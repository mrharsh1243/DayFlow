"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CalendarPlus } from "lucide-react";
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

export function AiFeaturesCard() {
  const { toast } = useToast();
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [suggestedTasksResult, setSuggestedTasksResult] = useState<string[] | null>(null);
  const [scheduleResult, setScheduleResult] = useState<{ suggestedStartTime: string; justification: string } | null>(null);

  // State for SuggestTasksInput
  const [userHistory, setUserHistory] = useState("Completed 'Morning Coffee & Email Check'. Usually works on Project Titan from 10 AM - 12 PM.");
  const [currentSchedule, setCurrentSchedule] = useState("1 PM - Lunch with team. 4 PM - Client Call.");
  const [priorities, setPriorities] = useState("Finalize Q3 report, Prepare presentation slides for Friday.");
  const [weatherForecast, setWeatherForecast] = useState("Sunny, 25°C. Slight chance of rain in the evening.");

  // State for ScheduleLockedTimeInput
  const [taskName, setTaskName] = useState("Dentist Appointment");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [earliestStartTime, setEarliestStartTime] = useState("09:00");
  const [latestEndTime, setLatestEndTime] = useState("17:00");
  const [bufferBefore, setBufferBefore] = useState(15);
  const [bufferAfter, setBufferAfter] = useState(10);
  const [otherObligations, setOtherObligations] = useState("Need 20 mins travel time each way. School pick-up at 3:30 PM.");

  const handleSuggestTasks = async () => {
    setIsLoadingTasks(true);
    setSuggestedTasksResult(null);
    try {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const input: SuggestTasksInput = { userHistory, currentSchedule, priorities, currentTime, weatherForecast };
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
      toast({ title: "Time Slot Scheduled!", description: "AI has suggested a time for your locked task." });
    } catch (error) {
      console.error("Error scheduling time:", error);
      toast({ title: "Error", description: "Could not schedule time. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="text-primary" />
          AI Assistant
        </CardTitle>
        <CardDescription>Let AI help you plan your day more effectively.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Intelligent Task Suggestion */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              <Sparkles className="mr-2 h-4 w-4" /> Suggest Tasks
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Intelligent Task Suggestion</DialogTitle>
              <DialogDescription>Provide context for the AI to suggest relevant tasks.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userHistory" className="text-right">Your Habits</Label>
                <Textarea id="userHistory" value={userHistory} onChange={(e) => setUserHistory(e.target.value)} className="col-span-3" placeholder="e.g., Morning run, work on Project X" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentSchedule" className="text-right">Today's Fixed Events</Label>
                <Textarea id="currentSchedule" value={currentSchedule} onChange={(e) => setCurrentSchedule(e.target.value)} className="col-span-3" placeholder="e.g., 10 AM Meeting, 1 PM Lunch" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priorities" className="text-right">Top Priorities</Label>
                <Textarea id="priorities" value={priorities} onChange={(e) => setPriorities(e.target.value)} className="col-span-3" placeholder="e.g., Finish report, Call John" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="weatherForecast" className="text-right">Weather (Optional)</Label>
                <Input id="weatherForecast" value={weatherForecast} onChange={(e) => setWeatherForecast(e.target.value)} className="col-span-3" placeholder="e.g., Sunny, 22°C" />
              </div>
            </div>
            {suggestedTasksResult && (
              <div className="mt-4 p-3 bg-secondary/50 rounded-md">
                <h4 className="font-semibold mb-2">Suggested Tasks:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {suggestedTasksResult.map((task, index) => <li key={index}>{task}</li>)}
                </ul>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleSuggestTasks} disabled={isLoadingTasks}>
                {isLoadingTasks ? "Suggesting..." : "Get Suggestions"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Scheduled "locked time slot" suggestions */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              <CalendarPlus className="mr-2 h-4 w-4" /> AI Schedule Locked Time
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>AI Schedule Locked Time</DialogTitle>
              <DialogDescription>Let AI find the best slot for your fixed task/appointment.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taskName" className="text-right">Task Name</Label>
                <Input id="taskName" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="col-span-3" placeholder="e.g., Doctor's appointment" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="durationMinutes" className="text-right">Duration (min)</Label>
                <Input id="durationMinutes" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="earliestStartTime" className="text-right">Earliest Start</Label>
                <Input id="earliestStartTime" type="time" value={earliestStartTime} onChange={(e) => setEarliestStartTime(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="latestEndTime" className="text-right">Latest End</Label>
                <Input id="latestEndTime" type="time" value={latestEndTime} onChange={(e) => setLatestEndTime(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bufferBefore" className="text-right">Buffer Before (min)</Label>
                <Input id="bufferBefore" type="number" value={bufferBefore} onChange={(e) => setBufferBefore(parseInt(e.target.value))} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bufferAfter" className="text-right">Buffer After (min)</Label>
                <Input id="bufferAfter" type="number" value={bufferAfter} onChange={(e) => setBufferAfter(parseInt(e.target.value))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="otherObligations" className="text-right">Other Obligations</Label>
                <Textarea id="otherObligations" value={otherObligations} onChange={(e) => setOtherObligations(e.target.value)} className="col-span-3" placeholder="e.g., Travel time, existing meetings" />
              </div>
            </div>
             {scheduleResult && (
              <div className="mt-4 p-3 bg-secondary/50 rounded-md">
                <h4 className="font-semibold">Suggested Start Time: {scheduleResult.suggestedStartTime}</h4>
                <p className="text-sm mt-1"><strong>Justification:</strong> {scheduleResult.justification}</p>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleScheduleLockedTime} disabled={isLoadingSchedule}>
                {isLoadingSchedule ? "Scheduling..." : "Find Slot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
