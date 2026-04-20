/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Match, Team, Player, Round, PlayType, ThemeType } from './types';

const STORAGE_KEY = 'domino_rd_app_data';

interface AppData {
  matches: Match[];
  players: Player[];
  teams: Team[];
  theme: ThemeType;
  currentMatchId: string | null;
}

const DEFAULT_DATA: AppData = {
  matches: [],
  players: [],
  teams: [],
  theme: 'minimalist',
  currentMatchId: null,
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
      return { ...DEFAULT_DATA, ...parsed };
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

  const setTheme = (theme: ThemeType) => setData(prev => ({ ...prev, theme }));

  const addPlayer = (name: string) => {
    const newPlayer: Player = { id: generateUUID(), name };
    setData(prev => ({ ...prev, players: [newPlayer, ...prev.players] }));
    return newPlayer;
  };

  const startNewMatch = (teams: Team[], scoreLimit: number = 100) => {
    const newMatch: Match = {
      id: generateUUID(),
      date: Date.now(),
      teams,
      rounds: [],
      scoreLimit,
      status: 'active',
    };
    setData(prev => ({
      ...prev,
      matches: [newMatch, ...prev.matches],
      currentMatchId: newMatch.id,
    }));
    return newMatch;
  };

  const addRound = (matchId: string, roundData: Omit<Round, 'id' | 'timestamp' | 'number' | 'matchId'>) => {
    setData(prev => {
      const matchIndex = prev.matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prev;

      const match = prev.matches[matchIndex];
      const newRound: Round = {
        ...roundData,
        id: generateUUID(),
        matchId,
        number: match.rounds.length + 1,
        timestamp: Date.now(),
      };

      const updatedRounds = [...match.rounds, newRound];
      
      // Calculate totals
      const scoreT1 = updatedRounds.reduce((acc, r) => acc + (r.winningTeamIndex === 0 ? r.pointsTeam1 : 0), 0);
      const scoreT2 = updatedRounds.reduce((acc, r) => acc + (r.winningTeamIndex === 1 ? r.pointsTeam2 : 0), 0);

      let status = match.status;
      let winnerId = match.winnerTeamId;

      if (scoreT1 >= match.scoreLimit) {
        status = 'finished';
        winnerId = match.teams[0].id;
      } else if (scoreT2 >= match.scoreLimit) {
        status = 'finished';
        winnerId = match.teams[1].id;
      }

      const updatedMatch: Match = {
        ...match,
        rounds: updatedRounds,
        status,
        winnerTeamId: winnerId,
      };

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

  const currentMatch = data.matches.find(m => m.id === data.currentMatchId) || null;

  return {
    ...data,
    currentMatch,
    setTheme,
    addPlayer,
    startNewMatch,
    addRound,
    deleteMatch,
    setCurrentMatch: (id: string | null) => setData(prev => ({ ...prev, currentMatchId: id })),
  };
}

export function calculateRoundPoints(points: number, playType: PlayType): number {
  return points;
}
