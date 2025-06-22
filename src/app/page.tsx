
"use client";

import { useEffect } from 'react';
import { Header } from "@/components/dayflow/Header";
import { DailyOverviewCard } from "@/components/dayflow/DailyOverviewCard";
import { TimeBlockingCard } from "@/components/dayflow/TimeBlockingCard";
import { ToDoListCard } from "@/components/dayflow/ToDoListCard";
import { GoalsHabitsCard } from "@/components/dayflow/GoalsHabitsCard";
import { MealPlannerCard } from "@/components/dayflow/MealPlannerCard";
import { NotesIdeasCard } from "@/components/dayflow/NotesIdeasCard";
import { ReflectionReviewCard } from "@/components/dayflow/ReflectionReviewCard";
import { AiFeaturesCard } from "@/components/dayflow/AiFeaturesCard";
import { PomodoroTimerCard } from "@/components/dayflow/PomodoroTimerCard";

export default function DayFlowPage() {
  useEffect(() => {
    const LAST_ACTIVE_DATE_KEY = 'dayflow-last-active-date';

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastActiveDate = localStorage.getItem(LAST_ACTIVE_DATE_KEY);
        const today = new Date().toDateString();

        if (lastActiveDate && lastActiveDate !== today) {
          // It's a new day, refresh the page to reload all data
          window.location.reload();
        }
        
        // Always update the last active date when the app becomes visible
        localStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
      }
    };
    
    // Set the initial date when the component mounts
    localStorage.setItem(LAST_ACTIVE_DATE_KEY, new Date().toDateString());

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          
          {/* Primary Content Column */}
          {/* On md, takes 1/2 width. On lg, takes 2/3 width. On xl, takes 3/4 width. */}
          <div className="space-y-6 md:col-span-1 lg:col-span-2 xl:col-span-3">
            <DailyOverviewCard />
            <TimeBlockingCard />
            <ToDoListCard />
          </div>

          {/* Secondary Content Column / Sidebar */}
          {/* On md, takes 1/2 width. On lg, takes 1/3 width. On xl, takes 1/4 width. */}
          <div className="space-y-6 md:col-span-1 lg:col-span-1 xl:col-span-1">
            <AiFeaturesCard />
            <PomodoroTimerCard />
            <GoalsHabitsCard />
            <MealPlannerCard />
            <NotesIdeasCard />
            <ReflectionReviewCard />
          </div>

        </div>
      </main>
    </div>
  );
}
