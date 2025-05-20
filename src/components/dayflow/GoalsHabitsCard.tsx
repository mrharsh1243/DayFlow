
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Repeat, PlusCircle, Trash2, Droplet, Dumbbell, BookOpen, Brain } from "lucide-react";
import type { Habit, Goal } from '@/types/dayflow';
import { DEFAULT_HABITS } from '@/types/dayflow';
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const habitIcons: Record<string, React.ElementType> = {
  'Drink 8 glasses of water': Droplet,
  '30 min workout': Dumbbell,
  'Read for 15 minutes': BookOpen,
  'Mindfulness/Meditation': Brain,
};


export function GoalsHabitsCard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedHabits = localStorage.getItem('dayflow-habits');
    if (storedHabits) {
      const parsedHabits: Omit<Habit, 'icon'>[] = JSON.parse(storedHabits);
      setHabits(
        parsedHabits.map(h => ({
          ...h,
          icon: habitIcons[h.name] || Repeat,
        }))
      );
    } else {
      setHabits(DEFAULT_HABITS.map(h => ({...h, icon: habitIcons[h.name] || Repeat })));
    }

    const storedGoals = localStorage.getItem('dayflow-goals');
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dayflow-habits', JSON.stringify(
      habits.map(({ icon, ...rest }) => rest) // Don't store icon component directly
    ));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('dayflow-goals', JSON.stringify(goals));
  }, [goals]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const wasCompleted = h.completed;
        const updatedHabit = { ...h, completed: !h.completed };
        if (!wasCompleted && updatedHabit.completed) {
          new Audio('/completion-sound.mp3').play().catch(e => console.error("Error playing sound:", e));
        }
        return updatedHabit;
      }
      return h;
    }));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, { id: Date.now().toString(), text: newGoal, achieved: false }]);
      setNewGoal('');
      toast({title: "Goal Added", description: `"${newGoal}" added.`});
    }
  };
  
  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const wasAchieved = g.achieved;
        const updatedGoal = { ...g, achieved: !g.achieved };
        if (!wasAchieved && updatedGoal.achieved) {
          new Audio('/completion-sound.mp3').play().catch(e => console.error("Error playing sound:", e));
        }
        return updatedGoal;
      }
      return g;
    }));
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    toast({title: "Goal Removed", variant: "destructive"});
  };


  return (
    <Card className="shadow-lg">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="w-full text-left hover:no-underline p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="text-primary" />
                Goals & Habits
              </CardTitle>
              <CardDescription>Track your daily habits and micro-goals.</CardDescription>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="space-y-6 p-6 pt-2">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Repeat className="text-accent" /> Daily Habits</h3>
                <ul className="space-y-2">
                  {habits.map(habit => {
                    const IconComponent = habit.icon || Repeat;
                    return (
                      <li key={habit.id} className="flex items-center gap-2 p-2 bg-card rounded-md hover:bg-secondary/30 transition-colors">
                        <Checkbox id={`habit-${habit.id}`} checked={habit.completed} onCheckedChange={() => toggleHabit(habit.id)} />
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <label htmlFor={`habit-${habit.id}`} className={`flex-1 text-sm ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>{habit.name}</label>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Target className="text-accent" /> Micro Goals</h3>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add a micro goal"
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <Button onClick={addGoal} size="icon"><PlusCircle /></Button>
                </div>
                {goals.length > 0 ? (
                  <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {goals.map(goal => (
                      <li key={goal.id} className="flex items-center gap-2 p-2 bg-card rounded-md hover:bg-secondary/30 transition-colors">
                        <Checkbox id={`goal-${goal.id}`} checked={!!goal.achieved} onCheckedChange={() => toggleGoal(goal.id)} />
                        <label htmlFor={`goal-${goal.id}`} className={`flex-1 text-sm ${goal.achieved ? 'line-through text-muted-foreground' : ''}`}>{goal.text}</label>
                        <Button variant="ghost" size="icon" onClick={() => removeGoal(goal.id)} className="h-7 w-7">
                          <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center py-2">No micro goals set. Add one!</p>
                )}
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

