// src/ai/flows/schedule-locked-time.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for scheduling locked time slots in a user's day.
 *
 * - scheduleLockedTime - A function that suggests a schedule for a locked time slot, considering constraints and obligations.
 * - ScheduleLockedTimeInput - The input type for the scheduleLockedTime function.
 * - ScheduleLockedTimeOutput - The return type for the scheduleLockedTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScheduleLockedTimeInputSchema = z.object({
  taskName: z.string().describe('The name of the task to be scheduled.'),
  durationMinutes: z.number().describe('The duration of the task in minutes.'),
  earliestStartTime: z.string().describe('The earliest time the task can start (e.g., 09:00).'),
  latestEndTime: z.string().describe('The latest time the task can end (e.g., 17:00).'),
  requiredBufferMinutesBefore: z.number().describe('The required buffer time in minutes before the task.'),
  requiredBufferMinutesAfter: z.number().describe('The required buffer time in minutes after the task.'),
  otherObligations: z.string().describe('A description of other obligations that need to be considered when scheduling the task, such as drive time or wake-up time.'),
});

export type ScheduleLockedTimeInput = z.infer<typeof ScheduleLockedTimeInputSchema>;

const ScheduleLockedTimeOutputSchema = z.object({
  suggestedStartTime: z.string().describe('The suggested start time for the task (e.g., 10:30).'),
  justification: z.string().describe('The AI justification for the suggested start time, considering all constraints and obligations.'),
});

export type ScheduleLockedTimeOutput = z.infer<typeof ScheduleLockedTimeOutputSchema>;

export async function scheduleLockedTime(input: ScheduleLockedTimeInput): Promise<ScheduleLockedTimeOutput> {
  return scheduleLockedTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scheduleLockedTimePrompt',
  input: {schema: ScheduleLockedTimeInputSchema},
  output: {schema: ScheduleLockedTimeOutputSchema},
  prompt: `You are an AI assistant helping users schedule tasks into their day within specific time constraints.

You are provided with the following information about the task to be scheduled:
- Task Name: {{{taskName}}}
- Duration: {{{durationMinutes}}} minutes
- Earliest Start Time: {{{earliestStartTime}}}
- Latest End Time: {{{latestEndTime}}}
- Required Buffer Before: {{{requiredBufferMinutesBefore}}} minutes
- Required Buffer After: {{{requiredBufferMinutesAfter}}} minutes
- Other Obligations: {{{otherObligations}}}

Consider all of these factors and suggest the best start time for the task. Provide a clear justification for your suggestion, explaining how you considered all constraints and obligations.

Output the suggested start time and the justification in the format specified by the output schema.`, 
});

const scheduleLockedTimeFlow = ai.defineFlow(
  {
    name: 'scheduleLockedTimeFlow',
    inputSchema: ScheduleLockedTimeInputSchema,
    outputSchema: ScheduleLockedTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

