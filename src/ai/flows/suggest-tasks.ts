// src/ai/flows/suggest-tasks.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting tasks to the user based on their past behavior, current schedule, and priorities.
 *
 * - suggestTasks - A function that suggests tasks for the user.
 * - SuggestTasksInput - The input type for the suggestTasks function.
 * - SuggestTasksOutput - The return type for the suggestTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTasksInputSchema = z.object({
  userHistory: z
    .string()
    .describe(
      'A summary of the users past tasks, schedules, and priorities. Should include recently completed tasks.'
    ),
  currentSchedule: z
    .string()
    .describe('A summary of the users current schedule for the day.'),
  priorities: z.string().describe('A list of the users priorities.'),
  currentTime: z.string().describe('The current time.'),
  weatherForecast: z.string().describe('The current weather forecast.'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.object({
  suggestedTasks: z
    .array(z.string())
    .describe('A list of suggested tasks for the user.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are a personal assistant helping the user plan their day.

  Based on the users past behavior, current schedule, and priorities, suggest a list of tasks for the user to do today.

  Past Behavior: {{{userHistory}}}
  Current Schedule: {{{currentSchedule}}}
  Priorities: {{{priorities}}}
  Current Time: {{{currentTime}}}
  Weather Forecast: {{{weatherForecast}}}

  Suggest tasks that are relevant to the users past behavior, current schedule, and priorities.
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
