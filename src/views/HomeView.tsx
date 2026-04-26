import React from 'react';
import { motion } from 'motion/react';
import { Play, Plus, Dices, History, Zap } from 'lucide-react';

export default function HomeView({ navigate, store }: any) {
  const activeMatch = store.currentMatch;
  const matches = [...(store.matches || [])].sort((a: any, b: any) => b.date - a.date).slice(0, 3);

  return (
    <div className="p-6 space-y-8 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -ml-32 -mb-32" />

      {/* Hero Section */}
      <section className="text-center space-y-3 py-6 relative">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          className="inline-flex items-center justify-center p-6 bg-bg-card rounded-[2.5rem] shadow-2xl border-b-4 border-r-4 border-primary/20 mb-2"
        >
          <div className="grid grid-cols-2 gap-1 translate-y-1">
             <div className="w-4 h-8 bg-primary rounded-sm shadow-sm" />
             <div className="w-4 h-8 bg-secondary rounded-sm shadow-sm" />
          </div>
          <Dices className="w-10 h-10 ml-2 text-primary" id="hero-icon" />
        </motion.div>
        <h2 className="text-4xl font-display font-black uppercase tracking-tighter" id="welcome-text">
          ¡DALE <span className="text-secondary italic">PLAY!</span>
        </h2>
        <p className="text-text-dim text-sm font-medium tracking-tight px-4 leading-snug">
          La mejor forma de anotar tus partidas de dominó en la República Dominicana.
        </p>
      </section>

      {/* Main Actions */}
      <div className="grid gap-4 relative">
        {activeMatch && (
          <button 
            id="continue-match-btn"
            onClick={() => navigate('game')}
            className="group relative overflow-hidden bg-primary text-white p-7 rounded-[2rem] shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-between"
          >
            <div className="relative z-10 text-left">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                Partida en curso
              </span>
              <span className="text-2xl font-black font-display uppercase tracking-tight">Continuar</span>
            </div>
            <Play className="w-10 h-10 text-secondary fill-secondary transition-transform group-hover:scale-125" />
          </button>
        )}

        <button 
          id="new-match-btn"
          onClick={() => navigate('setup')}
          className={`group p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-between border-b-4 ${
            activeMatch 
              ? 'bg-bg-card border-border-theme text-text-main' 
              : 'bg-secondary text-white border-secondary/20 shadow-secondary/20'
          }`}
        >
          <div className="text-left">
            {!activeMatch && <span className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Primer trancazo</span>}
            <span className="text-xl font-black font-display uppercase tracking-tight">Nueva Partida</span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12 ${activeMatch ? 'bg-primary/10 text-primary' : 'bg-white/20 text-white'}`}>
             <Plus className="w-7 h-7" />
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button 
            id="history-btn"
            onClick={() => navigate('history')}
            className="card-premium flex flex-col items-center gap-2 text-center group"
          >
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <History className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Historial</span>
          </button>

          <button 
            onClick={() => window.open('https://ais-dev-l3dac2ls5evpj6bfb7thz6-401655172120.us-west2.run.app', '_blank')}
            className="card-premium flex flex-col items-center gap-2 text-center group border-dashed border-secondary/20"
          >
            <div className="w-12 h-12 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Dominó RD</span>
          </button>
        </div>
      </div>

      {/* Recents Section */}
      {matches.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">Partidas Recientes</h3>
            <div className="h-px flex-1 bg-border-theme ml-4 opacity-50" />
          </div>
          <div className="space-y-3">
            {matches.map((m: any) => (
              <button 
                key={m.id}
                onClick={() => {
                  store.setCurrentMatch(m.id);
                  navigate('game');
                }}
                className="w-full bg-bg-card border-2 border-border-theme p-4 rounded-[1.75rem] flex items-center justify-between hover:border-primary transition-all active:scale-[0.98] group relative overflow-hidden"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-text-dim group-hover:bg-primary group-hover:text-white transition-all duration-500 overflow-hidden relative">
                    <Zap className="w-6 h-6 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-left flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                       {m.teams.map((t: any, idx: number) => {
                         const wins = m.setWins?.[idx] || 0;
                         return (
                           <div key={t.id} className="flex items-center gap-1.5 bg-bg-main px-2 py-1 rounded-xl border border-border-theme group-hover:border-primary/20 transition-colors">
                             <span className="text-[9px] font-black uppercase text-text-main tracking-tight">{t.name.split(' ')[0]}</span>
                             <span className={`text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-lg ${wins > 0 ? 'bg-primary text-white' : 'bg-text-main/10 text-text-dim'}`}>
                               {wins}
                             </span>
                           </div>
                         );
                       })}
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-text-dim/60">
                       <span className="bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-md">{m.scoreLimit} PTS</span>
                       <span>•</span>
                       <span>{new Date(m.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="relative z-10">
                   <div className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${m.status === 'finished' ? 'bg-text-main/10 text-text-dim' : 'bg-secondary/10 text-secondary border border-secondary/20 shadow-sm shadow-secondary/10'}`}>
                     {m.status === 'finished' ? 'Final' : 'En Juego'}
                   </div>
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
