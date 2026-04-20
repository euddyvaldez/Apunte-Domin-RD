/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayType } from '../types';
import { calculateRoundPoints } from '../store';
import { Zap, RotateCcw, Info } from 'lucide-react';

export default function PracticeView({ navigate }: any) {
  const [points, setPoints] = useState<string>('');
  const [playType, setPlayType] = useState<PlayType>('Dominó');
  
  const types: PlayType[] = ['Dominó', 'Capicúa', 'Tranque', 'Paso de salida', 'Pase Corrido', 'Otro'];
  
  const currentPoints = parseInt(points) || 0;
  const calculatedPoints = calculateRoundPoints(currentPoints, playType);

  const handleReset = () => {
    setPoints('');
    setPlayType('Dominó');
  };

  return (
    <div className="p-6 space-y-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent/20 text-accent rounded-lg">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <h2 className="text-2xl font-display font-bold">Práctica Rápida</h2>
        </div>
        <p className="text-text-dim text-sm italic">
          Simula una mano y mira el registro.
        </p>
      </header>

      {/* Point Calculator Display */}
      <section className="bg-bg-card border border-border-theme p-8 rounded-[2.5rem] shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Zap className="w-24 h-24" />
        </div>
        
        <div className="text-center space-y-2 relative z-10">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-dim opacity-70">
            TOTAL ANOTADO
          </span>
          <motion.div 
            key={calculatedPoints}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-display font-black text-primary"
          >
            {calculatedPoints}
          </motion.div>
          <div className="flex items-center justify-center gap-2 text-xs text-text-dim">
            <span>{playType}</span>
          </div>
        </div>
      </section>

      {/* Selection Area */}
      <div className="space-y-6">
        {/* Play Type Selection */}
        <div className="space-y-3">
           <label className="text-xs font-bold text-text-dim uppercase tracking-widest px-2">
            Tipo de Jugada
           </label>
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
             {types.map(t => (
               <button
                 key={t}
                 onClick={() => setPlayType(t)}
                 className={`whitespace-nowrap px-4 py-2 rounded-full border transition-all text-sm font-bold ${
                   playType === t 
                     ? 'border-primary bg-primary text-white shadow-md' 
                     : 'border-border-theme bg-bg-card text-text-dim hover:bg-primary/5'
                 }`}
               >
                 {t}
               </button>
             ))}
           </div>
        </div>

        {/* Number Input */}
        <div className="space-y-3">
           <label className="text-xs font-bold text-text-dim uppercase tracking-widest px-2">
            Puntos de la Mano
           </label>
           <input 
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full bg-bg-card border-none ring-1 ring-border-theme focus:ring-2 focus:ring-primary rounded-2xl p-6 text-4xl font-display font-black text-center transition-all"
           />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={handleReset}
             className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-border-theme text-text-dim font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
           >
             <RotateCcw className="w-5 h-5" />
             Reiniciar
           </button>
           <button 
             onClick={() => navigate('home')}
             className="p-4 rounded-2xl bg-text-main text-bg-page font-bold shadow-lg hover:opacity-90 transition-all"
           >
             Cerrar
           </button>
        </div>
      </div>

    </div>
  );
}
