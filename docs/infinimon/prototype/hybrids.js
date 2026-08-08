/*
 * Infinimon — hybrid species audit
 *
 *   node hybrids.js
 *
 * Each hybrid element carries a stat bias so it has character of its own rather
 * than being the mean of whichever two parents made it. The bias is supposed to
 * REDISTRIBUTE, not strengthen — this checks that it does.
 *
 * Answers:
 *   1. Are the 15 hybrids visibly different from each other in stat shape?
 *   2. Are they nonetheless balanced against each other?
 *   3. Is breeding actually a reward — do hybrids beat their own parents?
 *   4. Does the same pairing always produce the same species, either order?
 */

const G = require('./engine.js');

G.configure({ INCOMING_DAMAGE_MULT: 1, WILD_AI_ACCURACY: 1 });

const RUNS = 50;
const LEVEL = 15;

const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// A representative parent pair for each element, so every hybrid is built from
// a comparable starting point.
const REP = {
  spark: 'bolthorn', tide: 'puddlup', ember: 'coalpaw',
  verdant: 'sproutle', terra: 'burrowl', gale: 'ruffle',
};

const rng = G.makeRng(90210);

function buildHybrid(elA, elB, seedRng) {
  const a = G.createMonster({ speciesId: REP[elA], level: 5 });
  const b = G.createMonster({ speciesId: REP[elB], level: 5 });
  return G.breed(a, b, seedRng || rng);
}

const ALL_PAIRS = [];
for (let i = 0; i < G.ELEMENT_CYCLE.length; i++) {
  for (let j = i + 1; j < G.ELEMENT_CYCLE.length; j++) {
    ALL_PAIRS.push([G.ELEMENT_CYCLE[i], G.ELEMENT_CYCLE[j]]);
  }
}

function duel(mA, mB, r) {
  const a = G.createMonster({ elements: mA.elements, bases: mA.bases, name: mA.name, level: LEVEL });
  const b = G.createMonster({ elements: mB.elements, bases: mB.bases, name: mB.name, level: LEVEL });
  const battle = G.createBattle([a], b, r);
  let guard = 0;
  while (!battle.over && guard++ < 300) {
    G.resolveTurn(battle, G.chooseMove(a, b, battle.playerFocus));
  }
  return battle.outcome === 'wild_fainted';
}

/** Win-rate spread across the 15 hybrids at the current config. */
function hybridSpread(runs, seed) {
  const r = G.makeRng(seed);
  const roster = ALL_PAIRS.map(([a, b]) => buildHybrid(a, b, r).child);
  const w = {}, g = {};
  roster.forEach((m) => { w[m.name] = 0; g[m.name] = 0; });
  for (let i = 0; i < roster.length; i++) {
    for (let j = 0; j < roster.length; j++) {
      if (i === j) continue;
      for (let k = 0; k < runs; k++) {
        const aWon = duel(roster[i], roster[j], r);
        g[roster[i].name] += 1; g[roster[j].name] += 1;
        if (aWon) w[roster[i].name] += 1; else w[roster[j].name] += 1;
      }
    }
  }
  const rates = roster.map((m) => (w[m.name] / g[m.name]) * 100);
  return { spread: Math.max(...rates) - Math.min(...rates), rates, roster };
}

// ---------------------------------------------------------------------------
// Sweep mode: find the SPD power weight that flattens the hybrid round robin.
// ---------------------------------------------------------------------------

