/**
 * Gestion des tours : joueur en cours, surbrillance et verrouillage des cases.
 */

import { game } from './state';

/** Cases de score d'une colonne : champs numériques et groupes de boutons. */
function scoreFields(root: ParentNode, col?: number): HTMLElement[] {
  const suffix = col === undefined ? '' : `[id$="-${col}"]`;
  return Array.from(root.querySelectorAll<HTMLElement>(`.score-input${suffix}, .choice-picker${suffix}`));
}

function isFilled(field: HTMLElement): boolean {
  const value = field instanceof HTMLInputElement ? field.value : field.dataset.value ?? '';
  return value.trim() !== '';
}

function isLocked(field: HTMLElement): boolean {
  return field.dataset.locked === 'true';
}

export function updateTurnIndicator(): void {
  const label = document.getElementById('turnLabel');
  const player = game.players[game.currentPlayer];
  if (label && player) label.textContent = `Au tour de ${player.name || `Joueur ${game.currentPlayer + 1}`}`;
}

/**
 * Met à jour la surbrillance et ce qui est modifiable. À rappeler après chaque saisie.
 */
export function highlightCurrentPlayer(): void {
  const table = document.getElementById('scoreTable') as HTMLTableElement | null;
  if (!table) return;

  // Une seule ligne alimentée par tour : la case remplie pendant ce tour, s'il y en a une.
  const filledThisTurn = scoreFields(table, game.currentPlayer).find((field) => isFilled(field) && !isLocked(field));

  // La 1re cellule de chaque ligne est le libellé ; les titres de section couvrent toute la ligne.
  table.querySelectorAll<HTMLTableRowElement>('tr:not(.section-title)').forEach((tr) => {
    Array.from(tr.cells)
      .slice(1)
      .forEach((cell, col) => {
        const isCurrent = col === game.currentPlayer;
        cell.classList.toggle('is-current', isCurrent);
        // Seule la colonne du joueur en cours est modifiable, hors cases déjà validées
        // et hors autres lignes une fois une case remplie dans le tour.
        const field = scoreFields(cell)[0];
        const blocked =
          !isCurrent ||
          (field !== undefined && (isLocked(field) || (filledThisTurn !== undefined && field !== filledThisTurn)));
        cell.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button').forEach((control) => {
          if (control instanceof HTMLInputElement) control.readOnly = blocked;
          else control.disabled = blocked;
        });
      });
  });
  updateTurnIndicator();
}

function lockFilledInputs(col: number): void {
  // Les cases remplies sont figées jusqu'à la fin de la partie.
  scoreFields(document, col).forEach((field) => {
    if (isFilled(field)) field.dataset.locked = 'true';
  });
}

export function nextTurn(): void {
  if (game.players.length === 0) return;
  lockFilledInputs(game.currentPlayer);
  game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
  highlightCurrentPlayer();
}
