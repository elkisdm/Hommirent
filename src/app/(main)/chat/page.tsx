
'use client';

import { useState } from 'react';
import { AIChatClient } from '@/components/chat/AIChatClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, MessageSquarePlus } from 'lucide-react'; // Using MessageSquarePlus as a Canva-like "Magic" icon

export default function ChatPage() {
  const [initialQuery, setInitialQuery] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleStartChat = () => {
    if (inputValue.trim() === '') return;
    setInitialQuery(inputValue);
    setChatStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-8 px-4">
      {!chatStarted ? (
        <div className="w-full max-w-2xl text-center p-6 md:p-10 bg-card/80 backdrop-blur-sm rounded-xl shadow-2xl border border-border/30">
          <MessageSquarePlus className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3 text-heading-foreground">
            Asistente de Arriendos IA
          </h1>
          <p className="mt-2 text-lg text-foreground/80 mb-8">
            Describe lo que buscas, ¡y la IA te ayudará a encontrarlo!
            <br />
            Por ejemplo: <em className="text-primary/90">"Busco dpto en Ñuñoa, 2d 1b, hasta $600.000 con balcón"</em>
          </p>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Describe tu arriendo ideal y la IA lo buscará..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartChat()}
              className="flex-1 py-6 text-md rounded-full border-2 border-input bg-input/80 focus:border-primary focus:ring-2 focus:ring-primary/50 shadow-lg placeholder:text-muted-foreground/70 text-lg h-14"
            />
            <Button
              onClick={handleStartChat}
              disabled={inputValue.trim() === ''}
              size="lg"
              className="rounded-full h-14 w-14 p-0 aspect-square shadow-lg bg-primary hover:bg-primary/80 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Enviar consulta"
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-3xl h-[calc(100vh-12rem)] md:h-[calc(100vh-15rem)]">
          {/* AIChatClient container takes full height specified */}
          <AIChatClient initialUserQuery={initialQuery} />
        </div>
      )}
    </div>
  );
}
