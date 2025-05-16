
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, ListChecks, Briefcase, User, HeartPulse, ShoppingCart } from "lucide-react";
import type { Task, TaskCategory } from '@/types/dayflow';
import { useToast } from "@/hooks/use-toast";

const CATEGORIES: { name: TaskCategory, icon: React.ElementType }[] = [
  { name: 'Work', icon: Briefcase },
  { name: 'Personal', icon: User },
  { name: 'Health/Fitness', icon: HeartPulse },
  { name: 'Errands', icon: ShoppingCart },
];

const initialTaskState = (): Record<TaskCategory, Task[]> => {
  const state: Record<TaskCategory, Task[]> = {
    Work: [], Personal: [], 'Health/Fitness': [], Errands: []
  };
  // Ensure all defined categories are present
  CATEGORIES.forEach(cat => {
    if (!state[cat.name]) {
      state[cat.name] = [];
    }
  });
  return state;
};


export function ToDoListCard() {
  const [tasks, setTasks] = useState<Record<TaskCategory, Task[]>>(initialTaskState());
  const [newTaskInputs, setNewTaskInputs] = useState<Record<TaskCategory, string>>({
    Work: '', Personal: '', 'Health/Fitness': '', Errands: ''
  });
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const loadTasks = () => {
    const storedTasks = localStorage.getItem('dayflow-todolist-tasks');
    let newTasksState = initialTaskState();
    if (storedTasks) {
        try {
            const parsedTasks = JSON.parse(storedTasks);
            // Merge stored tasks with initial state to ensure all categories are covered
            for (const category in newTasksState) {
                if (parsedTasks[category]) {
                    newTasksState[category as TaskCategory] = parsedTasks[category];
                }
            }
        } catch (error) {
            console.error("Error parsing tasks from localStorage", error);
            // Fallback to initial empty state if parsing fails
        }
    }
    setTasks(newTasksState);
  };


  useEffect(() => {
    loadTasks(); // Initial load

    const handleDataChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    window.addEventListener('dayflow-datachanged', handleDataChange);
    return () => {
      window.removeEventListener('dayflow-datachanged', handleDataChange);
    };
  }, []);

  useEffect(() => {
    if (refreshKey > 0) { // Avoid re-load on initial mount if already loaded
        loadTasks();
    }
  }, [refreshKey]);


  useEffect(() => {
    // Avoid saving empty initial state immediately if it was just loaded
    if (Object.values(tasks).some(taskList => taskList.length > 0) || refreshKey > 0) {
         localStorage.setItem('dayflow-todolist-tasks', JSON.stringify(tasks));
    }
  }, [tasks, refreshKey]);

  const addTask = (category: TaskCategory) => {
    const text = newTaskInputs[category].trim();
    if (!text) return;
    const newTask: Task = { id: Date.now().toString(), text, completed: false, category };
    setTasks(prevTasks => ({
      ...prevTasks,
      [category]: [...(prevTasks[category] || []), newTask]
    }));
    setNewTaskInputs(prevInputs => ({ ...prevInputs, [category]: '' }));
    toast({ title: "Task Added", description: `"${text}" added to ${category}.`});
  };

  const toggleTask = (category: TaskCategory, taskId: string) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [category]: prevTasks[category].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const removeTask = (category: TaskCategory, taskId: string) => {
     setTasks(prevTasks => ({
      ...prevTasks,
      [category]: prevTasks[category].filter(task => task.id !== taskId)
    }));
    toast({ title: "Task Removed", variant: "destructive"});
  };

  const handleInputChange = (category: TaskCategory, value: string) => {
    setNewTaskInputs(prevInputs => ({ ...prevInputs, [category]: value }));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ListChecks className="text-primary" />
          To-Do Lists
        </CardTitle>
        <CardDescription>Organize your tasks by category.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Work" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.name} value={cat.name} className="text-xs sm:text-sm">
                <cat.icon className="h-4 w-4 mr-1 sm:mr-2" />{cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map(cat => (
            <TabsContent key={cat.name} value={cat.name}>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTaskInputs[cat.name]}
                    onChange={(e) => handleInputChange(cat.name, e.target.value)}
                    placeholder={`Add a ${cat.name.toLowerCase()} task`}
                    onKeyPress={(e) => e.key === 'Enter' && addTask(cat.name)}
                  />
                  <Button onClick={() => addTask(cat.name)} size="icon">
                    <PlusCircle />
                  </Button>
                </div>
                {(tasks[cat.name] && tasks[cat.name].length > 0) ? (
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {tasks[cat.name].map(task => (
                      <li key={task.id} className="flex items-center gap-2 p-2 bg-card rounded-md hover:bg-secondary/30 transition-colors">
                        <Checkbox id={`task-${cat.name}-${task.id}`} checked={task.completed} onCheckedChange={() => toggleTask(cat.name, task.id)} />
                        <label htmlFor={`task-${cat.name}-${task.id}`} className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.text}</label>
                        <Button variant="ghost" size="icon" onClick={() => removeTask(cat.name, task.id)} className="h-7 w-7">
                          <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center py-4">No tasks in {cat.name}. Add some!</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
