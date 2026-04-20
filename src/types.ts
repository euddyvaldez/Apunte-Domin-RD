/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlayType = 'Dominó' | 'Capicúa' | 'Tranque' | 'Paso de salida' | 'Pase Corrido' | 'Otro';

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Round {
  id: string;
  matchId: string;
  number: number;
  playType: PlayType;
  pointsTeam1: number;
  pointsTeam2: number;
  winningTeamIndex: 0 | 1; // Index 0 for Team 1, 1 for Team 2
  closerPlayerId?: string;
  timestamp: number;
}

export interface Match {
  id: string;
  date: number;
  teams: Team[];
  rounds: Round[];
  scoreLimit: number;
  winnerTeamId?: string;
  status: 'active' | 'finished';
}

export type ThemeType = 'escolar' | 'cartulina' | 'minimalist' | 'sleek';
