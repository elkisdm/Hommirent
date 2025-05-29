
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, Bot, User } from 'lucide-react';
import { rentalAssistantChat, type RentalAssistantInput, type RentalAssistantOutput } from '@/ai/flows/rental-assistant-chat';
import { Spinner } from '../ui/spinner';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendations?: string[];
}

interface AIChatClientProps {
  initialContextMessage?: string; // For specific property context
}

export function AIChatClient({ initialContextMessage }: AIChatClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Optional: Pre-fill with some context if available (e.g. from URL params or user profile)
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [bedrooms, setBedrooms] = useState<number | undefined>(undefined);


  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    // Initial greeting from AI
    const greeting = { id: 'initial-greeting', sender: 'ai', text: '¡Hola! Soy tu asistente de arriendos Hommie AI. ¿Cómo puedo ayudarte a encontrar tu próximo hogar hoy?' };
    if (initialContextMessage) {
      setMessages([greeting]);
      // Simulate user sending the context message to AI (or AI pre-filling it)
      // This helps guide the AI for the first real user message
      // We don't display this context message directly to user, but send it to AI
      handleSendMessage(initialContextMessage, true);
    } else {
      setMessages([greeting]);
    }
  }, [initialContextMessage]);


  const handleSendMessage = async (messageToSend?: string, isContextMessage = false) => {
    const currentInput = messageToSend || input;
    if (currentInput.trim() === '') return;

    if (!isContextMessage) {
      const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: currentInput };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
    }
    setIsLoading(true);

    try {
      const aiInput: RentalAssistantInput = {
        message: currentInput,
        location: location || undefined, 
        priceRange: priceRange || undefined,
        bedrooms: bedrooms || undefined,
        propertyContext: isContextMessage ? undefined : initialContextMessage, // Pass context if it's a regular user message after context was set
      };
      // If it is the context message itself, we pass it as propertyContext to prime the AI
      if (isContextMessage) {
        aiInput.propertyContext = currentInput;
        aiInput.message = "El usuario está viendo la siguiente propiedad y podría tener preguntas al respecto. "; // Generic starter for AI
      }

      const aiResponse: RentalAssistantOutput = await rentalAssistantChat(aiInput);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse.response,
        recommendations: aiResponse.propertyRecommendations,
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error('Error calling AI assistant:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Lo siento, tuve un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-0 rounded-lg shadow-none"> {/* Adjusted for sheet */}
      <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end space-x-2 ${
              message.sender === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.sender === 'ai' && (
              <Avatar className="h-8 w-8">
                <AvatarFallback><Bot size={20} /></AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold mb-1">Recomendaciones:</p>
                  <ul className="space-y-1">
                    {message.recommendations.map((rec, index) => (
                      <li key={index} className="text-xs">
                        <Button variant="link" asChild className="p-0 h-auto text-current hover:underline">
                           <Link href={`/properties/${rec}`}>Propiedad ID: {rec}</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {message.sender === 'user' && (
              <Avatar className="h-8 w-8">
                 <AvatarFallback><User size={20} /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback><Bot size={20} /></AvatarFallback>
            </Avatar>
            <div className="max-w-xs lg:max-w-md p-3 rounded-lg bg-muted">
              <Spinner size="small" />
            </div>
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          className="flex-1"
          disabled={isLoading}
        />
        <Button onClick={() => handleSendMessage()} disabled={isLoading || input.trim() === ''}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </div>
    </div>
  );
}
