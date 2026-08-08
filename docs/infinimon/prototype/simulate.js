/*
 * Infinimon — balance simulation harness
 *
 *   node simulate.js [runsPerMatchup]
 *
 * Answers the questions design-v1.md flagged as unvalidated:
 *   1. Is K = 0.6 producing the intended 3-7 turn fights?
 *   2. Does fight length stay stable across the level curve?
 *   3. Is there a usable taming window between 50% HP and fainting?
 *   4. Is the element grid actually balanced in play, not just on paper?
 *   5. Do breeding outcomes match the specified rates?
 */

const G = require('./engine.js');

/*
 * Balance harnesses measure the SYMMETRIC game. The player-experience knobs
 * (reduced incoming damage, fallible wild AI) would otherwise hand a permanent
 * edge to whichever monster occupies the "player" slot and corrupt every
 * matchup number here. playtest.js is where those knobs are exercised.
 */
G.configure({ INCOMING_DAMAGE_MULT: 1, WILD_AI_ACCURACY: 1 });

const RUNS = parseInt(process.argv[2], 10) || 40;
const LEVELS = [5, 15, 25];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const pct = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const f1 = (n) => n.toFixed(1);
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);

function head(title) {
  console.log('\n' + '='.repeat(74));
  console.log('  ' + title);
  console.log('='.repeat(74));
}

/**
 * One 1v1 fight to the finish, both sides driven by the baseline AI.
 * Returns turn count, winner, and how many turns the defender spent in the
 * attunement window (alive, below 50% HP).
 */
function fight(aSpec, bSpec, level, rng) {
  const a = G.createMonster({ speciesId: aSpec.id, level, bond: 0 });
  const b = G.createMonster({ speciesId: bSpec.id, level, bond: 0 });
  const battle = G.createBattle([a], b, rng);

  let tameWindow = 0;
  let guard = 0;
  while (!battle.over && guard++ < 200) {
    const move = G.chooseMove(a, b, battle.playerFocus);
    G.resolveTurn(battle, move);
    if (b.hp > 0 && b.hp / b.maxHp < 0.5) tameWindow += 1;
  }

  return {
    turns: battle.turn,
    playerWon: battle.outcome === 'wild_fainted',
    tameWindow,
    // Did the defender ever exist below 50% while alive? If not, taming that
    // matchup is impossible — it went from above half to fainted in one blow.
    tameable: tameWindow > 0,
  };
}

// ---------------------------------------------------------------------------
// 1 + 2. Fight length across the level curve
// ---------------------------------------------------------------------------

head(`Fight length  (K = ${G.CONFIG.K}, Focus start = ${G.CONFIG.FOCUS_START}, ` +
  `${RUNS} runs per matchup, all 144 pairings)`);
console.log('\n  Target from design-v1.md §5: 2-3 turns lopsided, 5-7 even.\n');
console.log(`  ${pad('Level', 8)}${lpad('median', 8)}${lpad('mean', 8)}${lpad('p10', 7)}${lpad('p90', 7)}${lpad('min', 7)}${lpad('max', 7)}`);
console.log('  ' + '-'.repeat(52));

const byLevel = {};
for (const level of LEVELS) {
  const rng = G.makeRng(1337 + level);
  const turns = [];
  for (const a of G.SPECIES) {
    for (const b of G.SPECIES) {
      for (let i = 0; i < RUNS; i++) turns.push(fight(a, b, level, rng).turns);
    }
  }
  byLevel[level] = turns;
  console.log(
    `  ${pad(level, 8)}${lpad(pct(turns, 50), 8)}${lpad(f1(mean(turns)), 8)}` +
    `${lpad(pct(turns, 10), 7)}${lpad(pct(turns, 90), 7)}` +
    `${lpad(Math.min(...turns), 7)}${lpad(Math.max(...turns), 7)}`
  );
}

const drift = Math.abs(mean(byLevel[25]) - mean(byLevel[5]));
console.log(`\n  Mean drift L5 -> L25: ${f1(drift)} turns ` +
  `(${drift < 1.0 ? 'STABLE — proportional growth is holding' : 'DRIFTING — revisit stat growth'})`);

