
'use client';

import { useState } from 'react';
import { AIChatClient } from '@/components/chat/AIChatClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-8">
      {!chatStarted ? (
        <div className="w-full max-w-2xl text-center p-6 md:p-8 bg-muted/50 dark:bg-muted/20 rounded-xl shadow-lg">
          <Sparkles className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
            Asistente de Arriendos IA
          </h1>
          <p className="mt-2 text-lg text-muted-foreground mb-8">
            Escribe tu consulta y te ayudaré a encontrar tu próximo hogar.
            <br />
            Por ejemplo: <em className="text-primary/80">"Busco dpto en Ñuñoa, 2d 1b, hasta $600.000"</em>
          </p>
          <div className="flex w-full items-center space-x-3">
            <Input
              type="text"
              placeholder="Describe lo que buscas..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartChat()}
              className="flex-1 py-6 text-md rounded-full border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/50 shadow-sm"
            />
            <Button
              onClick={handleStartChat}
              disabled={inputValue.trim() === ''}
              size="lg"
              className="rounded-full h-12 w-12 p-0 aspect-square"
              aria-label="Enviar consulta"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-3xl h-[calc(100vh-12rem)] md:h-[calc(100vh-15rem)]">
          {/* Container for AIChatClient to control its height */}
          <AIChatClient initialUserQuery={initialQuery} />
        </div>
      )}
    </div>
  );
}
