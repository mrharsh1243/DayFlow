
'use server';
/**
 * @fileOverview Defines a Genkit flow for generating a smart, comprehensive daily schedule.
 *
 * - generateSmartSchedule - A function that creates a schedule based on user goals, tasks, constraints, and preferences.
 * - SmartScheduleInput - The input type for the generateSmartSchedule function.
 * - SmartScheduleOutput - The return type for the generateSmartSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartScheduleInputSchema = z.object({
  overallGoal: z.string().describe('The main objective or goal for the day/planning period.'),
  itemsToSchedule: z.array(z.string()).describe("A list of tasks and fixed events the user needs to accomplish. Fixed events should include their times (e.g., 'Meeting at 2 PM-3 PM', 'Dentist 10:00-10:45')."),
  preferences: z.string().optional().describe('User preferences for scheduling (e.g., "Prefer focused work in mornings", "Group similar tasks", "Take short breaks").'),
  currentDayTime: z.string().describe('The current date and time to provide context for planning (e.g., "Monday, 9:00 AM").'),
  availableStartTime: z.string().describe('The earliest time the user wants to start their scheduled tasks (e.g., "08:00").'),
  availableEndTime: z.string().describe('The latest time the user wants to end their scheduled tasks (e.g., "18:00").'),
});
export type SmartScheduleInput = z.infer<typeof SmartScheduleInputSchema>;

const ScheduledItemSchema = z.object({
  taskName: z.string().describe('The name of the task or event.'),
  suggestedStartTime: z.string().describe('The suggested start time for the task/event in HH:MM format (e.g., "09:00", "14:30").'),
  justification: z.string().optional().describe('A brief reason why this item is scheduled at this time or in this order.'),
  isFixedEvent: z.boolean().optional().describe('True if this item was identified as a fixed event with a specific time from the input list, false or undefined otherwise.'),
});

const SmartScheduleOutputSchema = z.object({
  scheduledTasks: z.array(ScheduledItemSchema).describe('An ordered list of tasks/events with their suggested start times, justifications, and fixed event status.'),
  overallSummary: z.string().optional().describe('A brief summary or overview of the generated schedule strategy.'),
});
export type SmartScheduleOutput = z.infer<typeof SmartScheduleOutputSchema>;

export async function generateSmartSchedule(input: SmartScheduleInput): Promise<SmartScheduleOutput> {
  return generateSmartScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSmartSchedulePrompt',
  input: {schema: SmartScheduleInputSchema},
  output: {schema: SmartScheduleOutputSchema},
  prompt: `You are an expert AI personal assistant specializing in daily planning and time management.
Your goal is to create a realistic and effective schedule for the user based on their inputs.

User's Overall Goal for the period: {{{overallGoal}}}
Items to Schedule (Tasks and Fixed Events):
{{#each itemsToSchedule}}
- {{{this}}}
{{/each}}

User Preferences: {{#if preferences}}{{{preferences}}}{{else}}None specified.{{/if}}
Current Day & Time: {{{currentDayTime}}}
User's Available Time Window for Scheduling: {{{availableStartTime}}} to {{{availableEndTime}}}

Instructions:
1.  Analyze all inputs carefully.
2.  Parse the 'Items to Schedule' list. Identify items that are fixed events due to explicit time mentions (e.g., "Meeting 10 AM - 11 AM", "Lunch at 1 PM", "14:00 Dentist"). For these, set 'isFixedEvent' to true in your output. For all other items (flexible tasks), 'isFixedEvent' should be false or omitted.
3.  Fixed events MUST be scheduled at their specified times. All other tasks should be scheduled around them.
4.  Prioritize tasks that align with the user's overall goal.
5.  Distribute the tasks within the user's available time window ({{{availableStartTime}}} to {{{availableEndTime}}}).
6.  For each item you place in the schedule, provide a 'suggestedStartTime' in HH:MM format. Assume tasks will generally take about an hour unless the task name implies a very short or long duration, or if a fixed event has a clear duration. If a task seems like it would take longer than an hour, you can break it into parts or schedule a longer block if appropriate.
7.  Consider user preferences when arranging tasks (e.g., focused work in the morning if stated).
8.  Generate a logical flow for the day.
9.  For each scheduled item, provide a brief 'justification' explaining your reasoning for its placement or timing.
10. Provide an 'overallSummary' of your scheduling strategy if you have any high-level comments.

Output the schedule in the specified JSON format. Ensure all item names from the input list are included in the output if possible, or explain if some cannot be scheduled.
The 'suggestedStartTime' for each item is crucial and must be in HH:MM format.
The 'isFixedEvent' field is important for distinguishing fixed appointments from flexible tasks in the output.
`,
  config: {
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

const generateSmartScheduleFlow = ai.defineFlow(
  {
    name: 'generateSmartScheduleFlow',
    inputSchema: SmartScheduleInputSchema,
    outputSchema: SmartScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI did not return a valid schedule.");
    }
    if (!output.scheduledTasks) {
        output.scheduledTasks = [];
    }
    return output;
  }
);