// ---------------------------------------------------------------------------
// 3. The taming window — the metric that decides whether §4 works at all
// ---------------------------------------------------------------------------

head('Taming window');
console.log('\n  Attune unlocks below 50% HP (§4). If a monster crosses 50% and');
console.log('  faints in the same blow, it can never be tamed. Measuring how many');
console.log('  turns exist in that window.\n');
console.log(`  ${pad('Level', 8)}${lpad('median', 9)}${lpad('mean', 8)}${lpad('impossible', 13)}`);
console.log('  ' + '-'.repeat(38));

let worstImpossible = 0;
for (const level of LEVELS) {
  const rng = G.makeRng(99 + level);
  const windows = [];
  let impossible = 0;
  let total = 0;
  for (const a of G.SPECIES) {
    for (const b of G.SPECIES) {
      for (let i = 0; i < RUNS; i++) {
        const r = fight(a, b, level, rng);
        if (!r.playerWon) continue; // only fights where the wild actually went down
        total += 1;
        windows.push(r.tameWindow);
        if (!r.tameable) impossible += 1;
      }
    }
  }
  const rate = total ? (impossible / total) * 100 : 0;
  worstImpossible = Math.max(worstImpossible, rate);
  console.log(
    `  ${pad(level, 8)}${lpad(pct(windows, 50), 9)}${lpad(f1(mean(windows)), 8)}` +
    `${lpad(f1(rate) + '%', 13)}`
  );
}
console.log(`\n  Worst-case impossible rate: ${f1(worstImpossible)}% ` +
  `(${worstImpossible < 10 ? 'ACCEPTABLE' : 'TOO HIGH — soften K or raise the Attune threshold'})`);

// ---------------------------------------------------------------------------
// 4. Element balance in play
// ---------------------------------------------------------------------------

head('Element balance  (win rate across all matchups, level 15)');
console.log('\n  The §2 grid is symmetric on paper. Stat distributions are not, so');
console.log('  this checks whether any element is quietly dominant in practice.\n');

const rngEl = G.makeRng(4242);
const wins = {}, games = {};
for (const el of G.ELEMENT_CYCLE) { wins[el] = 0; games[el] = 0; }

for (const a of G.SPECIES) {
  for (const b of G.SPECIES) {
    if (a.id === b.id) continue;
    for (let i = 0; i < RUNS; i++) {
      const r = fight(a, b, 15, rngEl);
      games[a.element] += 1;
      games[b.element] += 1;
      if (r.playerWon) wins[a.element] += 1;
      else wins[b.element] += 1;
    }
  }
}

console.log(`  ${pad('Element', 12)}${lpad('win rate', 10)}   ${'bar'}`);
console.log('  ' + '-'.repeat(46));
const rates = [];
for (const el of G.ELEMENT_CYCLE) {
  const r = (wins[el] / games[el]) * 100;
  rates.push(r);
  const bars = '#'.repeat(Math.round(r / 2.5));
  console.log(`  ${pad(G.ELEMENTS[el].name, 12)}${lpad(f1(r) + '%', 10)}   ${bars}`);
}
const spread = Math.max(...rates) - Math.min(...rates);
console.log(`\n  Spread: ${f1(spread)} points ` +
  `(${spread < 10 ? 'BALANCED' : 'SKEWED — check the outlier stat lines'})`);

// ---------------------------------------------------------------------------
// 5. Type advantage — is it decisive without being an auto-win?
// ---------------------------------------------------------------------------

head('Type advantage payoff  (level 15)');

