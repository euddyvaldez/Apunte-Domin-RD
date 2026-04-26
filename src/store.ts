/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Match, Team, Player, Round, PlayType, ThemeType } from './types';

const STORAGE_KEY = 'domino_rd_app_data';

interface AppData {
  matches: Match[];
  teams: Team[];
  theme: ThemeType;
  isDarkMode: boolean;
  currentMatchId: string | null;
  onboardingSeen: boolean;
}

const DEFAULT_DATA: AppData = {
  matches: [],
  teams: [],
  theme: 'dominicano',
  isDarkMode: false,
  currentMatchId: null,
  onboardingSeen: false,
};

const isRegularRound = (type: PlayType) => ['Dominó', 'Tranque', 'Otro'].includes(type);

const recalculateMatch = (match: Match): Match => {
  const activeRounds = (match.rounds || []).filter(r => !r.isDeleted);
  
  const teamScores = match.teams.map((_, index) => {
    return activeRounds.reduce((acc, r) => {
      const pts = Number(r.points);
      return acc + (r.winningTeamIndex === index && !isNaN(pts) ? pts : 0);
    }, 0);
  });

  // Re-number rounds: only regular rounds get a number, in sequence
  let regularCount = 0;
  const updatedRounds = (match.rounds || []).map(r => {
    if (r.isDeleted) return { ...r, number: 0 };
    if (isRegularRound(r.playType)) {
      regularCount++;
      return { ...r, number: regularCount };
    }
    return { ...r, number: 0 };
  });

  let status: 'active' | 'finished' = 'active';
  let winnerId: string | undefined = undefined;
  let finishedTeamNames = match.finishedTeamNames;

  teamScores.forEach((score, index) => {
    if (score >= match.scoreLimit) {
      status = 'finished';
      winnerId = match.teams[index].id;
    }
  });

  if (status === ('finished' as any) && !finishedTeamNames) {
    finishedTeamNames = match.teams.map(t => t.name);
  } else if (status === ('active' as any)) {
    finishedTeamNames = undefined;
  }

  return {
    ...match,
    rounds: updatedRounds,
    status,
    winnerTeamId: winnerId,
    finishedTeamNames
  };
};

