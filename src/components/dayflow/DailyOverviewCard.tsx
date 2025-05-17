
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, ListTodo, MessageSquareQuote, PlusCircle, Trash2 } from "lucide-react";
import type { Priority } from '@/types/dayflow'; 
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const quotes = [
  "The secret of getting ahead is getting started.",
  "The best way to predict the future is to create it.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Your limitation—it's only your imagination."
];

export function DailyOverviewCard() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [newPriority, setNewPriority] = useState('');
  const [quote, setQuote] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadPriorities = useCallback(() => {
    const storedPriorities = localStorage.getItem('dayflow-priorities');
    if (storedPriorities) {
      try {
        const parsedPriorities = JSON.parse(storedPriorities);
        setPriorities(Array.isArray(parsedPriorities) ? parsedPriorities : []);
      } catch (e) {
        console.error("Failed to parse priorities from localStorage", e);
        setPriorities([{ id: 'prio-default', text: 'Define top goal for the day', completed: false }]);
      }
    } else {
      setPriorities([{ id: 'prio-default', text: 'Define top goal for the day', completed: false }]);
    }
  }, []);

  useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
    setCurrentDay(date.toLocaleDateString(undefined, { weekday: 'long' }));
    
    // Client-side only quote generation
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    loadPriorities();
    
    const handleDataChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    window.addEventListener('dayflow-datachanged', handleDataChange);
    return () => {
      window.removeEventListener('dayflow-datachanged', handleDataChange);
    };
  }, [loadPriorities]);

  useEffect(() => {
    if (refreshKey > 0) { 
        loadPriorities();
    }
  }, [refreshKey, loadPriorities]);

  useEffect(() => {
    if (refreshKey > 0 || (priorities.length > 0 && priorities[0].id !== 'prio-default') || priorities.length === 0 && localStorage.getItem('dayflow-priorities') !== null) {
      localStorage.setItem('dayflow-priorities', JSON.stringify(priorities));
    }
  }, [priorities, refreshKey]);

  const addPriority = () => {
    if (newPriority.trim() && priorities.length < 3) {
      setPriorities([...priorities, { id: Date.now().toString(), text: newPriority, completed: false }]);
      setNewPriority('');
      setRefreshKey(prev => prev + 1);
    }
  };

  const togglePriority = (id: string) => {
    setPriorities(priorities.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
    setRefreshKey(prev => prev + 1);
  };
  
  const removePriority = (id: string) => {
    setPriorities(priorities.filter(p => p.id !== id));
    setRefreshKey(prev => prev + 1);
  };

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
                  {priorities.map(priority => (
                    <li key={priority.id} className="flex items-center gap-2">
                      <Checkbox id={`prio-${priority.id}`} checked={priority.completed} onCheckedChange={() => togglePriority(priority.id)} />
                      <label htmlFor={`prio-${priority.id}`} className={`flex-1 ${priority.completed ? 'line-through text-muted-foreground' : ''}`}>{priority.text}</label>
                      <Button variant="ghost" size="icon" onClick={() => removePriority(priority.id)} className="h-6 w-6">
                        <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
                {priorities.length < 3 && (
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
                {priorities.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-2">No priorities set. Add up to 3!</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><MessageSquareQuote className="text-accent" /> Motivation</h3>
                <p className="text-sm italic text-muted-foreground p-3 bg-secondary/30 rounded-md">{quote}</p>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
