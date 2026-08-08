/*
 * Infinimon — player experience simulation
 *
 *   node playtest.js [sessions]
 *
 * simulate.js measures equal-level 1v1 with both sides played optimally. That
 * is the right harness for BALANCE but the wrong one for DIFFICULTY, and the
 * gap between them is exactly what playtesting exposed: a real player carries
 * damage between fights, starts with one monster rather than three, and faces
 * an AI that never misplays.
 *
 * This models the actual loop instead — a fresh save, one starter, repeated
 * encounters with healing, XP, and taming attempts — and reports whether it
 * feels survivable.
 */

const G = require('./engine.js');

const SESSIONS = parseInt(process.argv[2], 10) || 400;
const ENCOUNTERS = 12;   // per session
const TAP_SKILL = 0.55;  // probability a casual player lands any given tap

const f1 = (n) => n.toFixed(1);
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
const pct = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

function healParty(team, fraction) {
  team.forEach((m) => {
    m.status = null;
    m.hp = Math.min(m.maxHp, Math.max(m.hp, 0) + Math.round(m.maxHp * fraction));
    if (m.hp <= 0) m.hp = Math.round(m.maxHp * fraction);
  });
}

/** One full session: start with a random starter, run N encounters. */
function session(rng) {
  const starters = ['wickle', 'puddlup', 'sproutle'];
  const starter = starters[Math.floor(rng() * starters.length)];
  const team = [G.createMonster({ speciesId: starter, level: 5, bond: 40 })];
  const banked = {};
  const crystals = { spark: 2, tide: 2, ember: 2, verdant: 2, terra: 2, gale: 2 };

  let wipes = 0, tames = 0, attempts = 0, killedByAccident = 0;
  const hpLeft = [];

  for (let e = 0; e < ENCOUNTERS; e++) {
    const party = team.filter((m) => m.hp > 0).slice(0, 3);
    if (!party.length) { healParty(team, 1); continue; }

    const best = Math.max(...party.map((m) => m.level));
    const wild = G.randomWild(rng, Math.max(3, best - 1 + Math.floor(rng() * 2)));
    const battle = G.createBattle(party, wild, rng);

    let guard = 0;
    let tamed = false;
    let fled = false;
    let fails = 0;

    while (!battle.over && guard++ < 200) {
      const me = G.activeMonster(battle);

      // A player attunes as soon as it is available — that is the whole point.
      if (G.canAttune(wild)) {
        attempts += 1;
        const useCrystal = crystals[wild.elements[0]] > 0;
        if (useCrystal) crystals[wild.elements[0]] -= 1;

        let taps = 0;
        for (let t = 0; t < 3; t++) if (rng() < TAP_SKILL) taps += 1;

        const res = G.attune(wild, {
          taps,
          crystalMatch: useCrystal,
          banked: banked[wild.speciesId] || 0,
        });
        banked[wild.speciesId] = res.newBanked;

        if (res.success) {
          tamed = true; tames += 1;
          wild.hp = wild.maxHp;
          team.push(wild);
          break;
        }
        fails += 1;
        if (rng() < G.fleeChanceAfterFailure(fails)) { fled = true; break; }
        // Otherwise the attempt costs the turn but keeps the encounter alive.
        G.resolveTurn(battle, null);
        continue;
      }

      G.resolveTurn(battle, G.chooseMove(me, wild, battle.playerFocus));
    }

    if (!tamed && !fled) {
      if (battle.outcome === 'player_wiped') wipes += 1;
      else if (battle.outcome === 'wild_fainted') killedByAccident += 1;
    }

    const alive = team.filter((m) => m.hp > 0);
    if (alive.length) hpLeft.push(mean(alive.map((m) => (m.hp / m.maxHp) * 100)));

    team.forEach((m) => { if (m.hp > 0) G.grantXp(m, G.xpForWin(m.level, wild.level)); });
    healParty(team, battle.outcome === 'player_wiped' ? 1 : G.CONFIG.POST_BATTLE_HEAL);
  }

  return {
    wipes, tames, attempts, killedByAccident,
    teamSize: team.length,
    topLevel: Math.max(...team.map((m) => m.level)),
    hpLeft: mean(hpLeft),
  };
}

