/**
 * Calculateur de score pour le jeu de Yams.
 * SPA sans framework : construit la feuille de score en DOM et recalcule
 * les sous-totaux / total à chaque saisie.
 *
 * Point d'entrée : relie la page d'accueil, la popup de configuration, la feuille de score et les tours.
 */

import { initEndDialog, isGameOver, showEndDialog } from './endGame';
import { createEmptyPlayer } from './model';
import { renderTable } from './scoreTable';
import { initSetupDialog } from './setupDialog';
import { game } from './state';
import { highlightCurrentPlayer, nextTurn, updateTurnIndicator } from './turns';

function startGame(names: string[]): void {
  game.players = names.map((name, i) => {
    const player = createEmptyPlayer(i);
    if (name) player.name = name;
    return player;
  });
  renderTable(game.players.length);
  game.currentPlayer = 0;
  game.over = false;
  setNextTurnEnabled(true);
  highlightCurrentPlayer();
  showApp();
}

function setNextTurnEnabled(enabled: boolean): void {
  const button = document.getElementById('nextTurnButton') as HTMLButtonElement | null;
  if (button) button.disabled = !enabled;
}

/** Valide le tour ; si plus aucune case n'est à remplir, proclame le gagnant. */
function onNextTurn(): void {
  nextTurn();
  if (!isGameOver()) return;
  game.over = true;
  setNextTurnEnabled(false);
  updateTurnIndicator();
  showEndDialog();
}

/** Quitte la page d'accueil pour afficher la feuille de score. */
function showApp(): void {
  document.getElementById('welcome')?.setAttribute('hidden', '');
  document.getElementById('app')?.removeAttribute('hidden');
}

function initApp(): void {
  const openSetup = initSetupDialog(startGame);
  if (!openSetup) return;

  document.getElementById('welcomeStartButton')?.addEventListener('click', openSetup);
  document.getElementById('newGameButton')?.addEventListener('click', openSetup);
  document.getElementById('nextTurnButton')?.addEventListener('click', onNextTurn);
  initEndDialog(openSetup);
}

document.addEventListener('DOMContentLoaded', initApp);
