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
}

export interface Round {
  id: string;
  matchId: string;
  number: number;
  playType: PlayType;
  points: number;
  winningTeamIndex: number;
  timestamp: number;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface Match {
  id: string;
  date: number;
  teams: Team[];
  rounds: Round[];
  scoreLimit: number;
  capicuaPoints: number;
  pasoSalidaPoints: number;
  pasoCorridoPoints: number;
  winnerTeamId?: string;
  status: 'active' | 'finished';
}

export type ThemeType = 'escolar' | 'cartulina' | 'minimalist' | 'sleek';
