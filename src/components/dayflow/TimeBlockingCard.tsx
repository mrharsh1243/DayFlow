
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, PlusCircle, Trash2, Lock, Edit3, AlertTriangle } from "lucide-react";
import type { Task, TimeSlot as TimeSlotType } from '@/types/dayflow'; 
import { TIME_SLOTS } from '@/types/dayflow';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScheduledTask extends Task {
  timeSlotId: string;
}

// Hoist TimeSlot to be a top-level component or ensure it's defined before TimeBlockingCard
interface TimeSlotProps {
  slot: TimeSlotType;
  tasks: ScheduledTask[];
  onAddTask: (taskText: string, isLocked: boolean) => void;
  onRemoveTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: ScheduledTask) => void;
}

const TimeSlot = React.forwardRef<HTMLDivElement, TimeSlotProps>(
  ({ slot, tasks, onAddTask, onRemoveTask, onToggleTask, onEditTask }, ref) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [isLockedSlot, setIsLockedSlot] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const [isClientInternal, setIsClientInternal] = useState(false);
    const [isCurrentHourActive, setIsCurrentHourActive] = useState(false);

    useEffect(() => {
      setIsClientInternal(true);
    }, []);

    useEffect(() => {
      if (!isClientInternal) return;

      const checkCurrentHour = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const [slotHourStr] = slot.isoTime.split(':');
        const slotHour = parseInt(slotHourStr);
        
        const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotHour);
        setIsCurrentHourActive(currentHour === slotHour && slotDate.toDateString() === now.toDateString());
      };

      checkCurrentHour(); 
      const intervalId = setInterval(checkCurrentHour, 60000); 

      return () => clearInterval(intervalId);
    }, [isClientInternal, slot.isoTime]);


    let isSlotPast = false;
    if (isClientInternal) {
      const now = new Date();
      const [slotHourStr, slotMinuteStr] = slot.isoTime.split(':');
      const slotDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(slotHourStr), parseInt(slotMinuteStr));
      isSlotPast = slotDateTime < now && slotDateTime.toDateString() === now.toDateString();
    }


    const handleAddTask = () => {
      if (newTaskText.trim()) {
        onAddTask(newTaskText, isLockedSlot);
        setNewTaskText('');
        setIsLockedSlot(false);
        setIsDialogOpen(false);
      }
    };

    return (
      <div 
        ref={ref} 
        className={`p-3 border rounded-lg bg-card/60 hover:shadow-sm transition-all duration-300 ${isCurrentHourActive ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/50' : 'border-border'}`}
      > 
        <div className="flex justify-between items-center mb-1.5"> 
          <h4 className={`font-semibold text-base ${isCurrentHourActive ? 'text-primary' : 'text-foreground'}`}>{slot.label}</h4> 
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm"> 
                <PlusCircle className="mr-1.5 h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Task to {slot.label}</DialogTitle>
                <DialogDescription>
                  Enter task details. Locked tasks are considered fixed appointments.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-start gap-4"> 
                  <Label htmlFor={`task-text-${slot.id}`} className="text-right pt-1.5">Task</Label> 
                  <Textarea 
                    id={`task-text-${slot.id}`}
                    value={newTaskText} 
                    onChange={(e) => setNewTaskText(e.target.value)} 
                    className="col-span-3"
                    placeholder="Describe the task"
                    rows={2} 
                  />
                </div>
                <div className="flex items-center space-x-2 col-start-2 col-span-3"> 
                  <Checkbox id={`is-locked-${slot.id}`} checked={isLockedSlot} onCheckedChange={(checked) => setIsLockedSlot(checked as boolean)} />
                  <Label htmlFor={`is-locked-${slot.id}`} className="text-sm font-normal">Mark as locked time</Label> 
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {tasks.length > 0 ? (
          <ul className="space-y-1.5 text-sm"> 
            {tasks.map(task => {
              const isOverdue = isClientInternal && isSlotPast && !task.completed && !task.isLocked && parseInt(slot.isoTime.split(':')[0]) < new Date().getHours();
              return (
                <li key={task.id} className={`flex items-center gap-2 p-1.5 rounded ${task.isLocked ? 'bg-primary/10' : 'bg-muted/40'} ${isOverdue ? 'opacity-75' : ''}`}> 
                  <Checkbox id={`task-${slot.id}-${task.id}`} checked={task.completed} onCheckedChange={() => onToggleTask(task.id)} disabled={task.isLocked} aria-label={`Mark task ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}/>
                  <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'} ${isOverdue ? 'text-destructive' : ''}`}>
                    {isOverdue && <AlertTriangle className="inline h-3.5 w-3.5 mr-1.5 text-destructive" />}
                    {task.isLocked && <Lock className="inline h-3.5 w-3.5 mr-1.5 text-accent" />} 
                    {task.text}
                  </span>
                  {!task.isLocked && (
                     <Button variant="ghost" size="icon" onClick={() => onEditTask(task)} className="h-7 w-7" aria-label={`Edit task ${task.text}`}> 
                        <Edit3 className="h-4 w-4 text-primary/80 hover:text-primary" />
                      </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => onRemoveTask(task.id)} className="h-7 w-7" aria-label={`Remove task ${task.text}`}> 
                    <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground italic px-1 py-2">No tasks for this slot.</p> 
        )}
      </div>
    );
  }
);
TimeSlot.displayName = 'TimeSlot';


export function TimeBlockingCard() {
  const [tasks, setTasks] = useState<Record<string, ScheduledTask[]>>({});
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [editingText, setEditingText] = useState('');
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeSlotIndexRef = useRef<number | null>(null);

  const [playedStartSounds, setPlayedStartSounds] = useState<Record<string, boolean>>({});
  const [playedWarningSounds, setPlayedWarningSounds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsClient(true);
    slotRefs.current = Array(TIME_SLOTS.length).fill(null);
  }, []);

  const loadTasks = useCallback(() => {
    const storedTasks = localStorage.getItem('dayflow-timeblock-tasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error("Error parsing timeblock tasks from localStorage", error);
        setTasks({});
      }
    } else {
      setTasks({});
    }
  }, []); 

  useEffect(() => {
    loadTasks();
    const handleDataChange = () => setRefreshKey(prev => prev + 1);
    window.addEventListener('dayflow-datachanged', handleDataChange);
    return () => window.removeEventListener('dayflow-datachanged', handleDataChange);
  }, [loadTasks]); 

  useEffect(() => {
    if (refreshKey > 0) loadTasks();
  }, [refreshKey, loadTasks]); 

  useEffect(() => {
    if (Object.keys(tasks).length > 0 || refreshKey > 0) { 
        localStorage.setItem('dayflow-timeblock-tasks', JSON.stringify(tasks));
    }
  }, [tasks, refreshKey]);

  useEffect(() => {
    setPlayedStartSounds({});
    setPlayedWarningSounds({});
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const playSound = (soundPath: string) => {
      new Audio(soundPath).play().catch(e => console.error(`Error playing sound ${soundPath}:`, e));
    };

    const soundIntervalId = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const todayString = now.toDateString();

      TIME_SLOTS.forEach(slot => {
        const [slotHourStr] = slot.isoTime.split(':');
        const slotHour = parseInt(slotHourStr);
        const tasksInSlot = tasks[slot.id] || [];

        if (tasksInSlot.length === 0) return; 

        const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotHour);
        if (slotDate.toDateString() !== todayString) return; // Only for today's slots

        if (currentHour === slotHour && currentMinute === 0) {
          if (!playedStartSounds[slot.id]) {
            playSound('/slot-start-sound.mp3');
            setPlayedStartSounds(prev => ({ ...prev, [slot.id]: true }));
          }
        }

        if (currentHour === slotHour && currentMinute === 55) {
           if (!playedWarningSounds[slot.id]) {
            playSound('/slot-5min-warning.mp3');
            setPlayedWarningSounds(prev => ({ ...prev, [slot.id]: true }));
          }
        }
      });
    }, 60000); 

    return () => clearInterval(soundIntervalId);
  }, [isClient, tasks, playedStartSounds, playedWarningSounds]);


  useEffect(() => {
    if (!isClient) return;
  
    const scrollLogic = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const todayString = now.toDateString();
  
      const newActiveIndex = TIME_SLOTS.findIndex(slot => {
        const [slotHourStr] = slot.isoTime.split(':');
        const slotHour = parseInt(slotHourStr);
        const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotHour);
        return slotHour === currentHour && slotDate.toDateString() === todayString;
      });
  
      if (newActiveIndex !== -1) {
        if (newActiveIndex !== activeSlotIndexRef.current) {
          const behavior = activeSlotIndexRef.current === null ? 'smooth' : 'smooth'; // Use smooth for initial as well
          slotRefs.current[newActiveIndex]?.scrollIntoView({
            behavior: behavior,
            block: 'center',
          });
          activeSlotIndexRef.current = newActiveIndex;
        }
      } else {
         activeSlotIndexRef.current = null; // No active slot for today
      }
    };
  
    scrollLogic(); // Initial scroll
    const scrollIntervalId = setInterval(scrollLogic, 60000); // Check every minute
  
    return () => clearInterval(scrollIntervalId);
  }, [isClient, refreshKey]); // refreshKey might be relevant if data loading affects layout/refs


  const addTaskToSlot = useCallback((timeSlotId: string, taskText: string, isLocked: boolean = false) => {
    if (!taskText.trim()) return;
    const newTask: ScheduledTask = { 
      id: Date.now().toString(), 
      text: taskText, 
      completed: false, 
      timeSlotId,
      isLocked 
    };
    setTasks(prevTasks => ({
      ...prevTasks,
      [timeSlotId]: [...(prevTasks[timeSlotId] || []), newTask]
    }));
    toast({ title: "Task Added", description: `"${taskText}" added to ${TIME_SLOTS.find(s=>s.id === timeSlotId)?.label}.` });
  }, [toast]); 

  const removeTaskFromSlot = (timeSlotId: string, taskId: string) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [timeSlotId]: (prevTasks[timeSlotId] || []).filter(task => task.id !== taskId)
    }));
    toast({ title: "Task Removed", variant: "destructive" });
  };

  const toggleTaskCompletion = useCallback((timeSlotId: string, taskId: string) => {
    setTasks(prevTasks => {
      const newTasksForSlot = (prevTasks[timeSlotId] || []).map(task => {
        if (task.id === taskId) {
          const wasCompleted = task.completed;
          const updatedTask = { ...task, completed: !task.completed };
          if (!wasCompleted && updatedTask.completed && !updatedTask.isLocked) {
            new Audio('/completion-sound.mp3').play().catch(e => console.error("Error playing sound:", e));
          }
          return updatedTask;
        }
        return task;
      });
      return { ...prevTasks, [timeSlotId]: newTasksForSlot };
    });
  }, []);

  const startEditing = (task: ScheduledTask) => {
    setEditingTask(task);
    setEditingText(task.text);
  };

  const saveEditing = () => {
    if (editingTask && editingText.trim()) {
      setTasks(prevTasks => ({
        ...prevTasks,
        [editingTask.timeSlotId]: (prevTasks[editingTask.timeSlotId] || []).map(task => 
          task.id === editingTask.id ? { ...task, text: editingText } : task
        )
      }));
      toast({ title: "Task Updated" });
    }
    setEditingTask(null);
    setEditingText('');
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditingText('');
  };


  return (
    <Card className="shadow-lg md:col-span-2 lg:col-span-3 xl:col-span-4"> 
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="w-full text-left hover:no-underline p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Clock className="text-primary" />
                Time Blocking Schedule
              </CardTitle>
              <CardDescription>Plan your day hour by hour from 6 AM to 10 PM.</CardDescription>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="p-6 pt-2">
              <ScrollArea className="h-[60vh] pr-3"> 
                <div className="space-y-3"> 
                  {TIME_SLOTS.map((slot, index) => (
                    <TimeSlot
                      key={slot.id}
                      ref={el => slotRefs.current[index] = el}
                      slot={slot}
                      tasks={tasks[slot.id] || []}
                      onAddTask={(taskText, isLocked) => addTaskToSlot(slot.id, taskText, isLocked)}
                      onRemoveTask={(taskId) => removeTaskFromSlot(slot.id, taskId)}
                      onToggleTask={(taskId) => toggleTaskCompletion(slot.id, taskId)}
                      onEditTask={startEditing}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
       {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={(isOpen) => !isOpen && cancelEditing()}>
          <DialogContent className="sm:max-w-[425px]"> 
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Make changes to your task description here.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                value={editingText} 
                onChange={(e) => setEditingText(e.target.value)}
                placeholder="Task description"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
              <Button onClick={saveEditing}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
    

