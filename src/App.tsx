import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, DailyEntry, Habit, WeeklyReflection } from './types';
import { formatDateKey } from './utils/dateUtils';
import { 
  loadAllEntries, 
  saveAllEntries,
  saveEntry, 
  loadHabits, 
  saveHabits, 
  loadReflections, 
  saveReflections, 
  calculateStreak, 
  createEmptyEntry 
} from './utils/storage';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from './lib/firebase';
import { 
  loadUserEntriesFromFirestore, 
  saveEntryToFirestore, 
  loadUserHabitsFromFirestore, 
  saveHabitsToFirestore, 
  loadUserReflectionsFromFirestore, 
  saveReflectionsToFirestore 
} from './utils/firestoreSync';
import { playChime, playPageTurnSound } from './utils/sound';
import { Header } from './components/Header';
import { DailySpread } from './components/DailySpread';
import { HabitTrackerView } from './components/HabitTrackerView';
import { WeeklyQuestionsView } from './components/WeeklyQuestionsView';
import { ArchiveView } from './components/ArchiveView';
import { AboutModal } from './components/AboutModal';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { Check } from 'lucide-react';

export default function App() {
  const [currentDateKey, setCurrentDateKey] = useState<string>(() => formatDateKey(new Date()));
  const [activeTab, setActiveTab] = useState<ActiveTab>('diary');
  const [flipAnimation, setFlipAnimation] = useState<'animate-page-flip-next' | 'animate-page-flip-prev' | 'animate-tab-flip' | ''>('');
  const [animationKey, setAnimationKey] = useState<number>(0);

  const handleDateChange = useCallback((newDateKey: string) => {
    if (newDateKey === currentDateKey) return;
    const direction = newDateKey > currentDateKey ? 'animate-page-flip-next' : 'animate-page-flip-prev';
    setFlipAnimation(direction);
    setAnimationKey((prev) => prev + 1);
    setCurrentDateKey(newDateKey);
    playPageTurnSound();
  }, [currentDateKey]);

  const handleTabChange = useCallback((newTab: ActiveTab) => {
    if (newTab === activeTab) return;
    setFlipAnimation('animate-tab-flip');
    setAnimationKey((prev) => prev + 1);
    setActiveTab(newTab);
    playPageTurnSound();
  }, [activeTab]);
  
  // Data State
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  const [habits, setHabits] = useState<Habit[]>([]);
  const [reflections, setReflections] = useState<Record<string, WeeklyReflection>>({});
  const [streak, setStreak] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [saveIndicator, setSaveIndicator] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('6min_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('6min_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Initial local load
  const reloadData = useCallback(() => {
    const loadedEntries = loadAllEntries();
    const loadedHabits = loadHabits();
    const loadedReflections = loadReflections();

    setEntries(loadedEntries);
    setHabits(loadedHabits);
    setReflections(loadedReflections);
    setStreak(calculateStreak(loadedEntries));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Listen to Firebase Auth state and synchronize with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Load user cloud data
          const cloudEntries = await loadUserEntriesFromFirestore(user.uid);
          const cloudHabits = await loadUserHabitsFromFirestore(user.uid);
          const cloudReflections = await loadUserReflectionsFromFirestore(user.uid);

          const hasCloudEntries = Object.keys(cloudEntries).length > 0;
          if (hasCloudEntries) {
            setEntries(cloudEntries);
            saveAllEntries(cloudEntries);
            setStreak(calculateStreak(cloudEntries));
          } else {
            // Upload current local entries to user's new cloud profile so nothing is lost
            const local = loadAllEntries();
            for (const entry of Object.values(local)) {
              await saveEntryToFirestore(user.uid, entry);
            }
          }

          if (cloudHabits && cloudHabits.length > 0) {
            setHabits(cloudHabits);
            saveHabits(cloudHabits);
          } else {
            const localHabits = loadHabits();
            await saveHabitsToFirestore(user.uid, localHabits);
          }

          if (cloudReflections && Object.keys(cloudReflections).length > 0) {
            setReflections(cloudReflections);
            saveReflections(cloudReflections);
          } else {
            const localReflections = loadReflections();
            await saveReflectionsToFirestore(user.uid, localReflections);
          }
        } catch (err) {
          console.error('Error syncing with Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Login / Logout handlers
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error('Sign Out failed:', err);
    }
  };

  // Handle entry changes (saves locally and to Firestore if authenticated)
  const handleUpdateEntry = (updated: DailyEntry) => {
    saveEntry(updated);
    if (currentUser) {
      saveEntryToFirestore(currentUser.uid, updated);
    }

    setEntries((prev) => {
      const next = { ...prev, [updated.date]: updated };
      setStreak(calculateStreak(next));
      return next;
    });

    // Brief save indicator
    setSaveIndicator(true);
    setTimeout(() => {
      setSaveIndicator(false);
    }, 1500);
  };

  // Handle habit updates
  const handleUpdateHabits = (updated: Habit[]) => {
    saveHabits(updated);
    if (currentUser) {
      saveHabitsToFirestore(currentUser.uid, updated);
    }
    setHabits(updated);
  };

  // Handle reflection updates
  const handleUpdateReflection = (weekId: string, updated: WeeklyReflection) => {
    setReflections((prev) => {
      const next = { ...prev, [weekId]: updated };
      saveReflections(next);
      if (currentUser) {
        saveReflectionsToFirestore(currentUser.uid, next);
      }
      return next;
    });
  };

  // Current entry
  const currentEntry: DailyEntry = entries[currentDateKey] || createEmptyEntry(currentDateKey);

  // Keyboard navigation between days (ArrowLeft / ArrowRight) when not typing in form inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (activeTab === 'diary') {
        if (e.key === 'ArrowLeft') {
          const [y, m, d] = currentDateKey.split('-').map(Number);
          const prev = new Date(y, m - 1, d - 1);
          handleDateChange(formatDateKey(prev));
        } else if (e.key === 'ArrowRight') {
          const [y, m, d] = currentDateKey.split('-').map(Number);
          const next = new Date(y, m - 1, d + 1);
          handleDateChange(formatDateKey(next));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDateKey, activeTab, handleDateChange]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F7F4EC] dark:bg-[#171513] flex items-center justify-center text-[#827768] dark:text-[#9C9385] font-serif italic text-lg">
        Открываем страницы вашего дневника...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EC] dark:bg-[#171513] text-[#38332E] dark:text-[#EAE5D9] flex flex-col selection:bg-[#E9EDC9] selection:text-[#4F5938] transition-colors duration-200">
      {/* Top Header */}
      <Header
        currentDateKey={currentDateKey}
        activeTab={activeTab}
        streak={streak}
        theme={theme}
        currentUser={currentUser}
        onToggleTheme={handleToggleTheme}
        onTabChange={handleTabChange}
        onDateChange={handleDateChange}
        onOpenAbout={() => setIsAboutOpen(true)}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onOpenAIAnalysis={() => setIsAIModalOpen(true)}
      />

      {/* Main Screen Content with 3D Page Flip Transition Stage */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full diary-flip-stage">
        <div 
          key={`page-flip-${animationKey}-${activeTab}-${currentDateKey}`}
          className={flipAnimation}
          onAnimationEnd={() => setFlipAnimation('')}
        >
          {activeTab === 'diary' && (
            <DailySpread
              entry={currentEntry}
              onUpdateEntry={handleUpdateEntry}
              onNavigateDate={handleDateChange}
              onOpenAIAnalysis={() => setIsAIModalOpen(true)}
            />
          )}

          {activeTab === 'habits' && (
            <HabitTrackerView
              currentDateKey={currentDateKey}
              habits={habits}
              onUpdateHabits={handleUpdateHabits}
            />
          )}

          {activeTab === 'weekly' && (
            <WeeklyQuestionsView
              currentDateKey={currentDateKey}
              reflections={reflections}
              onUpdateReflection={handleUpdateReflection}
              onNavigateDate={handleDateChange}
            />
          )}

          {activeTab === 'archive' && (
            <ArchiveView
              entries={entries}
              streak={streak}
              reflections={reflections}
              onSelectDate={(dateKey) => {
                handleDateChange(dateKey);
                handleTabChange('diary');
              }}
            />
          )}
        </div>
      </main>

      {/* Minimal Footer with gentle book aesthetic */}
      <footer className="w-full py-4 border-t border-[#E5E1D8] dark:border-[#2D2821] text-center text-xs text-[#A0A090] dark:text-[#7A7265] font-sans print:hidden">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            «Дневник 6 минут» • Практика благодарности и осознанности
          </span>
          <div className="flex items-center gap-3">
            {saveIndicator && (
              <span className="inline-flex items-center gap-1 text-[#555C40] dark:text-[#D9E2A8] bg-[#E9EDC9] dark:bg-[#2B3220] px-2.5 py-0.5 rounded-full text-[11px] font-sans border border-[#D5DCB3] dark:border-[#424D31] shadow-2xs">
                <Check className="w-3 h-3 text-[#7C8363] dark:text-[#A4B56C]" /> Сохранено
              </span>
            )}
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-[#434343] dark:hover:text-[#EAE5D9] underline transition-colors"
            >
              Методика и бэкап
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onDataImported={reloadData}
      />

      <AIAnalysisModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        entry={currentEntry}
        currentUser={currentUser}
      />
    </div>
  );
}
