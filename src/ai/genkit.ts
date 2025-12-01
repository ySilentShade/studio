import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiVersion: 'v1'})],
  model: 'googleai/gemini-2.0-flash',
  // Disable tracing and metrics in production to avoid errors in Netlify
  enableTracingAndMetrics: process.env.NODE_ENV !== 'production',
});
