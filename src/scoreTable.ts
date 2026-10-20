/**
 * Construction de la feuille de score en DOM et mise à jour des cellules calculées.
 */

import { COMBO_ROWS, ComboRowConfig, DICE_FACES } from './model';
import { chanceBalance, computeBonus, grandTotal, sumUpper } from './scoring';
import { game } from './state';
import { updateTurnIndicator } from './turns';

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
  const player = game.players[col];
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
    input.value = game.players[col].name;
    input.setAttribute('aria-label', `Nom du joueur ${col + 1}`);
    input.addEventListener('input', () => {
      game.players[col].name = input.value;
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
    const input = createNumberInput(cellId(`dice-${face}`, col), game.players[col].dice[face], (value) => {
      game.players[col].dice[face] = value;
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
    const input = createNumberInput(cellId(`combo-${row.key}`, col), game.players[col].combos[row.key], (value) => {
      game.players[col].combos[row.key] = value;
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
    const input = createNumberInput(cellId(field, col), game.players[col][field], (value) => {
      game.players[col][field] = value;
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

export function renderTable(count: number): void {
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

