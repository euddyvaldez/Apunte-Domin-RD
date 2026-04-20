/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { generateUUID } from '../store';
import { Users, Target, CheckCircle, ChevronRight } from 'lucide-react';

export default function SetupView({ navigate, store }: any) {
  const [team1Name, setTeam1Name] = useState('Equipo A');
  const [team1Player1, setTeam1Player1] = useState('');
  const [team1Player2, setTeam1Player2] = useState('');

  const [team2Name, setTeam2Name] = useState('Equipo B');
  const [team2Player1, setTeam2Player1] = useState('');
  const [team2Player2, setTeam2Player2] = useState('');

  const [scoreLimit, setScoreLimit] = useState(100);

  const handleStart = () => {
    const team1 = {
      id: generateUUID(),
      name: team1Name,
      players: [
        { id: generateUUID(), name: team1Player1 || 'Jugador 1' },
        { id: generateUUID(), name: team1Player2 || 'Jugador 2' }
      ]
    };
    const team2 = {
      id: generateUUID(),
      name: team2Name,
      players: [
        { id: generateUUID(), name: team2Player1 || 'Jugador 3' },
        { id: generateUUID(), name: team2Player2 || 'Jugador 4' }
      ]
    };

    store.startNewMatch([team1, team2], scoreLimit);
    navigate('game');
  };

  return (
    <div className="p-6 space-y-8">
      <header className="space-y-1">
        <h2 className="text-2xl font-display font-bold">Nueva Partida</h2>
        <p className="text-text-dim text-sm">Configura los equipos y el límite de puntos.</p>
      </header>

      <div className="space-y-6">
        {/* Límite de Puntos */}
        <section className="bg-bg-card border border-border-theme p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Límite de Puntos</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[100, 150, 200, 500].map(val => (
              <button
                key={val}
                onClick={() => setScoreLimit(val)}
                className={`flex-1 min-w-[70px] py-3 rounded-xl border-2 transition-all font-bold ${
                  scoreLimit === val 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-transparent bg-primary/5 text-text-dim'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
          
          <div className="pt-2">
            <label className="text-[10px] uppercase font-bold text-text-dim tracking-widest pl-1 mb-1 block">
              O puntos personalizados
            </label>
            <input 
              type="number"
              placeholder="Ej: 300"
              value={[100, 150, 200, 500].includes(scoreLimit) ? '' : scoreLimit}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setScoreLimit(val);
                else setScoreLimit(0);
              }}
              className="w-full bg-bg-page p-3 rounded-xl text-sm border-none ring-1 ring-border-theme focus:ring-primary transition-all text-center font-bold"
            />
          </div>
        </section>

        {/* Equipos */}
        <div className="grid gap-6">
          {/* Equipo 1 */}
          <section className="bg-bg-card border border-border-theme p-5 rounded-2xl space-y-4 border-l-4 border-l-primary">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <input 
                type="text" 
                value={team1Name} 
                onChange={e => setTeam1Name(e.target.value)}
                className="font-bold bg-transparent border-none focus:ring-0 w-full"
                placeholder="Nombre Equipo 1"
              />
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Jugador 1" 
                value={team1Player1}
                onChange={e => setTeam1Player1(e.target.value)}
                className="w-full bg-bg-page p-3 rounded-xl text-sm border-none ring-1 ring-border-theme focus:ring-primary transition-all"
              />
              <input 
                type="text" 
                placeholder="Jugador 2" 
                value={team1Player2}
                onChange={e => setTeam1Player2(e.target.value)}
                className="w-full bg-bg-page p-3 rounded-xl text-sm border-none ring-1 ring-border-theme focus:ring-primary transition-all"
              />
            </div>
          </section>

          {/* Equipo 2 */}
          <section className="bg-bg-card border border-border-theme p-5 rounded-2xl space-y-4 border-l-4 border-l-secondary">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-secondary" />
              <input 
                type="text" 
                value={team2Name} 
                onChange={e => setTeam2Name(e.target.value)}
                className="font-bold bg-transparent border-none focus:ring-0 w-full"
                placeholder="Nombre Equipo 2"
              />
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Jugador 1" 
                value={team2Player1}
                onChange={e => setTeam2Player1(e.target.value)}
                className="w-full bg-bg-page p-3 rounded-xl text-sm border-none ring-1 ring-border-theme focus:ring-primary transition-all"
              />
              <input 
                type="text" 
                placeholder="Jugador 2" 
                value={team2Player2}
                onChange={e => setTeam2Player2(e.target.value)}
                className="w-full bg-bg-page p-3 rounded-xl text-sm border-none ring-1 ring-border-theme focus:ring-primary transition-all"
              />
            </div>
          </section>
        </div>

        <button 
          onClick={handleStart}
          className="w-full bg-primary text-white p-5 rounded-2xl flex items-center justify-center gap-3 font-display font-bold text-lg shadow-lg active:scale-95 transition-all"
        >
          Comenzar Partida
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
