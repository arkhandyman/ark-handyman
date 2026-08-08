/*
 * Infinimon — per-monster balance analysis
 *
 *   node balance.js
 *
 * The element sweep showed a ~29 point win-rate spread that did NOT respond to
 * fight-length tuning, which rules out the damage constants as the cause. This
 * drills into individual stat lines to find where the imbalance actually lives.
 *
 * The hypothesis being tested: an equal 180-point stat budget does not produce
 * equal monsters, because stat points are not fungible. Survivability is
 * HP x (DEF + C) -- multiplicative -- so stacking both is quadratically strong,
 * while SPD only decides turn order and is nearly free.
 */

const G = require('./engine.js');

const RUNS = 60;
const LEVEL = 15;

/*
 * Analytic estimate of a monster's worth, independent of simulation.
 *
 *   effective HP    = HP x (DEF + DEF_CONSTANT)   <- how much damage it absorbs
 *   damage per turn ~ ATK
 *   total output    = effective HP x ATK          <- damage dealt before dying
 */
function powerScore(s) {
  const effHp = s.hp * (s.def + G.CONFIG.DEF_CONSTANT);
  return (effHp * s.atk) / 100000;
}

function fight(aSpec, bSpec, rng) {
  const a = G.createMonster({ speciesId: aSpec.id, level: LEVEL, bond: 0 });
  const b = G.createMonster({ speciesId: bSpec.id, level: LEVEL, bond: 0 });
  const battle = G.createBattle([a], b, rng);
  let guard = 0;
  while (!battle.over && guard++ < 300) {
    G.resolveTurn(battle, G.chooseMove(a, b, battle.playerFocus));
  }
  return battle.outcome === 'wild_fainted';
}

const rng = G.makeRng(31415);
const wins = {}, games = {};
for (const s of G.SPECIES) { wins[s.id] = 0; games[s.id] = 0; }

for (const a of G.SPECIES) {
  for (const b of G.SPECIES) {
    if (a.id === b.id) continue;
    for (let i = 0; i < RUNS; i++) {
      const aWon = fight(a, b, rng);
      games[a.id] += 1; games[b.id] += 1;
      if (aWon) wins[a.id] += 1; else wins[b.id] += 1;
    }
  }
}

const rows = G.SPECIES.map((s) => ({
  s,
  rate: (wins[s.id] / games[s.id]) * 100,
  power: powerScore(s),
  total: s.hp + s.atk + s.def + s.spd,
})).sort((x, y) => y.rate - x.rate);

console.log('\n' + '='.repeat(78));
console.log('  Per-monster win rate  (round robin, level ' + LEVEL + ', ' + RUNS + ' runs per pairing)');
console.log('='.repeat(78));
console.log('\n  ' + 'Monster'.padEnd(11) + 'Element'.padEnd(10) +
  'HP  ATK DEF SPD'.padEnd(17) + 'total'.padEnd(7) +
  'power'.padStart(7) + 'win%'.padStart(9) + '   ');
console.log('  ' + '-'.repeat(74));

for (const r of rows) {
  const { s } = r;
  const stats = `${String(s.hp).padStart(2)}  ${String(s.atk).padStart(3)} ` +
    `${String(s.def).padStart(3)} ${String(s.spd).padStart(3)}`;
  const bar = '#'.repeat(Math.round(r.rate / 4));
  console.log(
    '  ' + s.name.padEnd(11) + G.ELEMENTS[s.element].name.padEnd(10) +
    stats.padEnd(17) + String(r.total).padEnd(7) +
    r.power.toFixed(1).padStart(7) + (r.rate.toFixed(1) + '%').padStart(9) + '  ' + bar
  );
}

const rates = rows.map((r) => r.rate);
const spread = Math.max(...rates) - Math.min(...rates);
console.log('\n  Win-rate spread: ' + spread.toFixed(1) + ' points');

// ---------------------------------------------------------------------------
// Does the analytic power score explain the observed win rates?
// ---------------------------------------------------------------------------

const n = rows.length;
const mx = rows.reduce((a, r) => a + r.power, 0) / n;
const my = rows.reduce((a, r) => a + r.rate, 0) / n;
let num = 0, dx = 0, dy = 0;
for (const r of rows) {
  num += (r.power - mx) * (r.rate - my);
  dx += (r.power - mx) ** 2;
  dy += (r.rate - my) ** 2;
}
const corr = num / Math.sqrt(dx * dy);

console.log('  Correlation between HP x (DEF+C) x ATK and win rate: r = ' + corr.toFixed(3));
console.log('');
if (corr > 0.85) {
  console.log('  >> The power score predicts win rate almost perfectly. The imbalance is');
  console.log('     in the stat LINES, not in the damage constants. Equal 180-point');
  console.log('     budgets do not produce equal monsters, because SPD is nearly free');
  console.log('     while HP and DEF multiply each other.');
  console.log('');
  console.log('  >> Power score needed for a ~50% win rate: ' +
    (mx).toFixed(1) + ' (current spread: ' +
    Math.min(...rows.map(r => r.power)).toFixed(1) + ' - ' +
    Math.max(...rows.map(r => r.power)).toFixed(1) + ')');
}
console.log('');
