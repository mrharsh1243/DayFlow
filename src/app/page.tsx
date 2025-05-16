import { Header } from "@/components/dayflow/Header";
import { DailyOverviewCard } from "@/components/dayflow/DailyOverviewCard";
import { TimeBlockingCard } from "@/components/dayflow/TimeBlockingCard";
import { ToDoListCard } from "@/components/dayflow/ToDoListCard";
import { GoalsHabitsCard } from "@/components/dayflow/GoalsHabitsCard";
import { MealPlannerCard } from "@/components/dayflow/MealPlannerCard";
import { NotesIdeasCard } from "@/components/dayflow/NotesIdeasCard";
import { ReflectionReviewCard } from "@/components/dayflow/ReflectionReviewCard";
import { AiFeaturesCard } from "@/components/dayflow/AiFeaturesCard";

export default function DayFlowPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          
          {/* Row 1 */}
          <div className="lg:col-span-2 xl:col-span-2">
            <DailyOverviewCard />
          </div>
          
          <div className="lg:col-span-1 xl:col-span-2">
             <AiFeaturesCard />
          </div>

          {/* Row 2 */}
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
            <TimeBlockingCard />
          </div>

          {/* Row 3 */}
          <div className="lg:col-span-1 xl:col-span-2">
            <ToDoListCard />
          </div>
          <div className="lg:col-span-1 xl:col-span-2">
            <GoalsHabitsCard />
          </div>
          
          {/* Row 4 */}
          <div className="lg:col-span-1 xl:col-span-2">
            <MealPlannerCard />
          </div>
          <div className="lg:col-span-1 xl:col-span-2">
            <NotesIdeasCard />
          </div>

          {/* Row 5 */}
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
            <ReflectionReviewCard />
          </div>

        </div>
      </main>
    </div>
  );
}
