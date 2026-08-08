/*
 * Infinimon — stat line solver
 *
 *   node autobalance.js
 *
 * balance.js established that equal 180-point stat budgets do not produce equal
 * monsters. This solves for lines that actually are equal, by round-robin
 * simulation and gradient descent on win rate.
 *
 * Method:
 *   - SPD is held FIXED. It is what gives each monster its character (Kitewing
 *     is the fast one; Pebbet is the slow one) and it is the axis the design
 *     spends most deliberately.
 *   - HP / ATK / DEF are scaled together, preserving each monster's shape.
 *   - Monsters above 50% shrink, monsters below 50% grow, and it iterates.
 *
 * The output is a set of stat lines with UNEQUAL totals. That is the finding:
 * fast, frail monsters need a larger budget because SPD buys less than HP+DEF.
 */

const G = require('./engine.js');

const ITERATIONS = 30;
const RUNS = 20;      // per pairing, per iteration
const LEVEL = 15;
const RATE = 0.12;    // descent strength — 0.55 oscillated wildly, overshooting
const MIN_STAT = 15;
const MAX_STAT = 80;

// Working copies — SPD fixed, HP/ATK/DEF mutable.
const lines = G.SPECIES.map((s) => ({
  id: s.id, name: s.name, element: s.element, rarity: s.rarity,
  hp: s.hp, atk: s.atk, def: s.def, spd: s.spd,
  scale: 1,
  origin: { hp: s.hp, atk: s.atk, def: s.def },
}));

const clamp = (v) => Math.max(MIN_STAT, Math.min(MAX_STAT, Math.round(v)));

function applyScale(l) {
  l.hp = clamp(l.origin.hp * l.scale);
  l.atk = clamp(l.origin.atk * l.scale);
  l.def = clamp(l.origin.def * l.scale);
}

function monsterFrom(l) {
  return G.createMonster({
    elements: [l.element],
    bases: { hp: l.hp, atk: l.atk, def: l.def, spd: l.spd },
    name: l.name,
    level: LEVEL,
    bond: 0,
  });
}

function roundRobin(rng) {
  const wins = {}, games = {};
  for (const l of lines) { wins[l.id] = 0; games[l.id] = 0; }

  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines.length; j++) {
      if (i === j) continue;
      for (let k = 0; k < RUNS; k++) {
        const a = monsterFrom(lines[i]);
        const b = monsterFrom(lines[j]);
        const battle = G.createBattle([a], b, rng);
        let guard = 0;
        while (!battle.over && guard++ < 300) {
          G.resolveTurn(battle, G.chooseMove(a, b, battle.playerFocus));
        }
        games[lines[i].id] += 1; games[lines[j].id] += 1;
        if (battle.outcome === 'wild_fainted') wins[lines[i].id] += 1;
        else wins[lines[j].id] += 1;
      }
    }
  }
  const rates = {};
  for (const l of lines) rates[l.id] = wins[l.id] / games[l.id];
  return rates;
}

// ---------------------------------------------------------------------------

console.log('\nSolving for balanced stat lines...\n');
console.log('  iter   spread   worst                best');
console.log('  ' + '-'.repeat(56));

let rates;
// Simulation noise means the final iterate is not necessarily the best one.
// Track the lowest-spread solution seen and return that.
let bestSpread = Infinity;
let bestSnapshot = null;
let bestRates = null;

for (let iter = 0; iter < ITERATIONS; iter++) {
  const rng = G.makeRng(5000 + iter);
  rates = roundRobin(rng);

  const vals = lines.map((l) => rates[l.id] * 100);
  const spread = Math.max(...vals) - Math.min(...vals);
  const worst = lines.reduce((a, b) => (rates[a.id] < rates[b.id] ? a : b));
  const best = lines.reduce((a, b) => (rates[a.id] > rates[b.id] ? a : b));

  if (spread < bestSpread) {
    bestSpread = spread;
    bestRates = { ...rates };
    bestSnapshot = lines.map((l) => ({ ...l, origin: { ...l.origin } }));
  }

  console.log(
    `  ${String(iter + 1).padStart(4)}   ${spread.toFixed(1).padStart(6)}   ` +
    `${(worst.name + ' ' + (rates[worst.id] * 100).toFixed(0) + '%').padEnd(20)} ` +
    `${best.name} ${(rates[best.id] * 100).toFixed(0)}%` +
    (spread === bestSpread ? '   <- best' : '')
  );

  if (iter === ITERATIONS - 1) break;

  // Descend: below 50% grows, above 50% shrinks.
  for (const l of lines) {
    l.scale *= 1 + (0.5 - rates[l.id]) * RATE;
    applyScale(l);
  }
}

// Restore the best iterate for reporting.
for (let i = 0; i < lines.length; i++) Object.assign(lines[i], bestSnapshot[i]);
rates = bestRates;

// ---------------------------------------------------------------------------

console.log('\n' + '='.repeat(78));
console.log('  SOLVED STAT LINES');
console.log('='.repeat(78));
console.log('\n  ' + 'Monster'.padEnd(11) + 'Element'.padEnd(10) +
  'HP'.padStart(4) + 'ATK'.padStart(5) + 'DEF'.padStart(5) + 'SPD'.padStart(5) +
  'total'.padStart(8) + 'was'.padStart(6) + 'win%'.padStart(8));
console.log('  ' + '-'.repeat(70));

const sorted = [...lines].sort((a, b) => rates[b.id] - rates[a.id]);
for (const l of sorted) {
  const total = l.hp + l.atk + l.def + l.spd;
  const wasTotal = l.origin.hp + l.origin.atk + l.origin.def + l.spd;
  console.log(
    '  ' + l.name.padEnd(11) + G.ELEMENTS[l.element].name.padEnd(10) +
    String(l.hp).padStart(4) + String(l.atk).padStart(5) +
    String(l.def).padStart(5) + String(l.spd).padStart(5) +
    String(total).padStart(8) + String(wasTotal).padStart(6) +
    ((rates[l.id] * 100).toFixed(1) + '%').padStart(8)
  );
}

const finalVals = lines.map((l) => rates[l.id] * 100);
const finalSpread = Math.max(...finalVals) - Math.min(...finalVals);
console.log('\n  Final win-rate spread: ' + finalSpread.toFixed(1) + ' points');

const totals = lines.map((l) => l.hp + l.atk + l.def + l.spd);
console.log('  Stat totals now range ' + Math.min(...totals) + ' - ' + Math.max(...totals) +
  ' (they were all 180)');

// Paste-ready block for engine.js
console.log('\n' + '-'.repeat(78));
console.log('  Paste into engine.js SPECIES:');
console.log('-'.repeat(78) + '\n');
for (const l of G.SPECIES.map((s) => lines.find((x) => x.id === s.id))) {
  const sp = G.speciesById(l.id);
  console.log(
    `    { id: '${l.id}',${' '.repeat(10 - l.id.length)} name: '${l.name}',` +
    `${' '.repeat(10 - l.name.length)} element: '${l.element}',` +
    `${' '.repeat(9 - l.element.length)} hp: ${l.hp}, atk: ${l.atk}, ` +
    `def: ${l.def}, spd: ${l.spd}, rarity: '${sp.rarity}' },`
  );
}
console.log('');