// ---------------------------------------------------------------------------

const rng = G.makeRng(8675309);
const runs = [];
for (let i = 0; i < SESSIONS; i++) runs.push(session(rng));

console.log('\n' + '='.repeat(74));
console.log(`  Player experience  (${SESSIONS} sessions x ${ENCOUNTERS} encounters, ` +
  `tap skill ${Math.round(TAP_SKILL * 100)}%)`);
console.log('='.repeat(74));
console.log('\n  Simulates a fresh save: one starter, no party, real healing and XP.\n');

const wipes = runs.map((r) => r.wipes);
const tames = runs.map((r) => r.tames);
const teamSizes = runs.map((r) => r.teamSize);
const levels = runs.map((r) => r.topLevel);
const hp = runs.map((r) => r.hpLeft);
const tameRate = mean(runs.map((r) => (r.attempts ? r.tames / r.attempts : 0))) * 100;
const accidental = mean(runs.map((r) => r.killedByAccident));

const line = (label, val, note) =>
  console.log(`  ${pad(label, 30)}${lpad(val, 10)}   ${note || ''}`);

line('Party wipes per session', f1(mean(wipes)), mean(wipes) < 2 ? 'ok' : 'TOO PUNISHING');
line('Creatures tamed per session', f1(mean(tames)), mean(tames) >= 3 ? 'ok' : 'TOO FEW');
line('Attunement success rate', f1(tameRate) + '%', tameRate > 50 ? 'ok' : 'TOO HARD');
line('Accidental knockouts', f1(accidental), accidental < 3 ? 'ok' : 'window too narrow');
line('Team size after 12 fights', f1(mean(teamSizes)));
line('Top level after 12 fights', f1(mean(levels)));
line('Avg party HP entering a fight', f1(mean(hp)) + '%', mean(hp) > 55 ? 'ok' : 'attrition too steep');

console.log('\n  Distribution of wipes per session:');
console.log(`    p10 ${pct(wipes, 10)}   median ${pct(wipes, 50)}   p90 ${pct(wipes, 90)}`);
console.log('  Distribution of tames per session:');
console.log(`    p10 ${pct(tames, 10)}   median ${pct(tames, 50)}   p90 ${pct(tames, 90)}`);

// ---------------------------------------------------------------------------
// Taming difficulty across skill levels — a child taps worse than an adult.
// ---------------------------------------------------------------------------

console.log('\n' + '='.repeat(74));
console.log('  Attunement success by player skill');
console.log('='.repeat(74));
console.log('\n  Chance of taming on a single attempt, no crystal, no banked Trust.\n');
console.log(`  ${pad('tap accuracy', 16)}${lpad('common', 10)}${lpad('uncommon', 11)}${lpad('rare', 8)}`);
console.log('  ' + '-'.repeat(44));

for (const skill of [0.35, 0.5, 0.65, 0.8]) {
  const out = [];
  for (const rarity of ['common', 'uncommon', 'rare']) {
    const sp = G.SPECIES.find((s) => s.rarity === rarity);
    let ok = 0;
    const N = 4000;
    for (let i = 0; i < N; i++) {
      const w = G.createMonster({ speciesId: sp.id, level: 8 });
      w.hp = Math.round(w.maxHp * 0.4);
      let taps = 0;
      for (let t = 0; t < 3; t++) if (rng() < skill) taps += 1;
      if (G.attune(w, { taps, crystalMatch: false, banked: 0 }).success) ok += 1;
    }
    out.push(((ok / N) * 100).toFixed(0) + '%');
  }
  console.log(`  ${pad(Math.round(skill * 100) + '%', 16)}` +
    `${lpad(out[0], 10)}${lpad(out[1], 11)}${lpad(out[2], 8)}`);
}

console.log('\n  A crystal adds +1 Trust, weakening below 25% HP adds +1, and every');
console.log('  failed attempt banks +1 for the next try (max +3) — so the practical');
console.log('  odds are well above the table, and rise every time you fall short.');
console.log('');
