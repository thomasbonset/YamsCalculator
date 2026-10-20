/**
 * Calculs des sous-totaux, bonus et total d'un joueur.
 */

import { BONUS_THRESHOLD, BONUS_VALUE, COMBO_ROWS, DICE_FACES, PlayerData } from './model';

export function sumUpper(player: PlayerData): number {
  return DICE_FACES.reduce((total, face) => total + (player.dice[face] ?? 0), 0);
}

export function computeBonus(player: PlayerData): number {
  return sumUpper(player) > BONUS_THRESHOLD ? BONUS_VALUE : 0;
}

export function sumCombos(player: PlayerData): number {
  return COMBO_ROWS.reduce((total, row) => total + (player.combos[row.key] ?? 0), 0);
}

export function chanceBalance(player: PlayerData): number {
  return (player.chance ?? 0) - (player.malchance ?? 0);
}

export function grandTotal(player: PlayerData): number {
  return sumUpper(player) + computeBonus(player) + sumCombos(player) + chanceBalance(player);
}

