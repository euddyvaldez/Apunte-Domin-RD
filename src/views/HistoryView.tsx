import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Calendar, Trash2, ArrowRight } from 'lucide-react';

export default function HistoryView({ navigate, store }: any) {
  const matches = [...(store.matches || [])].sort((a, b) => b.date - a.date);

  return (
    <div className="p-6 pb-24 space-y-6 bg-bg-page min-h-full scrollbar-hide overflow-y-auto">
      <header className="space-y-1">
        <h2 className="text-2xl font-display font-bold">Historial</h2>
        <p className="text-text-dim text-sm">Registro de tus partidas pasadas.</p>
      </header>

      {matches.length === 0 ? (
        <div className="py-20 text-center space-y-4 opacity-30">
          <Calendar className="w-16 h-16 mx-auto" />
          <p className="italic">No hay partidas registradas todavía.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m: any) => {
            const dateStr = new Date(m.date).toLocaleDateString();

            return (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-card border border-border-theme p-5 rounded-[2rem] space-y-4 relative overflow-hidden shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-secondary/60 tracking-widest">{dateStr}</span>
                    <div className="flex items-center gap-6">
                      {m.teams.map((team: any, idx: number) => {
                        const score = (m.rounds || []).reduce((acc: number, r: any) => {
                          return acc + (r.winningTeamIndex === idx && !r.isDeleted ? r.points : 0);
                        }, 0);
                        const wins = m.setWins?.[idx] || 0;
                        return (
                          <div key={team.id} className="text-center relative">
                            <span className="block text-[8px] font-bold text-text-dim/40 uppercase truncate max-w-[70px] mb-1">{team.name}</span>
                            <div className="flex flex-col items-center">
                              <span className="text-2xl font-display font-black tracking-tighter">{score}</span>
                              <span className={`text-[9px] font-black px-1.5 rounded-full mt-0.5 ${wins > 0 ? 'bg-primary/10 text-primary' : 'bg-text-dim/5 text-text-dim/40'}`}>
                                {wins}v
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {m.status === 'finished' ? (
                      <div className="flex items-center gap-1 text-primary">
                        <Trophy className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase">Win</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-500">
                         <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                         <span className="text-[9px] font-black uppercase">Live</span>
                      </div>
                    )}
                    <button 
                      onClick={() => { if(confirm('¿Borrar?')) store.deleteMatch(m.id); }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    store.setCurrentMatch(m.id);
                    navigate('game');
                  }}
                  className="w-full bg-primary text-white p-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-md active:scale-95 transition-all"
                >
                  {m.status === 'active' ? 'Continuar' : 'Ver Detalles'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
