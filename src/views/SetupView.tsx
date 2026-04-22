/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { generateUUID } from '../store';
import { Users, Target, CheckCircle, ChevronRight } from 'lucide-react';

export default function SetupView({ navigate, store }: any) {
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState<string[]>(['Equipo A', 'Equipo B', 'Equipo C', 'Equipo D']);
  
  const [scoreLimit, setScoreLimit] = useState(100);
  const [capicua, setCapicua] = useState(30);
  const [salida, setSalida] = useState(30);
  const [corrido, setCorrido] = useState(30);

  const handleStart = () => {
    const teams = teamNames.slice(0, numTeams).map((name) => ({
      id: generateUUID(),
      name: name || `Equipo ${generateUUID().slice(0, 4)}`,
    }));

    store.startNewMatch(teams, scoreLimit, capicua, salida, corrido);
    navigate('game');
  };

  const updateTeamName = (index: number, name: string) => {
    const newNames = [...teamNames];
    newNames[index] = name;
    setTeamNames(newNames);
  };

  return (
    <div className="p-6 pb-24 space-y-8">
      <header className="space-y-1">
        <h2 className="text-2xl font-display font-bold">Nueva Partida</h2>
        <p className="text-text-dim text-sm">Configura los participantes y reglas.</p>
      </header>

      <div className="space-y-6">
        {/* Modalidad de Juego */}
        <section className="bg-bg-card border border-border-theme p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Modalidad</h3>
          </div>
          <div className="flex gap-2">
            {[2, 3, 4].map(val => (
              <button
                key={val}
                onClick={() => setNumTeams(val)}
                className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${
                  numTeams === val 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-transparent bg-primary/5 text-text-dim'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Límite de Puntos */}
          <section className="bg-bg-card border border-border-theme p-5 rounded-3xl space-y-4">
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

          {/* Apuntes Rápidos */}
          <section className="bg-bg-card border border-border-theme p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-bold">Apuntes Rápidos</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="flex flex-col gap-1 p-2 bg-bg-page rounded-xl border border-border-theme/50">
                <span className="text-[10px] uppercase font-black text-text-dim/60 px-1">Capicúa</span>
                <input 
                  type="number"
                  value={capicua}
                  onChange={(e) => setCapicua(parseInt(e.target.value) || 0)}
                  className="w-full bg-bg-card p-1.5 rounded-lg text-sm text-center font-black border-none ring-1 ring-border-theme focus:ring-green-500"
                />
              </div>
              <div className="flex flex-col gap-1 p-2 bg-bg-page rounded-xl border border-border-theme/50">
                <span className="text-[10px] uppercase font-black text-text-dim/60 px-1">Corrido</span>
                <input 
                  type="number"
                  value={corrido}
                  onChange={(e) => setCorrido(parseInt(e.target.value) || 0)}
                  className="w-full bg-bg-card p-1.5 rounded-lg text-sm text-center font-black border-none ring-1 ring-border-theme focus:ring-green-500"
                />
              </div>
              <div className="flex flex-col gap-1 p-2 bg-bg-page rounded-xl border border-border-theme/50 min-w-full col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-black text-text-dim/60 px-1">Salida</span>
                <input 
                  type="number"
                  value={salida}
                  onChange={(e) => setSalida(parseInt(e.target.value) || 0)}
                  className="w-full bg-bg-card p-1.5 rounded-lg text-sm text-center font-black border-none ring-1 ring-border-theme focus:ring-green-500"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Equipos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: numTeams }).map((_, idx) => (
            <motion.section 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-bg-card border border-border-theme p-5 rounded-3xl space-y-4 border-l-4 ${
                idx === 0 ? 'border-l-primary' : 
                idx === 1 ? 'border-l-secondary' :
                idx === 2 ? 'border-l-accent' : 'border-l-purple-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  idx === 0 ? 'bg-primary/10 text-primary' : 
                  idx === 1 ? 'bg-secondary/10 text-secondary' :
                  idx === 2 ? 'bg-accent/10 text-accent' : 'bg-purple-100 text-purple-500'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-black text-text-dim/40 tracking-widest block mb-1">
                    {numTeams > 2 ? `Participante ${idx + 1}` : `Equipo ${String.fromCharCode(65 + idx)}`}
                  </label>
                  <input 
                    type="text" 
                    value={teamNames[idx]} 
                    onChange={e => updateTeamName(idx, e.target.value)}
                    className="w-full font-bold bg-transparent border-none focus:ring-0 p-0 text-lg placeholder:text-text-dim/20"
                    placeholder={`Nombre ${numTeams > 2 ? 'Jugador' : 'Equipo'}`}
                  />
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        <button 
          onClick={handleStart}
          className="w-full bg-primary text-white p-5 rounded-3xl flex items-center justify-center gap-3 font-display font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
        >
          Comenzar Partida
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