if (process.argv[2] === 'sweep') {
  console.log('\nSweeping SPD_POWER_WEIGHT against hybrid win-rate spread...\n');
  console.log('  weight    spread   worst / best');
  console.log('  ' + '-'.repeat(52));
  const results = [];
  for (const wgt of [0.000, 0.010, 0.020, 0.030, 0.040, 0.050, 0.060, 0.070]) {
    G.configure({ SPD_POWER_WEIGHT: wgt });
    const { spread, rates, roster } = hybridSpread(20, 4242);
    const lo = roster[rates.indexOf(Math.min(...rates))].name;
    const hi = roster[rates.indexOf(Math.max(...rates))].name;
    results.push({ wgt, spread });
    console.log('  ' + String(wgt.toFixed(3)).padEnd(10) +
      (spread.toFixed(1) + '%').padStart(7) + '   ' +
      `${lo} ${Math.min(...rates).toFixed(0)}% / ${hi} ${Math.max(...rates).toFixed(0)}%`);
  }
  results.sort((a, b) => a.spread - b.spread);
  console.log(`\n  BEST: SPD_POWER_WEIGHT = ${results[0].wgt.toFixed(3)} ` +
    `(spread ${results[0].spread.toFixed(1)} points)\n`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Solve mode: per-hybrid power multipliers.
//
// Flattening the type grid entirely still left a ~53 point spread, which rules
// out matchups and points at the stat lines: equal power does not mean equal
// strength, because extreme shapes underperform what the power product
// predicts. Same finding as the 180-point stat budget in §7, one level up.
//
// So each hybrid gets its own power target, descended on measured win rate.
// Biases stay fixed — they are the creature's character.
// ---------------------------------------------------------------------------

if (process.argv[2] === 'solve') {
  const ITER = 26;
  const RUNS_PER = 14;
  const RATE = 0.35;

  console.log('\nSolving per-hybrid power multipliers...\n');
  console.log('  iter   spread   worst                best');
  console.log('  ' + '-'.repeat(58));

  let bestSpread = Infinity, bestMults = null, bestRates = null, bestRoster = null;

  for (let it = 0; it < ITER; it++) {
    const { spread, rates, roster } = hybridSpread(RUNS_PER, 7000 + it);

    if (spread < bestSpread) {
      bestSpread = spread;
      bestRates = rates.slice();
      bestRoster = roster.map((m) => m.name);
      bestMults = {};
      for (const k of Object.keys(G.HYBRID_PROFILES)) {
        bestMults[k] = G.HYBRID_PROFILES[k].powerMult;
      }
    }

    const lo = roster[rates.indexOf(Math.min(...rates))].name;
    const hi = roster[rates.indexOf(Math.max(...rates))].name;
    console.log('  ' + String(it + 1).padStart(4) + '   ' +
      (spread.toFixed(1) + '%').padStart(6) + '   ' +
      pad(`${lo} ${Math.min(...rates).toFixed(0)}%`, 20) + ' ' +
      `${hi} ${Math.max(...rates).toFixed(0)}%` +
      (spread === bestSpread ? '   <- best' : ''));

    if (it === ITER - 1) break;

    // Descend. Roster order matches ALL_PAIRS order, so map back to elements.
    ALL_PAIRS.forEach(([ea, eb], idx) => {
      const key = G.hybridName(ea, eb);
      const p = G.HYBRID_PROFILES[key];
      const delta = (0.5 - rates[idx] / 100) * RATE;
      p.powerMult = Math.max(0.55, Math.min(1.8, p.powerMult * (1 + delta)));
    });
  }

  for (const k of Object.keys(bestMults)) G.HYBRID_PROFILES[k].powerMult = bestMults[k];

  console.log('\n' + '='.repeat(70));
  console.log('  SOLVED  (spread ' + bestSpread.toFixed(1) + ' points)');
  console.log('='.repeat(70) + '\n');
  bestRoster.forEach((n, i) => {
    console.log('  ' + pad(n, 13) + lpad(bestRates[i].toFixed(1) + '%', 7));
  });

  console.log('\n  Paste into engine.js HYBRID_PROFILES:\n');
  for (const [ea, eb] of ALL_PAIRS) {
    const key = G.hybridName(ea, eb);
    console.log('    ' + pad(key + ':', 11) + ' powerMult: ' +
      G.HYBRID_PROFILES[key].powerMult.toFixed(2));
  }
  console.log('');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 1. Stat shapes
// ---------------------------------------------------------------------------

const pairs = [];
for (let i = 0; i < G.ELEMENT_CYCLE.length; i++) {
  for (let j = i + 1; j < G.ELEMENT_CYCLE.length; j++) {
    pairs.push([G.ELEMENT_CYCLE[i], G.ELEMENT_CYCLE[j]]);
  }
}

console.log('\n' + '='.repeat(78));
console.log('  The 15 hybrids  (averaged over 200 breeds from representative parents)');
console.log('='.repeat(78));
console.log('\n  ' + pad('Element', 10) + pad('Name', 12) +
  lpad('HP', 5) + lpad('ATK', 5) + lpad('DEF', 5) + lpad('SPD', 5) +
  lpad('total', 8) + lpad('power', 8) + '   shape');
console.log('  ' + '-'.repeat(74));

const built = [];
for (const [ea, eb] of pairs) {
  const name = G.hybridName(ea, eb);
  const samples = [];
  for (let i = 0; i < 200; i++) samples.push(buildHybrid(ea, eb).child);

  const avg = {
    hp: mean(samples.map((m) => m.bases.hp)),
    atk: mean(samples.map((m) => m.bases.atk)),
    def: mean(samples.map((m) => m.bases.def)),
    spd: mean(samples.map((m) => m.bases.spd)),
  };
  const total = avg.hp + avg.atk + avg.def + avg.spd;
  const power = G.powerOf(avg) / 100000;

  // Describe the shape by whichever stats sit furthest from the group mean.
  built.push({ name, ea, eb, avg, total, power, species: G.HYBRID_PROFILES[name].name });
}

const groupMean = {
  hp: mean(built.map((b) => b.avg.hp)),
  atk: mean(built.map((b) => b.avg.atk)),
  def: mean(built.map((b) => b.avg.def)),
  spd: mean(built.map((b) => b.avg.spd)),
};

for (const b of built) {
  const dev = ['hp', 'atk', 'def', 'spd']
    .map((k) => ({ k, d: (b.avg[k] - groupMean[k]) / groupMean[k] }))
    .sort((x, y) => Math.abs(y.d) - Math.abs(x.d))
    .slice(0, 2)
    .map((x) => (x.d > 0 ? '+' : '') + Math.round(x.d * 100) + '% ' + x.k.toUpperCase())
    .join(', ');

  console.log('  ' + pad(b.name, 10) + pad(b.species, 12) +
    lpad(Math.round(b.avg.hp), 5) + lpad(Math.round(b.avg.atk), 5) +
    lpad(Math.round(b.avg.def), 5) + lpad(Math.round(b.avg.spd), 5) +
    lpad(Math.round(b.total), 8) + lpad(b.power.toFixed(1), 8) + '   ' + dev);
}

const totals = built.map((b) => b.total);
const powers = built.map((b) => b.power);
console.log(`\n  Stat totals  ${Math.round(Math.min(...totals))} - ${Math.round(Math.max(...totals))}` +
  '   (unequal by design — SPD-heavy lines need a bigger budget)');
console.log(`  Power scores ${Math.min(...powers).toFixed(1)} - ${Math.max(...powers).toFixed(1)}` +
  `   (spread ${(((Math.max(...powers) - Math.min(...powers)) / mean(powers)) * 100).toFixed(1)}%` +
  ` — this is what must stay tight)`);

// ---------------------------------------------------------------------------
// 2. Are they balanced against each other?
// ---------------------------------------------------------------------------

function fight(mA, mB, r) {
  const a = G.createMonster({ elements: mA.elements, bases: mA.bases, name: mA.name, level: LEVEL });
  const b = G.createMonster({ elements: mB.elements, bases: mB.bases, name: mB.name, level: LEVEL });
  const battle = G.createBattle([a], b, r);
  let guard = 0;
  while (!battle.over && guard++ < 300) {
    G.resolveTurn(battle, G.chooseMove(a, b, battle.playerFocus));
  }
  return battle.outcome === 'wild_fainted';
}

console.log('\n' + '='.repeat(78));
console.log('  Hybrid vs hybrid  (round robin, level ' + LEVEL + ')');
console.log('='.repeat(78) + '\n');

const roster = built.map((b) => buildHybrid(b.ea, b.eb).child);
const wins = {}, games = {};
roster.forEach((m) => { wins[m.name] = 0; games[m.name] = 0; });

for (let i = 0; i < roster.length; i++) {
  for (let j = 0; j < roster.length; j++) {
    if (i === j) continue;
    for (let k = 0; k < RUNS; k++) {
      const aWon = fight(roster[i], roster[j], rng);
      games[roster[i].name] += 1; games[roster[j].name] += 1;
      if (aWon) wins[roster[i].name] += 1; else wins[roster[j].name] += 1;
    }
  }
}

const rates = roster.map((m) => ({ name: m.name, r: (wins[m.name] / games[m.name]) * 100 }))
  .sort((a, b) => b.r - a.r);
for (const r of rates) {
  console.log('  ' + pad(r.name, 13) + lpad(r.r.toFixed(1) + '%', 7) + '  ' + '#'.repeat(Math.round(r.r / 4)));
}
const spread = rates[0].r - rates[rates.length - 1].r;
// Seed noise on a 15-way dual-element round robin runs about +/- 5 points, so
// treat anything under 25 as converged rather than chasing a single lucky seed.
console.log(`\n  Spread: ${spread.toFixed(1)} points  ` +
  `(${spread < 25 ? 'ACCEPTABLE — nobody dominant, nobody unplayable'
    : 'TOO WIDE — re-run `node hybrids.js solve`'})`);
console.log('  Was 71.9 before per-hybrid power multipliers were solved.');

// ---------------------------------------------------------------------------
// 3. Is breeding worth doing?
// ---------------------------------------------------------------------------

console.log('\n' + '='.repeat(78));
console.log('  Is breeding a reward?  (hybrid vs its own two parents)');
console.log('='.repeat(78) + '\n');

let hybridWins = 0, hybridGames = 0;
for (const [ea, eb] of pairs) {
  for (let k = 0; k < 40; k++) {
    const res = buildHybrid(ea, eb);
    for (const parentEl of [ea, eb]) {
      const p = G.createMonster({ speciesId: REP[parentEl], level: LEVEL });
      hybridGames += 1;
      if (fight(res.child, p, rng)) hybridWins += 1;
    }
  }
}
const rate = (hybridWins / hybridGames) * 100;
console.log(`  Hybrid beats a parent: ${rate.toFixed(1)}% of the time`);
console.log(`  ${rate > 55 && rate < 75 ? 'GOOD — a real upgrade without invalidating the base roster'
  : rate <= 55 ? 'TOO WEAK — breeding does not feel worth the Catalyst'
  : 'TOO STRONG — base monsters become disposable'}`);

// ---------------------------------------------------------------------------
// 4. Determinism
// ---------------------------------------------------------------------------

console.log('\n' + '='.repeat(78));
console.log('  Species determinism');
console.log('='.repeat(78) + '\n');

let ok = true;
for (const [ea, eb] of pairs) {
  const r1 = G.breed(
    G.createMonster({ speciesId: REP[ea], level: 5 }),
    G.createMonster({ speciesId: REP[eb], level: 5 }), G.makeRng(1));
  const r2 = G.breed(
    G.createMonster({ speciesId: REP[eb], level: 5 }),
    G.createMonster({ speciesId: REP[ea], level: 5 }), G.makeRng(1));

  const sameName = r1.child.name === r2.child.name;
  const sameEls = r1.child.elements.join() === r2.child.elements.join();
  const sameMoves = r1.child.moves.map((m) => m.name).join() ===
                    r2.child.moves.map((m) => m.name).join();
  if (!sameName || !sameEls || !sameMoves) {
    ok = false;
    console.log(`  FAIL ${ea}+${eb}: name=${sameName} elements=${sameEls} moves=${sameMoves}`);
  }
}
console.log(ok
  ? '  PASS — every pairing yields the same species, element order, and move set\n' +
    '         regardless of which parent was selected first.'
  : '  FAIL — pairing order still affects the offspring.');
console.log('');
