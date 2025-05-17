
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
