/**
 * Calculateur de score pour le jeu de Yams.
 * SPA sans framework : construit la feuille de score en DOM et recalcule
 * les sous-totaux / total à chaque saisie.
 */

type ComboKey = 'brelan' | 'full' | 'petiteSuite' | 'grandeSuite' | 'carre' | 'yams';

interface ComboRowConfig {
  key: ComboKey;
  label: string;
}

interface PlayerData {
  name: string;
  dice: Record<number, number | null>;
  combos: Record<ComboKey, number | null>;
  chance: number | null;
  malchance: number | null;
}

const DICE_FACES = [1, 2, 3, 4, 5, 6] as const;
const BONUS_THRESHOLD = 63;
const BONUS_VALUE = 35;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;
const DEFAULT_PLAYERS = 3;

const COMBO_ROWS: ComboRowConfig[] = [
  { key: 'brelan', label: 'Brelan (total des triplés)' },
  { key: 'full', label: 'Full (15 pts)' },
  { key: 'petiteSuite', label: 'Petite suite (20 pts)' },
  { key: 'grandeSuite', label: 'Grande suite (25 pts)' },
  { key: 'carre', label: 'Carré (30 pts)' },
  { key: 'yams', label: 'Yams (50 pts)' },
];

let players: PlayerData[] = [];
let currentPlayer = 0;

function createEmptyPlayer(index: number): PlayerData {
  return {
    name: `Joueur ${index + 1}`,
    dice: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
    combos: { brelan: null, full: null, petiteSuite: null, grandeSuite: null, carre: null, yams: null },
    chance: null,
    malchance: null,
  };
}

function sumUpper(player: PlayerData): number {
  return DICE_FACES.reduce((total, face) => total + (player.dice[face] ?? 0), 0);
}

function computeBonus(player: PlayerData): number {
  return sumUpper(player) > BONUS_THRESHOLD ? BONUS_VALUE : 0;
}

function sumCombos(player: PlayerData): number {
  return COMBO_ROWS.reduce((total, row) => total + (player.combos[row.key] ?? 0), 0);
}

function chanceBalance(player: PlayerData): number {
  return (player.chance ?? 0) - (player.malchance ?? 0);
}

function grandTotal(player: PlayerData): number {
  return sumUpper(player) + computeBonus(player) + sumCombos(player) + chanceBalance(player);
}

function cellId(row: string, col: number): string {
  return `cell-${row}-${col}`;
}

function createNumberInput(
  id: string,
  value: number | null,
  onChange: (value: number | null) => void
): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'number';
  input.id = id;
  input.className = 'score-input';
  input.setAttribute('inputmode', 'numeric');
  if (value !== null) {
    input.value = String(value);
  }
  input.addEventListener('input', () => {
    const raw = input.value.trim();
    onChange(raw === '' ? null : Number(raw));
  });
  return input;
}

function createComputedCell(id: string): HTMLTableCellElement {
  const td = document.createElement('td');
  td.id = id;
  td.className = 'computed-cell';
  return td;
}

function updateComputedCells(col: number): void {
  const player = players[col];
  const subtotalEl = document.getElementById(cellId('subtotal-upper', col));
  const bonusEl = document.getElementById(cellId('bonus', col));
  const chanceEl = document.getElementById(cellId('subtotal-chance', col));
  const totalEl = document.getElementById(cellId('total', col));

  if (subtotalEl) subtotalEl.textContent = String(sumUpper(player));
  if (bonusEl) bonusEl.textContent = String(computeBonus(player));
  if (chanceEl) chanceEl.textContent = String(chanceBalance(player));
  if (totalEl) totalEl.textContent = String(grandTotal(player));
}

function buildHeaderRow(count: number): HTMLTableRowElement {
  const tr = document.createElement('tr');
  tr.className = 'row-header';

  const corner = document.createElement('th');
  corner.textContent = 'Joueur';
  tr.appendChild(corner);

  for (let col = 0; col < count; col++) {
    const th = document.createElement('th');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'player-name-input';
    input.value = players[col].name;
    input.setAttribute('aria-label', `Nom du joueur ${col + 1}`);
    input.addEventListener('input', () => {
      players[col].name = input.value;
      updateTurnIndicator();
    });
    th.appendChild(input);
    tr.appendChild(th);
  }
  return tr;
}

function buildLabelRow(label: string, extraClass = ''): HTMLTableRowElement {
  const tr = document.createElement('tr');
  if (extraClass) tr.className = extraClass;
  const th = document.createElement('th');
  th.textContent = label;
  th.scope = 'row';
  tr.appendChild(th);
  return tr;
}

function buildSectionTitleRow(label: string, count: number): HTMLTableRowElement {
  const tr = document.createElement('tr');
  tr.className = 'section-title';
  const th = document.createElement('th');
  th.textContent = label;
  th.colSpan = count + 1;
  tr.appendChild(th);
  return tr;
}

function buildDiceRow(face: number, count: number): HTMLTableRowElement {
  const tr = buildLabelRow(`Total de ${face}`);
  for (let col = 0; col < count; col++) {
    const td = document.createElement('td');
    const input = createNumberInput(cellId(`dice-${face}`, col), players[col].dice[face], (value) => {
      players[col].dice[face] = value;
      updateComputedCells(col);
    });
    td.appendChild(input);
    tr.appendChild(td);
  }
  return tr;
}

