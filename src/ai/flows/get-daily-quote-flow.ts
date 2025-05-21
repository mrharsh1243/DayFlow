
'use server';
/**
 * @fileOverview Defines a Genkit flow for generating a daily motivational quote.
 *
 * - getDailyQuote - A function that returns an AI-generated motivational quote.
 * - DailyQuoteOutput - The return type for the getDailyQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyQuoteOutputSchema = z.object({
  quote: z.string().describe('A short, inspiring motivational quote.'),
});
export type DailyQuoteOutput = z.infer<typeof DailyQuoteOutputSchema>;

export async function getDailyQuote(): Promise<DailyQuoteOutput> {
  return getDailyQuoteFlow();
}

const prompt = ai.definePrompt({
  name: 'getDailyQuotePrompt',
  output: {schema: DailyQuoteOutputSchema},
  prompt: `You are an AI that provides inspiring daily quotes.
Generate a short, unique, and uplifting motivational quote suitable for a daily planner.
The quote should be concise and impactful. Avoid clichés if possible.
Focus on themes like productivity, starting fresh, achieving goals, or mindfulness.
Example themes: "Make today count.", "Small steps lead to big results."
Do not include any preamble like "Here's a quote:". Just provide the quote itself.
`,
  config: {
    temperature: 0.8, // Add some creativity
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

const getDailyQuoteFlow = ai.defineFlow(
  {
    name: 'getDailyQuoteFlow',
    outputSchema: DailyQuoteOutputSchema,
  },
  async () => {
    const {output} = await prompt({}); // No input needed for this prompt
    if (!output || !output.quote) {
        // Fallback in case AI fails to generate a proper quote
        return { quote: "Embrace the possibilities of today." };
    }
    return output;
  }
);

