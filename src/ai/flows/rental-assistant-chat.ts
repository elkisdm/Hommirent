
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
  propertyContext: z.string().optional().describe('Context about a specific property the user might be viewing or asking about (e.g., property title or ID).'),
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
  prompt: `You are a helpful AI rental assistant for Hommie.cl. Your goal is to help tenants find suitable rental properties based on their needs and preferences, and answer questions they might have.

  The tenant will provide a message. They might also provide their preferred location, price range, and number of bedrooms.
  {{#if propertyContext}}
  The user is currently interested in or asking about the following property: {{{propertyContext}}}. Keep this in mind when responding.
  {{/if}}

  Use this information to provide personalized recommendations and answer questions.

  Tenant Message: {{{message}}}
  {{#if location}}Preferred Location: {{{location}}}{{/if}}
  {{#if priceRange}}Desired Price Range: {{{priceRange}}}{{/if}}
  {{#if bedrooms}}Required Bedrooms: {{{bedrooms}}}{{/if}}

  Respond in a friendly and informative manner. 
  If the tenant is asking for specific properties matching location, price range, and number of bedrooms, respond with propertyRecommendations as a list of property IDs (if you can identify any from a hypothetical database or prior knowledge).
  If the tenant is just starting the conversation, or asking general questions, or asking about the specific propertyContext, respond to them normally without necessarily providing new propertyRecommendations unless they explicitly ask for alternatives.
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
