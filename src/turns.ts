/**
 * Gestion des tours : joueur en cours, surbrillance et verrouillage des cases.
 */

import { game } from './state';

export function updateTurnIndicator(): void {
  const label = document.getElementById('turnLabel');
  const player = game.players[game.currentPlayer];
  if (label && player) label.textContent = `Au tour de ${player.name || `Joueur ${game.currentPlayer + 1}`}`;
}

export function highlightCurrentPlayer(): void {
  const table = document.getElementById('scoreTable') as HTMLTableElement | null;
  if (!table) return;
  // La 1re cellule de chaque ligne est le libellé ; les titres de section couvrent toute la ligne.
  table.querySelectorAll<HTMLTableRowElement>('tr:not(.section-title)').forEach((tr) => {
    Array.from(tr.cells)
      .slice(1)
      .forEach((cell, col) => {
        const isCurrent = col === game.currentPlayer;
        cell.classList.toggle('is-current', isCurrent);
        // Seule la colonne du joueur en cours est modifiable, hors cases déjà validées.
        cell.querySelectorAll('input').forEach((input) => {
          input.readOnly = !isCurrent || input.dataset.locked === 'true';
        });
      });
  });
  updateTurnIndicator();
}

function lockFilledInputs(col: number): void {
  // Les cases remplies sont figées jusqu'à la fin de la partie.
  document.querySelectorAll<HTMLInputElement>(`.score-input[id$="-${col}"]`).forEach((input) => {
    if (input.value.trim() !== '') input.dataset.locked = 'true';
  });
}

export function nextTurn(): void {
  if (game.players.length === 0) return;
  lockFilledInputs(game.currentPlayer);
  game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
  highlightCurrentPlayer();
}

