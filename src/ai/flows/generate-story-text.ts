
'use server';
/**
 * @fileOverview Formats a raw property description into a concise, formatted string for social media stories.
 *
 * - generateStoryText - A function that formats the property description.
 * - GenerateStoryTextInput - The input type for the function.
 * - GenerateStoryTextOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateStoryTextInputSchema = z.object({
  rawText: z
    .string()
    .describe('The raw text property description written by a realtor.'),
});
export type GenerateStoryTextInput = z.infer<typeof GenerateStoryTextInputSchema>;

const GenerateStoryTextOutputSchema = z.object({
  storyText: z
    .string()
    .describe('The formatted string for the story.'),
});
export type GenerateStoryTextOutput = z.infer<typeof GenerateStoryTextOutputSchema>;

export async function generateStoryText(
  input: GenerateStoryTextInput
): Promise<GenerateStoryTextOutput> {
  return generateStoryTextFlow(input);
}

const generateStoryTextPrompt = ai.definePrompt({
  name: 'generateStoryTextPrompt',
  input: { schema: GenerateStoryTextInputSchema },
  output: { schema: GenerateStoryTextOutputSchema },
  prompt: `You are an expert real estate copywriter specializing in creating short, punchy text for social media stories.
Your task is to extract key features from a raw property description and format them into a single line of text, respecting a strict character limit.

CRITICAL RULES (MUST BE FOLLOWED):
1.  **CHARACTER LIMIT: The final output string MUST NOT exceed 90 characters under any circumstances. This is the most important rule.**
2.  **SEPARATORS:** Each feature MUST be separated by a single pipe character with spaces around it (' | '). Do not use pipes at the very beginning or end of the string.
3.  **CAPITALIZATION:** Every feature must start with a capital letter.
4.  **NUMBERS:** Always represent numbers with two digits (e.g., "04 Quartos", "02 Suítes").
5.  **CORRECTIONS:** Correct any typos or abbreviations from the original text (e.g., "gar" to "Garagem", "qts" to "Quartos").
6.  **PRIORITIZATION & MAXIMIZATION:** Prioritize features in this order: bedrooms, suites, garage spaces, gourmet area, pool. After these, add as many other important features as possible **without exceeding the 90-character limit.** Be concise (e.g., use "Área Gourmet" instead of "Espaço com área gourmet"). If you must choose between including another feature and breaking the 90-character limit, you MUST OMIT the feature.
7.  **OUTPUT FORMAT:** The final output must be a single, continuous string.

EXAMPLE 1:
Input: "casa top com 4 qts sendo 2 suites, garagem pra 4 carro, area gourmet e piscina. tbm tem aquecimento solar."
Output: 04 Quartos | 02 Suítes | 04 Vagas de Garagem | Área Gourmet | Piscina | Aquecimento Solar

EXAMPLE 2:
Input: "Excelente oportunidade! Apartamento com 4 quartos, 3 suítes, e uma área de lazer com piscina e churrasqueira. Garagem para 4 carros."
Output: 04 Quartos | 03 Suítes | 04 Vagas de Garagem | Piscina | Churrasqueira

Now, process the following raw text and generate the formatted story text, following all rules strictly:
{{{rawText}}}
`,
});

const generateStoryTextFlow = ai.defineFlow(
  {
    name: 'generateStoryTextFlow',
    inputSchema: GenerateStoryTextInputSchema,
    outputSchema: GenerateStoryTextOutputSchema,
  },
  async (input) => {
    const { output } = await generateStoryTextPrompt(input);

    if (!output?.storyText) {
      throw new Error(
        'AI flow failed to generate story text. The output may be empty or malformed.'
      );
    }
    
    // Final check to ensure no leading/trailing pipes or spaces
    let storyText = output.storyText.trim();
    if (storyText.startsWith('|')) {
        storyText = storyText.substring(1).trim();
    }
    if (storyText.endsWith('|')) {
        storyText = storyText.slice(0, -1).trim();
    }

    return { storyText };
  }
);
    
