/**
 * État de la partie en cours, partagé entre les modules.
 */

import { PlayerData } from './model';

export const game = {
  players: [] as PlayerData[],
  currentPlayer: 0,
};
