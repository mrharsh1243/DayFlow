
"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

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

const componentMap = {
  DailyOverviewCard,
  TimeBlockingCard,
  ToDoListCard,
  AiFeaturesCard,
  PomodoroTimerCard,
  GoalsHabitsCard,
  MealPlannerCard,
  NotesIdeasCard,
  ReflectionReviewCard,
};

type ComponentKey = keyof typeof componentMap;

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transition,
    zIndex: isDragging ? 10 : undefined,
    // Add a shadow and a slight scale when dragging for better visual feedback.
    boxShadow: isDragging ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : undefined,
    transform: isDragging 
      ? `${CSS.Transform.toString(transform)} scale(1.02)` 
      : CSS.Transform.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <button {...attributes} {...listeners} className="absolute top-1/2 -left-2 sm:-left-6 transform -translate-y-1/2 p-2 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring rounded-full">
        <GripVertical />
      </button>
      {children}
    </div>
  );
}

export default function DayFlowPage() {
  const defaultMainLayout: ComponentKey[] = ['DailyOverviewCard', 'TimeBlockingCard', 'ToDoListCard'];
  const defaultSidebarLayout: ComponentKey[] = ['AiFeaturesCard', 'PomodoroTimerCard', 'GoalsHabitsCard', 'MealPlannerCard', 'NotesIdeasCard', 'ReflectionReviewCard'];
  
  const [mainComponents, setMainComponents] = useState<ComponentKey[]>([]);
  const [sidebarComponents, setSidebarComponents] = useState<ComponentKey[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const LAST_ACTIVE_DATE_KEY = 'dayflow-last-active-date';

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastActiveDate = localStorage.getItem(LAST_ACTIVE_DATE_KEY);
        const today = new Date().toDateString();

        if (lastActiveDate && lastActiveDate !== today) {
          window.location.reload();
        }
        
        localStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
      }
    };
    
    localStorage.setItem(LAST_ACTIVE_DATE_KEY, new Date().toDateString());
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const savedMainLayout = localStorage.getItem('dayflow-main-layout');
    setMainComponents(savedMainLayout ? JSON.parse(savedMainLayout) : defaultMainLayout);
    
    const savedSidebarLayout = localStorage.getItem('dayflow-sidebar-layout');
    setSidebarComponents(savedSidebarLayout ? JSON.parse(savedSidebarLayout) : defaultSidebarLayout);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as ComponentKey;
    const overId = over.id as ComponentKey;
    
    if (activeId === overId) return;

    const isMainDrag = mainComponents.includes(activeId) && mainComponents.includes(overId);
    const isSidebarDrag = sidebarComponents.includes(activeId) && sidebarComponents.includes(overId);

    if (isMainDrag) {
      setMainComponents((items) => {
        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('dayflow-main-layout', JSON.stringify(newOrder));
        return newOrder;
      });
    } else if (isSidebarDrag) {
      setSidebarComponents((items) => {
        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('dayflow-sidebar-layout', JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  const renderComponent = (key: ComponentKey) => {
    const Component = componentMap[key];
    return Component ? <Component key={key} /> : null;
  };

  if (!isClient) {
      // Render a static layout or skeleton on the server to avoid hydration mismatch
      return (
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
             <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               <div className="space-y-6 md:col-span-1 lg:col-span-2 xl:col-span-3">
                 <DailyOverviewCard />
                 <TimeBlockingCard />
                 <ToDoListCard />
               </div>
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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            
            <SortableContext items={mainComponents} strategy={verticalListSortingStrategy}>
              <div className="space-y-6 md:col-span-1 lg:col-span-2 xl:col-span-3">
                {mainComponents.map(key => (
                  <SortableItem key={key} id={key}>
                    {renderComponent(key)}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>

            <SortableContext items={sidebarComponents} strategy={verticalListSortingStrategy}>
                <div className="space-y-6 md:col-span-1 lg:col-span-1 xl:col-span-1">
                    {sidebarComponents.map(key => (
                        <SortableItem key={key} id={key}>
                           {renderComponent(key)}
                        </SortableItem>
                    ))}
                </div>
            </SortableContext>

          </div>
        </main>
      </div>
    </DndContext>
  );
}
