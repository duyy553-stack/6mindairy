import React, { useState } from 'react';
import { Plus, Check, Trash2, CheckSquare, Sparkles, Edit2, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Habit } from '../types';
import { getWeekDetails, formatShortDate, formatDateKey } from '../utils/dateUtils';
import { playChime } from '../utils/sound';

interface HabitTrackerViewProps {
  currentDateKey: string;
  habits: Habit[];
  onUpdateHabits: (updated: Habit[]) => void;
}

export const HabitTrackerView: React.FC<HabitTrackerViewProps> = ({
  currentDateKey,
  habits,
  onUpdateHabits,
}) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit Habit Text State
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Drag-and-drop reorder state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { weekId, weekNumber, weekDays } = getWeekDetails(currentDateKey);
  const weekdayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const todayKey = formatDateKey(new Date());

  const handleToggle = (habitId: string, dateKey: string) => {
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;
      const current = !!h.records[dateKey];
      const newRecords = { ...h.records, [dateKey]: !current };
      if (!current) {
        playChime();
      }
      return {
        ...h,
        records: newRecords,
      };
    });
    onUpdateHabits(updated);
  };

  const handleMoveHabit = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= habits.length) return;
    const reordered = [...habits];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onUpdateHabits(reordered);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...habits];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    onUpdateHabits(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    const randomColor = colors[habits.length % colors.length];

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: newHabitName.trim(),
      color: randomColor,
      createdAt: new Date().toISOString(),
      records: {},
    };

    onUpdateHabits([...habits, newHabit]);
    setNewHabitName('');
    setIsAdding(false);
  };

  const handleStartEdit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditingName(habit.name);
  };

  const handleSaveEdit = (habitId: string) => {
    if (!editingName.trim()) return;
    const updated = habits.map((h) =>
      h.id === habitId ? { ...h, name: editingName.trim() } : h
    );
    onUpdateHabits(updated);
    setEditingHabitId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingHabitId(null);
    setEditingName('');
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Удалить эту привычку из трекера?')) {
      onUpdateHabits(habits.filter((h) => h.id !== habitId));
    }
  };

  // Calculate week overall completion
  let totalOpportunities = habits.length * 7;
  let completedCount = 0;
  habits.forEach((h) => {
    weekDays.forEach((dKey) => {
      if (h.records[dKey]) completedCount++;
    });
  });
  const weekPercent = totalOpportunities > 0 ? Math.round((completedCount / totalOpportunities) * 100) : 0;

  return (
    <div id="habit-tracker-container" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#7C8363] dark:text-[#B4BE82] font-semibold uppercase tracking-widest mb-1.5 font-sans">
            <CheckSquare className="w-4 h-4 text-[#7C8363] dark:text-[#B4BE82]" />
            <span>Трекер привычек недели</span>
          </div>
          <h2 className="text-2xl font-serif italic text-[#38332E] dark:text-[#EAE5D9]">
            Неделя {weekNumber} ({weekId})
          </h2>
          <p className="text-xs text-[#827768] dark:text-[#9C9385] mt-1 font-serif">
            Маленькие регулярные действия создают фундамент гармоничной жизни.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#FAF8F3] dark:bg-[#25211D] px-5 py-3 rounded-2xl border border-[#E5E1D8] dark:border-[#383127]">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#827768] dark:text-[#9C9385] block font-semibold">
              Успех недели
            </span>
            <span className="text-xl font-serif italic text-[#38332E] dark:text-[#EAE5D9] font-bold">{weekPercent}%</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#E9EDC9] dark:bg-[#2B3220] flex items-center justify-center text-[#7C8363] dark:text-[#B4BE82]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Habits Table */}
      <div className="bg-[#FFFDF9] dark:bg-[#1E1B17] border border-[#E5E1D8] dark:border-[#383127] rounded-3xl p-6 sm:p-8 shadow-sm overflow-x-auto transition-colors">
        <table className="w-full text-left border-collapse min-w-[660px]">
          <thead>
            <tr className="border-b border-[#EFE8DC] dark:border-[#2E2820]">
              <th className="pb-4 text-xs font-semibold text-[#827768] dark:text-[#9C9385] uppercase tracking-wider font-sans w-2/5">
                Привычка (перемещайте и настраивайте)
              </th>
              {weekDays.map((dateStr, idx) => {
                const isCurrentToday = dateStr === todayKey;
                return (
                  <th key={dateStr} className="pb-4 text-center">
                    <div className={`inline-flex flex-col items-center px-2.5 py-1 rounded-xl transition-colors ${
                      isCurrentToday 
                        ? 'bg-[#E9EDC9] dark:bg-[#2B3220] text-[#4F5938] dark:text-[#D9E2A8] font-bold shadow-2xs' 
                        : 'text-[#827768] dark:text-[#9C9385]'
                    }`}>
                      <span className="text-[10px] uppercase tracking-wider font-sans">
                        {weekdayLabels[idx]}
                      </span>
                      <span className="text-xs font-mono">
                        {formatShortDate(dateStr)}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="pb-4 text-center text-xs font-semibold text-[#827768] dark:text-[#9C9385] uppercase tracking-wider font-sans w-16">
                Итог
              </th>
              <th className="pb-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE8DC] dark:divide-[#2E2820]">
            {habits.map((habit, habitIdx) => {
              const habitWeekDone = weekDays.filter((dKey) => habit.records[dKey]).length;
              const isEditingThis = editingHabitId === habit.id;
              const isBeingDragged = draggedIndex === habitIdx;
              const isDragOver = dragOverIndex === habitIdx;

              return (
                <tr 
                  key={habit.id} 
                  draggable={!isEditingThis}
                  onDragStart={(e) => handleDragStart(e, habitIdx)}
                  onDragOver={(e) => handleDragOver(e, habitIdx)}
                  onDrop={(e) => handleDrop(e, habitIdx)}
                  onDragEnd={handleDragEnd}
                  className={`transition-all ${
                    isBeingDragged 
                      ? 'opacity-40 bg-[#FAF7F0] dark:bg-[#201C18]' 
                      : isDragOver
                      ? 'border-t-2 border-[#7C8363] dark:border-[#B4BE82] bg-[#FAF8F3] dark:bg-[#25211D]'
                      : 'hover:bg-[#FAF8F3] dark:hover:bg-[#241F1A]'
                  }`}
                >
                  <td className="py-3.5 pr-4">
                    {isEditingThis ? (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                          style={{ backgroundColor: habit.color }} 
                        />
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(habit.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                          placeholder="Название привычки..."
                          className="flex-1 text-sm bg-white dark:bg-[#2A251F] border border-[#7C8363] dark:border-[#B4BE82] rounded-xl px-2.5 py-1 text-[#38332E] dark:text-[#EAE5D9] focus:outline-none shadow-2xs font-serif"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(habit.id)}
                          className="p-1.5 rounded-lg bg-[#7C8363] dark:bg-[#6D7456] text-white hover:bg-[#5E6548] transition-colors shadow-2xs"
                          title="Сохранить (Enter)"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1.5 rounded-lg text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] transition-colors"
                          title="Отмена (Esc)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group gap-2">
                        {/* Drag and Reorder Controls */}
                        <div className="flex items-center gap-1.5">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 text-[#C4B9A7] dark:text-[#5E5446] hover:text-[#7C8363] dark:hover:text-[#B4BE82] transition-colors rounded"
                            title="Зажмите и перетащите мышью для перемещения"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Quick Up / Down arrows for touch & click convenience */}
                          <div className="flex flex-col -space-y-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleMoveHabit(habitIdx, -1)}
                              disabled={habitIdx === 0}
                              className="p-0.5 text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] disabled:opacity-20 disabled:hover:text-[#827768] transition-colors"
                              title="Переместить выше"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveHabit(habitIdx, 1)}
                              disabled={habitIdx === habits.length - 1}
                              className="p-0.5 text-[#827768] dark:text-[#9C9385] hover:text-[#38332E] dark:hover:text-[#EAE5D9] disabled:opacity-20 disabled:hover:text-[#827768] transition-colors"
                              title="Переместить ниже"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Habit name with double-click edit */}
                        <div 
                          className="flex items-center gap-2.5 cursor-pointer select-none flex-1 min-w-0"
                          onDoubleClick={() => handleStartEdit(habit)}
                          onClick={() => handleStartEdit(habit)}
                          title="Нажмите или дважды кликните, чтобы изменить текст привычки"
                        >
                          <div 
                            className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                            style={{ backgroundColor: habit.color }} 
                          />
                          <span className="text-sm font-serif font-medium text-[#38332E] dark:text-[#EAE5D9] group-hover:text-[#7C8363] dark:group-hover:text-[#B4BE82] transition-colors truncate">
                            {habit.name}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(habit)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-[#827768] dark:text-[#9C9385] hover:text-[#7C8363] dark:hover:text-[#B4BE82] hover:bg-[#FAF8F3] dark:hover:bg-[#2A251F]"
                          title="Редактировать текст привычки"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>

                  {weekDays.map((dateStr) => {
                    const isChecked = !!habit.records[dateStr];
                    const isCurrentToday = dateStr === todayKey;
                    return (
                      <td key={dateStr} className="py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(habit.id, dateStr)}
                          className={`w-8 h-8 mx-auto rounded-xl border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-[#7C8363] border-[#7C8363] text-white shadow-2xs'
                              : isCurrentToday
                              ? 'bg-[#E9EDC9]/40 dark:bg-[#2B3220]/60 border-[#D5DCB3] dark:border-[#424D31] hover:bg-[#E9EDC9]/80'
                              : 'bg-white dark:bg-[#25211D] border-[#E5E1D8] dark:border-[#383127] hover:border-[#7C8363] dark:hover:border-[#B4BE82]'
                          }`}
                          title={`${habit.name} на ${dateStr}`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[2.5]" />}
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-4 text-center">
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#FAF8F3] dark:bg-[#25211D] text-[#38332E] dark:text-[#EAE5D9] border border-[#E5E1D8] dark:border-[#383127]">
                      {habitWeekDone}/7
                    </span>
                  </td>

                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="text-[#D6CAB8] dark:text-[#5E5446] hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                      title="Удалить привычку"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Add Habit Form */}
        <div className="mt-6 pt-4 border-t border-[#EFE8DC] dark:border-[#2E2820]">
          {isAdding ? (
            <form onSubmit={handleAddHabit} className="flex items-center gap-3">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Например: 10 минут утренней зарядки или чтения..."
                autoFocus
                className="flex-1 text-sm font-serif bg-white dark:bg-[#25211D] border border-[#E5E1D8] dark:border-[#383127] rounded-2xl px-4 py-2.5 text-[#38332E] dark:text-[#EAE5D9] focus:outline-none focus:border-[#7C8363] dark:focus:border-[#B4BE82] shadow-2xs"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#7C8363] text-white text-xs font-serif font-medium rounded-2xl hover:bg-[#6D7456] transition-colors shadow-2xs"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewHabitName('');
                }}
                className="px-3 py-2 text-[#827768] dark:text-[#9C9385] text-xs hover:text-[#38332E] dark:hover:text-[#EAE5D9]"
              >
                Отмена
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 text-xs font-serif font-medium text-[#7C8363] dark:text-[#B4BE82] hover:text-[#555C40] dark:hover:text-[#D9E2A8] px-4 py-2.5 rounded-2xl border border-dashed border-[#D6CAB8] dark:border-[#383127] hover:border-[#7C8363] dark:hover:border-[#B4BE82] bg-[#FAF8F3] dark:bg-[#25211D] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить привычку</span>
            </button>
          )}
        </div>
      </div>

      {/* Motivational Note */}
      <div className="p-5 rounded-3xl bg-[#E9EDC9]/40 dark:bg-[#2B3220]/50 text-xs font-serif text-[#4F5938] dark:text-[#D9E2A8] leading-relaxed border border-[#D5DCB3] dark:border-[#424D31]">
        💡 <strong>Совет Доминика Спенста:</strong> «Не стремитесь внедрять 10 новых привычек одновременно. Выберите от 2 до 4 ключевых действий, которые заряжают вас энергией, и выполняйте их маленькими шагами каждый день».
      </div>
    </div>
  );
};
