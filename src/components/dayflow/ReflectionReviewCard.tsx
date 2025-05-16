"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BookText, Smile, Meh, Frown, Brain, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import type { ReflectionItem, Mood } from '@/types/dayflow';
import { useToast } from "@/hooks/use-toast";

const REFLECTION_QUESTIONS: { id: string, question: string, icon: React.ElementType }[] = [
  { id: 'q1', question: 'What went well today?', icon: TrendingUp },
  { id: 'q2', question: "What didn't go as planned?", icon: TrendingDown },
  { id: 'q3', question: 'What can I improve for tomorrow?', icon: Brain },
];

const MOOD_OPTIONS: { value: Mood, label: string, icon: React.ElementType }[] = [
  { value: 'Happy', label: 'Happy', icon: Smile },
  { value: 'Productive', label: 'Productive', icon: CheckCircle },
  { value: 'Neutral', label: 'Neutral', icon: Meh },
  { value: 'Tired', label: 'Tired', icon: Frown }, // Replaced Frown with something for Tired if available, or use a generic one
  { value: 'Stressed', label: 'Stressed', icon: Frown },
];


export function ReflectionReviewCard() {
  const [reflections, setReflections] = useState<ReflectionItem[]>(
    REFLECTION_QUESTIONS.map(q => ({ id: q.id, question: q.question, answer: '' }))
  );
  const [mood, setMood] = useState<Mood>('');
  const { toast } = useToast();

  useEffect(() => {
    const storedReflections = localStorage.getItem('dayflow-reflections');
    if (storedReflections) setReflections(JSON.parse(storedReflections));
    const storedMood = localStorage.getItem('dayflow-mood');
    if (storedMood) setMood(storedMood as Mood);
  }, []);

  const handleReflectionChange = (id: string, answer: string) => {
    setReflections(prev => prev.map(r => r.id === id ? { ...r, answer } : r));
  };

  const saveReflection = () => {
    localStorage.setItem('dayflow-reflections', JSON.stringify(reflections));
    localStorage.setItem('dayflow-mood', mood);
    toast({title: "Reflection Saved", description: "Your daily review has been saved."});
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <BookText className="text-primary" />
          Reflection & Review
        </CardTitle>
        <CardDescription>Reflect on your day and track your mood.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {reflections.map(item => {
          const questionData = REFLECTION_QUESTIONS.find(q => q.id === item.id);
          const Icon = questionData?.icon || Brain;
          return (
          <div key={item.id} className="space-y-1">
            <Label htmlFor={`reflection-${item.id}`} className="font-semibold flex items-center gap-2">
              <Icon className="h-5 w-5 text-accent" /> {item.question}
            </Label>
            <Textarea
              id={`reflection-${item.id}`}
              value={item.answer}
              onChange={(e) => handleReflectionChange(item.id, e.target.value)}
              placeholder="Your thoughts..."
              rows={3}
              className="text-sm"
            />
          </div>
        )})}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2"><Smile className="h-5 w-5 text-accent" /> Mood Tracker</h4>
          <RadioGroup value={mood} onValueChange={(value) => setMood(value as Mood)} className="flex flex-wrap gap-2 sm:gap-4">
            {MOOD_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`mood-${opt.value}`} />
                <Label htmlFor={`mood-${opt.value}`} className="flex items-center gap-1 cursor-pointer">
                  <Icon className={`h-5 w-5 ${mood === opt.value ? 'text-primary' : 'text-muted-foreground' }`} /> {opt.label}
                </Label>
              </div>
            )})}
          </RadioGroup>
        </div>
        <Button onClick={saveReflection} className="w-full sm:w-auto">Save Reflection</Button>
      </CardContent>
    </Card>
  );
}
