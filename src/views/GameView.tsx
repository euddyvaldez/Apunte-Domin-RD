import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  MoreHorizontal, 
  X,
  Trophy,
  History as HistoryIcon,
  LogOut,
  Flag,
  Zap,
  Target,
  Trash2,
  Pencil,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../lib/haptics';
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
  const [roundToEdit, setRoundToEdit] = useState<any>(null);
  const [initialTeamForModal, setInitialTeamForModal] = useState<number>(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [tempMeta, setTempMeta] = useState(match?.scoreLimit.toString() || '100');
  const [dismissedFinishedModal, setDismissedFinishedModal] = useState(false);

  useEffect(() => {
    if (!match) {
      navigate('home');
    }
  }, [match, navigate]);

  if (!match) {
    return null;
  }

  const teamScores = match.teams.map((_: any, index: number) => {
    return (match.rounds || []).reduce((acc: number, r: any) => {
      const pts = Number(r.points);
      const isWinner = r.winningTeamIndex === index && !r.isDeleted && !isNaN(pts);
      return acc + (isWinner ? pts : 0);
    }, 0);
  });

  const isFinished = match.status === 'finished';

  const handleReplay = () => {
    store.replayMatch(match.id);
    setDismissedFinishedModal(false);
  };

  useEffect(() => {
    if (isFinished && !dismissedFinishedModal) {
      triggerHaptic([50, 30, 50]);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      });
    }
  }, [isFinished]);

  const gridColsClass = match.teams.length === 4 ? 'grid-cols-4' : 
                        match.teams.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="flex flex-col h-full bg-bg-page select-none overflow-x-hidden pb-16">
      {/* Scoreboard */}
      <div className="p-3 pb-2 flex flex-col gap-2 sticky top-0 bg-bg-page/80 backdrop-blur-md z-40 border-b border-border-theme">
        <div className="flex justify-center items-center gap-2">
          {isEditingMeta ? (
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={tempMeta}
                autoFocus
                onChange={(e) => setTempMeta(e.target.value)}
                onBlur={() => {
                  const val = parseInt(tempMeta);
                  if (!isNaN(val) && val > 0) store.updateMatchLimit(match.id, val);
                  setIsEditingMeta(false);
                }}
                className="w-16 text-[10px] font-black text-center bg-bg-card border border-primary/50 rounded-full py-0.5 outline-none"
              />
              <span className="text-[7px] font-bold text-primary uppercase">Nueva Meta</span>
            </div>
          ) : (
            <button 
              onClick={() => {
                setTempMeta(match.scoreLimit.toString());
                setIsEditingMeta(true);
              }}
              className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-border-theme/50 transition-all text-text-dim/60 bg-text-main/5"
            >
              <span>Meta: {match.scoreLimit}</span>
              <Pencil className="w-2.5 h-2.5 opacity-40" />
            </button>
          )}
        </div>

        <div className={`grid ${gridColsClass} gap-2`}>
          {match.teams.map((team: any, idx: number) => (
            <div key={team.id} className="flex flex-col gap-1.5 min-w-0">
              <ScoreCard 
                name={team.name} 
                score={teamScores[idx]} 
                limit={match.scoreLimit} 
                primary={idx === 0}
                secondary={idx === 1}
                accent={idx === 2}
                purple={idx === 3}
                winner={match.winnerTeamId === team.id}
                isFinished={isFinished}
                wins={match.setWins?.[idx] || 0}
                onAdd={() => {
                  setInitialTeamForModal(idx);
                  setShowAddPoints(true);
                }}
              />
              {!isFinished && (
                <QuickActions 
                  match={match} 
                  teamIdx={idx}
                  onQuickAdd={(type: any, pts: number) => {
                    store.addRound(match.id, {
                      playType: type,
                      points: pts,
                      winningTeamIndex: idx
                    });
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Options Header / Finished Controls */}
      <div className="px-4 py-2 flex items-center justify-between min-h-[48px]">
        {isFinished ? (
          <div className="flex items-center gap-2 w-full">
            <button 
              onClick={handleReplay}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
              id="replay-finished-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Volver a jugar
            </button>
            <button 
              onClick={() => {
                store.setCurrentMatch(null);
                navigate('setup');
              }}
              className="flex-1 bg-bg-card border border-border-theme py-2.5 rounded-xl font-bold text-[10px] uppercase text-text-dim hover:bg-primary/5 transition-all flex items-center justify-center gap-2 shadow-sm"
              id="new-game-finished-btn"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva Partida
            </button>
          </div>
        ) : (
          <div className="flex-1 flex justify-end">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-dim"
              id="options-trigger"
            >
              <MoreHorizontal className="w-4 h-4" />
              Opciones
            </button>
          </div>
        )}
      </div>

      {/* Options Modal Helper */}
      <AnimatePresence>
        {showOptions && !isFinished && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-4 p-2 bg-bg-card border border-border-theme rounded-xl shadow-xl z-50 flex flex-col gap-1"
          >
            <button 
              onClick={() => navigate('home')}
              className="flex items-center gap-3 p-3 hover:bg-primary/5 rounded-lg text-sm font-bold text-primary"
            >
              <LogOut className="w-4 h-4" /> Salir a Inicio
            </button>
            <button 
              onClick={() => {
                if(confirm('¿Reiniciar partida?')) {
                   // Restart logic missing in snippets, assuming navigate('setup') or logic in store
                   navigate('setup');
                }
              }}
              className="flex items-center gap-3 p-3 hover:bg-secondary/5 rounded-lg text-sm font-bold text-text-dim"
            >
              <RotateCcw className="w-4 h-4" /> Reiniciar Juego
            </button>
            <button 
              onClick={() => {
                if(confirm('¿Borrar partida?')) {
                  store.deleteMatch(match.id);
                  navigate('home');
                }
              }}
              className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg text-sm font-bold text-red-500"
            >
              <Flag className="w-4 h-4" /> Abandonar Partida
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Grid on Front Page */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-hide">
        <div className={`grid ${gridColsClass} gap-2 items-start`}>
          {match.teams.map((team: any, teamIdx: number) => (
            <div key={team.id} className="space-y-1.5">
              <div className="text-center py-1 border-b border-border-theme/50 mb-1">
                 <span className="text-[8px] font-black uppercase opacity-40">{team.name}</span>
              </div>
              {[...match.rounds].filter((r: any) => r.winningTeamIndex === teamIdx).reverse().map((round: any) => (
                <button 
                  key={round.id}
                  onClick={() => setRoundToEdit(round)}
                  className={`w-full p-2 bg-bg-card border border-border-theme rounded-xl flex flex-col items-center gap-0.5 hover:border-primary/40 active:scale-95 transition-all text-center relative overflow-hidden ${round.isDeleted ? 'opacity-30' : ''}`}
                >
                  <span className="text-[7px] font-black tracking-widest opacity-40">{PLAY_ABBR[round.playType] || 'OTR'}</span>
                  <span className={`text-sm font-display font-black ${round.winningTeamIndex === 0 ? 'text-primary' : round.winningTeamIndex === 1 ? 'text-secondary' : 'text-accent'}`}>
                    +{round.points}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bitacora Button Handle */}
      <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <button
          onClick={() => setShowHistory(true)}
          className="pointer-events-auto bg-bg-card border-x border-t border-border-theme rounded-t-2xl px-12 py-2 shadow-lg flex flex-col items-center gap-1 group"
        >
          <div className="w-10 h-1 bg-border-theme rounded-full" />
          <span className="text-[9px] font-black uppercase tracking-widest text-text-dim">Bitácora</span>
        </button>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {(showAddPoints || roundToEdit) && (
          <PointsModal 
            onClose={() => {
              setShowAddPoints(false);
              setRoundToEdit(null);
            }} 
            match={match} 
            roundToEdit={roundToEdit}
            initialTeamIndex={initialTeamForModal}
            onAdd={(roundData: any) => {
              store.addRound(match.id, roundData);
              setShowAddPoints(false);
            }}
            onUpdate={(roundId: string, roundData: any) => {
              store.updateRound(match.id, roundId, roundData);
              setRoundToEdit(null);
            }}
            onDelete={(roundId: string) => {
              store.deleteRound(match.id, roundId);
              setRoundToEdit(null);
            }}
          />
        )}
        {showHistory && (
          <HistorySheet 
            match={match} 
            onClose={() => setShowHistory(false)} 
            onEdit={(r: any) => {
              setShowHistory(false);
              setRoundToEdit(r);
            }}
            onNewMatch={() => {
              store.setCurrentMatch(null);
              navigate('setup');
            }}
            onReplay={handleReplay}
          />
        )}
        {isFinished && !dismissedFinishedModal && (
          <WinnerModal 
            match={match} 
            onClose={() => setDismissedFinishedModal(true)}
            onNewMatch={() => {
              store.setCurrentMatch(null);
              navigate('setup');
            }}
            onReplay={handleReplay}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreCard({ name, score, limit, primary, secondary, accent, winner, onAdd, isFinished, wins }: any) {
  const percent = Math.min((score / limit) * 100, 100);
  const colorClass = primary ? 'bg-primary text-white shadow-primary/20' : 
                     secondary ? 'bg-secondary text-white shadow-secondary/20' : 
                     accent ? 'bg-accent text-white shadow-accent/20' : 'bg-purple-500 text-white';

  return (
    <motion.button
      whileTap={!isFinished ? { scale: 0.95 } : {}}
      onClick={onAdd}
      disabled={isFinished}
      className={`relative w-full p-3 rounded-2xl border border-border-theme flex flex-col items-center gap-1 shadow-md transition-all ${isFinished ? 'opacity-80' : 'active:shadow-inner'}`}
    >
      <div className="absolute top-0 left-0 h-full bg-primary/5 rounded-2xl transition-all" style={{ width: `${percent}%` }} />
      <div className="flex items-center gap-1 w-full justify-center">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-40 truncate">{name}</span>
        {wins > 0 && (
          <span className="bg-primary/20 text-primary text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
            {wins} v
          </span>
        )}
      </div>
      <div className="text-3xl font-display font-black tabular-nums relative z-10">{score}</div>
      {winner && <Trophy className="absolute -top-2 -right-1 w-5 h-5 text-yellow-500 drop-shadow-sm" />}
    </motion.button>
  );
}

function QuickActions({ match, teamIdx, onQuickAdd }: any) {
  const actions = [
    { type: 'Capicúa' as PlayType, label: 'CP', pts: match.capicuaPoints },
    { type: 'Pase Corrido' as PlayType, label: 'CO', pts: match.pasoCorridoPoints },
    { type: 'Paso de salida' as PlayType, label: 'SA', pts: match.pasoSalidaPoints },
  ];

  return (
    <div className="flex gap-1">
      {actions.map(action => (
        <button
          key={action.type}
          onClick={() => {
            triggerHaptic(15);
            onQuickAdd(action.type, action.pts);
          }}
          className="flex-1 py-1.5 flex flex-col items-center justify-center bg-bg-card border border-border-theme rounded-lg text-[8px] font-black hover:border-primary/30 active:scale-90 transition-all text-text-dim"
        >
          <span>{action.label}</span>
          <span className="opacity-40">+{action.pts}</span>
        </button>
      ))}
    </div>
  );
}

function PointsModal({ onClose, match, onAdd, onUpdate, onDelete, roundToEdit, initialTeamIndex }: any) {
  const isEditing = !!roundToEdit;
  const [teamIndex, setTeamIndex] = useState<number>(isEditing ? roundToEdit.winningTeamIndex : initialTeamIndex);
  const [points, setPoints] = useState<string>(isEditing ? roundToEdit.points.toString() : '');
  const [playType, setPlayType] = useState<PlayType>(isEditing ? roundToEdit.playType : 'Dominó');

  const types: PlayType[] = ['Dominó', 'Tranque', 'Otro'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(30);
    const pts = calculateRoundPoints(parseInt(points) || 0, playType);
    if (isEditing) {
      onUpdate(roundToEdit.id, { playType, points: pts, winningTeamIndex: teamIndex });
    } else {
      onAdd({ playType, points: pts, winningTeamIndex: teamIndex });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-sm bg-bg-page rounded-[2.5rem] p-6 shadow-2xl space-y-6"
      >
        <div className="w-10 h-1 bg-border-theme rounded-full mx-auto" />
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{isEditing ? 'Editar' : 'Anotar'} Puntos</h3>
          <button onClick={onClose} className="p-2 hover:bg-primary/10 rounded-full"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-bg-card p-1 rounded-2xl border border-border-theme">
            {match.teams.map((t: any, idx: number) => (
              <button
                key={t.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setTeamIndex(idx)}
                className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${teamIndex === idx ? 'bg-primary text-white' : 'text-text-dim'}`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <input 
              type="number"
              placeholder="Puntos"
              value={points}
              autoFocus
              onChange={(e) => setPoints(e.target.value)}
              className="w-full text-center text-4xl font-display font-black bg-bg-card p-5 rounded-3xl border-none ring-2 ring-border-theme focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {types.map(t => (
              <button
                key={t}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setPlayType(t)}
                className={`p-3 rounded-xl border text-[9px] font-black uppercase transition-all ${playType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border-theme bg-bg-card text-text-dim'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {isEditing && (
              <button type="button" onClick={() => onDelete(roundToEdit.id)} className="flex-1 bg-red-50 text-red-500 p-4 rounded-2xl font-bold">Borrar</button>
            )}
            <button type="submit" className="flex-[2] bg-primary text-white p-4 rounded-2xl font-bold">Guardar</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function HistorySheet({ match, onClose, onEdit, onNewMatch, onReplay }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full bg-bg-page rounded-t-[3rem] p-6 max-h-[85vh] overflow-y-auto scrollbar-hide border-t border-border-theme"
      >
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-bg-page z-10 py-2">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black uppercase tracking-tight">Bitácora</h3>
            {match.setWins?.some((w: number) => w > 0) && (
              <div className="flex gap-2 mt-1">
                 {match.teams.map((t: any, i: number) => (
                   <span key={t.id} className="text-[9px] font-black uppercase px-2 py-0.5 bg-primary/5 rounded-full text-text-dim">
                     {t.name.split(' ')[0]}: {match.setWins[i]}v
                   </span>
                 ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 bg-primary/5 hover:bg-primary/10 rounded-full transition-all"><X /></button>
        </div>

        <div className="space-y-6 pb-12">
          {/* Current Rounds */}
          <div className="space-y-2">
            {[...match.rounds].reverse().map(r => (
              <RoundEntry key={r.id} round={r} match={match} onEdit={onEdit} />
            ))}
            {match.rounds.length === 0 && (!match.historySets || match.historySets.length === 0) && (
              <div className="text-center py-12 text-text-dim/20 italic font-black uppercase tracking-widest text-xs">
                No hay jugadas registradas
              </div>
            )}
          </div>

          {/* Previous Sets */}
          {[...(match.historySets || [])].reverse().map((set: any, idx: number) => {
            const winner = match.teams.find((t: any) => t.id === set.winnerTeamId);
            const totalScore = set.rounds.reduce((acc: number, r: any) => acc + (r.isDeleted ? 0 : Number(r.points)), 0);
            const actualIdx = match.historySets.length - idx;

            return (
              <div key={idx} className="space-y-4">
                {/* WINNER DIVIDER */}
                <div className="relative flex items-center justify-center py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-border-theme opacity-40"></div>
                  </div>
                  <div className="relative bg-bg-page px-6 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-yellow-500 mb-0.5">
                      <Trophy className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Set {actualIdx}</span>
                    </div>
                    <p className="text-sm font-black uppercase tracking-tight text-primary flex items-center gap-1.5">
                      GANADOR: <span className="italic">{winner?.name}</span>
                    </p>
                    <span className="text-[9px] font-bold text-text-dim opacity-40">
                       Vitoria con {totalScore} pts
                    </span>
                  </div>
                </div>

                {/* Historical Rounds */}
                <div className="space-y-2">
                  {[...set.rounds].reverse().map((r: any) => (
                    <RoundEntry key={r.id} round={r} match={match} onEdit={onEdit} isHistory />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function RoundEntry({ round, match, onEdit, isHistory }: any) {
  return (
    <button 
      onClick={() => !isHistory && onEdit(round)}
      disabled={isHistory}
      className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
        round.isDeleted 
          ? 'opacity-20 grayscale border-transparent bg-transparent' 
          : 'border-border-theme bg-bg-card hover:border-primary/40 active:scale-[0.98]'
      } ${isHistory ? 'cursor-default border-dashed opacity-70' : 'shadow-sm'}`}
    >
      <div className="text-left flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
          round.winningTeamIndex === 0 ? 'bg-primary/10 text-primary' : 
          round.winningTeamIndex === 1 ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'
        }`}>
          {match.teams[round.winningTeamIndex].name.charAt(0)}
        </div>
        <div>
          <span className="block text-[8px] font-black uppercase opacity-40 tracking-widest">{match.teams[round.winningTeamIndex].name}</span>
          <span className="font-bold text-sm tracking-tight">{round.playType}</span>
        </div>
      </div>
      <div className="text-xl font-display font-black tracking-tighter">+{round.points}</div>
    </button>
  );
}

function WinnerModal({ match, onClose, onNewMatch, onReplay }: any) {
  const winner = match.teams.find((t: any) => t.id === match.winnerTeamId);
  const winnerIdx = match.teams.findIndex((t: any) => t.id === match.winnerTeamId);
  const currentWins = match.setWins?.[winnerIdx] || 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-primary/20 backdrop-blur-md p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-bg-page border-4 border-primary p-8 rounded-[3rem] shadow-2xl text-center space-y-6 w-full max-w-sm relative overflow-hidden"
      >
        <div className="flex justify-center relative">
          <Trophy className="w-20 h-20 text-yellow-500 animate-bounce" />
          <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white">
            {currentWins + 1} SETS
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">¡Ganador!</h2>
          <p className="text-2xl font-bold mt-1">{winner?.name}</p>
        </div>
        <div className="space-y-4">
           <button onClick={onReplay} className="w-full bg-primary text-white p-4 rounded-2xl font-black uppercase tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
             <RotateCcw className="w-5 h-5" />
             Volver a jugar
           </button>
           <div className="grid grid-cols-2 gap-2">
             <button onClick={onNewMatch} className="bg-bg-card border border-border-theme p-3 rounded-2xl font-bold text-[10px] uppercase text-text-dim hover:bg-primary/5 transition-all">Nueva Partida</button>
             <button onClick={onClose} className="bg-bg-card border border-border-theme p-3 rounded-2xl font-bold text-[10px] uppercase text-text-dim hover:bg-primary/5 transition-all">Bitácora</button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