function buildComboRow(row: ComboRowConfig, count: number): HTMLTableRowElement {
  const tr = buildLabelRow(row.label);
  for (let col = 0; col < count; col++) {
    const td = document.createElement('td');
    const input = createNumberInput(cellId(`combo-${row.key}`, col), players[col].combos[row.key], (value) => {
      players[col].combos[row.key] = value;
      updateComputedCells(col);
    });
    td.appendChild(input);
    tr.appendChild(td);
  }
  return tr;
}

function buildChanceRow(label: string, field: 'chance' | 'malchance', count: number): HTMLTableRowElement {
  const tr = buildLabelRow(label);
  for (let col = 0; col < count; col++) {
    const td = document.createElement('td');
    const input = createNumberInput(cellId(field, col), players[col][field], (value) => {
      players[col][field] = value;
      updateComputedCells(col);
    });
    td.appendChild(input);
    tr.appendChild(td);
  }
  return tr;
}

function buildComputedRow(label: string, idPrefix: string, count: number, extraClass = ''): HTMLTableRowElement {
  const tr = buildLabelRow(label, extraClass);
  for (let col = 0; col < count; col++) {
    tr.appendChild(createComputedCell(cellId(idPrefix, col)));
  }
  return tr;
}

function renderTable(count: number): void {
  const table = document.getElementById('scoreTable');
  if (!table) return;
  table.innerHTML = '';

  const thead = document.createElement('thead');
  thead.appendChild(buildHeaderRow(count));
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  tbody.appendChild(buildSectionTitleRow('Totaux par dé', count));
  for (const face of DICE_FACES) {
    tbody.appendChild(buildDiceRow(face, count));
  }
  tbody.appendChild(buildComputedRow('Sous-total', 'subtotal-upper', count, 'row-subtotal'));
  tbody.appendChild(buildComputedRow('Bonus (+35 si > 63)', 'bonus', count, 'row-bonus'));

  tbody.appendChild(buildSectionTitleRow('Combinaisons', count));
  for (const row of COMBO_ROWS) {
    tbody.appendChild(buildComboRow(row, count));
  }

  tbody.appendChild(buildSectionTitleRow('Chance', count));
  tbody.appendChild(buildChanceRow('Chance (total des dés)', 'chance', count));
  tbody.appendChild(buildChanceRow('Malchance (total des dés)', 'malchance', count));
  tbody.appendChild(buildComputedRow('Sous-total chance - malchance', 'subtotal-chance', count, 'row-subtotal'));

  tbody.appendChild(buildComputedRow('TOTAL', 'total', count, 'row-total'));

  table.appendChild(tbody);

  for (let col = 0; col < count; col++) {
    updateComputedCells(col);
  }
}

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

function updateTurnIndicator(): void {
  const label = document.getElementById('turnLabel');
  const player = players[currentPlayer];
  if (label && player) label.textContent = `Au tour de ${player.name || `Joueur ${currentPlayer + 1}`}`;
}

function highlightCurrentPlayer(): void {
  const table = document.getElementById('scoreTable') as HTMLTableElement | null;
  if (!table) return;
  // La 1re cellule de chaque ligne est le libellé ; les titres de section couvrent toute la ligne.
  table.querySelectorAll<HTMLTableRowElement>('tr:not(.section-title)').forEach((tr) => {
    Array.from(tr.cells)
      .slice(1)
      .forEach((cell, col) => {
        const isCurrent = col === currentPlayer;
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

function nextTurn(): void {
  if (players.length === 0) return;
  lockFilledInputs(currentPlayer);
  currentPlayer = (currentPlayer + 1) % players.length;
  highlightCurrentPlayer();
}

function startGame(names: string[]): void {
  players = names.map((name, i) => {
    const player = createEmptyPlayer(i);
    if (name) player.name = name;
    return player;
  });
  renderTable(players.length);
  currentPlayer = 0;
  highlightCurrentPlayer();
}

function initApp(): void {
  const dialog = document.getElementById('setupDialog') as HTMLDialogElement | null;
  const form = document.getElementById('setupForm') as HTMLFormElement | null;
  const select = document.getElementById('playerCount') as HTMLSelectElement | null;
  const namesContainer = document.getElementById('playerNames');
  const cancelButton = document.getElementById('setupCancel') as HTMLButtonElement | null;
  const newGameButton = document.getElementById('newGameButton');
  if (!dialog || !form || !select || !namesContainer || !cancelButton || !newGameButton) return;

  const openSetup = (): void => {
    // Pas d'annulation possible tant qu'aucune partie n'a commencé.
    cancelButton.hidden = players.length === 0;
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
    startGame(names);
  });

  dialog.addEventListener('cancel', (event) => {
    if (players.length === 0) event.preventDefault();
  });

  cancelButton.addEventListener('click', () => dialog.close());
  newGameButton.addEventListener('click', openSetup);
  document.getElementById('nextTurnButton')?.addEventListener('click', nextTurn);

  openSetup();
}

document.addEventListener('DOMContentLoaded', initApp);
