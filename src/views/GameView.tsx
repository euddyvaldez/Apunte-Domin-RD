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
import { PlayType, Team } from '../types';

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

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const isFinished = match.status === 'finished';

  const handleEditTeamName = (team: Team) => {
    setEditingTeamId(team.id);
    setEditingName(team.name);
  };

  const saveTeamName = () => {
    if (editingTeamId && editingName.trim()) {
      store.updateTeamName(match.id, editingTeamId, editingName.trim());
    }
    setEditingTeamId(null);
  };

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
      <div className="p-4 pb-2 space-y-4 sticky top-0 bg-bg-page/90 backdrop-blur-xl z-40 border-b-2 border-border-theme">
        <div className="flex justify-between items-center bg-bg-main p-2 rounded-2xl border border-border-theme/50 shadow-inner">
           <div className="flex items-center gap-2 pl-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim/60">En Mesa</span>
           </div>
           
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
                className="w-20 text-xs font-black text-center bg-white border-2 border-primary rounded-xl py-1 outline-none shadow-lg"
              />
            </div>
          ) : (
            <button 
              onClick={() => {
                setTempMeta(match.scoreLimit.toString());
                setIsEditingMeta(true);
              }}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-b-4 border-primary bg-primary text-white shadow-lg active:border-b-0 active:translate-y-0.5 transition-all"
            >
              <Target className="w-3 h-3" />
              <span>{match.scoreLimit} PTS</span>
            </button>
          )}
        </div>

        <div className={`grid ${gridColsClass} gap-3`}>
          {match.teams.map((team: any, idx: number) => (
            <div key={team.id} className="flex flex-col gap-2 min-w-0">
              <ScoreCard 
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
              
              <div className="text-center px-1">
                 {editingTeamId === team.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={saveTeamName}
                      onKeyDown={(e) => e.key === 'Enter' && saveTeamName()}
                      className="text-[10px] font-black uppercase bg-white border-2 border-primary outline-none rounded-lg px-2 w-full text-center py-1 shadow-sm"
                    />
                  ) : (
                    <button 
                      onClick={() => !isFinished && handleEditTeamName(team)}
                      className="text-[9px] font-black uppercase tracking-widest text-text-main/70 truncate w-full hover:text-primary transition-colors py-1"
                    >
                      {team.name}
                    </button>
                  )}
              </div>

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
          <>
            {/* Overlay to handle click outside */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOptions(false)}
              className="fixed inset-0 z-40 bg-black/5"
            />
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 mb-4 p-2 bg-bg-card border border-border-theme rounded-xl shadow-xl z-50 flex flex-col gap-1 relative"
            >
            {/* Modalidad Control */}
            <div className="p-2 space-y-2 mb-1">
              <span className="text-[9px] font-black uppercase text-text-dim/40 tracking-widest pl-1">Modalidad de Partida</span>
              <div className="flex bg-primary/5 p-1 rounded-lg gap-1 border border-border-theme/30">
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      triggerHaptic(10);
                      store.updateMatchMode(match.id, num);
                    }}
                    className={`flex-1 py-2 rounded-md text-[9px] font-black uppercase transition-all ${
                      match.teams.length === num 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-text-dim hover:bg-primary/5'
                    }`}
                  >
                    {num === 2 ? 'Frente' : num === 3 ? '3 Jug.' : 'To pa to'}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border-theme/20 mx-2 mb-1" />

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
        </>
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
          className="pointer-events-auto bg-primary text-white rounded-t-[2.5rem] px-14 py-3 shadow-2xl flex flex-col items-center gap-1 group border-x-4 border-t-4 border-white active:scale-95 transition-all"
        >
          <div className="w-10 h-1 bg-white/40 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Bitácora</span>
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

