
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="w-full text-left hover:no-underline p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Lightbulb className="text-primary" />
                Notes & Ideas
              </CardTitle>
              <CardDescription>A space for your thoughts, brain dumps, and brilliant ideas.</CardDescription>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="space-y-3 p-6 pt-2">
              <Textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Jot down anything..."
                rows={8}
                className="min-h-[150px] text-sm"
              />
              <Button onClick={saveNotes} className="w-full sm:w-auto">Save Notes</Button>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
