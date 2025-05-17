
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CalendarPlus, PlusCircle, BrainCircuit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { suggestTasks, SuggestTasksInput } from '@/ai/flows/suggest-tasks';
import { scheduleLockedTime, ScheduleLockedTimeInput } from '@/ai/flows/schedule-locked-time';
import { generateSmartSchedule, SmartScheduleInput, SmartScheduleOutput } from '@/ai/flows/generate-smart-schedule';
import type { Task, Priority } from '@/types/dayflow';
import { TIME_SLOTS } from '@/types/dayflow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function AiFeaturesCard() {
  const { toast } = useToast();
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isLoadingSmartSchedule, setIsLoadingSmartSchedule] = useState(false);

  const [suggestedTasksResult, setSuggestedTasksResult] = useState<string[] | null>(null);
  const [scheduleResult, setScheduleResult] = useState<{ suggestedStartTime: string; justification: string } | null>(null);
  const [smartScheduleResult, setSmartScheduleResult] = useState<SmartScheduleOutput | null>(null);

  const [userHistory, setUserHistory] = useState("Completed 'Morning Coffee & Email Check'. Usually works on Project Titan from 10 AM - 12 PM.");
  const [currentScheduleText, setCurrentScheduleText] = useState("1 PM - Lunch with team. 4 PM - Client Call."); // Renamed to avoid conflict
  const [prioritiesContext, setPrioritiesContext] = useState("Finalize Q3 report, Prepare presentation slides for Friday.");
  const [weatherForecast, setWeatherForecast] = useState("Sunny, 25°C. Slight chance of rain in the evening.");

  const [taskName, setTaskName] = useState("Dentist Appointment");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [earliestStartTime, setEarliestStartTime] = useState("09:00");
  const [latestEndTime, setLatestEndTime] = useState("17:00");
  const [bufferBefore, setBufferBefore] = useState(15);
  const [bufferAfter, setBufferAfter] = useState(10);
  const [otherObligations, setOtherObligations] = useState("Need 20 mins travel time each way. School pick-up at 3:30 PM.");

  const [overallGoal, setOverallGoal] = useState("Have a productive day focusing on Project Alpha and maintaining work-life balance.");
  const [tasksToSchedule, setTasksToSchedule] = useState("Draft Project Alpha proposal\nReview Q2 financials\nTeam meeting re: Project Beta\nWorkout session\nCall with supplier");
  const [fixedEvents, setFixedEvents] = useState("11:00-11:30 Standup meeting. 14:00-15:00 Client demo call.");
  const [schedulePreferences, setSchedulePreferences] = useState("Prefer focused work in the morning. Group small admin tasks together if possible.");
  const [scheduleAvailableStartTime, setScheduleAvailableStartTime] = useState("08:00");
  const [scheduleAvailableEndTime, setScheduleAvailableEndTime] = useState("18:00");
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDateTime(now.toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
  }, []);


  const handleSuggestTasks = async () => {
    setIsLoadingTasks(true);
    setSuggestedTasksResult(null);
    try {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const input: SuggestTasksInput = { userHistory, currentSchedule: currentScheduleText, priorities: prioritiesContext, currentTime, weatherForecast };
      const result = await suggestTasks(input);
      setSuggestedTasksResult(result.suggestedTasks);
      toast({ title: "Tasks Suggested!", description: "AI has generated some task ideas for you." });
    } catch (error) {
      console.error("Error suggesting tasks:", error);
      toast({ title: "Error", description: "Could not suggest tasks. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleAddSuggestedTaskToPriority = (taskText: string) => {
    try {
      const storedPriorities = localStorage.getItem('dayflow-priorities');
      let currentPriorities: Priority[] = storedPriorities ? JSON.parse(storedPriorities) : [];
      
      if (currentPriorities.length < 3) {
        const newPriority: Priority = {
          id: Date.now().toString(),
          text: taskText,
          completed: false,
        };
        currentPriorities.push(newPriority);
        localStorage.setItem('dayflow-priorities', JSON.stringify(currentPriorities));
        window.dispatchEvent(new CustomEvent('dayflow-datachanged'));
        toast({ title: "Priority Added", description: `"${taskText}" added to your top priorities.` });
      } else {
        toast({ title: "Priorities Full", description: "Max 3 priorities. Remove one to add.", variant: "default" });
      }
    } catch (error) {
      console.error("Error adding task to priorities:", error);
      toast({ title: "Error", description: "Could not add task to priorities.", variant: "destructive" });
    }
  };

  const getSlotIdFromTime = (timeStr: string): string | null => {
    if (!timeStr || !timeStr.includes(':')) return TIME_SLOTS[0]?.id || null;
    const [hours] = timeStr.split(':').map(Number);
  
    if (isNaN(hours)) return TIME_SLOTS[0]?.id || null;
  
    let bestSlotId: string | null = null;
    for (let i = 0; i < TIME_SLOTS.length; i++) {
        const [slotHour] = TIME_SLOTS[i].isoTime.split(':').map(Number);
        if (hours < slotHour) {
            if (i > 0) bestSlotId = TIME_SLOTS[i-1].id;
            else bestSlotId = TIME_SLOTS[0].id; 
            break;
        }
        if (hours === slotHour) {
            bestSlotId = TIME_SLOTS[i].id;
            break;
        }
        if (i === TIME_SLOTS.length - 1) {
            bestSlotId = TIME_SLOTS[i].id;
        }
    }
    return bestSlotId || TIME_SLOTS[TIME_SLOTS.length -1]?.id || null; 
  };
  

  const handleAddScheduledTaskToTimeblock = () => {
    if (!scheduleResult) return;
    try {
      const timeSlotId = getSlotIdFromTime(scheduleResult.suggestedStartTime);
      if (!timeSlotId) {
        toast({ title: "Error", description: "Could not determine a valid time slot.", variant: "destructive" });
        return;
      }

      const storedTimeblockTasks = localStorage.getItem('dayflow-timeblock-tasks');
      const tasksByTimeSlot: Record<string, Task[]> = storedTimeblockTasks ? JSON.parse(storedTimeblockTasks) : {};

      if (!tasksByTimeSlot[timeSlotId]) {
        tasksByTimeSlot[timeSlotId] = [];
      }
      
      const newTask: Task = {
        id: Date.now().toString(),
        text: taskName, 
        completed: false,
        isLocked: true,
      };

      tasksByTimeSlot[timeSlotId].push(newTask);
      localStorage.setItem('dayflow-timeblock-tasks', JSON.stringify(tasksByTimeSlot));
      window.dispatchEvent(new CustomEvent('dayflow-datachanged'));
      toast({ title: "Task Scheduled", description: `"${taskName}" added to your time block.` });
    } catch (error) {
      console.error("Error adding scheduled task to timeblock:", error);
      toast({ title: "Error", description: "Could not schedule the task.", variant: "destructive" });
    }
  };


  const handleScheduleLockedTime = async () => {
    setIsLoadingSchedule(true);
    setScheduleResult(null);
    try {
      const input: ScheduleLockedTimeInput = {
        taskName,
        durationMinutes,
        earliestStartTime,
        latestEndTime,
        requiredBufferMinutesBefore: bufferBefore,
        requiredBufferMinutesAfter: bufferAfter,
        otherObligations,
      };
      const result = await scheduleLockedTime(input);
      setScheduleResult(result);
      toast({ title: "Time Slot Suggested!", description: "AI has suggested a time for your locked task." });
    } catch (error) {
      console.error("Error scheduling time:", error);
      toast({ title: "Error", description: "Could not schedule time. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const handleGenerateSmartSchedule = async () => {
    setIsLoadingSmartSchedule(true);
    setSmartScheduleResult(null);
    try {
      const tasksArray = tasksToSchedule.split('\n').map(t => t.trim()).filter(t => t.length > 0);
      if (tasksArray.length === 0) {
        toast({ title: "Input Error", description: "Please provide at least one task to schedule.", variant: "destructive"});
        setIsLoadingSmartSchedule(false);
        return;
      }
      const input: SmartScheduleInput = {
        overallGoal,
        tasksToSchedule: tasksArray,
        fixedEvents: fixedEvents || undefined,
        preferences: schedulePreferences || undefined,
        currentDayTime: currentDateTime,
        availableStartTime: scheduleAvailableStartTime,
        availableEndTime: scheduleAvailableEndTime,
      };
      const result = await generateSmartSchedule(input);
      setSmartScheduleResult(result);
      toast({ title: "Smart Schedule Generated!", description: "AI has proposed a schedule for your day." });
    } catch (error) {
      console.error("Error generating smart schedule:", error);
      toast({ title: "Error", description: "Could not generate smart schedule. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingSmartSchedule(false);
    }
  };
  
  const handleApplySmartScheduleToTimeblocks = () => {
    if (!smartScheduleResult || !smartScheduleResult.scheduledTasks) return;
  
    try {
      const storedTimeblockTasks = localStorage.getItem('dayflow-timeblock-tasks');
      let tasksByTimeSlot: Record<string, Task[]> = storedTimeblockTasks ? JSON.parse(storedTimeblockTasks) : {};
      
      // Clear existing non-locked tasks, keep locked ones
      for (const slotId in tasksByTimeSlot) {
        tasksByTimeSlot[slotId] = tasksByTimeSlot[slotId].filter(task => task.isLocked);
      }
  
      smartScheduleResult.scheduledTasks.forEach(item => {
        const timeSlotId = getSlotIdFromTime(item.suggestedStartTime);
        if (timeSlotId) {
          if (!tasksByTimeSlot[timeSlotId]) {
            tasksByTimeSlot[timeSlotId] = [];
          }
          const newTask: Task = {
            id: `${Date.now().toString()}-${item.taskName.replace(/\s+/g, '-')}`, // Ensure unique ID
            text: item.taskName,
            completed: false,
            // Determine if it's a fixed event that should be locked
            isLocked: fixedEvents?.toLowerCase().includes(item.taskName.toLowerCase()), 
          };
          // Avoid adding duplicate tasks if one with the same text already exists in the slot (e.g. manually added fixed event)
          if (!tasksByTimeSlot[timeSlotId].find(t => t.text === newTask.text)) {
             tasksByTimeSlot[timeSlotId].push(newTask);
          }
        } else {
            // Optionally, inform the user or log if a task couldn't be placed
            console.warn(`Could not find time slot for AI suggested time: ${item.suggestedStartTime} for task ${item.taskName}`);
        }
      });
  
      localStorage.setItem('dayflow-timeblock-tasks', JSON.stringify(tasksByTimeSlot));
      window.dispatchEvent(new CustomEvent('dayflow-datachanged'));
      toast({ title: "Smart Schedule Applied", description: "Your time blocks have been updated with the AI's suggestions." });
    } catch (error) {
      console.error("Error applying smart schedule to timeblocks:", error);
      toast({ title: "Error", description: "Could not apply the smart schedule.", variant: "destructive" });
    }
  };

  return (
    <Card className="shadow-lg">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="w-full text-left hover:no-underline p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="text-primary" />
                AI Assistant
              </CardTitle>
              <CardDescription>Let AI help you plan your day more effectively.</CardDescription>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="space-y-4 p-6 pt-2">
              {/* Generate Smart Schedule */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="default">
                    <BrainCircuit className="mr-2 h-4 w-4" /> Generate Smart Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Generate Smart Schedule</DialogTitle>
                    <DialogDescription>Provide details for the AI to create a comprehensive schedule for your day.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[45vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
                      <Label htmlFor="overallGoal" className="text-right pt-2 col-span-1">Overall Goal</Label>
                      <Textarea id="overallGoal" value={overallGoal} onChange={(e) => setOverallGoal(e.target.value)} className="col-span-3" placeholder="e.g., Focus on Project X, prepare for presentation" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
                      <Label htmlFor="tasksToSchedule" className="text-right pt-2 col-span-1">Tasks (one per line)</Label>
                      <Textarea id="tasksToSchedule" value={tasksToSchedule} onChange={(e) => setTasksToSchedule(e.target.value)} className="col-span-3" placeholder="e.g., Write report\nCall client\nGym session" rows={4}/>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
                      <Label htmlFor="fixedEvents" className="text-right pt-2 col-span-1">Fixed Events</Label>
                      <Textarea id="fixedEvents" value={fixedEvents} onChange={(e) => setFixedEvents(e.target.value)} className="col-span-3" placeholder="e.g., Meeting 10-11 AM, Lunch 1-2 PM" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="scheduleAvailableStartTime" className="text-right col-span-1">Available From</Label>
                      <Input id="scheduleAvailableStartTime" type="time" value={scheduleAvailableStartTime} onChange={(e) => setScheduleAvailableStartTime(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="scheduleAvailableEndTime" className="text-right col-span-1">Available Until</Label>
                      <Input id="scheduleAvailableEndTime" type="time" value={scheduleAvailableEndTime} onChange={(e) => setScheduleAvailableEndTime(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
                      <Label htmlFor="schedulePreferences" className="text-right pt-2 col-span-1">Preferences</Label>
                      <Textarea id="schedulePreferences" value={schedulePreferences} onChange={(e) => setSchedulePreferences(e.target.value)} className="col-span-3" placeholder="e.g., Morning for deep work, short breaks every 90 mins" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="currentDateTime" className="text-right col-span-1">Current Context</Label>
                      <Input id="currentDateTime" value={currentDateTime} onChange={(e) => setCurrentDateTime(e.target.value)} className="col-span-3" readOnly disabled />
                    </div>
                  </div>
                  
                  {smartScheduleResult && (
                      <div className="mt-1 p-4 bg-secondary/30 rounded-md max-h-[30vh] overflow-y-auto border-t">
                        <h4 className="font-semibold mb-2 text-lg">AI's Proposed Schedule:</h4>
                        {smartScheduleResult.overallSummary && (
                            <p className="text-sm italic mb-3 p-2 bg-background/50 rounded">{smartScheduleResult.overallSummary}</p>
                        )}
                        {smartScheduleResult.scheduledTasks && smartScheduleResult.scheduledTasks.length > 0 ? (
                          <ul className="space-y-3">
                            {smartScheduleResult.scheduledTasks.map((item, index) => (
                              <li key={index} className="p-2 border-b border-primary/20">
                                <p className="font-medium text-primary-foreground bg-primary/80 px-2 py-1 rounded-t-md">
                                    {item.suggestedStartTime} - {item.taskName}
                                </p>
                                {item.justification && <p className="text-xs text-muted-foreground mt-1 pl-1">{item.justification}</p>}
                              </li>
                            ))}
                          </ul>
                        ) : <p className="text-sm text-muted-foreground">AI could not generate a schedule with the given inputs, or no tasks were provided.</p>}
                        {smartScheduleResult.scheduledTasks && smartScheduleResult.scheduledTasks.length > 0 && (
                            <Button className="mt-4 w-full" onClick={handleApplySmartScheduleToTimeblocks} disabled={isLoadingSmartSchedule}>
                                <CalendarPlus className="mr-2 h-4 w-4" /> Apply Schedule to Time Blocks
                            </Button>
                        )}
                      </div>
                    )}
                  <DialogFooter className="pt-4 border-t">
                    <Button onClick={handleGenerateSmartSchedule} disabled={isLoadingSmartSchedule} className="w-full sm:w-auto">
                      {isLoadingSmartSchedule ? "Generating..." : "Generate My Schedule"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" /> Suggest Tasks for Priorities
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Intelligent Task Suggestion</DialogTitle>
                    <DialogDescription>Provide context for the AI to suggest relevant tasks for your Top Priorities.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
                      <Label htmlFor="userHistorySuggest" className="text-right pt-2 col-span-1">Your Habits</Label>
                      <Textarea id="userHistorySuggest" value={userHistory} onChange={(e) => setUserHistory(e.target.value)} className="col-span-3" placeholder="e.g., Morning run, work on Project X" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
                      <Label htmlFor="currentScheduleTextSuggest" className="text-right pt-2 col-span-1">Today's Fixed Events</Label>
                      <Textarea id="currentScheduleTextSuggest" value={currentScheduleText} onChange={(e) => setCurrentScheduleText(e.target.value)} className="col-span-3" placeholder="e.g., 10 AM Meeting, 1 PM Lunch" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
                      <Label htmlFor="prioritiesContextSuggest" className="text-right pt-2 col-span-1">Top Priorities Context</Label>
                      <Textarea id="prioritiesContextSuggest" value={prioritiesContext} onChange={(e) => setPrioritiesContext(e.target.value)} className="col-span-3" placeholder="e.g., Finish report, Call John" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="weatherForecastSuggest" className="text-right col-span-1">Weather (Optional)</Label>
                      <Input id="weatherForecastSuggest" value={weatherForecast} onChange={(e) => setWeatherForecast(e.target.value)} className="col-span-3" placeholder="e.g., Sunny, 22°C" />
                    </div>
                  
                    {suggestedTasksResult && (
                      <div className="col-span-4 mt-4 p-3 bg-secondary/50 rounded-md max-h-[30vh] overflow-y-auto">
                        <h4 className="font-semibold mb-2">Suggested Tasks for Priorities:</h4>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          {suggestedTasksResult.map((task, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <span>{task}</span>
                              <Button size="sm" variant="outline" onClick={() => handleAddSuggestedTaskToPriority(task)}>
                                <PlusCircle className="mr-2 h-3 w-3" /> Add to Priorities
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="pt-4 border-t">
                    <Button onClick={handleSuggestTasks} disabled={isLoadingTasks}>
                      {isLoadingTasks ? "Suggesting..." : "Get Suggestions"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <CalendarPlus className="mr-2 h-4 w-4" /> AI Schedule Single Locked Time
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>AI Schedule Single Locked Time</DialogTitle>
                    <DialogDescription>Let AI find the best slot for one fixed task/appointment.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="taskNameSchedule" className="text-right col-span-1">Task Name</Label>
                      <Input id="taskNameSchedule" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="col-span-3" placeholder="e.g., Doctor's appointment" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="durationMinutesSchedule" className="text-right col-span-1">Duration (min)</Label>
                      <Input id="durationMinutesSchedule" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="earliestStartTimeSchedule" className="text-right col-span-1">Earliest Start</Label>
                      <Input id="earliestStartTimeSchedule" type="time" value={earliestStartTime} onChange={(e) => setEarliestStartTime(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="latestEndTimeSchedule" className="text-right col-span-1">Latest End</Label>
                      <Input id="latestEndTimeSchedule" type="time" value={latestEndTime} onChange={(e) => setLatestEndTime(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="bufferBeforeSchedule" className="text-right col-span-1">Buffer Before (min)</Label>
                      <Input id="bufferBeforeSchedule" type="number" value={bufferBefore} onChange={(e) => setBufferBefore(parseInt(e.target.value))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                      <Label htmlFor="bufferAfterSchedule" className="text-right col-span-1">Buffer After (min)</Label>
                      <Input id="bufferAfterSchedule" type="number" value={bufferAfter} onChange={(e) => setBufferAfter(parseInt(e.target.value))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
                      <Label htmlFor="otherObligationsSchedule" className="text-right pt-2 col-span-1">Other Obligations</Label>
                      <Textarea id="otherObligationsSchedule" value={otherObligations} onChange={(e) => setOtherObligations(e.target.value)} className="col-span-3" placeholder="e.g., Travel time, existing meetings" />
                    </div>
                  
                  {scheduleResult && (
                    <div className="col-span-4 mt-4 p-3 bg-secondary/50 rounded-md">
                      <h4 className="font-semibold">Suggested Start Time: {scheduleResult.suggestedStartTime}</h4>
                      <p className="text-sm mt-1"><strong>Justification:</strong> {scheduleResult.justification}</p>
                      <Button className="mt-2 w-full" onClick={handleAddScheduledTaskToTimeblock} disabled={isLoadingSchedule}>
                        <CalendarPlus className="mr-2 h-4 w-4" /> Add to Schedule
                      </Button>
                    </div>
                  )}
                  </div>
                  <DialogFooter className="pt-4 border-t">
                    <Button onClick={handleScheduleLockedTime} disabled={isLoadingSchedule}>
                      {isLoadingSchedule ? "Scheduling..." : "Find Slot"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}


    