function ScoreCard({ score, limit, primary, secondary, accent, winner, onAdd, isFinished, wins }: any) {
  const percent = Math.min((score / limit) * 100, 100);
  const colorClass = primary ? 'border-primary/30 shadow-primary/10' : 
                     secondary ? 'border-secondary/30 shadow-secondary/10' : 
                     accent ? 'border-accent/30 shadow-accent/10' : 'border-purple-300 shadow-purple-500/10';

  return (
    <motion.button
      whileTap={!isFinished ? { scale: 0.95 } : {}}
      onClick={onAdd}
      disabled={isFinished}
      className={`relative w-full py-8 px-3 rounded-[2rem] border-b-8 flex flex-col items-center gap-1 transition-all bg-bg-card shadow-2xl ${colorClass} ${isFinished ? 'opacity-80' : 'active:border-b-0 active:translate-y-1'}`}
    >
      {/* Wins Badge */}
      {wins > 0 && (
        <div className="absolute top-2 left-2 z-30">
          <div className="bg-primary text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black shadow-lg border-2 border-white">
            {wins}
          </div>
        </div>
      )}

      {/* Progress Bar Background */}
      <div className="absolute top-0 left-0 w-full h-2 bg-text-main/5 rounded-t-[2rem] overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${primary ? 'bg-primary' : secondary ? 'bg-secondary' : 'bg-accent'}`}
        />
      </div>
      
      <div className="flex flex-col items-center relative z-20 mt-2">
        <span className={`text-5xl font-display font-black tabular-nums tracking-tighter ${winner ? 'text-secondary animate-bounce' : 'text-primary'}`}>
          {score}
        </span>
      </div>
      
      {winner && <div className="absolute -top-3 -right-1 bg-yellow-400 text-white p-1.5 rounded-full shadow-lg rotate-12 z-30"><Trophy className="w-5 h-5" /></div>}
    </motion.button>
  );
}

