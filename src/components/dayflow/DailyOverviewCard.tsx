
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, ListTodo, MessageSquareQuote, PlusCircle, Trash2, Zap, Briefcase, User, HeartPulse, ShoppingCart, AlertTriangle } from "lucide-react";
import type { Priority, Task, TaskCategoryName } from '@/types/dayflow'; 
import { TODO_CATEGORY_NAMES } from '@/types/dayflow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { getDailyQuote } from '@/ai/flows/get-daily-quote-flow';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, isEqual, parseISO } from 'date-fns';

const DEFAULT_PRIORITY_PLACEHOLDER_ID = 'prio-default';
const DEFAULT_PRIORITY_PLACEHOLDER: Priority = { id: DEFAULT_PRIORITY_PLACEHOLDER_ID, text: 'Define top goal for the day', completed: false };

const categoryIcons: Record<TaskCategoryName, React.ElementType> = {
  Work: Briefcase,
  Personal: User,
  'Health/Fitness': HeartPulse,
  Errands: ShoppingCart,
};

export function DailyOverviewCard() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [newPriority, setNewPriority] = useState('');
  const [quote, setQuote] = useState<string | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);
  const [isInitialPriorityLoad, setIsInitialPriorityLoad] = useState(true);
  const { toast } = useToast();

  const [yesterdaysPrioritiesToCarryOver, setYesterdaysPrioritiesToCarryOver] = useState<Priority[]>([]);
  const [priorityToMove, setPriorityToMove] = useState<Priority | null>(null);
  const [isMoveToToDoDialogOpen, setIsMoveToToDoDialogOpen] = useState(false);


  useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
    setCurrentDay(date.toLocaleDateString(undefined, { weekday: 'long' }));
  }, []);

  const loadAndProcessPriorities = useCallback(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const storedPrioritiesStr = localStorage.getItem('dayflow-priorities');
    const lastSavedDate = localStorage.getItem('dayflow-priorities-date');

    let currentDayPriorities: Priority[] = [];
    let yesterdaysIncomplete: Priority[] = [];

    if (storedPrioritiesStr) {
      try {
        const storedPriorities: Priority[] = JSON.parse(storedPrioritiesStr);
        if (lastSavedDate && lastSavedDate !== todayStr) {
          // It's a new day, check for incomplete priorities from yesterday
          yesterdaysIncomplete = storedPriorities.filter(p => !p.completed && p.id !== DEFAULT_PRIORITY_PLACEHOLDER_ID);
          currentDayPriorities = [DEFAULT_PRIORITY_PLACEHOLDER]; // Start fresh for today
        } else {
          // Same day or no date stored, use stored priorities
          currentDayPriorities = Array.isArray(storedPriorities) && storedPriorities.length > 0 ? storedPriorities : [DEFAULT_PRIORITY_PLACEHOLDER];
        }
      } catch (e) {
        console.error("Failed to parse priorities from localStorage", e);
        currentDayPriorities = [DEFAULT_PRIORITY_PLACEHOLDER];
      }
    } else {
      currentDayPriorities = [DEFAULT_PRIORITY_PLACEHOLDER];
    }
    
    setPriorities(currentDayPriorities);
    setYesterdaysPrioritiesToCarryOver(yesterdaysIncomplete);
    setIsInitialPriorityLoad(false);

    if (lastSavedDate !== todayStr || !storedPrioritiesStr) {
      localStorage.setItem('dayflow-priorities-date', todayStr);
      if (currentDayPriorities.length > 0 || yesterdaysIncomplete.length === 0) { // Save if we have priorities or reset for new day
         localStorage.setItem('dayflow-priorities', JSON.stringify(currentDayPriorities));
      }
    }
  }, []);


  useEffect(() => {
    loadAndProcessPriorities();
    const handleDataChange = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail?.source !== 'DailyOverviewCardItself') {
            loadAndProcessPriorities();
        }
    };
    window.addEventListener('dayflow-datachanged', handleDataChange);
    
    return () => {
      window.removeEventListener('dayflow-datachanged', handleDataChange);
    };
  }, [loadAndProcessPriorities]);

  useEffect(() => {
    if (!isInitialPriorityLoad) {
      localStorage.setItem('dayflow-priorities', JSON.stringify(priorities));
      localStorage.setItem('dayflow-priorities-date', format(new Date(), 'yyyy-MM-dd'));
      // Dispatch event so other components know data changed, but distinguish source
      window.dispatchEvent(new CustomEvent('dayflow-datachanged', { detail: { source: 'DailyOverviewCardItself' } }));
    }
  }, [priorities, isInitialPriorityLoad]);

  useEffect(() => {
    let isMounted = true;
    const fetchOrLoadQuote = async () => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const lsQuote = localStorage.getItem('dayflow-dailyQuote');
      const lsQuoteDate = localStorage.getItem('dayflow-dailyQuoteDate');

      if (lsQuote && lsQuoteDate === todayStr) {
        if (isMounted) {
          setQuote(lsQuote);
          setIsQuoteLoading(false);
        }
      } else {
        if (isMounted) setIsQuoteLoading(true);
        try {
          const result = await getDailyQuote();
          if (isMounted) {
            setQuote(result.quote);
            localStorage.setItem('dayflow-dailyQuote', result.quote);
            localStorage.setItem('dayflow-dailyQuoteDate', todayStr);
          }
        } catch (error) {
          console.error("Error fetching daily quote:", error);
          if (isMounted) {
            const fallbackOnError = "The best way to predict the future is to create it.";
            setQuote(fallbackOnError); // Use fallback
            localStorage.setItem('dayflow-dailyQuote', fallbackOnError);
            localStorage.setItem('dayflow-dailyQuoteDate', todayStr);
            toast({ title: "AI Quote Error", description: "Could not fetch a new quote. Showing a default one.", variant: "destructive" });
          }
        } finally {
          if (isMounted) setIsQuoteLoading(false);
        }
      }
    };
    fetchOrLoadQuote();
    return () => { isMounted = false; };
  }, [toast]);

  const addPriorityToList = (priorityText: string) => {
    setPriorities(prevPriorities => {
        const actualPriorities = prevPriorities.filter(p => p.id !== DEFAULT_PRIORITY_PLACEHOLDER_ID);
        if (actualPriorities.length < 3) {
            return [...actualPriorities, { id: Date.now().toString(), text: priorityText, completed: false }];
        }
        toast({ title: "Priorities Full", description: "Maximum of 3 priorities allowed for today."});
        return prevPriorities;
    });
  };

  const handleAddPriorityInput = () => {
    if (newPriority.trim()) {
      addPriorityToList(newPriority.trim());
      setNewPriority('');
    }
  };
  
  const handleAddCarryOverPriority = (priority: Priority) => {
    const currentDisplayablePriorities = priorities.filter(p => p.id !== DEFAULT_PRIORITY_PLACEHOLDER_ID);
    if (currentDisplayablePriorities.length < 3) {
      addPriorityToList(priority.text);
      setYesterdaysPrioritiesToCarryOver(prev => prev.filter(p => p.id !== priority.id));
      toast({ title: "Priority Carried Over", description: `"${priority.text}" added to today's priorities.`});
    } else {
      // Priorities are full, open dialog to move to To-Do
      setPriorityToMove(priority);
      setIsMoveToToDoDialogOpen(true);
    }
  };

  const handleMoveToToDoCategory = (categoryName: TaskCategoryName) => {
    if (!priorityToMove) return;

    const storedTodoTasks = localStorage.getItem('dayflow-todolist-tasks');
    let todoTasks: Record<TaskCategoryName, Task[]> = storedTodoTasks ? JSON.parse(storedTodoTasks) : 
      TODO_CATEGORY_NAMES.reduce((acc, cat) => ({...acc, [cat]: []}), {} as Record<TaskCategoryName, Task[]>);

    const newTask: Task = {
      id: Date.now().toString(),
      text: priorityToMove.text,
      completed: false,
      category: categoryName,
    };

    if (!todoTasks[categoryName]) {
      todoTasks[categoryName] = [];
    }
    todoTasks[categoryName].push(newTask);
    localStorage.setItem('dayflow-todolist-tasks', JSON.stringify(todoTasks));
    window.dispatchEvent(new CustomEvent('dayflow-datachanged'));
    
    setYesterdaysPrioritiesToCarryOver(prev => prev.filter(p => p.id !== priorityToMove.id));
    toast({ title: "Task Moved", description: `"${priorityToMove.text}" moved to ${categoryName} To-Do list.`});
    setIsMoveToToDoDialogOpen(false);
    setPriorityToMove(null);
  };

  const dismissCarryOverPriority = (priorityId: string) => {
    setYesterdaysPrioritiesToCarryOver(prev => prev.filter(p => p.id !== priorityId));
    toast({ title: "Task Dismissed", description: "Yesterday's pending task was dismissed." });
  };


  const togglePriority = (id: string) => {
    setPriorities(prevPriorities => {
        const updatedPriorities = prevPriorities.map(p => {
            if (p.id === id) {
                const wasCompleted = p.completed;
                const newP = { ...p, completed: !p.completed };
                if (!wasCompleted && newP.completed) {
                    new Audio('/completion-sound.mp3').play().catch(e => console.error("Error playing sound:", e));
                }
                return newP;
            }
            return p;
        });
        
        const actualPrioritiesList = updatedPriorities.filter(p => p.id !== DEFAULT_PRIORITY_PLACEHOLDER_ID);
        if (actualPrioritiesList.length === 0 && !updatedPriorities.some(p => p.id === DEFAULT_PRIORITY_PLACEHOLDER_ID && !p.completed)) {
           return [DEFAULT_PRIORITY_PLACEHOLDER];
        }
        if (actualPrioritiesList.length > 0 && updatedPriorities.some(p => p.id === DEFAULT_PRIORITY_PLACEHOLDER_ID)) {
           return actualPrioritiesList;
        }
        return updatedPriorities;
    });
  };
  
  const removePriority = (id: string) => {
    setPriorities(prevPriorities => {
        const updatedPriorities = prevPriorities.filter(p => p.id !== id);
        if (updatedPriorities.filter(p => p.id !== DEFAULT_PRIORITY_PLACEHOLDER_ID).length === 0) {
          return [DEFAULT_PRIORITY_PLACEHOLDER];
        }
        return updatedPriorities;
    });
  };

  const displayablePriorities = priorities.filter(p => p.id !== DEFAULT_PRIORITY_PLACEHOLDER_ID);
  const showAddPriorityInput = displayablePriorities.length < 3;
  const showNoPrioritiesMessage = displayablePriorities.length === 0 && priorities.some(p => p.id === DEFAULT_PRIORITY_PLACEHOLDER_ID && !p.completed);


  return (
    <Card className="shadow-lg">
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="w-full text-left hover:no-underline p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarDays className="text-primary" />
                Daily Overview
              </CardTitle>
              <CardDescription>{currentDate} - {currentDay}</CardDescription>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="space-y-6 p-6 pt-2">
              {yesterdaysPrioritiesToCarryOver.length > 0 && (
                <div className="p-3 border border-yellow-500/50 bg-yellow-500/10 rounded-md space-y-2">
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Pending from Yesterday:</h4>
                  <ul className="space-y-1.5 text-sm">
                    {yesterdaysPrioritiesToCarryOver.map(priority => (
                      <li key={`carry-${priority.id}`} className="flex items-center justify-between gap-2">
                        <span className="flex-1">{priority.text}</span>
                        <div className="flex gap-1">
                           <Button size="xs" variant="outline" onClick={() => handleAddCarryOverPriority(priority)} className="text-xs px-1.5 py-0.5 h-6">
                            Add to Today
                          </Button>
                          <Button size="xs" variant="ghost" onClick={() => dismissCarryOverPriority(priority.id)} className="text-xs px-1.5 py-0.5 h-6 hover:bg-destructive/20">
                            <Trash2 className="h-3 w-3"/>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><ListTodo className="text-accent" /> Top 3 Priorities</h3>
                <ul className="space-y-2">
                  {displayablePriorities.map(priority => (
                    <li key={priority.id} className="flex items-center gap-2">
                      <Checkbox id={`prio-${priority.id}`} checked={priority.completed} onCheckedChange={() => togglePriority(priority.id)} />
                      <label htmlFor={`prio-${priority.id}`} className={`flex-1 ${priority.completed ? 'line-through text-muted-foreground' : ''}`}>{priority.text}</label>
                      <Button variant="ghost" size="icon" onClick={() => removePriority(priority.id)} className="h-6 w-6">
                        <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
                {showAddPriorityInput && (
                  <div className="mt-2 flex gap-2">
                    <Input 
                      value={newPriority} 
                      onChange={(e) => setNewPriority(e.target.value)}
                      placeholder="Add a priority (max 3)"
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPriorityInput()}
                    />
                    <Button onClick={handleAddPriorityInput} size="icon" className="h-10 w-10">
                      <PlusCircle />
                    </Button>
                  </div>
                )}
                {showNoPrioritiesMessage && (
                  <p className="text-sm text-muted-foreground italic text-center py-2">No priorities set. Add up to 3!</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  {isQuoteLoading ? <Zap className="text-accent animate-pulse" /> : <MessageSquareQuote className="text-accent" />}
                  Motivation
                </h3>
                <p className="text-sm italic text-muted-foreground p-3 bg-secondary/30 rounded-md min-h-[40px]">
                  {isQuoteLoading ? "Fetching inspiring words..." : quote || "Embrace the journey, one step at a time."}
                </p>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {priorityToMove && (
        <Dialog open={isMoveToToDoDialogOpen} onOpenChange={setIsMoveToToDoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Priorities Full</DialogTitle>
              <DialogDescription>
                Your Top 3 Priorities for today are full. Would you like to add "{priorityToMove.text}" to a To-Do list category instead?
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 py-4">
              {TODO_CATEGORY_NAMES.map(categoryName => {
                const Icon = categoryIcons[categoryName];
                return (
                  <Button key={categoryName} variant="outline" onClick={() => handleMoveToToDoCategory(categoryName)}>
                    <Icon className="mr-2 h-4 w-4" />
                    {categoryName}
                  </Button>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => {setIsMoveToToDoDialogOpen(false); setPriorityToMove(null);}}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
