
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
import {z} from 'zod';

const FormatPropertyFeaturesInputSchema = z.object({
  featuresText: z
    .string()
    .describe('The plain text property features to be formatted.'),
});
export type FormatPropertyFeaturesInput = z.infer<typeof FormatPropertyFeaturesInputSchema>;

const FormatPropertyFeaturesOutputSchema = z.object({
  formattedFeatures: z
    .string()
    .describe('The formatted property features as a concise list, with each feature on a new line.'),
});
export type FormatPropertyFeaturesOutput = z.infer<typeof FormatPropertyFeaturesOutputSchema>;

export async function formatPropertyFeatures(
  input: FormatPropertyFeaturesInput
): Promise<FormatPropertyFeaturesOutput> {
  return formatPropertyFeaturesFlow(input);
}

const formatPropertyFeaturesPrompt = ai.definePrompt({
  name: 'formatPropertyFeaturesPrompt',
  input: {schema: FormatPropertyFeaturesInputSchema},
  output: {schema: FormatPropertyFeaturesOutputSchema},
  prompt: `You are an AI assistant that specializes in formatting property features for real estate listings.
Your goal is to transform a plain text input of property features into a concise, well-formatted list that is appealing and easy to read.

CRITICAL INSTRUCTIONS:
*   Each feature MUST be on a new line. This is a strict requirement.
*   Start each feature with "✅ ".
*   End each feature with a semicolon ";".
*   Use numerals for numbers (e.g., "3 quartos" instead of "três quartos").
*   Be concise, extracting only the most important and direct characteristics.
*   Remove any original punctuation or formatting from the input text.

EXAMPLE (Follow this format exactly):

Input: "Amplo apartamento com 3 quartos, sendo uma suíte, sala espaçosa com varanda gourmet, cozinha planejada, área de serviço completa, 2 vagas de garagem."

Output:
✅ 3 quartos, sendo uma suíte;
✅ Sala espaçosa com varanda gourmet;
✅ Cozinha planejada;
✅ Área de serviço completa;
✅ 2 vagas de garagem;


Now, process the following features text following all the rules above:
{{{featuresText}}}
`,
});

const formatPropertyFeaturesFlow = ai.defineFlow(
  {
    name: 'formatPropertyFeaturesFlow',
    inputSchema: FormatPropertyFeaturesInputSchema,
    outputSchema: FormatPropertyFeaturesOutputSchema,
  },
  async input => {
    console.log('[formatPropertyFeaturesFlow] Iniciando fluxo...');
    console.log('[formatPropertyFeaturesFlow] Input recebido:', JSON.stringify(input));

    try {
      const {output} = await formatPropertyFeaturesPrompt(input);
      console.log('[formatPropertyFeaturesFlow] Output da IA:', JSON.stringify(output));

      if (!output || typeof output.formattedFeatures !== 'string') {
        console.error(
          '[formatPropertyFeaturesFlow] Erro: A IA retornou um output inválido ou vazio. Output:',
          output
        );
        throw new Error(
          'A IA não retornou uma formatação válida para as características. O resultado pode estar vazio ou malformado.'
        );
      }

      let formattedFeatures = output.formattedFeatures;

      if (formattedFeatures && !formattedFeatures.trim().endsWith(';')) {
          const lines = formattedFeatures.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          if (lastLine) {
              lines[lines.length - 1] = lastLine.endsWith(';') ? lastLine : lastLine + ';';
              formattedFeatures = lines.join('\n');
          }
      }
      
      const result = {formattedFeatures: formattedFeatures.trim()};
      console.log('[formatPropertyFeaturesFlow] Resultado final:', JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('[formatPropertyFeaturesFlow] Erro catastrófico no fluxo:', error);
      // Re-throw para que o front-end possa capturar o erro
      throw error;
    }
  }
);
