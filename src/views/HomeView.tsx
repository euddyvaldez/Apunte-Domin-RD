/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Play, History, Plus, Dices } from 'lucide-react';

export default function HomeView({ navigate, store }: any) {
  const activeMatch = store.currentMatch;

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-2 py-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-4 bg-primary text-white rounded-3xl shadow-lg mb-4"
        >
          <Dices className="w-12 h-12" />
        </motion.div>
        <h2 className="text-3xl font-display font-bold">¡Bienvenido!</h2>
        <p className="text-text-dim">Anota tus partidas de dominó como un profesional.</p>
      </section>

      {/* Main Actions */}
      <div className="grid gap-4">
        {activeMatch ? (
          <button 
            onClick={() => navigate('game')}
            className="group relative overflow-hidden bg-primary text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-between"
          >
            <div className="relative z-10">
              <span className="block text-xs uppercase tracking-widest opacity-80 mb-1">Partida en curso</span>
              <span className="text-xl font-bold font-display">Continuar Juego</span>
            </div>
            <Play className="w-8 h-8 opacity-40 group-hover:scale-125 transition-transform" />
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </button>
        ) : (
          <button 
            onClick={() => navigate('setup')}
            className="group bg-primary text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-between"
          >
            <span className="text-xl font-bold font-display">Nueva Partida</span>
            <Plus className="w-8 h-8 opacity-40 group-hover:rotate-90 transition-transform" />
          </button>
        )}

        <button 
          onClick={() => navigate('history')}
          className="bg-bg-card border border-border-theme p-5 rounded-2xl flex items-center gap-4 hover:bg-primary/5 transition-colors"
        >
          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
            <History className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="block font-bold">Historial</span>
            <span className="text-sm text-text-dim">Revisa partidas pasadas</span>
          </div>
        </button>

      </div>

      {/* Footer Info */}
      <footer className="text-center pt-8">
        <p className="text-[10px] text-text-dim uppercase tracking-[0.2em]">
          Apuntes de Dominó RD v1.0
        </p>
      </footer>
    </div>
  );
}
