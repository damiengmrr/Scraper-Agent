import { Progress } from "@/components/ui/progress";
import { Loader2, Zap, Globe, Database, CheckCircle, AlertCircle } from "lucide-react";

interface ScrapeProgressProps {
  status: string;
  current: number;
  total: number;
  phase: 'idle' | 'connecting' | 'collecting' | 'scraping' | 'done' | 'error';
}

export function ScrapeProgress({ status, current, total, phase }: ScrapeProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const phaseSteps: Array<{ id: ScrapeProgressProps['phase']; label: string }> = [
    { id: 'connecting', label: 'Connexion' },
    { id: 'collecting', label: 'Collecte des liens' },
    { id: 'scraping', label: 'Extraction deep' },
    { id: 'done', label: 'Terminé' },
  ];
  const activeStep = phase === 'error' ? 2 : Math.max(0, phaseSteps.findIndex((step) => step.id === phase));
  
  const getIcon = () => {
    switch(phase) {
      case 'connecting': return <Globe className="text-blue-500 animate-pulse" size={20} />;
      case 'collecting': return <Zap className="text-yellow-500 animate-pulse" size={20} />;
      case 'scraping': return <Database className="text-indigo-500 animate-pulse" size={20} />;
      case 'done': return <CheckCircle className="text-green-500" size={20} />;
      case 'error': return <AlertCircle className="text-red-500" size={20} />;
      default: return <Loader2 className="animate-spin text-muted-foreground" size={20} />;
    }
  };

  return (
    <div className="z-10 shrink-0 border-b border-border/60 bg-blue-950/35 px-6 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.2em] text-blue-200/65">Pipeline IA</span>
            <span className="font-medium text-sm text-blue-50">{status}</span>
          </div>
        </div>
        
        {phase === 'scraping' && total > 0 && (
          <span className="rounded-full border border-blue-300/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
            {current} / {total} ({percentage}%)
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {phaseSteps.map((step, index) => {
          const isActive = index <= activeStep && phase !== 'idle';
          return (
            <div
              key={step.id}
              className={`rounded-xl border px-3 py-2 text-xs transition ${
                isActive ? 'border-blue-300/35 bg-blue-500/15 text-blue-50' : 'border-blue-300/15 bg-blue-950/30 text-blue-200/45'
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-cyan-300 pulse-dot' : 'bg-blue-200/35'}`} />
                <span>{step.label}</span>
              </div>
              <span className="text-[11px] text-blue-200/60">Etape {index + 1}</span>
            </div>
          );
        })}
      </div>

      {(phase === 'scraping' || phase === 'done') && total > 0 && (
        <Progress
          value={percentage}
          className={`mt-4 h-2.5 rounded-full border border-blue-300/20 bg-blue-950/40 ${phase === 'scraping' ? 'shine' : ''}`}
        />
      )}
    </div>
  );
}
