/*
 * Infinimon — constant sweep
 *
 *   node tune.js
 *
 * The first simulation run showed the design's original constants produced
 * 2-turn fights instead of the intended 5-7, which in turn made ~25% of wild
 * monsters impossible to tame (they crossed 50% HP and fainted in the same
 * blow) and left the element grid badly skewed toward high-DEF lines.
 *
 * Rather than guess at replacements, this sweeps the three constants that
 * drive fight length and scores each combination against the design targets.
 *
 * Scored on:
 *   - median fight length near 6 turns
 *   - impossible-to-tame rate under 10%
 *   - element win-rate spread under 10 points
 */

const G = require('./engine.js');

const RUNS = 12;          // per matchup, per candidate — kept low; the sweep is wide
const TARGET_TURNS = 6;

const K_VALUES = [0.20, 0.25, 0.30, 0.35, 0.40];
const FOCUS_STARTS = [0, 1, 2, 3];
const DEF_CONSTANTS = [50, 70, 90];

function fight(aSpec, bSpec, level, rng) {
  const a = G.createMonster({ speciesId: aSpec.id, level, bond: 0 });
  const b = G.createMonster({ speciesId: bSpec.id, level, bond: 0 });
  const battle = G.createBattle([a], b, rng);
  let tameWindow = 0;
  let guard = 0;
  while (!battle.over && guard++ < 300) {
    G.resolveTurn(battle, G.chooseMove(a, b, battle.playerFocus));
    if (b.hp > 0 && b.hp / b.maxHp < 0.5) tameWindow += 1;
  }
  return {
    turns: battle.turn,
    playerWon: battle.outcome === 'wild_fainted',
    tameable: tameWindow > 0,
    aEl: aSpec.element,
    bEl: bSpec.element,
  };
}

function evaluate(config) {
  G.configure(config);
  const rng = G.makeRng(20260808);

  const turns = [];
  let impossible = 0, decided = 0;
  const wins = {}, games = {};
  for (const el of G.ELEMENT_CYCLE) { wins[el] = 0; games[el] = 0; }

  for (const level of [5, 15, 25]) {
    for (const a of G.SPECIES) {
      for (const b of G.SPECIES) {
        for (let i = 0; i < RUNS; i++) {
          const r = fight(a, b, level, rng);
          turns.push(r.turns);
          if (r.playerWon) {
            decided += 1;
            if (!r.tameable) impossible += 1;
          }
          if (a.id !== b.id) {
            games[r.aEl] += 1; games[r.bEl] += 1;
            if (r.playerWon) wins[r.aEl] += 1; else wins[r.bEl] += 1;
          }
        }
      }
    }
  }

  const sorted = turns.sort((x, y) => x - y);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  const impossibleRate = decided ? (impossible / decided) * 100 : 100;
  const rates = G.ELEMENT_CYCLE.map((el) => (wins[el] / games[el]) * 100);
  const spread = Math.max(...rates) - Math.min(...rates);

  // Lower is better. Turn-length miss and taming failures dominate; element
  // spread is a tiebreaker because it is also fixable by editing stat lines.
  const score =
    Math.abs(median - TARGET_TURNS) * 2 +
    Math.max(0, impossibleRate - 10) * 0.8 +
    Math.max(0, spread - 10) * 0.4;

  return { median, p90, impossibleRate, spread, score, rates };
}

// ---------------------------------------------------------------------------

console.log('\nSweeping ' + (K_VALUES.length * FOCUS_STARTS.length * DEF_CONSTANTS.length) +
  ' combinations...\n');

const results = [];
for (const K of K_VALUES) {
  for (const FOCUS_START of FOCUS_STARTS) {
    for (const DEF_CONSTANT of DEF_CONSTANTS) {
      const cfg = { K, FOCUS_START, DEF_CONSTANT };
      results.push({ cfg, ...evaluate(cfg) });
    }
  }
}

results.sort((a, b) => a.score - b.score);

const row = (r) =>
  `  ${String(r.cfg.K).padEnd(6)}${String(r.cfg.FOCUS_START).padEnd(8)}` +
  `${String(r.cfg.DEF_CONSTANT).padEnd(7)}` +
  `${String(r.median).padStart(8)}${String(r.p90).padStart(6)}` +
  `${(r.impossibleRate.toFixed(1) + '%').padStart(13)}` +
  `${(r.spread.toFixed(1)).padStart(10)}` +
  `${r.score.toFixed(2).padStart(9)}`;

console.log('  K     Focus   DEF+     median   p90   impossible    spread    score');
console.log('  ' + '-'.repeat(70));
for (const r of results.slice(0, 15)) console.log(row(r));

console.log('\n  ...worst 3 for contrast:');
for (const r of results.slice(-3)) console.log(row(r));

const best = results[0];
console.log('\n' + '='.repeat(74));
console.log('  BEST: K = ' + best.cfg.K + ', FOCUS_START = ' + best.cfg.FOCUS_START +
  ', DEF_CONSTANT = ' + best.cfg.DEF_CONSTANT);
console.log('='.repeat(74));
console.log(`  median fight      ${best.median} turns   (target ${TARGET_TURNS})`);
console.log(`  p90 fight         ${best.p90} turns`);
console.log(`  impossible tames  ${best.impossibleRate.toFixed(1)}%   (target < 10%)`);
console.log(`  element spread    ${best.spread.toFixed(1)} points   (target < 10)`);
console.log('\n  Element win rates at these values:');
G.ELEMENT_CYCLE.forEach((el, i) => {
  console.log(`    ${G.ELEMENTS[el].name.padEnd(10)}${best.rates[i].toFixed(1)}%`);
});
console.log('');
