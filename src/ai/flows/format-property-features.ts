
// src/ai/flows/format-property-features.ts
'use server';
/**
 * @fileOverview Formats property features using AI to create a concise, well-formatted list.
 *
 * - formatPropertyFeatures - A function that formats the property features.
 * - FormatPropertyFeaturesInput - The input type for the formatPropertyFeatures function.
 * - FormatPropertyFeaturesOutput - The return type for the formatPropertyFeatures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatPropertyFeaturesInputSchema = z.object({
  featuresText: z
    .string()
    .describe('The plain text property features to be formatted.'),
});
export type FormatPropertyFeaturesInput = z.infer<typeof FormatPropertyFeaturesInputSchema>;

const FormatPropertyFeaturesOutputSchema = z.object({
  formattedFeatures: z
    .string()
    .describe('The formatted property features as a concise list.'),
});
export type FormatPropertyFeaturesOutput = z.infer<typeof FormatPropertyFeaturesOutputSchema>;

export async function formatPropertyFeatures(
  input: FormatPropertyFeaturesInput
): Promise<FormatPropertyFeaturesOutput> {
  return formatPropertyFeaturesFlow(input);
}

const formatPropertyFeaturesPrompt = ai.definePrompt({
  name: 'formatPropertyFeaturesPrompt',
  model: 'googleai/gemini-2.0-flash', // Especifica o modelo a ser usado
  input: {schema: FormatPropertyFeaturesInputSchema},
  output: {schema: FormatPropertyFeaturesOutputSchema},
  prompt: `You are an AI assistant that specializes in formatting property features for real estate listings. Your goal is to transform a plain text input of property features into a concise, well-formatted list that is appealing and easy to read.

Instructions:

*   List each feature on a new line.
*   Start each feature with "✅ ".
*   End each feature with a semicolon ";".
*   Use numerals for numbers (e.g., "3 quartos" instead of "três quartos").
*   Be concise, extracting only the most important and direct characteristics.
*   Remove any original punctuation or formatting from the input text.

Example:

Input: "Amplo apartamento com 3 quartos, sendo uma suíte, sala espaçosa com varanda gourmet, cozinha planejada, área de serviço completa, 2 vagas de garagem."

Output:
✅ 3 quartos, sendo uma suíte;
✅ Sala espaçosa com varanda gourmet;
✅ Cozinha planejada;
✅ Área de serviço completa;
✅ 2 vagas de garagem;


Here is the features text: {{{featuresText}}}
`,
});

const formatPropertyFeaturesFlow = ai.defineFlow(
  {
    name: 'formatPropertyFeaturesFlow',
    inputSchema: FormatPropertyFeaturesInputSchema,
    outputSchema: FormatPropertyFeaturesOutputSchema,
  },
  async input => {
    const {output} = await formatPropertyFeaturesPrompt(input);

    // Check if the output or the specific field is missing
    if (!output || typeof output.formattedFeatures !== 'string') {
      console.error(
        'AI flow received undefined output or missing/invalid formattedFeatures from prompt. Full prompt output:',
        output
      );
      throw new Error(
        'A IA não retornou uma formatação válida para as características. O resultado pode estar vazio ou malformado.'
      );
    }

    let formattedFeatures = output.formattedFeatures;

    // Ensure the output ends with a semicolon if it's not empty
    if (formattedFeatures && !formattedFeatures.endsWith(';')) {
      formattedFeatures += ';';
    }

    return {formattedFeatures: formattedFeatures};
  }
);
