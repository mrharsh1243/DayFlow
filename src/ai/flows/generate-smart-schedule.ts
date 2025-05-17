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
  tasksToSchedule: z.array(z.string()).describe('A list of tasks the user needs to accomplish.'),
  fixedEvents: z.string().optional().describe('Any fixed appointments or events with specific times (e.g., "Meeting at 2 PM-3 PM", "Dentist 10:00-10:45").'),
  preferences: z.string().optional().describe('User preferences for scheduling (e.g., "Prefer focused work in mornings", "Group similar tasks", "Take short breaks").'),
  currentDayTime: z.string().describe('The current date and time to provide context for planning (e.g., "Monday, 9:00 AM").'),
  availableStartTime: z.string().describe('The earliest time the user wants to start their scheduled tasks (e.g., "08:00").'),
  availableEndTime: z.string().describe('The latest time the user wants to end their scheduled tasks (e.g., "18:00").'),
});
export type SmartScheduleInput = z.infer<typeof SmartScheduleInputSchema>;

const ScheduledItemSchema = z.object({
  taskName: z.string().describe('The name of the task.'),
  suggestedStartTime: z.string().describe('The suggested start time for the task in HH:MM format (e.g., "09:00", "14:30").'),
  // durationMinutes: z.number().optional().describe('Estimated duration of the task in minutes.'),
  justification: z.string().optional().describe('A brief reason why this task is scheduled at this time or in this order.'),
});

const SmartScheduleOutputSchema = z.object({
  scheduledTasks: z.array(ScheduledItemSchema).describe('An ordered list of tasks with their suggested start times and justifications.'),
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
Tasks to Schedule:
{{#each tasksToSchedule}}
- {{{this}}}
{{/each}}

Fixed Events/Appointments: {{#if fixedEvents}}{{{fixedEvents}}}{{else}}None specified.{{/if}}
User Preferences: {{#if preferences}}{{{preferences}}}{{else}}None specified.{{/if}}
Current Day & Time: {{{currentDayTime}}}
User's Available Time Window for Scheduling: {{{availableStartTime}}} to {{{availableEndTime}}}

Instructions:
1.  Analyze all inputs carefully.
2.  Prioritize tasks that align with the user's overall goal.
3.  Ensure all fixed events are respected and scheduled around. These are non-negotiable.
4.  Distribute the tasks within the user's available time window ({{{availableStartTime}}} to {{{availableEndTime}}}).
5.  For each task you place in the schedule, provide a 'suggestedStartTime' in HH:MM format. Assume tasks will generally take about an hour unless the task name implies a very short or long duration. If a task seems like it would take longer than an hour, you can break it into parts or schedule a longer block if appropriate.
6.  Consider user preferences when arranging tasks (e.g., focused work in the morning if stated).
7.  Generate a logical flow for the day.
8.  For each scheduled task, provide a brief 'justification' explaining your reasoning for its placement or timing.
9.  Provide an 'overallSummary' of your scheduling strategy if you have any high-level comments.

Output the schedule in the specified JSON format. Ensure all task names from the input list are included in the output if possible, or explain if some cannot be scheduled.
The 'suggestedStartTime' for each task is crucial and must be in HH:MM format.
`,
});

const generateSmartScheduleFlow = ai.defineFlow(
  {
    name: 'generateSmartScheduleFlow',
    inputSchema: SmartScheduleInputSchema,
    outputSchema: SmartScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure output is not null and adheres to the schema, especially the array part.
    if (!output) {
        throw new Error("AI did not return a valid schedule.");
    }
    if (!output.scheduledTasks) {
        // Handle cases where AI might return an empty or malformed tasks list.
        // This could be an empty array if no tasks could be scheduled, which is valid.
        // Or, if truly malformed, you might throw an error or return a default.
        // For now, we'll assume an empty array is possible if the AI decides.
        output.scheduledTasks = [];
    }
    return output;
  }
);
