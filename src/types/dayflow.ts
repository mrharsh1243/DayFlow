export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category?: TaskCategory;
  startTime?: string; // e.g., "09:00"
  endTime?: string; // e.g., "10:00"
  isLocked?: boolean; // For manually locked time slots
}

export interface Habit {
  id: string;
  name: string;
  completed: boolean;
  icon?: React.ElementType;
}

export interface Goal {
  id: string;
  text: string;
  achieved?: boolean;
}

export interface Meal {
  id: string;
  name: string; // e.g., Breakfast, Lunch
  description: string;
}

export interface ReflectionItem {
  id: string;
  question: string;
  answer: string;
}

export type Mood = 'Happy' | 'Neutral' | 'Productive' | 'Stressed' | 'Tired' | '';

// Removed 'AI Suggested'
export type TaskCategory = 'Work' | 'Personal' | 'Health/Fitness' | 'Errands';

export interface Priority {
  id: string;
  text: string;
  completed: boolean;
}

export const DEFAULT_HABITS: Habit[] = [
  { id: 'habit-1', name: 'Drink 8 glasses of water', completed: false },
  { id: 'habit-2', name: '30 min workout', completed: false },
  { id: 'habit-3', name: 'Read for 15 minutes', completed: false },
  { id: 'habit-4', name: 'Mindfulness/Meditation', completed: false },
];

export const TIME_SLOTS = Array.from({ length: (22 - 6) + 1 }, (_, i) => {
  const hour = i + 6; // 6 AM to 10 PM (22:00)
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 || hour === 24 ? 'AM' : 'PM'; // Corrected AM/PM logic
  const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
  return {
    id: `slot-${formattedHour}:00`,
    label: `${displayHour} ${ampm}`,
    isoTime: `${formattedHour}:00`
  };
});
