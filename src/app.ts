/**
 * Calculateur de score pour le jeu de Yams.
 * SPA sans framework : construit la feuille de score en DOM et recalcule
 * les sous-totaux / total à chaque saisie.
 *
 * Point d'entrée : relie la popup de configuration, la feuille de score et les tours.
 */

import { createEmptyPlayer } from './model';
import { renderTable } from './scoreTable';
import { initSetupDialog } from './setupDialog';
import { game } from './state';
import { highlightCurrentPlayer, nextTurn } from './turns';

function startGame(names: string[]): void {
  game.players = names.map((name, i) => {
    const player = createEmptyPlayer(i);
    if (name) player.name = name;
    return player;
  });
  renderTable(game.players.length);
  game.currentPlayer = 0;
  highlightCurrentPlayer();
}

function initApp(): void {
  const openSetup = initSetupDialog(startGame);
  if (!openSetup) return;

  document.getElementById('newGameButton')?.addEventListener('click', openSetup);
  document.getElementById('nextTurnButton')?.addEventListener('click', nextTurn);
}

document.addEventListener('DOMContentLoaded', initApp);
