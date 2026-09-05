import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs 
} from '../lib/firebase';
import { DailyEntry, Habit, WeeklyReflection } from '../types';

export async function loadUserEntriesFromFirestore(userId: string): Promise<Record<string, DailyEntry>> {
  try {
    const colRef = collection(db, 'users', userId, 'entries');
    const snapshot = await getDocs(colRef);
    const result: Record<string, DailyEntry> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DailyEntry;
      if (data && data.date) {
        result[data.date] = data;
      }
    });
    return result;
  } catch (err) {
    console.error('Error loading entries from Firestore:', err);
    return {};
  }
}

export async function saveEntryToFirestore(userId: string, entry: DailyEntry): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'entries', entry.date);
    await setDoc(docRef, {
      ...entry,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Error saving entry to Firestore:', err);
  }
}

export async function loadUserHabitsFromFirestore(userId: string): Promise<Habit[] | null> {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'habits');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data()?.habits || null;
    }
    return null;
  } catch (err) {
    console.error('Error loading habits from Firestore:', err);
    return null;
  }
}

export async function saveHabitsToFirestore(userId: string, habits: Habit[]): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'habits');
    await setDoc(docRef, {
      habits,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving habits to Firestore:', err);
  }
}

export async function loadUserReflectionsFromFirestore(userId: string): Promise<Record<string, WeeklyReflection> | null> {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'reflections');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data()?.reflections || null;
    }
    return null;
  } catch (err) {
    console.error('Error loading reflections from Firestore:', err);
    return null;
  }
}

export async function saveReflectionsToFirestore(
  userId: string, 
  reflections: Record<string, WeeklyReflection>
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'reflections');
    await setDoc(docRef, {
      reflections,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving reflections to Firestore:', err);
  }
}

export async function loadSavedAnalysis(userId: string, dateKey: string): Promise<string | null> {
  try {
    const docRef = doc(db, 'users', userId, 'analyses', dateKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data()?.analysis || null;
    }
    return null;
  } catch (err) {
    console.error('Error loading saved analysis:', err);
    return null;
  }
}

export async function saveAnalysisToFirestore(userId: string, dateKey: string, analysis: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'analyses', dateKey);
    await setDoc(docRef, {
      dateKey,
      analysis,
      model: 'gemini-3.8-flash',
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving analysis to Firestore:', err);
  }
}