const rngAdv = G.makeRng(777);
const buckets = { advantage: [0, 0], neutral: [0, 0], disadvantage: [0, 0] };
for (const a of G.SPECIES) {
  for (const b of G.SPECIES) {
    if (a.element === b.element) continue;
    const m = G.typeMultiplier(a.element, b.element);
    const key = m > 1 ? 'advantage' : m < 1 ? 'disadvantage' : 'neutral';
    for (let i = 0; i < RUNS; i++) {
      const r = fight(a, b, 15, rngAdv);
      buckets[key][1] += 1;
      if (r.playerWon) buckets[key][0] += 1;
    }
  }
}
console.log('');
for (const [key, [w, g]] of Object.entries(buckets)) {
  if (!g) continue;
  console.log(`  ${pad(key, 15)}${lpad(f1((w / g) * 100) + '%', 8)}  win rate`);
}
console.log('\n  Advantage should win clearly but not always — a 100% figure means');
console.log('  type choice replaces play entirely.');

// ---------------------------------------------------------------------------
// 6. Breeding rates
// ---------------------------------------------------------------------------

head('Breeding  (10,000 pairings)');

const rngBreed = G.makeRng(2024);
let blooms = 0, hybrids = 0, refined = 0;
const seenHybrids = new Set();
const childTotals = [];

for (let i = 0; i < 10000; i++) {
  const a = G.SPECIES[Math.floor(rngBreed() * G.SPECIES.length)];
  const b = G.SPECIES[Math.floor(rngBreed() * G.SPECIES.length)];
  const pa = G.createMonster({ speciesId: a.id, level: 5 });
  const pb = G.createMonster({ speciesId: b.id, level: 5 });
  const res = G.breed(pa, pb, rngBreed);
  if (res.error) continue;
  if (res.rareBloom) blooms += 1;
  if (res.kind === 'hybrid') { hybrids += 1; seenHybrids.add(res.hybridElement); }
  else refined += 1;
  const c = res.child.bases;
  childTotals.push(c.hp + c.atk + c.def + c.spd);
}

console.log(`\n  Hybrid pairings       ${hybrids}`);
console.log(`  Same-element pairings ${refined}`);
console.log(`  Rare Blooms           ${blooms}  (${f1((blooms / (hybrids + refined)) * 100)}% — spec is 5%)`);
console.log(`  Distinct hybrids seen ${seenHybrids.size} / 15  ` +
  `(${seenHybrids.size === 15 ? 'ALL REACHABLE' : 'MISSING: ' +
    Object.values(G.HYBRID_NAMES).filter((n) => !seenHybrids.has(n)).join(', ')})`);
const parentTotals = G.SPECIES.map((s) => s.hp + s.atk + s.def + s.spd);
console.log(`\n  Offspring base stat total: median ${pct(childTotals, 50)}, ` +
  `p10 ${pct(childTotals, 10)}, p90 ${pct(childTotals, 90)}`);
console.log(`  (Parent totals range ${Math.min(...parentTotals)}-${Math.max(...parentTotals)}; ` +
  `offspring should sit inside that band,`);
console.log(`   drifting up slightly from the 25% better-parent inheritance roll.)`);

// ---------------------------------------------------------------------------
// 7. Sanity check on the element grid itself
// ---------------------------------------------------------------------------

head('Element grid integrity');

let gridOk = true;
for (const a of G.ELEMENT_CYCLE) {
  let strong = 0, weak = 0, neutral = 0;
  for (const b of G.ELEMENT_CYCLE) {
    const m = G.typeMultiplier(a, b);
    if (m > 1) strong += 1; else if (m < 1) weak += 1; else neutral += 1;
    // reciprocity: if a is strong into b, b must be weak into a
    const back = G.typeMultiplier(b, a);
    if (m > 1 && back >= 1) gridOk = false;
    if (m < 1 && back <= 1) gridOk = false;
  }
  if (strong !== 2 || weak !== 2 || neutral !== 2) gridOk = false;
  console.log(`  ${pad(G.ELEMENTS[a].name, 10)} strong:${strong}  weak:${weak}  neutral:${neutral}`);
}
console.log(`\n  ${gridOk ? 'PASS — every element has 2 strengths, 2 weaknesses, and is fully reciprocal.'
  : 'FAIL — the grid is not symmetric.'}`);

console.log('');
