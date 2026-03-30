'use client';

import { useState, useCallback } from 'react';
import { ExhibitorsTable } from '@/components/ExhibitorsTable';
import { Chat } from '@/components/Chat';
import { ScrapeProgress } from '@/components/ScrapeProgress';
import { Exhibitor } from '@/lib/schema';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ProgressState {
  active: boolean;
  status: string;
  current: number;
  total: number;
  phase: 'idle' | 'connecting' | 'collecting' | 'scraping' | 'done' | 'error';
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({
    active: false, status: '', current: 0, total: 0, phase: 'idle',
  });

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Detect if message contains URL
    const hasUrl = /https?:\/\/[^\s"'<>]+/i.test(text);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const isScrapeStream = res.headers.get('X-Scrape-Stream') === 'true';

      if (isScrapeStream && hasUrl) {
        // Handle streaming scrape events
        setExhibitors([]);
        setProgress({ active: true, status: 'Connexion...', current: 0, total: 0, phase: 'connecting' });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const collectedExhibitors: Exhibitor[] = [];

        // Add a status message
        const statusMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Extraction en cours...',
        };
        setMessages(prev => [...prev, statusMsg]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const event = JSON.parse(line);
                
                switch (event.type) {
                  case 'status':
                    setProgress(prev => ({ 
                      ...prev, 
                      status: event.message || '',
                      phase: event.message?.includes('Recherche') ? 'collecting' : 
                             event.message?.includes('Deep') ? 'scraping' : prev.phase,
                    }));
                    // Update the assistant message in real time
                    setMessages(prev => {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: event.message || '',
                      };
                      return updated;
                    });
                    break;

                  case 'progress':
                    setProgress(prev => ({
                      ...prev,
                      current: event.current || prev.current,
                      total: event.total || prev.total,
                      status: event.message || prev.status,
                      phase: 'scraping',
                    }));
                    break;

                  case 'exhibitor':
                    if (event.exhibitor) {
                      collectedExhibitors.push(event.exhibitor);
                      setExhibitors([...collectedExhibitors]);
                      setProgress(prev => ({
                        ...prev,
                        current: event.current || collectedExhibitors.length,
                        total: event.total || prev.total,
                        phase: 'scraping',
                      }));
                    }
                    break;

                  case 'done':
                    setProgress({
                      active: false,
                      status: event.message || 'Terminé',
                      current: event.total || collectedExhibitors.length,
                      total: event.total || collectedExhibitors.length,
                      phase: 'done',
                    });
                    setMessages(prev => {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: `Extraction terminée ! ${collectedExhibitors.length} exposants récupérés avec les informations détaillées.`,
                      };
                      return updated;
                    });
                    break;

                  case 'error':
                    setProgress(prev => ({ ...prev, active: false, phase: 'error', status: event.message || 'Erreur' }));
                    setMessages(prev => {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: `❌ ${event.message || 'Une erreur est survenue.'}`,
                      };
                      return updated;
                    });
                    break;
                }
              } catch {
                // Skip malformed lines
              }
            }
          }
        }
      } else {
        // Normal chat response (no URL)
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
        };
        setMessages(prev => [...prev, assistantMsg]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            assistantContent += chunk;
            
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: assistantContent,
              };
              return updated;
            });
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setProgress(prev => ({ ...prev, active: false, phase: 'error' }));
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden text-foreground md:flex-row font-sans">
      <div className="pointer-events-none absolute inset-0 night-grid opacity-35" />
      <div className="pointer-events-none absolute -top-40 left-10 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-44 right-8 h-96 w-96 rounded-full bg-cyan-400/15 blur-[120px]" />

      <div className="z-10 m-3 flex w-full flex-col overflow-hidden rounded-3xl glass-panel md:m-4 md:h-[calc(100vh-2rem)] md:w-[410px] lg:w-[470px]">
        <div className="flex h-20 items-center justify-between border-b border-border/60 px-6 shrink-0">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-blue-200/70">Shaarp Agent</p>
            <h1 className="text-2xl font-semibold tracking-tight text-blue-100">Scraper IA</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-100">
            <span className={`h-2.5 w-2.5 rounded-full bg-sky-300 ${isLoading ? 'pulse-dot' : ''}`} />
            {isLoading ? 'Analyse active' : 'Prêt'}
          </div>
        </div>
        <Chat 
           messages={messages} 
           sendMessage={sendMessage}
           isLoading={isLoading} 
        />
      </div>
      <div className="z-10 mb-3 mr-3 flex flex-1 flex-col overflow-hidden rounded-3xl glass-panel md:mb-4 md:mr-4 md:mt-4">
        {(progress.active || progress.phase === 'done' || progress.phase === 'error') && (
          <ScrapeProgress 
            status={progress.status}
            current={progress.current}
            total={progress.total}
            phase={progress.phase}
          />
        )}
        <ExhibitorsTable
          exhibitors={exhibitors}
          isScraping={progress.active}
          progressCurrent={progress.current}
          progressTotal={progress.total}
        />
      </div>
    </div>
  );
}
