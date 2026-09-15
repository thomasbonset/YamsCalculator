# Yams Calculator

Calculateur de score pour le jeu de dés Yams. SPA en TypeScript (sans framework), qui gère de 2 à 4 joueurs et calcule automatiquement les sous-totaux, le bonus et le total général.

## Fonctionnalités

- Tableau de 2, 3 ou 4 joueurs (noms modifiables)
- Totaux par dé (1 à 6) avec sous-total et bonus de +35 points si le sous-total dépasse 63
- Combinaisons : brelan, full, petite suite, grande suite, carré, Yams
- Chance / malchance avec sous-total (chance - malchance)
- Total général calculé en direct à chaque saisie

## Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- npm (fourni avec Node.js)

## Installation

```bash
git clone https://github.com/thomasbonset/YamsCalculator.git
cd YamsCalculator
npm install
```

## Utilisation

### Serveur de développement

```bash
npm start
```

Lance `webpack-dev-server` et ouvre l'application dans le navigateur (par défaut sur `http://localhost:8080`).

### Build de production

```bash
npm run build
```

Génère les fichiers optimisés dans le dossier `dist/`.

### Vérification des types

```bash
npm run typecheck
```

## Structure du projet

```
src/app.ts        Logique de l'application (TypeScript)
css/style.css      Styles
index.html          Page HTML principale
webpack.*.js        Configuration webpack (commun / dev / prod)
tsconfig.json       Configuration TypeScript
```
