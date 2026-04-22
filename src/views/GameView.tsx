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
  Circle,
  Trash2
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
  const [roundToEdit, setRoundToEdit] = useState<any>(null);
  const [initialTeamForModal, setInitialTeamForModal] = useState<number>(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [tempMeta, setTempMeta] = useState(match?.scoreLimit.toString() || '100');
  const [dismissedFinishedModal, setDismissedFinishedModal] = useState(false);
  const [editingTeamIdx, setEditingTeamIdx] = useState<number | null>(null);
  const [tempTeamName, setTempTeamName] = useState('');

  if (!match) {
    useEffect(() => navigate('home'), []);
    return null;
  }

  const teamScores = match.teams.map((_: any, index: number) => {
    return match.rounds.reduce((acc: number, r: any) => {
      const pts = Number(r.points);
      const isWinner = r.winningTeamIndex === index && !r.isDeleted && !isNaN(pts);
      return acc + (isWinner ? pts : 0);
    }, 0);
  });

  const isFinished = match.status === 'finished';

  // Reset dismissed state if match becomes active again
  useEffect(() => {
    if (!isFinished) {
      setDismissedFinishedModal(false);
    }
  }, [isFinished]);

  const gridColsClass = match.teams.length === 4 ? 'grid-cols-4' : 
                        match.teams.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="flex flex-col h-full bg-bg-page select-none">
      {/* Scoreboard */}
      <div className="p-3 pb-2 flex flex-col gap-2 sticky top-0 bg-bg-page/80 backdrop-blur-md z-40 border-b border-border-theme">
        <div className="flex justify-center items-center gap-2">
          {/* Meta Button */}
          {isEditingMeta ? (
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={tempMeta}
                autoFocus
                onChange={(e) => setTempMeta(e.target.value)}
                onBlur={() => {
                  const val = parseInt(tempMeta);
                  if (!isNaN(val) && val > 0) {
                    store.updateMatchLimit(match.id, val);
                  }
                  setIsEditingMeta(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt(tempMeta);
                    if (!isNaN(val) && val > 0) {
                      store.updateMatchLimit(match.id, val);
                    }
                    setIsEditingMeta(false);
                  }
                  if (e.key === 'Escape') {
                    setTempMeta(match.scoreLimit.toString());
                    setIsEditingMeta(false);
                  }
                }}
                className="w-16 text-[10px] font-black text-center bg-bg-card border border-primary/50 rounded-full py-0.5 outline-none focus:ring-1 focus:ring-primary/30"
              />
              <span className="text-[7px] font-bold text-primary uppercase">Nueva Meta</span>
            </div>
          ) : (
            <button 
              onClick={() => {
                setTempMeta(match.scoreLimit.toString());
                setIsEditingMeta(true);
              }}
              className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-border-theme/50 transition-all text-text-dim/60 bg-text-main/5 hover:bg-primary/5 hover:border-primary/30"
            >
              Meta: {match.scoreLimit}
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
                isManyTeams={match.teams.length >= 3}
                primary={idx === 0}
                secondary={idx === 1}
                accent={idx === 2}
                purple={idx === 3}
                winner={match.winnerTeamId === team.id}
                isFinished={isFinished}
                isEditingName={editingTeamIdx === idx}
                tempName={tempTeamName}
                onTempNameChange={setTempTeamName}
                onStartRename={() => {
                  setEditingTeamIdx(idx);
                  setTempTeamName(team.name);
                }}
                onRenameConfirm={() => {
                  if (tempTeamName.trim()) {
                    store.updateTeamName(match.id, idx, tempTeamName.trim());
                  }
                  setEditingTeamIdx(null);
                }}
                onRenameCancel={() => setEditingTeamIdx(null)}
                onAdd={() => {
                  setInitialTeamForModal(idx);
                  setShowAddPoints(true);
                }}
              />
              {!isFinished && (
                <QuickActions 
                  match={match} 
                  isManyTeams={match.teams.length >= 3}
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
        
        {!isFinished && (
           <div className="flex justify-end">
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
              className="flex items-center gap-3 p-3 bg-primary/5 hover:bg-primary/10 rounded-lg text-sm font-bold text-primary"
            >
              <LogOut className="w-4 h-4" />
              Guardar y Salir (Se puede retomar)
            </button>
            <button 
              onClick={() => {
                if(confirm('¿Quieres cerrar esta partida y volver al inicio?')) {
                  store.setCurrentMatch(null);
                  navigate('home');
                }
              }}
              className="flex items-center gap-3 p-3 hover:bg-secondary/5 rounded-lg text-sm font-bold text-text-dim"
            >
              <X className="w-4 h-4" />
              Cerrar Partida (Sin borrar)
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
      <div className="flex-1 p-3 overflow-y-auto pb-32 scrollbar-hide">
        {match.rounds.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-dim/30 italic">
            <Zap className="w-12 h-12 mb-2 text-text-dim/20" />
            <p>Toca un equipo para anotar puntos</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <div className="w-full">
              <div className={`grid ${gridColsClass} gap-2`}>
                {match.teams.map((team: any, teamIdx: number) => (
                  <div key={team.id} className="flex-1 space-y-1 min-w-0">
                    <div className="text-center pb-0.5 border-b border-border-theme">
                      <span className={`text-[7px] font-black uppercase tracking-widest truncate block ${
                        teamIdx === 0 ? 'text-primary' : 
                        teamIdx === 1 ? 'text-secondary' :
                        teamIdx === 2 ? 'text-accent' : 'text-purple-500'
                      }`}>
                        {team.name}
                      </span>
                    </div>
                    {[...match.rounds].filter((r: any) => r.winningTeamIndex === teamIdx).reverse().map((round: any) => (
                      <button 
                        key={round.id} 
                        onClick={() => setRoundToEdit(round)}
                        className={`w-full p-1 bg-bg-card border border-border-theme rounded-lg flex flex-col items-center hover:border-primary/30 active:scale-95 transition-all text-center relative overflow-hidden group ${round.isDeleted ? 'opacity-30 grayscale saturate-0' : ''}`}
                      >
                        <span className={`text-[6px] font-black uppercase tracking-widest ${
                          round.isDeleted ? 'text-gray-400' : 
                          teamIdx === 0 ? 'text-primary/40' : 
                          teamIdx === 1 ? 'text-secondary/40' :
                          teamIdx === 2 ? 'text-accent/40' : 'text-purple-500/40'
                        }`}>
                          {PLAY_ABBR[round.playType] || 'OTR'}
                        </span>
                        <span className={`text-sm font-display font-black ${
                          round.isDeleted ? 'text-gray-400 line-through decoration-red-500' : 
                          teamIdx === 0 ? 'text-primary' : 
                          teamIdx === 1 ? 'text-secondary' :
                          teamIdx === 2 ? 'text-accent' : 'text-purple-500'
                        }`}>
                          +{round.points}
                        </span>
                        {round.isEdited && !round.isDeleted && (
                          <div className="absolute top-0 right-0 bg-yellow-400 w-1.5 h-1.5 rounded-bl-sm" title="Editado" />
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bitacora Tab Handle */}
      {!isFinished && (
        <div className="fixed bottom-[4rem] left-0 right-0 z-40 flex justify-center pointer-events-none">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(true)}
            className="pointer-events-auto bg-bg-card border-x border-t border-border-theme rounded-t-2xl px-12 py-1.5 pb-2 shadow-[0_-4px_20px_rgb(0,0,0,0.05)] flex flex-col items-center gap-1 group transition-all hover:bg-primary/5 active:bg-primary/10"
          >
            <div className="w-12 h-1 bg-border-theme/60 rounded-full group-hover:bg-primary/30 transition-colors" />
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-3.5 h-3.5 text-text-dim group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-dim group-hover:text-primary transition-colors">Bitácora</span>
            </div>
          </motion.button>
        </div>
      )}

      {/* History Bottom Sheet */}
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
                  <div key={round.id} className={`flex items-center justify-between p-4 rounded-2xl border relative overflow-hidden ${
                    round.isDeleted ? 'opacity-40 grayscale bg-gray-100 border-gray-300' : 
                    round.winningTeamIndex === 0 ? 'border-primary/20 bg-primary/5' : 
                    round.winningTeamIndex === 1 ? 'border-secondary/20 bg-secondary/5' :
                    round.winningTeamIndex === 2 ? 'border-accent/20 bg-accent/5' :
                    'border-purple-200 bg-purple-50'
                  }`}>
                    {round.isDeleted && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-tighter rounded-br-lg z-10">Eliminado</div>
                    )}
                    {round.isEdited && !round.isDeleted && (
                      <div className="absolute top-0 left-0 bg-yellow-500 text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-tighter rounded-br-lg z-10">Editado</div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Ronda #{round.number}</span>
                      <span className="font-bold">{match.teams[round.winningTeamIndex].name}</span>
                      <span className="text-xs text-text-dim italic">{round.playType}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {!round.isDeleted && (
                        <button 
                          onClick={() => {
                            setShowHistory(false);
                            setRoundToEdit(round);
                          }}
                          className="p-2 bg-bg-card border border-border-theme rounded-full hover:scale-110 transition-transform"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                      )}
                      <div className={`text-2xl font-display font-black ${round.isDeleted ? 'text-gray-400 line-through' : round.winningTeamIndex === 0 ? 'text-primary' : round.winningTeamIndex === 1 ? 'text-secondary' : round.winningTeamIndex === 2 ? 'text-accent' : 'text-purple-500'}`}>
                        +{round.points}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Action Buttons removed and moved to history list area */}

      {isFinished && !dismissedFinishedModal && (
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
            
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold text-text-dim tracking-widest">El ganador es</p>
                <p className="text-xl font-bold text-primary">
                  {match.teams.find((t: any) => t.id === match.winnerTeamId)?.name || 'Error'}
                </p>
              </div>

              {/* Resultado Final */}
              <div className={`grid grid-cols-${match.teams.length} gap-2 bg-text-main/5 p-4 rounded-2xl border border-border-theme`}>
                {match.teams.map((team: any, idx: number) => (
                  <div key={team.id} className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-text-dim opacity-60 truncate">{team.name}</span>
                    <span className={`text-xl font-display font-black ${
                      idx === 0 ? 'text-primary' : 
                      idx === 1 ? 'text-secondary' :
                      idx === 2 ? 'text-accent' : 'text-purple-500'
                    }`}>{teamScores[idx]}</span>
                  </div>
                ))}
              </div>
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
                onClick={() => setDismissedFinishedModal(true)}
                className="w-full bg-white border-2 border-border-theme text-text-main p-4 rounded-2xl hover:bg-bg-card active:scale-95 transition-all font-bold"
              >
                Volver a la partida
              </button>
              <button 
                onClick={() => {
                  store.setCurrentMatch(null);
                  navigate('home');
                }}
                className="w-full bg-text-main/10 text-text-main p-4 rounded-2xl hover:bg-text-main/20 active:scale-95 transition-all font-bold text-sm"
              >
                Volver al Inicio
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit Points Modal */}
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
      </AnimatePresence>
    </div>
  );
}

function ScoreCard({ 
  name, 
  score, 
  limit, 
  winner, 
  onAdd, 
  isFinished, 
  primary, 
  secondary, 
  accent, 
  purple, 
  isManyTeams,
  isEditingName,
  tempName,
  onTempNameChange,
  onStartRename,
  onRenameConfirm,
  onRenameCancel
}: any) {
  const percentage = Math.min((score / limit) * 100, 100);
  
  const baseColor = primary ? 'primary' : secondary ? 'secondary' : accent ? 'accent' : purple ? 'purple-500' : 'primary';

  return (
    <motion.div 
      whileTap={!isFinished ? { scale: 0.95 } : {}}
      onClick={() => !isFinished && !isEditingName && onAdd()}
      className={`relative ${isManyTeams ? 'p-2 rounded-xl' : 'p-5 rounded-3xl'} overflow-hidden transition-all duration-300 border-2 cursor-pointer h-full ${
        winner ? `bg-${baseColor} border-${baseColor} shadow-lg scale-105` : 
        percentage > 90 ? `bg-${baseColor}/10 border-${baseColor}/50` : 
        'bg-bg-card border-border-theme hover:border-primary/50'
      }`}
    >
      <div className="relative z-10 flex flex-col items-center">
        <div className={`flex items-center justify-center gap-1 mb-0.5 ${isManyTeams ? 'flex-col -space-y-0.5' : 'flex-row'}`}>
          {isEditingName ? (
            <input 
              type="text"
              value={tempName}
              autoFocus
              className="w-full bg-text-main/5 border-b border-primary text-center px-1 outline-none text-[8px] font-black uppercase"
              onChange={(e) => onTempNameChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={onRenameConfirm}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onRenameConfirm();
                if (e.key === 'Escape') onRenameCancel();
              }}
            />
          ) : (
            <span 
              onClick={(e) => {
                if(!isFinished) {
                  e.stopPropagation();
                  onStartRename();
                }
              }}
              className={`uppercase font-black leading-tight truncate text-center transition-colors hover:text-primary ${isManyTeams ? 'text-[7px]' : 'text-[8px]'} ${winner ? 'text-white/60' : 'text-text-dim'}`}
            >
              {name}
            </span>
          )}
          {!winner && !isFinished && !isEditingName && (
            <div className={`p-0.5 rounded-full transition-all bg-${baseColor}/10 text-${baseColor} ${isManyTeams ? 'hidden' : 'block'}`}>
              <Plus className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
        <span className={`${isManyTeams ? 'text-lg' : 'text-3xl'} font-display font-black leading-none ${winner ? 'text-white' : 'text-text-main'}`}>
          {score}
        </span>
        <div className="w-full h-0.5 bg-text-main/10 rounded-full mt-1.5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full ${winner ? 'bg-white' : percentage > 90 ? 'bg-accent' : `bg-${baseColor}`}`}
          />
        </div>
      </div>
      {winner && <Trophy className={`absolute ${isManyTeams ? 'top-1 right-1 w-3 h-3' : 'top-2 right-2 w-4 h-4'} text-white/40`} />}
    </motion.div>
  );
}

function QuickActions({ match, onQuickAdd, isManyTeams }: any) {
  const actions: { type: PlayType, label: string, pts: number }[] = [
    { type: 'Capicúa', label: 'Capicua', pts: match.capicuaPoints || 30 },
    { type: 'Paso de salida', label: 'Salida', pts: match.pasoSalidaPoints || 30 },
    { type: 'Pase Corrido', label: 'Corrido', pts: match.pasoCorridoPoints || 30 }
  ];

  return (
    <div className={`grid ${isManyTeams ? 'grid-cols-1 gap-0.5' : 'grid-cols-3 gap-1'} px-0.5`}>
      {actions.map(action => (
        <button
          key={action.type}
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(action.type, action.pts);
          }}
          className={`flex ${isManyTeams ? 'flex-row justify-between px-2 h-5' : 'flex-col py-1'} items-center justify-center bg-bg-card border border-border-theme rounded-md hover:border-primary/50 hover:bg-primary/5 active:scale-90 transition-all group`}
        >
          <span className="text-[6px] font-black uppercase text-text-dim group-hover:text-primary transition-colors">{action.label}</span>
          <span className="text-[8px] font-black text-primary">+{action.pts}</span>
        </button>
      ))}
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

function PointsModal({ onClose, match, onAdd, onUpdate, onDelete, roundToEdit, initialTeamIndex = 0 }: any) {
  const isEditing = !!roundToEdit;
  const [teamIndex, setTeamIndex] = useState<number>(roundToEdit ? roundToEdit.winningTeamIndex : initialTeamIndex);
  const [points, setPoints] = useState<string>(roundToEdit ? roundToEdit.points.toString() : '');
  const [playType, setPlayType] = useState<PlayType>(roundToEdit ? roundToEdit.playType : 'Dominó');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const types: { name: PlayType, icon: React.ReactNode }[] = [
    { name: 'Dominó', icon: <Zap className="w-3 h-3" /> },
    { name: 'Tranque', icon: <Shield className="w-3 h-3" /> },
    { name: 'Otro', icon: <Circle className="w-3 h-3" /> }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(points) || 0;
    const finalPoints = calculateRoundPoints(pts, playType);
    
    if (isEditing) {
      onUpdate(roundToEdit.id, {
        playType,
        points: finalPoints,
        winningTeamIndex: teamIndex,
      });
    } else {
      onAdd({
        playType,
        points: finalPoints,
        winningTeamIndex: teamIndex,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 perspective-[1000px]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0.5 }}
        transition={{ 
          type: 'spring',
          damping: 25,
          stiffness: 300,
          mass: 0.8
        }}
        className="relative w-full max-w-md bg-bg-page rounded-t-[2.5rem] sm:rounded-[2rem] p-6 shadow-2xl space-y-5"
      >
        <div className="w-10 h-1 bg-border-theme/50 rounded-full mx-auto" />
        
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-text-main">
            {isEditing ? 'Editar Mano' : 'Anotar Puntos'}
          </h3>
          <div className="flex items-center gap-2">
            {isEditing && !roundToEdit.isDeleted && (
              <div className="flex items-center">
                <AnimatePresence mode="wait">
                  {isConfirmingDelete ? (
                    <motion.button 
                      key="confirm"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(roundToEdit.id);
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                    >
                      ¿Seguro?
                    </motion.button>
                  ) : (
                    <motion.button 
                      key="trash"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsConfirmingDelete(true);
                        setTimeout(() => setIsConfirmingDelete(false), 3000);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors flex items-center gap-1 group"
                      title="Eliminar esta mano"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
            <button onClick={onClose} className="p-2 hover:bg-text-main/5 rounded-full text-text-dim"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pb-2">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-text-dim/60 uppercase tracking-widest pl-1">¿Ganador de mano?</span>
            <div className={`grid ${match.teams.length > 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
              {match.teams.map((t: any, idx: number) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTeamIndex(idx)}
                  className={`py-3 px-2 rounded-xl border-2 transition-all font-bold text-[11px] truncate ${
                    teamIndex === idx 
                      ? idx === 0 ? 'border-primary bg-primary/10 text-primary' : 
                        idx === 1 ? 'border-secondary bg-secondary/10 text-secondary' :
                        idx === 2 ? 'border-accent bg-accent/10 text-accent' :
                        'border-purple-500 bg-purple-50 text-purple-500'
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
            className={`w-full p-4 rounded-2xl font-bold text-base shadow-lg active:scale-[0.98] transition-all mt-2 ${
              isEditing ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-primary text-white shadow-primary/20'
            }`}
          >
            {isEditing ? 'Actualizar Jugada' : 'Confirmar Mano'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
