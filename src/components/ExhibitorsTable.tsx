import { useState } from 'react';
import { Exhibitor } from '@/lib/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Globe, Mail, Phone } from 'lucide-react';
import Papa from 'papaparse';

interface ExhibitorsTableProps {
  exhibitors: Exhibitor[];
  isScraping?: boolean;
  progressCurrent?: number;
  progressTotal?: number;
}

export function ExhibitorsTable({
  exhibitors,
  isScraping = false,
  progressCurrent = 0,
  progressTotal = 0,
}: ExhibitorsTableProps) {
  const [search, setSearch] = useState('');

  const filteredExhibitors = exhibitors.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const formattedData = filteredExhibitors.map(e => ({
      'Nom': e.name,
      'Site Web': e.website || '',
      'Stand': e.booth || '',
      'Email': e.email || '',
      'Téléphone': e.phone || '',
      'LinkedIn': e.linkedin || '',
      'Twitter': e.twitter || '',
    }));

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contacts_exposants_shaarp.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (exhibitors.length === 0) {
    return (
      <div className="m-4 flex h-full flex-col items-center justify-center rounded-3xl border border-blue-300/20 bg-blue-950/30 p-8 text-center">
        <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-blue-300/25 bg-blue-500/10 ${isScraping ? 'pulse-dot' : ''}`}>
          <Search size={32} className="text-blue-100/80" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-blue-50">
          {isScraping ? "Scraping en cours" : "Aucun contact"}
        </h2>
        <p className="max-w-md text-blue-100/70">
          {isScraping
            ? "Le moteur IA explore les pages exposants et enrichit les données en temps réel."
            : "L'assistant IA va extraire les coordonnées de contact dès que vous fournissez une URL."}
        </p>
        {isScraping && (
          <div className="mt-6 w-full max-w-sm rounded-xl border border-blue-300/20 bg-blue-500/10 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-blue-100/80">
              <span>Progression live</span>
              <span>{progressCurrent}{progressTotal > 0 ? ` / ${progressTotal}` : ''}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-blue-950/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-300 to-cyan-300 transition-all duration-500"
                style={{ width: `${progressTotal > 0 ? Math.round((progressCurrent / progressTotal) * 100) : 18}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-blue-300/20 bg-blue-950/30 p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-blue-50">
            Contacts Extraits
            <Badge variant="secondary" className="ml-2 border-blue-300/25 bg-blue-500/20 text-blue-100">{filteredExhibitors.length}</Badge>
          </h2>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative w-full sm:w-64">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/60" />
             <Input 
               placeholder="Rechercher par nom..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="h-10 border-blue-300/25 bg-blue-900/40 pl-9 text-blue-50 placeholder:text-blue-200/50"
             />
          </div>
          <Button onClick={handleExport} className="h-10 rounded-xl bg-gradient-to-br from-blue-300 to-cyan-300 text-slate-900 shadow-[0_10px_22px_rgba(14,165,233,0.35)] flex items-center gap-2">
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-2xl border border-blue-300/20 bg-blue-950/30">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-blue-950/80 backdrop-blur">
            <TableRow>
              <TableHead>Exposant</TableHead>
              <TableHead>Stand</TableHead>
              <TableHead>Coordonnées Directes</TableHead>
              <TableHead>Réseaux</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExhibitors.map((ex, i) => (
              <TableRow key={i} className="transition-colors hover:bg-blue-900/35">
                <TableCell className="font-medium align-top">
                   <div className="flex flex-col gap-1">
                      <span className="text-base">{ex.name}</span>
                      {ex.website && ex.website !== "" && (
                         <a href={ex.website} target="_blank" rel="noreferrer" className="flex w-fit items-center gap-1 text-xs text-cyan-300 hover:underline">
                           <Globe size={12}/> Site Web
                         </a>
                      )}
                   </div>
                </TableCell>
                <TableCell className="align-top">
                   <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {ex.booth && ex.booth !== "" ? (
                        <span className="font-medium text-foreground">Stand: {ex.booth}</span>
                      ) : (
                        <span className="text-xs italic text-muted-foreground/50">-</span>
                      )}
                   </div>
                </TableCell>
                <TableCell className="align-top">
                   <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {ex.email && ex.email !== "" && (
                        <a href={`mailto:${ex.email}`} className="flex items-center gap-1 hover:text-foreground transition break-all">
                          <Mail size={12} className="shrink-0"/> {ex.email}
                        </a>
                      )}
                      {ex.phone && ex.phone !== "" && (
                        <span className="flex items-center gap-1">
                          <Phone size={12}/> {ex.phone}
                        </span>
                      )}
                      {(!ex.email || ex.email === "") && (!ex.phone || ex.phone === "") && (
                        <span className="italic text-xs text-muted-foreground/50">Non spécifié</span>
                      )}
                   </div>
                </TableCell>
                <TableCell className="align-top">
                   <div className="flex items-center gap-3">
                      {ex.linkedin && ex.linkedin !== "" && (
                        <a href={ex.linkedin} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200/25 bg-blue-500/15 text-xs font-bold text-blue-100 transition hover:bg-blue-400/30" title="LinkedIn">in</a>
                      )}
                      {ex.twitter && ex.twitter !== "" && (
                        <a href={ex.twitter} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200/25 bg-blue-500/15 text-xs font-bold text-blue-100 transition hover:bg-blue-400/30" title="Twitter/X">X</a>
                      )}
                      {(!ex.linkedin || ex.linkedin === "") && (!ex.twitter || ex.twitter === "") && (
                        <span className="text-xs text-muted-foreground/30">-</span>
                      )}
                   </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredExhibitors.length === 0 && (
               <TableRow>
                 <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Aucun contact trouvé.</TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