function QuickActions({ match, teamIdx, onQuickAdd }: any) {
  const actions = [
    { type: 'Capicúa' as PlayType, label: 'CAPICÚA', pts: match.capicuaPoints },
    { type: 'Pase Corrido' as PlayType, label: 'CORRIDO', pts: match.pasoCorridoPoints },
    { type: 'Paso de salida' as PlayType, label: 'SALIDA', pts: match.pasoSalidaPoints },
  ];

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {actions.map(action => (
        <button
          key={action.type}
          onClick={() => {
            triggerHaptic(15);
            onQuickAdd(action.type, action.pts);
          }}
          className="w-full py-2 bg-bg-main border border-border-theme rounded-xl text-[7px] font-black uppercase tracking-widest hover:border-primary/40 hover:bg-bg-card active:scale-95 transition-all text-text-dim flex items-center justify-between px-3"
        >
          <span>{action.label}</span>
          <span className="text-secondary">+{action.pts}</span>
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
        className="w-full max-w-sm bg-bg-card rounded-[3rem] p-8 shadow-2xl space-y-6 border-x-4 border-t-4 border-primary relative overflow-hidden"
      >
        <div className="dominican-accent absolute top-0 left-0 w-full h-2 flex">
           <div className="flex-1 bg-primary" />
           <div className="flex-1 bg-secondary" />
        </div>

        <div className="flex justify-between items-center pt-2">
          <h3 className="text-2xl font-display font-black uppercase tracking-tighter">{isEditing ? 'Editar' : 'Anotar'} Jugada</h3>
          <button onClick={onClose} className="p-2 hover:bg-text-main/5 text-text-dim hover:text-red-500 rounded-full transition-all"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-bg-main p-1.5 rounded-2xl border-2 border-border-theme">
            {match.teams.map((t: any, idx: number) => (
              <button
                key={t.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setTeamIndex(idx)}
                className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${teamIndex === idx ? 'bg-primary text-white shadow-lg' : 'text-text-dim/40'}`}
              >
                {t.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="space-y-2 relative">
            <input 
              type="number"
              placeholder="00"
              value={points}
              autoFocus
              onChange={(e) => setPoints(e.target.value)}
              className="w-full text-center text-6xl font-display font-black bg-bg-main p-8 rounded-[2rem] border-b-8 border-primary focus:border-secondary transition-all outline-none text-primary placeholder:opacity-10"
            />
            <span className="absolute bottom-2 right-6 text-[10px] font-black text-secondary">PTS</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {types.map(t => (
              <button
                key={t}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setPlayType(t)}
                className={`py-4 rounded-xl border-2 text-[9px] font-black uppercase tracking-widest transition-all ${playType === t ? 'border-secondary bg-secondary text-white' : 'border-border-theme bg-bg-main text-text-dim'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {isEditing && (
              <button type="button" onClick={() => onDelete(roundToEdit.id)} className="flex-1 bg-bg-card border-2 border-red-100 text-red-500 p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest">Borrar</button>
            )}
            <button type="submit" className="flex-[2] bg-primary text-white p-5 rounded-2xl font-display font-black uppercase text-xl italic tracking-tighter shadow-xl shadow-primary/20 active:scale-95 transition-all">
              {isEditing ? 'Actualizar' : '¡ANÓTALO!'}
            </button>
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
        className="w-full bg-bg-page rounded-t-[3rem] p-0 max-h-[85vh] overflow-hidden border-t-4 border-primary flex flex-col"
      >
        <div className="dominican-accent h-2 w-full flex">
           <div className="flex-1 bg-primary" />
           <div className="flex-1 bg-secondary" />
        </div>
        
        <div className="flex justify-between items-center p-6 bg-bg-card border-b border-border-theme">
          <div className="flex flex-col">
            <h3 className="text-3xl font-display font-black uppercase tracking-tighter">Historial</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim/60">Registro oficial de trancazos</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-bg-main hover:bg-red-50 hover:text-red-500 rounded-full flex items-center justify-center transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 scrollbar-hide">
          {/* Current Rounds */}
          <div className="space-y-2">
            {match.status === 'finished' && (
              <div className="flex flex-col items-center py-4 bg-primary/5 rounded-2xl mb-4 border border-dashed border-primary/20">
                <Trophy className="w-6 h-6 text-yellow-500 mb-1" />
                <p className="text-xs font-black uppercase tracking-widest text-primary">
                  Ganador del Set: <span className="italic">{match.finishedTeamNames?.find((_, i) => match.teams[i].id === match.winnerTeamId) || match.teams.find(t => t.id === match.winnerTeamId)?.name}</span>
                </p>
              </div>
            )}
            {[...match.rounds].reverse().map(r => (
              <RoundEntry 
                key={r.id} 
                round={r} 
                match={match} 
                onEdit={onEdit} 
                historyTeamNames={match.finishedTeamNames}
              />
            ))}
            {match.rounds.length === 0 && (!match.historySets || match.historySets.length === 0) && (
              <div className="text-center py-12 text-text-dim/20 italic font-black uppercase tracking-widest text-xs">
                No hay jugadas registradas
              </div>
            )}
          </div>

          {/* Previous Sets */}
          {[...(match.historySets || [])].reverse().map((set: any, idx: number) => {
            const teamNames = set.teamNames || match.teams.map((t: any) => t.name);
            const winnerIdx = match.teams.findIndex((t: any) => t.id === set.winnerTeamId);
            const winnerName = teamNames[winnerIdx] || 'Equipo';
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
                    <p className="text-sm font-black uppercase tracking-tight text-primary flex items-center gap-1.5 text-center">
                      GANADOR: <span className="italic">{winnerName}</span>
                    </p>
                    <span className="text-[9px] font-bold text-text-dim opacity-40">
                       Vitoria con {totalScore} pts
                    </span>
                  </div>
                </div>

                {/* Historical Rounds */}
                <div className="space-y-2">
                  {[...set.rounds].reverse().map((r: any) => (
                    <RoundEntry key={r.id} round={r} match={match} onEdit={onEdit} isHistory historyTeamNames={teamNames} />
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

function RoundEntry({ round, match, onEdit, isHistory, historyTeamNames }: any) {
  const teamName = historyTeamNames 
    ? historyTeamNames[round.winningTeamIndex] 
    : (match.teams[round.winningTeamIndex]?.name || 'Equipo');

  return (
    <button 
      onClick={() => !isHistory && onEdit(round)}
      disabled={isHistory}
      className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all relative overflow-hidden group ${
        round.isDeleted 
          ? 'opacity-20 grayscale border-transparent bg-transparent' 
          : 'border-border-theme bg-bg-card hover:border-primary active:scale-[0.98]'
      } ${isHistory ? 'cursor-default border-dashed' : 'shadow-sm'}`}
    >
      <div className="text-left flex items-center gap-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
          round.winningTeamIndex === 0 ? 'bg-primary text-white shadow-primary/20' : 
          round.winningTeamIndex === 1 ? 'bg-secondary text-white shadow-secondary/20' : 
          round.winningTeamIndex === 2 ? 'bg-accent text-white shadow-accent/20' : 'bg-purple-500 text-white shadow-purple-500/20'
        }`}>
          {teamName.charAt(0).toUpperCase()}
        </div>
        <div>
          <span className="block text-[8px] font-black uppercase text-text-dim/60 tracking-[0.2em]">{teamName}</span>
          <span className="font-black text-sm uppercase tracking-tight text-text-main">{round.playType}</span>
        </div>
      </div>
      <div className="text-2xl font-display font-black tracking-tighter text-primary relative z-10">+{round.points}</div>
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 translate-x-4 -translate-y-4 transition-transform group-hover:scale-110" />
    </button>
  );
}

function WinnerModal({ match, onClose, onNewMatch, onReplay }: any) {
  const winner = match.teams.find((t: any) => t.id === match.winnerTeamId);
  const winnerIdx = match.teams.findIndex((t: any) => t.id === match.winnerTeamId);
  const currentWins = match.setWins?.[winnerIdx] || 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-primary/40 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        className="bg-bg-card border-8 border-primary p-8 rounded-[4rem] shadow-2xl text-center space-y-6 w-full max-w-sm relative overflow-hidden"
      >
        <div className="dominican-accent absolute top-0 left-0 w-full h-4 flex">
           <div className="flex-1 bg-primary" />
           <div className="flex-1 bg-secondary" />
        </div>

        <div className="flex justify-center relative pt-4">
          <div className="relative">
            <Trophy className="w-24 h-24 text-yellow-500 animate-bounce" />
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-4 -right-4 bg-secondary text-white text-[10px] font-black px-4 py-2 rounded-full shadow-2xl border-4 border-white rotate-12"
            >
              {currentWins + 1} SETS
            </motion.div>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter text-primary">¡BRUTAL!</h2>
          <p className="text-2xl font-black uppercase text-secondary tracking-tight mt-2">{winner?.name}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-dim/60 mt-2">DUEÑO DE LA MESA</p>
        </div>
        <div className="space-y-4 pt-4">
           <button onClick={onReplay} className="w-full bg-primary text-white p-6 rounded-3xl font-display font-black uppercase tracking-tighter flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95 transition-all text-xl">
             <RotateCcw className="w-6 h-6 text-secondary" strokeWidth={4} />
             REVANCHA
           </button>
           <div className="grid grid-cols-2 gap-3">
             <button onClick={onNewMatch} className="bg-bg-main border-2 border-border-theme p-4 rounded-2xl font-black text-[10px] uppercase text-text-dim hover:bg-primary hover:text-white transition-all">Nueva Mesa</button>
             <button onClick={onClose} className="bg-bg-main border-2 border-border-theme p-4 rounded-2xl font-black text-[10px] uppercase text-text-dim hover:bg-primary hover:text-white transition-all">Bitácora</button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
