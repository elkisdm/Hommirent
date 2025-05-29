'use server';

/**
 * @fileOverview An AI-powered chat assistant for tenants to find rental properties.
 *
 * - rentalAssistantChat - A function that handles the chat interaction and provides rental recommendations.
 * - RentalAssistantInput - The input type for the rentalAssistantChat function.
 * - RentalAssistantOutput - The return type for the rentalAssistantChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RentalAssistantInputSchema = z.object({
  message: z.string().describe('The user message to the rental assistant.'),
  location: z.string().optional().describe('The preferred location for the rental property.'),
  priceRange: z.string().optional().describe('The desired price range for the rental property.'),
  bedrooms: z.number().optional().describe('The number of bedrooms required in the rental property.'),
});
export type RentalAssistantInput = z.infer<typeof RentalAssistantInputSchema>;

const RentalAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user message.'),
  propertyRecommendations: z.array(z.string()).optional().describe('A list of recommended property IDs based on the user criteria.'),
});
export type RentalAssistantOutput = z.infer<typeof RentalAssistantOutputSchema>;

export async function rentalAssistantChat(input: RentalAssistantInput): Promise<RentalAssistantOutput> {
  return rentalAssistantChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rentalAssistantPrompt',
  input: {schema: RentalAssistantInputSchema},
  output: {schema: RentalAssistantOutputSchema},
  prompt: `You are a helpful AI rental assistant. Your goal is to help tenants find suitable rental properties based on their needs and preferences.

  The tenant will provide a message, and optionally, their preferred location, price range, and number of bedrooms.

  Use this information to provide personalized recommendations.

  Tenant Message: {{{message}}}
  Location: {{{location}}}
  Price Range: {{{priceRange}}}
  Bedrooms: {{{bedrooms}}}

  Respond in a friendly and informative manner. If the tenant is asking for specific properties matching location, price range and number of bedrooms, respond with propertyRecommendations as a list of property IDs.
  If the tenant is just starting the conversation, respond to them normally without providing property recommendations.
  `,
});

const rentalAssistantChatFlow = ai.defineFlow(
  {
    name: 'rentalAssistantChatFlow',
    inputSchema: RentalAssistantInputSchema,
    outputSchema: RentalAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
