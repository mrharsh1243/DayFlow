
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { NoteItem } from '@/types/dayflow';
import { ScrollArea } from '../ui/scroll-area';

export function NotesIdeasCard() {
  const [notesList, setNotesList] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const { toast } = useToast();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const storedNotes = localStorage.getItem('dayflow-notes');
    if (storedNotes) {
      try {
        const parsedNotes = JSON.parse(storedNotes);
        if (Array.isArray(parsedNotes)) {
          setNotesList(parsedNotes);
        } else if (typeof parsedNotes === 'string') {
          // Handle old format: convert string to a single note item or start fresh
          // For simplicity, we'll start fresh if old format is detected.
          // Or, you could convert it: setNotesList([{ id: Date.now().toString(), text: parsedNotes }]);
          setNotesList([]);
        }
      } catch (e) {
        console.error("Error parsing notes from localStorage", e);
        setNotesList([]);
      }
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('dayflow-notes', JSON.stringify(notesList));
    }
  }, [notesList, isInitialLoad]);

  const handleAddNote = () => {
    if (newNoteText.trim() === '') {
      toast({ title: "Empty Note", description: "Cannot add an empty note.", variant: "destructive" });
      return;
    }
    const newNote: NoteItem = {
      id: Date.now().toString(),
      text: newNoteText.trim(),
    };
    setNotesList(prevNotes => [newNote, ...prevNotes]); // Add new notes to the top
    setNewNoteText('');
    toast({ title: "Note Added", description: "Your new note has been saved." });
  };

  const handleDeleteNote = (noteId: string) => {
    setNotesList(prevNotes => prevNotes.filter(note => note.id !== noteId));
    toast({ title: "Note Deleted", variant: "destructive" });
  };

  return (
    <Card className="shadow-lg">
      <Accordion type="single" collapsible className="w-full">
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
            <CardContent className="space-y-4 p-6 pt-2">
              <div className="space-y-2">
                <Textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Jot down a new note..."
                  rows={3}
                  className="text-sm"
                />
                <Button onClick={handleAddNote} className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Note
                </Button>
              </div>

              {notesList.length > 0 ? (
                <ScrollArea className="h-[200px] w-full pr-3">
                  <div className="space-y-3">
                    {notesList.map(note => (
                      <div key={note.id} className="p-3 bg-card rounded-md border flex justify-between items-start gap-2">
                        <p className="text-sm whitespace-pre-wrap flex-1 break-words">{note.text}</p>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)} className="h-7 w-7 shrink-0">
                          <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">No notes yet. Add one!</p>
              )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
