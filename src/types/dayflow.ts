
import type { LucideIcon } from 'lucide-react';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category?: TaskCategoryName;
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

export type TaskCategoryName = 'Work' | 'Personal' | 'Health/Fitness' | 'Errands';

export interface TaskCategory {
  name: TaskCategoryName;
  icon: LucideIcon; // Directly using LucideIcon type
}


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

// Moved from ToDoListCard.tsx for global access
// Ensure Lucide icons are imported where these categories are used if icons are directly rendered
// For now, we will import them in the components that use this.
// If direct LucideIcon components are stored here, it can complicate serialization or type usage across server/client.
// It's often better to store a string key and map to the component in the UI, but for direct use:
// import { Briefcase, User, HeartPulse, ShoppingCart } from "lucide-react";
// export const TODO_CATEGORIES: TaskCategory[] = [
//   { name: 'Work', icon: Briefcase },
//   { name: 'Personal', icon: User },
//   { name: 'Health/Fitness', icon: HeartPulse },
//   { name: 'Errands', icon: ShoppingCart },
// ];
// Simpler approach for now, actual icons will be imported in components that render them.
export const TODO_CATEGORY_NAMES: TaskCategoryName[] = ['Work', 'Personal', 'Health/Fitness', 'Errands'];
