/*
 * Infinimon — signature move audit and solver
 *
 *   node moves.js         audit which archetypes are winning and why
 *   node moves.js solve   tune each effect's magnitude toward parity
 *
 * Each creature has one signature move keyed to its body archetype (§5). Adding
 * them skewed the roster badly: a 50.9-point win-rate spread with `slow`
 * archetypes on top (Burrowl 78%) and `drain` archetypes at the bottom
 * (Finwhisk 27%).
 *
 * The cause was a knock-on from an earlier fix. SPD had been given real value
 * through glancing blows and Focus surge, so a move that CUTS enemy SPD now
 * pays twice — and nothing accounted for that. Drain, meanwhile, cost 2 Focus
 * for a weak hit.
 *
 * Rather than hand-guess magnitudes, this scales each effect toward a 50% group
 * win rate, the same method autobalance.js uses for stat lines.
 */

const G = require('./engine.js');

G.configure({ INCOMING_DAMAGE_MULT: 1, WILD_AI_ACCURACY: 1 });

const LEVEL = 14;
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

const archetypeOf = {};
for (const s of G.SPECIES) archetypeOf[s.id] = s.archetype;

const effectOf = (arche) => (G.SIGNATURES[arche] || {}).effect || 'none';

/** Round robin across the whole roster; returns win rate per species id. */
function roundRobin(runs, seed) {
  const rng = G.makeRng(seed);
  const wins = {}, games = {};
  for (const s of G.SPECIES) { wins[s.id] = 0; games[s.id] = 0; }

  for (const a of G.SPECIES) {
    for (const b of G.SPECIES) {
      if (a.id === b.id) continue;
      for (let k = 0; k < runs; k++) {
        const A = G.createMonster({ speciesId: a.id, level: LEVEL, bond: 0 });
        const B = G.createMonster({ speciesId: b.id, level: LEVEL, bond: 0 });
        const bt = G.createBattle([A], B, rng);
        let guard = 0;
        while (!bt.over && guard++ < 300) {
          G.resolveTurn(bt, G.chooseMove(A, B, bt.playerFocus));
        }
        games[a.id] += 1; games[b.id] += 1;
        // A stalemate counts for neither side.
        if (bt.outcome === 'wild_fainted') wins[a.id] += 1;
        else if (bt.outcome === 'player_wiped') wins[b.id] += 1;
      }
    }
  }
  const rates = {};
  for (const s of G.SPECIES) rates[s.id] = (wins[s.id] / games[s.id]) * 100;
  return rates;
}

/** Average win rate for every creature sharing an effect. */
function byEffect(rates) {
  const groups = {};
  for (const s of G.SPECIES) {
    const e = effectOf(s.archetype);
    (groups[e] = groups[e] || []).push(rates[s.id]);
  }
  const out = {};
  for (const [e, arr] of Object.entries(groups)) out[e] = mean(arr);
  return out;
}

// ---------------------------------------------------------------------------

if (process.argv[2] === 'solve') {
  const ITER = 14;
  const RUNS = 8;
  const RATE = 0.55;

  console.log('\nTuning signature effect magnitudes toward parity...\n');
  console.log('  iter   spread   ' + Object.keys(byEffect(roundRobin(1, 1))).join('  '));
  console.log('  ' + '-'.repeat(66));

  let bestSpread = Infinity, bestSnapshot = null;

  for (let it = 0; it < ITER; it++) {
    const rates = roundRobin(RUNS, 6000 + it);
    const groups = byEffect(rates);
    const vals = Object.values(rates);
    const spread = Math.max(...vals) - Math.min(...vals);

    if (spread < bestSpread) {
      bestSpread = spread;
      bestSnapshot = JSON.parse(JSON.stringify(G.SIGNATURES));
    }

    console.log('  ' + lpad(it + 1, 4) + '   ' + lpad(spread.toFixed(1), 6) + '   ' +
      Object.values(groups).map((v) => v.toFixed(0) + '%').join('   ') +
      (spread === bestSpread ? '  <- best' : ''));

    if (it === ITER - 1) break;

    // Weaken groups above 50%, strengthen those below.
    for (const [arche, sig] of Object.entries(G.SIGNATURES)) {
      const e = sig.effect;
      const groupRate = groups[e];
      if (groupRate == null) continue;
      const adj = 1 + (0.5 - groupRate / 100) * RATE;

      if (typeof sig.amount === 'number') {
        sig.amount = Math.max(0.08, Math.min(0.75, sig.amount * adj));
      }
      if (sig.power > 0) {
        sig.power = Math.max(14, Math.min(48, Math.round(sig.power * adj)));
      }
    }
  }

  Object.assign(G.SIGNATURES, bestSnapshot);

  console.log('\n' + '='.repeat(70));
  console.log('  SOLVED  (spread ' + bestSpread.toFixed(1) + ' points)');
  console.log('='.repeat(70) + '\n');
  console.log('  Paste into engine.js SIGNATURES:\n');
  for (const [arche, s] of Object.entries(G.SIGNATURES)) {
    const parts = [
      "name: '" + s.name + "',",
      'power: ' + s.power + ',',
      'focus: ' + s.focus + ',',
      "effect: '" + s.effect + "',",
    ];
    if (typeof s.amount === 'number') parts.push('amount: ' + s.amount.toFixed(2) + ',');
    if (s.turns) parts.push('turns: ' + s.turns + ',');
    console.log('    ' + pad(arche + ':', 10) + ' { ' + parts.join(' ') + ' },');
  }
  console.log('');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Audit mode
// ---------------------------------------------------------------------------

const rates = roundRobin(30, 31415);

console.log('\n' + '='.repeat(72));
console.log('  Signature moves by archetype  (round robin, level ' + LEVEL + ')');
console.log('='.repeat(72) + '\n');
console.log('  ' + pad('Creature', 12) + pad('Archetype', 11) + pad('Move', 15) +
  pad('Effect', 9) + 'win%');
console.log('  ' + '-'.repeat(66));

const rows = G.SPECIES.map((s) => ({
  s, sig: G.SIGNATURES[s.archetype], rate: rates[s.id],
})).sort((a, b) => b.rate - a.rate);

for (const r of rows) {
  console.log('  ' + pad(r.s.name, 12) + pad(r.s.archetype, 11) +
    pad(r.sig ? r.sig.name : '—', 15) + pad(r.sig ? r.sig.effect : '—', 9) +
    r.rate.toFixed(1) + '%');
}

const vals = Object.values(rates);
console.log('\n  Spread: ' + (Math.max(...vals) - Math.min(...vals)).toFixed(1) + ' points');

console.log('\n  By effect:');
const groups = byEffect(rates);
for (const [e, v] of Object.entries(groups).sort((a, b) => b[1] - a[1])) {
  console.log('    ' + pad(e, 9) + lpad(v.toFixed(1) + '%', 7) +
    '  ' + '#'.repeat(Math.round(v / 3)));
}
console.log('');
