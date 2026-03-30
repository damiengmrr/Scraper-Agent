import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, Loader2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  messages: Message[];
  sendMessage: (text: string) => void;
  isLoading: boolean;
}

export function Chat({ messages, sendMessage, isLoading }: ChatProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInputValue('');
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden shrink-0">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 h-full">
        <div className="flex flex-col gap-4 pb-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-blue-200/20 bg-blue-500/10 px-5 py-8 text-center text-blue-100/90">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-400/20">
                <Sparkles size={18} className="text-blue-200" />
              </div>
              <p className="text-sm leading-relaxed text-blue-100/85">
                Envoie l&apos;URL d&apos;un salon pro pour lancer un scraping intelligent.
                Je détecte la structure du site, je navigue automatiquement, puis j&apos;extrais les contacts exploitables.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-300/30 bg-blue-400/10 text-blue-100">
                  <Bot size={18}/>
                </div>
              )}
              <div className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.content && (
                  <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap border ${m.role === 'user' ? 'bg-gradient-to-br from-blue-300 to-cyan-300 text-slate-900 border-blue-100/40 shadow-[0_12px_30px_rgba(14,165,233,0.35)]' : 'bg-blue-950/45 text-blue-50 border-blue-300/20'}`}>
                    {m.content}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (messages.length === 0 || messages[messages.length-1]?.role === 'user') && (
            <div className="flex gap-3 justify-start">
               <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/10 text-blue-100">
                 <Loader2 size={18} className="animate-spin"/>
               </div>
               <div className="shine rounded-2xl border border-blue-300/20 bg-blue-950/45 px-4 py-2 text-sm text-blue-100/85">
                 Analyse en cours... (cela peut prendre 30-60 secondes)
               </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-border/60 bg-blue-950/35 p-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            placeholder="Entrez une URL (ex: https://...)" 
            className="h-10 flex-1 border-blue-300/25 bg-blue-900/40 text-blue-50 placeholder:text-blue-200/50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || inputValue.length === 0}
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-300 to-cyan-300 text-slate-900 transition hover:brightness-105"
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
