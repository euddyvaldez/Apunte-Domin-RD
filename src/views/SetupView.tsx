import React, { useState } from 'react';
import { motion } from 'motion/react';
import { generateUUID } from '../store';
import { Users, Target, Target as TargetIcon, ChevronRight, Zap, Dices } from 'lucide-react';

export default function SetupView({ navigate, store }: any) {
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState(['Equipo A', 'Equipo B', 'Equipo C', 'Equipo D']);
  
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

  const updateTeamName = (idx: number, val: string) => {
    const newNames = [...teamNames];
    newNames[idx] = val;
    setTeamNames(newNames);
  };

  return (
    <div className="p-6 pb-24 space-y-8 h-full bg-bg-page overflow-y-auto scrollbar-hide">
      <header className="space-y-1 py-4">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-1.5 h-8 bg-secondary rounded-full" />
           <h2 className="text-3xl font-display font-black uppercase tracking-tighter" id="setup-title">PREPARACIÓN</h2>
        </div>
        <p className="text-text-dim text-xs font-medium tracking-tight">Configura tu mesa para el trancazo.</p>
      </header>

      <div className="space-y-6">
        {/* Modalidad de Juego */}
        <section className="bg-bg-card border-2 border-border-theme p-6 rounded-[2rem] space-y-4 shadow-sm" id="modalidad-section">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-black uppercase text-[10px] tracking-widest text-text-dim">Modalidad de mesa</h3>
          </div>
          <div className="flex gap-2">
            {[2, 3, 4].map(val => (
              <button
                key={val}
                onClick={() => setNumTeams(val)}
                className={`flex-1 py-4 rounded-2xl border-b-4 transition-all font-black uppercase text-[10px] tracking-widest ${
                  numTeams === val 
                    ? 'border-primary bg-primary text-white scale-[1.02]' 
                    : 'border-border-theme bg-bg-main text-text-dim'
                }`}
              >
                {val === 2 ? 'Frente' : val === 3 ? '3 Player' : 'To pa to'}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4">
          {/* Límite de Puntos */}
          <section className="bg-bg-card border-2 border-border-theme p-6 rounded-[2rem] space-y-4 shadow-sm" id="limite-section">
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon className="w-5 h-5 text-primary" />
              <h3 className="font-black uppercase text-[10px] tracking-widest text-text-dim">Meta de Puntos</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[100, 150, 200, 500].map(val => (
                <button
                  key={val}
                  onClick={() => setScoreLimit(val)}
                  className={`py-4 rounded-2xl border-b-4 transition-all font-black text-xs ${
                    scoreLimit === val 
                      ? 'border-secondary bg-secondary text-white scale-[1.02]' 
                      : 'border-border-theme bg-bg-main text-text-dim'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </section>

          {/* Apuntes Rápidos */}
          <section className="bg-bg-card border-2 border-border-theme p-6 rounded-[2rem] space-y-5 shadow-sm" id="apuntes-rapidos-section">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="font-black uppercase text-[10px] tracking-widest text-text-dim">Puntos Dominicanos</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5 p-3 bg-bg-main rounded-[1.25rem] border border-border-theme/50 relative overflow-hidden">
                <span className="text-[8px] font-black uppercase text-secondary tracking-widest text-center">Capicúa</span>
                <input 
                  type="number"
                  value={capicua}
                  onChange={(e) => setCapicua(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent p-0 shadow-none outline-none text-base text-center font-black text-primary"
                />
                <div className="absolute top-0 right-0 w-4 h-4 bg-secondary/10 flex items-center justify-center rounded-bl-lg">
                   <div className="w-1 h-1 bg-secondary rounded-full" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 p-3 bg-bg-main rounded-[1.25rem] border border-border-theme/50">
                <span className="text-[8px] font-black uppercase text-primary tracking-widest text-center">Corrido</span>
                <input 
                  type="number"
                  value={corrido}
                  onChange={(e) => setCorrido(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent p-0 shadow-none outline-none text-base text-center font-black text-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5 p-3 bg-bg-main rounded-[1.25rem] border border-border-theme/50">
                <span className="text-[8px] font-black uppercase text-secondary tracking-widest text-center">Salida</span>
                <input 
                  type="number"
                  value={salida}
                  onChange={(e) => setSalida(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent p-0 shadow-none outline-none text-base text-center font-black text-primary"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Equipos */}
        <section className="space-y-4" id="teams-section">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">Participantes</h3>
            <div className="h-px flex-1 bg-border-theme ml-4 opacity-50" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: numTeams }).map((_, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-bg-card border-2 p-5 rounded-[1.75rem] shadow-sm relative overflow-hidden group ${
                  idx === 0 ? 'border-primary/20' : 
                  idx === 1 ? 'border-secondary/20' :
                  idx === 2 ? 'border-accent/20' : 'border-purple-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all ${
                    idx === 0 ? 'bg-primary text-white' : 
                    idx === 1 ? 'bg-secondary text-white' :
                    idx === 2 ? 'bg-accent text-white' : 'bg-purple-500 text-white'
                  }`}>
                    <span className="font-black text-lg">{String.fromCharCode(65 + idx)}</span>
                  </div>
                  <div className="flex-1">
                    <label className="text-[8px] font-black uppercase text-text-dim/40 tracking-[0.2em] block mb-0.5">
                      {numTeams > 2 ? `Participante ${idx + 1}` : `Mesa Equipo ${String.fromCharCode(65 + idx)}`}
                    </label>
                    <input 
                      type="text" 
                      value={teamNames[idx]} 
                      onChange={(e) => updateTeamName(idx, e.target.value)} 
                      className="w-full font-black bg-transparent border-none focus:ring-0 p-0 text-xl placeholder:text-text-dim/10 uppercase tracking-tight"
                      placeholder={`Nombre`}
                    />
                  </div>
                </div>
                {/* Decorative Domino Dot */}
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-border-theme" />
              </motion.div>
            ))}
          </div>
        </section>

        <button 
          id="start-match-btn"
          onClick={handleStart}
          className="w-full bg-primary text-white p-6 rounded-[2rem] flex items-center justify-center gap-3 font-display font-black text-xl uppercase tracking-tighter shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all"
        >
          ¡A JUGAR AHORA!
          <ChevronRight className="w-6 h-6 text-secondary" strokeWidth={4} />
        </button>
      </div>
    </div>
  );
}
