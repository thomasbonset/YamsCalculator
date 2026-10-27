/**
 * Fin de partie : détection, proclamation du gagnant et confettis.
 */

import { COMBO_ROWS, DICE_FACES, PlayerData } from './model';
import { grandTotal } from './scoring';
import { game } from './state';

const CONFETTI_COUNT = 120;
/** Durée de l'animation `end-pop` de la popup (style.css). */
const OPEN_ANIMATION_MS = 450;
const CONFETTI_COLORS = ['#1565c0', '#ffca28', '#e53935', '#43a047', '#8e24aa', '#fb8c00'];

function isPlayerComplete(player: PlayerData): boolean {
  return (
    DICE_FACES.every((face) => player.dice[face] !== null) &&
    COMBO_ROWS.every((row) => player.combos[row.key] !== null) &&
    player.chance !== null &&
    player.malchance !== null
  );
}

/** La partie est finie quand toutes les cases de tous les joueurs sont remplies. */
export function isGameOver(): boolean {
  return game.players.length > 0 && game.players.every(isPlayerComplete);
}

function playerName(index: number): string {
  return game.players[index].name || `Joueur ${index + 1}`;
}

function formatNames(names: string[]): string {
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;
}

/** Confettis qui tombent depuis le haut de l'écran, retirés une fois l'animation finie. */
function launchConfetti(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');

  let longest = 0;
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    const duration = 2.5 + Math.random() * 2;
    const delay = Math.random() * 1.2;
    longest = Math.max(longest, duration + delay);
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${delay}s`;
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 30}vw`);
    piece.style.setProperty('--spin', `${360 + Math.random() * 720}deg`);
    layer.appendChild(piece);
  }

  // Dans la popup modale pour passer au-dessus du fond assombri.
  (document.getElementById('endDialog') ?? document.body).appendChild(layer);
  window.setTimeout(() => layer.remove(), longest * 1000 + 200);
}

function renderRanking(list: HTMLElement, best: number): void {
  list.innerHTML = '';
  game.players
    .map((_, index) => ({ name: playerName(index), score: grandTotal(game.players[index]) }))
    .sort((a, b) => b.score - a.score)
    .forEach(({ name, score }) => {
      const li = document.createElement('li');
      li.classList.toggle('is-winner', score === best);
      const nameEl = document.createElement('span');
      nameEl.textContent = name;
      const scoreEl = document.createElement('span');
      scoreEl.textContent = `${score} pts`;
      li.append(nameEl, scoreEl);
      list.appendChild(li);
    });
}

/** Ouvre la popup de victoire. Le meilleur score gagne ; les ex aequo sont proclamés ensemble. */
export function showEndDialog(): void {
  const dialog = document.getElementById('endDialog') as HTMLDialogElement | null;
  const winnerEl = document.getElementById('endWinner');
  const ranking = document.getElementById('endRanking');
  if (!dialog || !winnerEl || !ranking) return;

  const scores = game.players.map(grandTotal);
  const best = Math.max(...scores);
  const winners = scores
    .map((score, index) => ({ score, index }))
    .filter(({ score }) => score === best)
    .map(({ index }) => playerName(index));

  winnerEl.textContent =
    winners.length === 1
      ? `${winners[0]} remporte la partie avec ${best} points !`
      : `Égalité ! ${formatNames(winners)} se partagent la victoire avec ${best} points !`;
  renderRanking(ranking, best);

  dialog.showModal();
  // Après l'animation d'ouverture : tant qu'elle transforme la popup, les confettis y resteraient enfermés.
  window.setTimeout(launchConfetti, OPEN_ANIMATION_MS);
}

/** Branche les boutons de la popup. `onRestart` relance une nouvelle partie. */
export function initEndDialog(onRestart: () => void): void {
  const dialog = document.getElementById('endDialog') as HTMLDialogElement | null;
  if (!dialog) return;

  document.getElementById('endRestart')?.addEventListener('click', () => {
    dialog.close();
    onRestart();
  });
  document.getElementById('endClose')?.addEventListener('click', () => dialog.close());
}
