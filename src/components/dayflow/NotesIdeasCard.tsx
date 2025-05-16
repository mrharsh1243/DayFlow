"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from '../ui/button';

export function NotesIdeasCard() {
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedNotes = localStorage.getItem('dayflow-notes');
    if (storedNotes) {
      setNotes(storedNotes);
    }
  }, []);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  const saveNotes = () => {
    localStorage.setItem('dayflow-notes', notes);
    toast({title: "Notes Saved", description: "Your notes and ideas have been saved."});
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Lightbulb className="text-primary" />
          Notes & Ideas
        </CardTitle>
        <CardDescription>A space for your thoughts, brain dumps, and brilliant ideas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Jot down anything..."
          rows={8}
          className="min-h-[150px] text-sm"
        />
        <Button onClick={saveNotes} className="w-full sm:w-auto">Save Notes</Button>
      </CardContent>
    </Card>
  );
}
