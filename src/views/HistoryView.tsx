/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Calendar, Users, Trash2, ArrowRight } from 'lucide-react';

export default function HistoryView({ navigate, store }: any) {
  const matches = store.matches || [];

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
            const scoreT1 = m.rounds.reduce((acc: number, r: any) => acc + (r.winningTeamIndex === 0 ? r.pointsTeam1 : 0), 0);
            const scoreT2 = m.rounds.reduce((acc: number, r: any) => acc + (r.winningTeamIndex === 1 ? r.pointsTeam2 : 0), 0);
            const dateStr = new Date(m.date).toLocaleDateString();

            return (
              <motion.div 
                key={m.id}
                layout
                className="bg-bg-card border border-border-theme p-5 rounded-2xl space-y-4 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                      {dateStr}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <span className="block text-xs text-text-dim">{m.teams[0].name}</span>
                        <span className="text-2xl font-display font-black">{scoreT1}</span>
                      </div>
                      <span className="text-text-dim font-bold">vs</span>
                      <div className="text-center">
                        <span className="block text-xs text-text-dim">{m.teams[1].name}</span>
                        <span className="text-2xl font-display font-black">{scoreT2}</span>
                      </div>
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
