/**
 * Popup de configuration d'une partie : nombre de joueurs et noms.
 */

import { DEFAULT_PLAYERS, MAX_PLAYERS, MIN_PLAYERS } from './model';
import { game } from './state';

function clampPlayerCount(value: number): number {
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, value));
}

function renderNameInputs(container: HTMLElement, count: number): void {
  // Conserve les noms déjà saisis quand on change le nombre de joueurs.
  const previous = Array.from(container.querySelectorAll<HTMLInputElement>('input')).map((input) => input.value);
  container.querySelectorAll('.setup-name').forEach((el) => el.remove());

  for (let i = 0; i < count; i++) {
    const label = document.createElement('label');
    label.className = 'setup-name';
    label.textContent = `Joueur ${i + 1}`;
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Joueur ${i + 1}`;
    input.maxLength = 20;
    input.value = previous[i] ?? '';
    label.appendChild(input);
    container.appendChild(label);
  }
}


/**
 * Branche la popup et l'ouvre immédiatement. Renvoie la fonction qui la rouvre.
 */
export function initSetupDialog(onStart: (names: string[]) => void): (() => void) | null {
  const dialog = document.getElementById('setupDialog') as HTMLDialogElement | null;
  const form = document.getElementById('setupForm') as HTMLFormElement | null;
  const select = document.getElementById('playerCount') as HTMLSelectElement | null;
  const namesContainer = document.getElementById('playerNames');
  const cancelButton = document.getElementById('setupCancel') as HTMLButtonElement | null;
  if (!dialog || !form || !select || !namesContainer || !cancelButton) return null;

  const openSetup = (): void => {
    // Pas d'annulation possible tant qu'aucune partie n'a commencé.
    cancelButton.hidden = game.players.length === 0;
    renderNameInputs(namesContainer, clampPlayerCount(Number(select.value) || DEFAULT_PLAYERS));
    dialog.showModal();
    namesContainer.querySelector('input')?.focus();
  };

  select.addEventListener('change', () => {
    renderNameInputs(namesContainer, clampPlayerCount(Number(select.value)));
  });

  form.addEventListener('submit', () => {
    const names = Array.from(namesContainer.querySelectorAll<HTMLInputElement>('input')).map((input) =>
      input.value.trim()
    );
    onStart(names);
  });

  dialog.addEventListener('cancel', (event) => {
    if (game.players.length === 0) event.preventDefault();
  });

  cancelButton.addEventListener('click', () => dialog.close());

  openSetup();
  return openSetup;
}
