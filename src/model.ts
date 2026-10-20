/**
 * Modèle de données et règles fixes de la feuille de score.
 */

export type ComboKey = 'brelan' | 'full' | 'petiteSuite' | 'grandeSuite' | 'carre' | 'yams';

export interface ComboRowConfig {
  key: ComboKey;
  label: string;
}

export interface PlayerData {
  name: string;
  dice: Record<number, number | null>;
  combos: Record<ComboKey, number | null>;
  chance: number | null;
  malchance: number | null;
}

export const DICE_FACES = [1, 2, 3, 4, 5, 6] as const;
export const BONUS_THRESHOLD = 63;
export const BONUS_VALUE = 35;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;
export const DEFAULT_PLAYERS = 3;

export const COMBO_ROWS: ComboRowConfig[] = [
  { key: 'brelan', label: 'Brelan (total des triplés)' },
  { key: 'full', label: 'Full (15 pts)' },
  { key: 'petiteSuite', label: 'Petite suite (20 pts)' },
  { key: 'grandeSuite', label: 'Grande suite (25 pts)' },
  { key: 'carre', label: 'Carré (30 pts)' },
  { key: 'yams', label: 'Yams (50 pts)' },
];

export function createEmptyPlayer(index: number): PlayerData {
  return {
    name: `Joueur ${index + 1}`,
    dice: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
    combos: { brelan: null, full: null, petiteSuite: null, grandeSuite: null, carre: null, yams: null },
    chance: null,
    malchance: null,
  };
}