// Polyfill/Fallback for crypto.randomUUID if not available (non-HTTPS or old browsers)
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export function useStore() {
  const [data, setData] = useState<AppData>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_DATA;
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_DATA;
      const parsed = JSON.parse(saved);
      // Basic validation to ensure we have the right structure
      if (!parsed || typeof parsed !== 'object') return DEFAULT_DATA;
      
      const loadedData = { ...DEFAULT_DATA, ...parsed };
      
      // Sanitización y Recalculo on load to fix NaN/Corrupt states
      if (loadedData.matches && Array.isArray(loadedData.matches)) {
        loadedData.matches = loadedData.matches.map(m => {
          // Ensure rounds is an array
          const rounds = Array.isArray(m.rounds) ? m.rounds : [];
          // Ensure mandatory fields exist
          return recalculateMatch({
            ...m,
            rounds,
            scoreLimit: Number(m.scoreLimit) || 100,
            capicuaPoints: Number(m.capicuaPoints) || 30,
            pasoSalidaPoints: Number(m.pasoSalidaPoints) || 30,
            pasoCorridoPoints: Number(m.pasoCorridoPoints) || 30,
            setWins: m.setWins || m.teams.map(() => 0),
            historySets: m.historySets || []
          });
        });
      }

      return loadedData;
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
      return DEFAULT_DATA;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
    }
  }, [data]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setData(prev => ({ ...prev, ...parsed }));
        } catch (err) {
          console.error("Sync error:", err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setTheme = (theme: ThemeType) => setData(prev => ({ ...prev, theme }));
  const toggleDarkMode = () => setData(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));

  const sanitizePoints = (pts: number): number => {
    if (isNaN(pts)) return 0;
    return Math.max(0, Math.min(pts, 1000)); // Límite lógico de 1000 puntos por mano
  };

  const startNewMatch = (
    teams: Team[], 
    scoreLimit: number = 100, 
    capicua: number = 30, 
    pasoSalida: number = 30, 
    pasoCorrido: number = 30
  ) => {
    const newMatch: Match = {
      id: generateUUID(),
      date: Date.now(),
      teams,
      rounds: [],
      scoreLimit: Math.max(10, Math.min(scoreLimit, 10000)),
      capicuaPoints: sanitizePoints(capicua),
      pasoSalidaPoints: sanitizePoints(pasoSalida),
      pasoCorridoPoints: sanitizePoints(pasoCorrido),
      status: 'active',
      setWins: teams.map(() => 0),
      historySets: [],
    };
    setData(prev => ({
      ...prev,
      matches: [newMatch, ...prev.matches],
      currentMatchId: newMatch.id,
    }));
    return newMatch;
  };

  const isRegularRound = (type: PlayType) => ['Dominó', 'Tranque', 'Otro'].includes(type);

  const replayMatch = (matchId: string) => {
    setData(prev => {
      const matchIndex = prev.matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;
      
      const match = prev.matches[matchIndex];
      const winnerIndex = match.teams.findIndex(t => t.id === match.winnerTeamId);
      
      if (winnerIndex === -1) return prev;

      const newSetWins = [...(match.setWins || match.teams.map(() => 0))];
      newSetWins[winnerIndex]++;

      const newHistorySet = {
        rounds: [...match.rounds],
        winnerTeamId: match.winnerTeamId!,
        date: Date.now(),
        teamNames: match.finishedTeamNames || match.teams.map(t => t.name)
      };

      const updatedMatch: Match = {
        ...match,
        rounds: [],
        status: 'active',
        winnerTeamId: undefined,
        setWins: newSetWins,
        historySets: [...(match.historySets || []), newHistorySet]
      };

      const updatedMatches = [...prev.matches];
      updatedMatches[matchIndex] = updatedMatch;

      return { ...prev, matches: updatedMatches };
    });
  };

  const addRound = (matchId: string, roundData: Omit<Round, 'id' | 'timestamp' | 'number' | 'matchId'>) => {
    setData(prev => {
      const matchIndex = prev.matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const match = prev.matches[matchIndex];
      const pts = Number(roundData.points);
      
      const newRound: Round = {
        ...roundData,
        points: isNaN(pts) ? 0 : pts,
        id: generateUUID(),
        matchId,
        number: 0, // Will be recalculated in recalculateMatch
        timestamp: Date.now(),
      };

      const updatedMatch = recalculateMatch({
        ...match,
        rounds: [...match.rounds, newRound],
      });

      const updatedMatches = [...prev.matches];
      updatedMatches[matchIndex] = updatedMatch;

      return { ...prev, matches: updatedMatches };
    });
  };

  const updateRound = (matchId: string, roundId: string, roundData: Partial<Round>) => {
    setData(prev => {
      const matchIndex = prev.matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const match = prev.matches[matchIndex];
      const roundIndex = match.rounds.findIndex(r => r.id === roundId);
      if (roundIndex === -1) return prev;

      const updatedRounds = [...match.rounds];
      updatedRounds[roundIndex] = { 
        ...updatedRounds[roundIndex], 
        ...roundData,
        isEdited: true 
      };

      const updatedMatch = recalculateMatch({
        ...match,
        rounds: updatedRounds,
      });

      const updatedMatches = [...prev.matches];
      updatedMatches[matchIndex] = updatedMatch;

      return { ...prev, matches: updatedMatches };
    });
  };

  const deleteRound = (matchId: string, roundId: string) => {
    setData(prev => {
      const matchIndex = prev.matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const match = prev.matches[matchIndex];
      const roundIndex = match.rounds.findIndex(r => r.id === roundId);
      if (roundIndex === -1) return prev;

      const updatedRounds = [...match.rounds];
      updatedRounds[roundIndex] = { 
        ...updatedRounds[roundIndex], 
        isDeleted: true 
      };

      const updatedMatch = recalculateMatch({
        ...match,
        rounds: updatedRounds,
      });

      const updatedMatches = [...prev.matches];
      updatedMatches[matchIndex] = updatedMatch;

      return { ...prev, matches: updatedMatches };
    });
  };

  const deleteMatch = (matchId: string) => {
    setData(prev => ({
      ...prev,
      matches: prev.matches.filter(m => m.id !== matchId),
      currentMatchId: prev.currentMatchId === matchId ? null : prev.currentMatchId,
    }));
  };

  const updateMatchMode = (matchId: string, numTeams: number) => {
    setData(prev => {
      const matchIndex = prev.matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const match = prev.matches[matchIndex];
      const currentTeams = match.teams;
      let newTeams: Team[] = [];

      if (numTeams > currentTeams.length) {
        // Add new teams
        newTeams = [...currentTeams];
        for (let i = currentTeams.length; i < numTeams; i++) {
          newTeams.push({
            id: generateUUID(),
            name: `Equipo ${String.fromCharCode(65 + i)}`,
          });
        }
      } else if (numTeams < currentTeams.length) {
        // Remove teams
        newTeams = currentTeams.slice(0, numTeams);
      } else {
        return prev;
      }

      const updatedMatch = recalculateMatch({
        ...match,
        teams: newTeams,
        setWins: newTeams.map((_, i) => match.setWins?.[i] || 0)
      });

      const updatedMatches = [...prev.matches];
      updatedMatches[matchIndex] = updatedMatch;

      return { ...prev, matches: updatedMatches };
    });
  };

  const updateMatchLimit = (matchId: string, newLimit: number) => {
    setData(prev => {
      const matchIndex = prev.matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const updatedMatch = recalculateMatch({
        ...prev.matches[matchIndex],
        scoreLimit: newLimit
      });

      const updatedMatches = [...prev.matches];
      updatedMatches[matchIndex] = updatedMatch;

      return { ...prev, matches: updatedMatches };
    });
  };

  const updateQuickPointsConfig = (matchId: string, field: 'capicua' | 'salida' | 'corrido', newValue: number) => {
    setData(prev => {
      const matchIndex = prev.matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const updatedMatches = [...prev.matches];
      const match = updatedMatches[matchIndex];
      
      if (field === 'capicua') match.capicuaPoints = newValue;
      if (field === 'salida') match.pasoSalidaPoints = newValue;
      if (field === 'corrido') match.pasoCorridoPoints = newValue;

      updatedMatches[matchIndex] = { ...match };

      return { ...prev, matches: updatedMatches };
    });
  };

  const updateTeamName = (matchId: string, teamId: string, newName: string) => {
    setData(prev => {
      const matchIndex = prev.matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const updatedMatches = [...prev.matches];
      const match = { ...updatedMatches[matchIndex] };
      const teamIndex = match.teams.findIndex(t => t.id === teamId);
      if (teamIndex === -1) return prev;

      const updatedTeams = [...match.teams];
      const oldNames = match.teams.map(t => t.name);
      
      // "Lock" history sets that don't have teamNames yet
      if (match.historySets && match.historySets.length > 0) {
        match.historySets = match.historySets.map(set => ({
          ...set,
          teamNames: set.teamNames || oldNames
        }));
      }

      updatedTeams[teamIndex] = { ...updatedTeams[teamIndex], name: newName };
      match.teams = updatedTeams;
      
      updatedMatches[matchIndex] = match;

      return { ...prev, matches: updatedMatches };
    });
  };

  const currentMatch = data.matches.find(m => m.id === data.currentMatchId) || null;

  return {
    ...data,
    currentMatch,
    setTheme,
    toggleDarkMode,
    startNewMatch,
    addRound,
    updateRound,
    deleteRound,
    deleteMatch,
    updateMatchLimit,
    updateTeamName,
    updateQuickPointsConfig,
    replayMatch,
    updateMatchMode,
    setCurrentMatch: (id: string | null) => setData(prev => ({ ...prev, currentMatchId: id })),
    setOnboardingSeen: (val: boolean) => setData(prev => ({ ...prev, onboardingSeen: val })),
  };
}

export function calculateRoundPoints(points: number, playType: PlayType): number {
  return points;
}
