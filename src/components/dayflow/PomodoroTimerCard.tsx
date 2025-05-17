
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, TimerIcon, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const WORK_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes
const POMODOROS_BEFORE_LONG_BREAK = 4;

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export function PomodoroTimerCard() {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const { toast } = useToast();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTimerEnd = useCallback(() => {
    setIsRunning(false);
    toast({
      title: `${currentMode === 'work' ? 'Work' : 'Break'} session ended!`,
      description: currentMode === 'work' 
        ? (pomodorosCompleted + 1) % POMODOROS_BEFORE_LONG_BREAK === 0 
          ? "Time for a long break." 
          : "Time for a short break."
        : "Time to get back to work!",
    });

    if (currentMode === 'work') {
      const newPomodorosCompleted = pomodorosCompleted + 1;
      setPomodorosCompleted(newPomodorosCompleted);
      if (newPomodorosCompleted % POMODOROS_BEFORE_LONG_BREAK === 0) {
        setCurrentMode('longBreak');
        setTimeLeft(LONG_BREAK_DURATION);
      } else {
        setCurrentMode('shortBreak');
        setTimeLeft(SHORT_BREAK_DURATION);
      }
    } else { // shortBreak or longBreak ended
      setCurrentMode('work');
      setTimeLeft(WORK_DURATION);
    }
  }, [currentMode, pomodorosCompleted, toast]);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft === 0) {
      handleTimerEnd();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, handleTimerEnd]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (currentMode === 'work') {
      setTimeLeft(WORK_DURATION);
    } else if (currentMode === 'shortBreak') {
      setTimeLeft(SHORT_BREAK_DURATION);
    } else {
      setTimeLeft(LONG_BREAK_DURATION);
    }
  }, [currentMode]);

  const selectMode = (mode: TimerMode) => {
    setIsRunning(false);
    setCurrentMode(mode);
    if (mode === 'work') {
      setTimeLeft(WORK_DURATION);
    } else if (mode === 'shortBreak') {
      setTimeLeft(SHORT_BREAK_DURATION);
    } else {
      setTimeLeft(LONG_BREAK_DURATION);
    }
    // Reset pomodoros if switching to work manually after a break cycle might have been interrupted
    if (mode === 'work' && (currentMode === 'shortBreak' || currentMode === 'longBreak')) {
      // This logic is a bit tricky. If user manually switches to work, we assume a fresh start.
      // The pomodorosCompleted count persists for the cycle.
    }
  };
  
  useEffect(() => {
    // Update document title with time left
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} | DayFlow`;
    } else {
      const defaultTitle = "DayFlow - Plan Your Day";
      if (document.title !== defaultTitle) {
         document.title = defaultTitle;
      }
    }
    // Cleanup on unmount
    return () => {
      const defaultTitle = "DayFlow - Plan Your Day";
      if (document.title !== defaultTitle) {
         document.title = defaultTitle;
      }
    };
  }, [timeLeft, isRunning, currentMode]);


  return (
    <Card className="shadow-lg">
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="w-full text-left hover:no-underline p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TimerIcon className="text-primary" />
                Pomodoro Timer
              </CardTitle>
              <CardDescription>Focus with the Pomodoro technique.</CardDescription>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="space-y-4 p-6 pt-2"> {/* Reduced space-y-6 to space-y-4 */}
              <div className="flex flex-wrap justify-center gap-2 mb-2"> {/* Added flex-wrap, changed space-x to gap, reduced mb */}
                <Button variant={currentMode === 'work' ? 'default' : 'outline'} onClick={() => selectMode('work')} size="sm">
                  <Zap className="mr-2 h-4 w-4" /> Work
                </Button>
                <Button variant={currentMode === 'shortBreak' ? 'default' : 'outline'} onClick={() => selectMode('shortBreak')} size="sm">
                  <Coffee className="mr-2 h-4 w-4" /> Short Break
                </Button>
                <Button variant={currentMode === 'longBreak' ? 'default' : 'outline'} onClick={() => selectMode('longBreak')} size="sm">
                  <Coffee className="mr-2 h-4 w-4" /> Long Break
                </Button>
              </div>

              <div className="text-center">
                <p className="text-5xl sm:text-6xl font-bold text-primary tabular-nums"> {/* Responsive font size */}
                  {formatTime(timeLeft)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentMode === 'work' ? 'Focus Session' : currentMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3"> {/* Added flex-wrap, changed space-x to gap */}
                <Button onClick={toggleTimer} variant="default" size="lg" className="px-6 sm:px-8"> {/* Adjusted padding */}
                  {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={resetTimer} variant="outline" size="lg" className="px-6 sm:px-8"> {/* Adjusted padding */}
                  <RotateCcw className="mr-2 h-5 w-5" /> Reset
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground mt-2"> {/* Reduced mt */}
                Pomodoros completed this cycle: {pomodorosCompleted % POMODOROS_BEFORE_LONG_BREAK} / {POMODOROS_BEFORE_LONG_BREAK}
                <br />
                Total pomodoros today: {pomodorosCompleted}
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
