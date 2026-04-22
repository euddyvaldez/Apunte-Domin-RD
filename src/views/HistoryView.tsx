/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Calendar, Users, Trash2, ArrowRight } from 'lucide-react';

export default function HistoryView({ navigate, store }: any) {
  const matches = [...(store.matches || [])].sort((a, b) => b.date - a.date);

  return (
    <div className="p-6 space-y-6">
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
                layout
                className="bg-bg-card border border-border-theme p-4 rounded-2xl space-y-4 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <span className="text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {dateStr}
                    </span>
                    <div className={`grid ${m.teams.length === 4 ? 'grid-cols-4' : m.teams.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                      {m.teams.map((team: any, idx: number) => {
                        const score = m.rounds.reduce((acc: number, r: any) => {
                          const pts = Number(r.points);
                          return acc + (r.winningTeamIndex === idx && !r.isDeleted && !isNaN(pts) ? pts : 0);
                        }, 0);
                        
                        return (
                          <div key={team.id} className="text-center overflow-hidden">
                            <span className="block text-[8px] text-text-dim truncate uppercase font-bold">{team.name}</span>
                            <span className={`text-xl font-display font-black ${score >= m.scoreLimit ? 'text-primary' : 'text-text-main'}`}>
                              {score}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {m.status === 'finished' ? (
                      <div className="flex items-center gap-1 text-primary">
                        <Trophy className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Finalizado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-accent">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase">En curso</span>
                      </div>
                    )}
                    <button 
                      onClick={() => store.deleteMatch(m.id)}
                      className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
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
                  className="w-full bg-primary/5 hover:bg-primary/10 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-primary transition-all"
                >
                  {m.status === 'active' ? 'Continuar Partida' : 'Ver Detalles'}
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
