
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, ListTodo, MessageSquareQuote, PlusCircle, Trash2, Zap } from "lucide-react";
import type { Priority } from '@/types/dayflow'; 
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getDailyQuote } from '@/ai/flows/get-daily-quote-flow';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_PRIORITY_PLACEHOLDER_ID = 'prio-default';
const DEFAULT_PRIORITY_PLACEHOLDER: Priority = { id: DEFAULT_PRIORITY_PLACEHOLDER_ID, text: 'Define top goal for the day', completed: false };

export function DailyOverviewCard() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [newPriority, setNewPriority] = useState('');
  const [quote, setQuote] = useState<string | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);
  const [isInitialPriorityLoad, setIsInitialPriorityLoad] = useState(true);
  const { toast } = useToast();

  const loadPrioritiesFromStorage = useCallback(() => {
    const storedPriorities = localStorage.getItem('dayflow-priorities');
    if (storedPriorities) {
      try {
        const parsedPriorities = JSON.parse(storedPriorities);
        setPriorities(Array.isArray(parsedPriorities) && parsedPriorities.length > 0 ? parsedPriorities : [DEFAULT_PRIORITY_PLACEHOLDER]);
      } catch (e) {
        console.error("Failed to parse priorities from localStorage", e);
        setPriorities([DEFAULT_PRIORITY_PLACEHOLDER]);
      }
    } else {
      setPriorities([DEFAULT_PRIORITY_PLACEHOLDER]);
    }
    setIsInitialPriorityLoad(false);
  }, []);

  useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
    setCurrentDay(date.toLocaleDateString(undefined, { weekday: 'long' }));
    
    loadPrioritiesFromStorage();
    
    const handleDataChange = () => {
      loadPrioritiesFromStorage();
    };
    window.addEventListener('dayflow-datachanged', handleDataChange);
    
    // Load or fetch daily quote
    const todayDateString = new Date().toISOString().split('T')[0];
    const storedQuote = localStorage.getItem('dayflow-dailyQuote');
    const storedQuoteDate = localStorage.getItem('dayflow-dailyQuoteDate');

    if (storedQuote && storedQuoteDate === todayDateString) {
      setQuote(storedQuote);
      setIsQuoteLoading(false);
    } else {
      setIsQuoteLoading(true);
      getDailyQuote()
        .then(result => {
          if (result && result.quote) {
            setQuote(result.quote);
            localStorage.setItem('dayflow-dailyQuote', result.quote);
            localStorage.setItem('dayflow-dailyQuoteDate', todayDateString);
          } else {
            setQuote("Keep shining, the world needs your light."); // Fallback quote
          }
        })
        .catch(error => {
          console.error("Error fetching daily quote:", error);
          setQuote("The best way to predict the future is to create it."); // Fallback on error
          toast({
            title: "AI Quote Error",
            description: "Could not fetch a new quote. Showing a default one.",
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsQuoteLoading(false);
        });
    }
    
    return () => {
      window.removeEventListener('dayflow-datachanged', handleDataChange);
    };
  }, [loadPrioritiesFromStorage, toast]);

  useEffect(() => {
    if (!isInitialPriorityLoad) {
      localStorage.setItem('dayflow-priorities', JSON.stringify(priorities));
    }
  }, [priorities, isInitialPriorityLoad]);

  const addPriority = () => {
    if (newPriority.trim()) {
      setPriorities(prevPriorities => {
        const currentActualPriorities = prevPriorities.filter(p => p.id !== DEFAULT_PRIORITY_PLACEHOLDER_ID);
        if (currentActualPriorities.length < 3) {
          return [...currentActualPriorities, { id: Date.now().toString(), text: newPriority, completed: false }];
        }
        // Optionally, toast if max priorities reached
        if(currentActualPriorities.length >= 3) {
            toast({ title: "Priorities Full", description: "Maximum of 3 priorities allowed."});
        }
        return prevPriorities.some(p => p.id === DEFAULT_PRIORITY_PLACEHOLDER_ID) ? prevPriorities : [DEFAULT_PRIORITY_PLACEHOLDER, ...currentActualPriorities].slice(0,4);
      });
      setNewPriority('');
    }
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

        const actualPriorities = updatedPriorities.filter(p => p.id !== DEFAULT_PRIORITY_PLACEHOLDER_ID);
        if (actualPriorities.length === 0 && !updatedPriorities.find(p => p.id === DEFAULT_PRIORITY_PLACEHOLDER_ID && !p.completed)) {
            return [DEFAULT_PRIORITY_PLACEHOLDER];
        }
        
        if (actualPriorities.length > 0 && updatedPriorities.some(p => p.id === DEFAULT_PRIORITY_PLACEHOLDER_ID)) {
            return actualPriorities;
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
                {displayablePriorities.length < 3 && (
                  <div className="mt-2 flex gap-2">
                    <Input 
                      value={newPriority} 
                      onChange={(e) => setNewPriority(e.target.value)}
                      placeholder="Add a priority (max 3)"
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && addPriority()}
                    />
                    <Button onClick={addPriority} size="icon" className="h-10 w-10">
                      <PlusCircle />
                    </Button>
                  </div>
                )}
                {displayablePriorities.length === 0 && priorities.some(p => p.id === DEFAULT_PRIORITY_PLACEHOLDER_ID) &&(
                  <p className="text-sm text-muted-foreground italic text-center py-2">No priorities set. Add up to 3!</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  {isQuoteLoading ? <Zap className="text-accent animate-pulse" /> : <MessageSquareQuote className="text-accent" />}
                  Motivation
                </h3>
                <p className="text-sm italic text-muted-foreground p-3 bg-secondary/30 rounded-md min-h-[40px]">
                  {isQuoteLoading ? "Fetching inspiring words..." : quote || " "}
                </p>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
