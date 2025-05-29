import { AIChatClient } from '@/components/chat/AIChatClient';

export default function ChatPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Asistente de Arriendos IA</h1>
        <p className="mt-2 text-lg text-muted-foreground">Chatea con nuestro asistente inteligente para encontrar tu arriendo ideal.</p>
      </div>
      <AIChatClient />
    </div>
  );
}
