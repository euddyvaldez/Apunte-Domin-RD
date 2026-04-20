/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  MoreHorizontal, 
  User, 
  AlertCircle,
  X,
  Trophy,
  History as HistoryIcon,
  LogOut,
  Flag,
  Zap,
  Target,
  Hash,
  Star,
  Shield,
  Circle
} from 'lucide-react';
import { calculateRoundPoints } from '../store';
import { PlayType } from '../types';

const PLAY_ABBR: Record<string, string> = {
  'Dominó': 'DOM',
  'Capicúa': 'CAP',
  'Tranque': 'TRA',
  'Paso de salida': 'PSA',
  'Pase Corrido': 'PCO',
  'Otro': 'OTR'
};

export default function GameView({ navigate, store }: any) {
  const match = store.currentMatch;
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (!match) {
    useEffect(() => navigate('home'), []);
    return null;
  }

  const scoreT1 = match.rounds.reduce((acc: number, r: any) => acc + (r.winningTeamIndex === 0 ? r.pointsTeam1 : 0), 0);
  const scoreT2 = match.rounds.reduce((acc: number, r: any) => acc + (r.winningTeamIndex === 1 ? r.pointsTeam2 : 0), 0);

  const isFinished = match.status === 'finished';

  return (
    <div className="flex flex-col h-full bg-bg-page select-none">
      {/* Scoreboard */}
      <div className="p-4 grid grid-cols-2 gap-4 sticky top-0 bg-bg-page/80 backdrop-blur-md z-40 border-b border-border-theme">
        <ScoreCard 
          name={match.teams[0].name} 
          score={scoreT1} 
          limit={match.scoreLimit} 
          primary 
          winner={match.winnerTeamId === match.teams[0].id}
        />
        <ScoreCard 
          name={match.teams[1].name} 
          score={scoreT2} 
          limit={match.scoreLimit} 
          winner={match.winnerTeamId === match.teams[1].id}
        />
        
        {!isFinished && (
           <div className="col-span-2 flex justify-end">
             <button 
               onClick={() => setShowOptions(!showOptions)}
               className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-primary transition-colors"
             >
               <MoreHorizontal className="w-4 h-4" />
               Opciones
             </button>
           </div>
        )}
      </div>

      {/* Options Dropdown/Modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 p-2 bg-bg-card border border-border-theme rounded-xl shadow-xl z-50 flex flex-col gap-1"
          >
            <button 
              onClick={() => {
                store.setCurrentMatch(null);
                navigate('home');
              }}
              className="flex items-center gap-3 p-3 hover:bg-primary/5 rounded-lg text-sm font-bold text-text-dim"
            >
              <LogOut className="w-4 h-4 text-secondary" />
              Salir al Inicio (Guardar)
            </button>
            <button 
              onClick={() => {
                if(confirm('¿Seguro que quieres terminar y descartar esta partida?')) {
                  store.deleteMatch(match.id);
                  navigate('home');
                }
              }}
              className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg text-sm font-bold text-red-500"
            >
              <Flag className="w-4 h-4" />
              Abandonar / Borrar Partida
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rounds History List - Show Split History on Front */}
      <div className="flex-1 p-4 overflow-y-auto">
        {match.rounds.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-dim/30 italic">
            <Plus className="w-12 h-12 mb-2" />
            <p>Presiona + para anotar puntos</p>
          </div>
        ) : (
          <div className="flex gap-4 min-h-full">
            {/* Team 1 Front Column */}
            <div className="flex-1 space-y-2">
              <div className="text-center pb-1 border-b border-border-theme">
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">{match.teams[0].name}</span>
              </div>
              {[...match.rounds].filter((r: any) => r.winningTeamIndex === 0).reverse().map((round: any) => (
                <div key={round.id} className="p-2 bg-bg-card border border-border-theme rounded-xl flex flex-col items-center">
                  <span className="text-[8px] font-black text-primary/50 uppercase tracking-tighter">
                    {PLAY_ABBR[round.playType] || 'OTR'}
                  </span>
                  <span className="text-xl font-display font-black text-primary">+{round.pointsTeam1}</span>
                </div>
              ))}
            </div>

            <div className="w-[1px] bg-border-theme/50" />

            {/* Team 2 Front Column */}
            <div className="flex-1 space-y-2">
              <div className="text-center pb-1 border-b border-border-theme">
                <span className="text-[10px] font-black uppercase text-secondary tracking-widest">{match.teams[1].name}</span>
              </div>
              {[...match.rounds].filter((r: any) => r.winningTeamIndex === 1).reverse().map((round: any) => (
                <div key={round.id} className="p-2 bg-bg-card border border-border-theme rounded-xl flex flex-col items-center">
                  <span className="text-[8px] font-black text-secondary/50 uppercase tracking-tighter">
                    {PLAY_ABBR[round.playType] || 'OTR'}
                  </span>
                  <span className="text-xl font-display font-black text-secondary">+{round.pointsTeam2}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History Bottom Sheet - Show sequential log one by one */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-bg-page rounded-t-[2rem] shadow-2xl z-[70] flex flex-col max-h-[80vh] border-x border-border-theme"
            >
              <div className="p-4 border-b border-border-theme flex items-center justify-between sticky top-0 bg-bg-page/80 backdrop-blur-md rounded-t-[2rem]">
                <h3 className="font-display font-bold text-lg">Bitácora de Partida</h3>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-primary/10 rounded-full"><X /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {[...match.rounds].reverse().map((round: any) => (
                  <div key={round.id} className={`flex items-center justify-between p-4 rounded-2xl border ${round.winningTeamIndex === 0 ? 'border-primary/20 bg-primary/5' : 'border-secondary/20 bg-secondary/5'}`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Ronda #{round.number}</span>
                      <span className="font-bold">{match.teams[round.winningTeamIndex].name}</span>
                      <span className="text-xs text-text-dim italic">{round.playType}</span>
                    </div>
                    <div className={`text-2xl font-display font-black ${round.winningTeamIndex === 0 ? 'text-primary' : 'text-secondary'}`}>
                      +{round.winningTeamIndex === 0 ? round.pointsTeam1 : round.pointsTeam2}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {!isFinished && (
        <div className="fixed bottom-20 left-0 right-0 flex items-center justify-center gap-6 pointer-events-none">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowHistory(true)}
            className="w-12 h-12 bg-bg-card border border-border-theme text-text-dim rounded-full shadow-lg flex items-center justify-center pointer-events-auto"
          >
            <HistoryIcon className="w-5 h-5" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddPoints(true)}
            className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-bg-page outline-none pointer-events-auto"
          >
            <Plus className="w-8 h-8" />
          </motion.button>

          <div className="w-12 h-12" /> {/* Spacer */}
        </div>
      )}

      {isFinished && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-bg-page border-2 border-primary p-8 rounded-[2.5rem] shadow-2xl text-center space-y-4 max-w-sm w-full"
          >
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black font-display text-text-main">¡Juego Terminado!</h3>
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold text-text-dim tracking-widest">El ganador es</p>
              <p className="text-xl font-bold text-primary">
                {match.winnerTeamId === match.teams[0].id ? match.teams[0].name : match.teams[1].name}
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <button 
                onClick={() => {
                  store.setCurrentMatch(null);
                  navigate('setup');
                }}
                className="w-full bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all font-bold text-lg"
              >
                Nueva Partida
              </button>
              <button 
                onClick={() => {
                  store.setCurrentMatch(null);
                  navigate('home');
                }}
                className="w-full bg-text-main/10 text-text-main p-4 rounded-2xl hover:bg-text-main/20 active:scale-95 transition-all font-bold"
              >
                Volver al Inicio
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Points Modal */}
      <AnimatePresence>
        {showAddPoints && (
          <AddPointsModal 
            onClose={() => setShowAddPoints(false)} 
            match={match} 
            onAdd={(roundData: any) => {
              store.addRound(match.id, roundData);
              setShowAddPoints(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreCard({ name, score, limit, primary, winner }: any) {
  const percentage = Math.min((score / limit) * 100, 100);
  
  return (
    <div className={`relative p-5 rounded-3xl overflow-hidden transition-all duration-500 border-2 ${
      winner ? 'bg-primary border-primary shadow-lg scale-105' : 
      percentage > 90 ? 'bg-accent/10 border-accent/50' : 
      'bg-bg-card border-border-theme'
    }`}>
      <div className="relative z-10 flex flex-col items-center">
        <span className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${winner ? 'text-white/60' : 'text-text-dim'}`}>
          {name}
        </span>
        <span className={`text-4xl font-display font-black ${winner ? 'text-white' : 'text-text-main'}`}>
          {score}
        </span>
        <div className="w-full h-1 bg-text-main/10 rounded-full mt-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full ${winner ? 'bg-white' : percentage > 90 ? 'bg-accent' : 'bg-primary'}`}
          />
        </div>
      </div>
      {winner && <Trophy className="absolute top-2 right-2 w-4 h-4 text-white/40" />}
    </div>
  );
}

function RoundEntry({ round, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: color === 'primary' ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-2 rounded-xl flex items-center justify-between gap-2 border bg-bg-card border-border-theme`}
    >
      <div className="flex flex-col min-w-0">
        <span className="text-[8px] font-black text-text-dim opacity-50 uppercase tracking-tighter">R#{round.number}</span>
        <span className="text-[10px] font-bold truncate">{round.playType}</span>
      </div>
      <div className={`text-sm font-display font-black text-${color}`}>
        +{round.winningTeamIndex === 0 ? round.pointsTeam1 : round.pointsTeam2}
      </div>
    </motion.div>
  );
}

function AddPointsModal({ onClose, match, onAdd }: any) {
  const [teamIndex, setTeamIndex] = useState<0 | 1>(0);
  const [points, setPoints] = useState<string>('');
  const [playType, setPlayType] = useState<PlayType>('Dominó');

  const types: { name: PlayType, icon: React.ReactNode }[] = [
    { name: 'Dominó', icon: <Zap className="w-3 h-3" /> },
    { name: 'Capicúa', icon: <Star className="w-3 h-3" /> },
    { name: 'Tranque', icon: <Shield className="w-3 h-3" /> },
    { name: 'Paso de salida', icon: <Target className="w-3 h-3" /> },
    { name: 'Pase Corrido', icon: <Hash className="w-3 h-3" /> },
    { name: 'Otro', icon: <Circle className="w-3 h-3" /> }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(points) || 0;
    const finalPoints = calculateRoundPoints(pts, playType);
    
    onAdd({
      playType,
      pointsTeam1: teamIndex === 0 ? finalPoints : 0,
      pointsTeam2: teamIndex === 1 ? finalPoints : 0,
      winningTeamIndex: teamIndex,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative w-full max-w-md bg-bg-page rounded-t-[2rem] sm:rounded-3xl p-5 shadow-2xl space-y-4"
      >
        <div className="w-10 h-1 bg-border-theme/50 rounded-full mx-auto" />
        
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-text-main">Anotar Puntos</h3>
          <button onClick={onClose} className="p-2 hover:bg-text-main/5 rounded-full text-text-dim"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pb-2">
          {/* Selector de Equipo */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-text-dim/60 uppercase tracking-widest pl-1">¿Ganador de mano?</span>
            <div className="flex gap-2">
              {match.teams.map((t: any, idx: number) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTeamIndex(idx as 0 | 1)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold text-sm ${
                    teamIndex === idx 
                      ? idx === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-transparent bg-bg-card text-text-dim opacity-60'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Tipo de Jugada - Grid View with Icons */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-text-dim/60 uppercase tracking-widest pl-1">Jugada</span>
            <div className="grid grid-cols-3 gap-2">
              {types.map(t => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setPlayType(t.name)}
                  className={`py-2 px-1 rounded-xl border transition-all text-[11px] font-bold text-center flex flex-col items-center gap-1 ${
                    playType === t.name 
                      ? 'border-primary bg-primary text-white shadow-md' 
                      : 'border-border-theme bg-bg-card text-text-dim hover:border-primary/30'
                  }`}
                >
                  {t.icon}
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Input de Puntos - Optimized Size */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-text-dim/60 uppercase tracking-widest pl-1">Puntos brutos</span>
            <div className="relative">
              <input 
                type="number" 
                inputMode="numeric"
                autoFocus
                value={points}
                onChange={e => setPoints(e.target.value)}
                className="w-full bg-bg-card border-border-theme rounded-2xl p-4 text-3xl font-display font-black text-center focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-white p-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all mt-2"
          >
            Confirmar Mano
          </button>
        </form>
      </motion.div>
    </div>
  );
}
