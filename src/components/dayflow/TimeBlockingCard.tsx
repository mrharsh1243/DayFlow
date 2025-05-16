"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, PlusCircle, Trash2, Lock, Edit3, CheckSquare, XSquare } from "lucide-react";
import type { Task, TimeSlot as TimeSlotType } from '@/types/dayflow'; // Renamed to avoid conflict
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

interface ScheduledTask extends Task {
  timeSlotId: string;
}

export function TimeBlockingCard() {
  const [tasks, setTasks] = useState<Record<string, ScheduledTask[]>>({});
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [editingText, setEditingText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedTasks = localStorage.getItem('dayflow-timeblock-tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dayflow-timeblock-tasks', JSON.stringify(tasks));
  }, [tasks]);

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
    toast({ title: "Task Added", description: `"${taskText}" added to ${timeSlotId}.` });
  }, [toast]);

  const removeTaskFromSlot = (timeSlotId: string, taskId: string) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [timeSlotId]: (prevTasks[timeSlotId] || []).filter(task => task.id !== taskId)
    }));
    toast({ title: "Task Removed", variant: "destructive" });
  };

  const toggleTaskCompletion = (timeSlotId: string, taskId: string) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [timeSlotId]: (prevTasks[timeSlotId] || []).map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

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
    <Card className="shadow-lg col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Clock className="text-primary" />
          Time Blocking Schedule
        </CardTitle>
        <CardDescription>Plan your day hour by hour from 6 AM to 10 PM.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {TIME_SLOTS.map(slot => (
          <TimeSlot
            key={slot.id}
            slot={slot}
            tasks={tasks[slot.id] || []}
            onAddTask={(taskText, isLocked) => addTaskToSlot(slot.id, taskText, isLocked)}
            onRemoveTask={(taskId) => removeTaskFromSlot(slot.id, taskId)}
            onToggleTask={(taskId) => toggleTaskCompletion(slot.id, taskId)}
            onEditTask={startEditing}
          />
        ))}
      </CardContent>
       {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={(isOpen) => !isOpen && cancelEditing()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
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

interface TimeSlotProps {
  slot: TimeSlotType;
  tasks: ScheduledTask[];
  onAddTask: (taskText: string, isLocked: boolean) => void;
  onRemoveTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: ScheduledTask) => void;
}

function TimeSlot({ slot, tasks, onAddTask, onRemoveTask, onToggleTask, onEditTask }: TimeSlotProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [isLockedSlot, setIsLockedSlot] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText, isLockedSlot);
      setNewTaskText('');
      setIsLockedSlot(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="p-3 border rounded-lg bg-card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-primary">{slot.label}</h4>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <PlusCircle className="mr-1 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task to {slot.label}</DialogTitle>
              <DialogDescription>
                Enter task details. Locked tasks are considered fixed appointments.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-text" className="text-right">Task</Label>
                <Textarea 
                  id="task-text" 
                  value={newTaskText} 
                  onChange={(e) => setNewTaskText(e.target.value)} 
                  className="col-span-3"
                  placeholder="Describe the task"
                />
              </div>
              <div className="flex items-center space-x-2 ml-auto mr-auto pl-[25%]"> {/* Adjusted for alignment */}
                <Checkbox id="is-locked" checked={isLockedSlot} onCheckedChange={(checked) => setIsLockedSlot(checked as boolean)} />
                <Label htmlFor="is-locked">Mark as locked time (e.g., meeting)</Label>
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
        <ul className="space-y-1 text-sm">
          {tasks.map(task => (
            <li key={task.id} className={`flex items-center gap-2 p-1.5 rounded ${task.isLocked ? 'bg-secondary/50' : ''}`}>
              <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => onToggleTask(task.id)} disabled={task.isLocked} />
              <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.isLocked && <Lock className="inline h-3 w-3 mr-1 text-accent" />}
                {task.text}
              </span>
              {!task.isLocked && (
                 <Button variant="ghost" size="icon" onClick={() => onEditTask(task)} className="h-6 w-6">
                    <Edit3 className="h-4 w-4 text-blue-500/70 hover:text-blue-500" />
                  </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => onRemoveTask(task.id)} className="h-6 w-6">
                <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground italic">No tasks scheduled for this slot.</p>
      )}
    </div>
  );
}
