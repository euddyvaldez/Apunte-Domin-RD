import React from 'react';
import { motion } from 'motion/react';
import { Play, Plus, Dices, History, Zap } from 'lucide-react';

export default function HomeView({ navigate, store }: any) {
  const activeMatch = store.currentMatch;
  const matches = [...(store.matches || [])].sort((a: any, b: any) => b.date - a.date).slice(0, 3);

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-2 py-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-5 bg-primary/10 text-primary dark:bg-primary dark:text-white rounded-[2.5rem] shadow-xl mb-4 border border-primary/20 dark:border-transparent"
        >
          <Dices className="w-12 h-12" id="hero-icon" />
        </motion.div>
        <h2 className="text-3xl font-display font-bold" id="welcome-text">¡Bienvenido!</h2>
        <p className="text-text-dim">Anota tus partidas de dominó como un profesional.</p>
      </section>

      {/* Main Actions */}
      <div className="grid gap-4">
        {activeMatch && (
          <button 
            id="continue-match-btn"
            onClick={() => navigate('game')}
            className="group relative overflow-hidden bg-primary text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-between"
          >
            <div className="relative z-10 text-left">
              <span className="block text-xs uppercase tracking-widest opacity-80 mb-1">Partida en curso</span>
              <span className="text-xl font-bold font-display">Continuar Juego</span>
            </div>
            <Play className="w-8 h-8 opacity-40 group-hover:scale-125 transition-transform" />
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </button>
        )}

        <button 
          id="new-match-btn"
          onClick={() => navigate('setup')}
          className={`group p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-between ${
            activeMatch 
              ? 'bg-bg-card border border-border-theme text-text-main' 
              : 'bg-primary text-white'
          }`}
        >
          <div className="text-left">
            {!activeMatch && <span className="block text-xs uppercase tracking-widest opacity-80 mb-1">Empezar de cero</span>}
            <span className="text-xl font-bold font-display">Nueva Partida</span>
          </div>
          <Plus className={`w-8 h-8 opacity-40 group-hover:rotate-90 transition-transform ${activeMatch ? 'text-primary' : ''}`} />
        </button>

        <button 
          id="history-btn"
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

      {/* Recents Section */}
      {matches.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-dim/60 pl-2">Recientes</h3>
          <div className="space-y-3">
            {matches.map((m: any) => (
              <button 
                key={m.id}
                onClick={() => {
                  store.setCurrentMatch(m.id);
                  navigate('game');
                }}
                className="w-full bg-bg-card border border-border-theme p-4 rounded-2xl flex items-center justify-between hover:border-primary/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/5 rounded-full flex items-center justify-center text-text-dim group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-left flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                       {m.teams.map((t: any, idx: number) => {
                         const wins = m.setWins?.[idx] || 0;
                         return (
                           <div key={t.id} className="flex items-center gap-1 bg-primary/5 px-1.5 py-0.5 rounded-lg border border-primary/10">
                             <span className="text-[10px] font-black uppercase text-text-main/70">{t.name.split(' ')[0]}</span>
                             <span className={`text-[8px] font-black px-1 rounded-md ${wins > 0 ? 'bg-primary text-white' : 'bg-text-dim/10 text-text-dim'}`}>
                               {wins}v
                             </span>
                           </div>
                         );
                       })}
                    </div>
                    <p className="text-[9px] text-text-dim uppercase font-black tracking-widest mt-1">
                      {new Date(m.date).toLocaleDateString()} • {m.scoreLimit} Pts
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${m.status === 'finished' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary animate-pulse'}`}>
                     {m.status === 'finished' ? 'Finalizada' : 'En Vivo'}
                   </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Banner Advertisement */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-auto cursor-pointer overflow-hidden rounded-xl shadow-md border border-border-theme bg-bg-card"
        onClick={() => window.open('https://ais-dev-l3dac2ls5evpj6bfb7thz6-401655172120.us-west2.run.app', '_blank')}
        id="banner-ad"
      >
        <img 
          src="https://i.postimg.cc/j2v1YXxc/Anuncio1-banner.png" 
          alt="Anuncio Dominó RD Banner"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </motion.div>

      {/* Footer Info */}
      <footer className="text-center pt-8 pb-4">
        <p className="text-[10px] text-text-dim uppercase tracking-[0.2em]">
          Apuntes de Dominó RD v1.0
        </p>
      </footer>
    </div>
  );
}
