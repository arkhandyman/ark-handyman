/*
 * Infinimon — prototype rules engine
 *
 * Pure rules, no rendering, no dependencies. Runs in both Node and the browser
 * so the simulation harness and the playable prototype share one source of truth.
 *
 * Implements design-v1.md sections 2, 3, 5, 6, 7.
 * All names are placeholders — see naming.md.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Infinimon = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Tuning constants (§5, §7)
  // ---------------------------------------------------------------------------

  // Mutable so the tuning harness can sweep them. Defaults are the values
  // design-v1.md currently specifies; tune.js is what justifies changing them.
  const CONFIG = {
    // Values chosen by tune.js, which swept 60 combinations and scored each on
    // fight length, taming feasibility, and element balance. K was 0.6 in the
    // original design, which produced 2-turn fights and made ~25% of wild
    // monsters impossible to tame.
    K: 0.30,                  // global damage constant — the primary tuning knob
    DEF_CONSTANT: 70,         // softens the ATK/DEF ratio
    LEVEL_TERM_DIVISOR: 40,   // damage level term: 1 + Level/40
    STAT_GROWTH_DIVISOR: 20,  // stat growth: base * (1 + Level/20)
    FOCUS_START: 3,           // starting Focus — affords one Strong move up front
    FOCUS_MAX: 6,
    FOCUS_REGEN: 1,

    /*
     * Player-experience knobs. The balance sims measure equal-level 1v1 with
     * both sides played optimally — which is NOT what a player faces. A real
     * player carries damage between fights, may be under-levelled, and is up
     * against an AI that never misplays. These close that gap.
     */
    WILD_AI_ACCURACY: 0.5,      // chance a wild picks its best move vs. a random one
    INCOMING_DAMAGE_MULT: 0.7,  // damage dealt TO the player's monsters
    POST_BATTLE_HEAL: 0.5,      // fraction of max HP restored after every encounter

    /*
     * A creature's patience. Letting a failed attunement keep the encounter
     * alive removed the feel-bad, but with banked Trust it also made taming
     * eventually guaranteed — 12 tames from 12 encounters, no stakes at all.
     * Each failure now risks it bolting, which caps retries at two or three
     * without ever wasting the Trust you earned.
     */
    FLEE_BASE: 0.28,            // flee chance after the first failed attempt
    FLEE_STEP: 0.22,            // added per subsequent failure

    // SPD used to decide turn order and nothing else, which made it nearly
    // worthless — balance.js measured r = 0.987 between HP x (DEF+C) x ATK and
    // win rate, with fast monsters at the bottom. These give SPD real value.
    GLANCE_DIVISOR: 120,      // SPD lead needed per point of glance chance
    GLANCE_CAP: 0.40,         // max chance an incoming hit glances
    GLANCE_DAMAGE: 0.5,       // a glancing blow deals half damage
    FOCUS_SURGE_RATIO: 1.5,   // outspeed by this much and you regen Focus faster
  };

  function configure(patch) {
    Object.assign(CONFIG, patch);
  }

  const MAX_LEVEL = 25;
  const BOND_BONUS_THRESHOLD = 60;
  const BOND_BONUS = 1.05;
  const RARE_BLOOM_CHANCE = 0.05;
  const RARE_BLOOM_MULT = 1.10;

  // ---------------------------------------------------------------------------
  // Seedable RNG — simulations must be reproducible
  // ---------------------------------------------------------------------------

  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return function rng() {
      // mulberry32
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const range = (rng, lo, hi) => lo + rng() * (hi - lo);

  // ---------------------------------------------------------------------------
  // Elements (§2)
  //
  // Cycle order. Each element is strong against the next two, weak against the
  // previous two, and neutral against its opposite (three steps away).
  // ---------------------------------------------------------------------------

  const ELEMENT_CYCLE = ['spark', 'tide', 'ember', 'verdant', 'terra', 'gale'];

  const ELEMENTS = {
    spark:   { name: 'Spark',   color: '#F5D547', dark: '#8A7410' },
    tide:    { name: 'Tide',    color: '#4EA8DE', dark: '#1B4F72' },
    ember:   { name: 'Ember',   color: '#F2704A', dark: '#8A2E12' },
    verdant: { name: 'Verdant', color: '#6FCF7F', dark: '#1E5B2A' },
    terra:   { name: 'Terra',   color: '#C89B6A', dark: '#6B4A24' },
    gale:    { name: 'Gale',    color: '#B9C7D6', dark: '#4A5A6B' },
  };

  const STRONG = 1.5;
  const NEUTRAL = 1.0;
  const WEAK = 0.75;

  /** Multiplier for a single attacking element into a single defending element. */
  function typeMultiplier(attackEl, defendEl) {
    const i = ELEMENT_CYCLE.indexOf(attackEl);
    const j = ELEMENT_CYCLE.indexOf(defendEl);
    if (i < 0 || j < 0) return NEUTRAL;
    const delta = (j - i + 6) % 6;
    if (delta === 1 || delta === 2) return STRONG; // beats the next two
    if (delta === 4 || delta === 5) return WEAK;   // loses to the previous two
    return NEUTRAL;                                // self, and the opposite
  }

  /**
   * Defensive multiplier. Hybrids average their two elements, which is what
   * makes them resilient rather than immune (§2).
   */
  function defenseMultiplier(attackEl, defenderElements) {
    const mults = defenderElements.map((e) => typeMultiplier(attackEl, e));
    const avg = mults.reduce((a, b) => a + b, 0) / mults.length;
    return Math.round(avg * 100) / 100;
  }

  /** The element three steps away — it beats both of your weaknesses (§ coverage). */
  function oppositeElement(el) {
    return ELEMENT_CYCLE[(ELEMENT_CYCLE.indexOf(el) + 3) % 6];
  }

  // ---------------------------------------------------------------------------
  // Hybrid elements (§2) — 15 pairings
  // ---------------------------------------------------------------------------

  const HYBRID_NAMES = {
    'spark|tide': 'Current',
    'ember|spark': 'Plasma',
    'spark|verdant': 'Lumen',
    'spark|terra': 'Magnet',
    'gale|spark': 'Storm',
    'ember|tide': 'Steam',
    'tide|verdant': 'Marsh',
    'terra|tide': 'Clay',
    'gale|tide': 'Mist',
    'ember|verdant': 'Ash',
    'ember|terra': 'Magma',
    'ember|gale': 'Cinder',
    'terra|verdant': 'Grove',
    'gale|verdant': 'Spore',
    'gale|terra': 'Dust',
  };

  const hybridKey = (a, b) => [a, b].sort().join('|');
  const hybridName = (a, b) => HYBRID_NAMES[hybridKey(a, b)] || null;

  // ---------------------------------------------------------------------------
  // Base roster (§3) — every base monster totals exactly 180
  // ---------------------------------------------------------------------------

  /*
   * Stat lines solved by autobalance.js, not hand-assigned.
   *
   * The design originally gave every base monster a 180-point total for "trivial
   * fairness". Simulation disproved that: stat points are not fungible, so equal
   * budgets produced a 92-point win-rate spread (Coalpaw 99.7%, Kitewing 7.7%).
   * These lines equalize measured win rate instead, landing at a 6.4-point
   * spread. Totals now range 170-191 — fast, frail monsters need a slightly
   * larger budget because SPD buys less than HP and DEF do.
   */
  const SPECIES = [
    { id: 'voltmoth', name: 'Voltmoth', element: 'spark',   hp: 36, atk: 56, def: 25, spd: 65, rarity: 'common',   look: 'Pale moth, lightning veins in its wings' },
    { id: 'bolthorn', name: 'Bolthorn', element: 'spark',   hp: 53, atk: 48, def: 43, spd: 30, rarity: 'uncommon', look: 'Stocky ram, charge arcing between horns' },
    { id: 'puddlup',  name: 'Puddlup',  element: 'tide',    hp: 60, atk: 35, def: 55, spd: 30, rarity: 'common',   look: 'Round puddle-creature, oversized eyes' },
    { id: 'finwhisk', name: 'Finwhisk', element: 'tide',    hp: 41, atk: 51, def: 30, spd: 60, rarity: 'common',   look: 'Darting fish-otter with whisker fins' },
    { id: 'wickle',   name: 'Wickle',   element: 'ember',   hp: 36, atk: 61, def: 25, spd: 60, rarity: 'common',   look: 'Fox kit with a candle-flame tail' },
    { id: 'coalpaw',  name: 'Coalpaw',  element: 'ember',   hp: 52, atk: 56, def: 42, spd: 20, rarity: 'rare',     look: 'Heavy badger, glowing cracks in its hide' },
    { id: 'sproutle', name: 'Sproutle', element: 'verdant', hp: 55, atk: 40, def: 55, spd: 30, rarity: 'common',   look: 'Sapling creature with leaf-bud ears' },
    { id: 'thornip',  name: 'Thornip',  element: 'verdant', hp: 39, atk: 59, def: 30, spd: 50, rarity: 'common',   look: 'Bristly root-rodent, thorn ridge' },
    { id: 'pebbet',   name: 'Pebbet',   element: 'terra',   hp: 60, atk: 40, def: 65, spd: 15, rarity: 'uncommon', look: 'Small stone tortoise, moss on the shell' },
    { id: 'burrowl',  name: 'Burrowl',  element: 'terra',   hp: 44, atk: 49, def: 39, spd: 45, rarity: 'uncommon', look: 'Owl with earth feathers and digging talons' },
    { id: 'kitewing', name: 'Kitewing', element: 'gale',    hp: 33, atk: 50, def: 33, spd: 75, rarity: 'rare',     look: 'Paper-thin gliding manta, translucent' },
    { id: 'ruffle',   name: 'Ruffle',   element: 'gale',    hp: 48, atk: 48, def: 39, spd: 40, rarity: 'common',   look: 'Puffed-up bird, permanently windswept' },
  ];

  const speciesById = (id) => SPECIES.find((s) => s.id === id);

  /*
   * Trust thresholds. Originally 3/4/5 against a maximum of 3 taps, which meant
   * even a Common demanded a perfect run and anything rarer was gated behind
   * consumables. Playtesting confirmed this read as punishing. Lowered so a
   * Common needs 2 of 3 taps and the rarer tiers are reachable without a
   * flawless performance.
   */
  const TRUST_REQUIRED = { common: 2, uncommon: 3, rare: 4 };
  const SPAWN_WEIGHT = { common: 10, uncommon: 4, rare: 1 };

  // ---------------------------------------------------------------------------
  // Moves (§5)
  //
  // Placeholder pools. Real move design is still an open question — every
  // monster currently gets Basic / Standard / Strong in its own element plus a
  // Standard coverage move in the opposite element, which by construction
  // answers both of its weaknesses.
  // ---------------------------------------------------------------------------

  const TIERS = {
    basic:    { power: 25, focus: 0 },
    standard: { power: 40, focus: 1 },
    strong:   { power: 65, focus: 3 },
  };

  const MOVE_NAMES = {
    spark:   { basic: 'Jolt',        standard: 'Arc Lash',   strong: 'Thunderhead' },
    tide:    { basic: 'Splash',      standard: 'Undertow',   strong: 'Riptide' },
    ember:   { basic: 'Cinder Flick', standard: 'Flame Lash', strong: 'Firestorm' },
    verdant: { basic: 'Vine Tap',    standard: 'Bramble',    strong: 'Overgrowth' },
    terra:   { basic: 'Pebble Toss', standard: 'Stone Slam', strong: 'Landslide' },
    gale:    { basic: 'Gust',        standard: 'Crosswind',  strong: 'Cyclone' },
  };

  const STATUS_BY_ELEMENT = {
    ember: 'scorched', spark: 'scorched',
    tide: 'drenched', gale: 'drenched',
    verdant: 'rooted', terra: 'rooted',
  };

  const STATUSES = {
    scorched: { name: 'Scorched', turns: 3, tick: 0.05 },
    drenched: { name: 'Drenched', turns: 3, spdMult: 0.5 },
    rooted:   { name: 'Rooted',   turns: 2, noSwitch: true },
  };

  function makeMove(element, tier) {
    return {
      name: MOVE_NAMES[element][tier],
      element,
      tier,
      power: TIERS[tier].power,
      focus: TIERS[tier].focus,
      // Strong moves carry a chance to inflict their element's status.
      status: tier === 'strong' ? STATUS_BY_ELEMENT[element] : null,
      statusChance: tier === 'strong' ? 0.25 : 0,
    };
  }

  function movesFor(elements) {
    const primary = elements[0];
    const secondary = elements[1] || oppositeElement(primary);
    return [
      makeMove(primary, 'basic'),
      makeMove(primary, 'standard'),
      makeMove(primary, 'strong'),
      makeMove(secondary, 'standard'), // coverage
    ];
  }

  // ---------------------------------------------------------------------------
  // Monsters (§7)
  // ---------------------------------------------------------------------------

  let nextUid = 1;

  /** Proportional growth — preserves each monster's stat *shape* at every level. */
  function statAt(base, level, mult) {
    return Math.round(base * (1 + level / CONFIG.STAT_GROWTH_DIVISOR) * (mult || 1));
  }

  function createMonster(opts) {
    const {
      speciesId, level = 5, bases, elements, name,
      bond = 30, rareBloom = false, bred = false,
    } = opts;

    const sp = speciesId ? speciesById(speciesId) : null;
    const els = elements || [sp.element];
    const b = bases || { hp: sp.hp, atk: sp.atk, def: sp.def, spd: sp.spd };
    const mult = rareBloom ? RARE_BLOOM_MULT : 1;

    const m = {
      uid: nextUid++,
      speciesId: speciesId || null,
      name: name || sp.name,
      elements: els,
      elementLabel: els.length > 1 ? hybridName(els[0], els[1]) : ELEMENTS[els[0]].name,
      rarity: sp ? sp.rarity : 'bred',
      level,
      bases: b,
      rareBloom,
      bred,
      bond,
      xp: 0,
      status: null,
      statusTurns: 0,
      moves: movesFor(els),
    };
    m.maxHp = statAt(b.hp, level, mult);
    m.hp = m.maxHp;
    m.atk = statAt(b.atk, level, mult);
    m.def = statAt(b.def, level, mult);
    m.spd = statAt(b.spd, level, mult);
    return m;
  }

  // ---------------------------------------------------------------------------
  // Leveling (§7)
  // ---------------------------------------------------------------------------

  const xpToNext = (level) => Math.round(15 * Math.pow(level, 1.5));

  function recomputeStats(m) {
    const mult = m.rareBloom ? RARE_BLOOM_MULT : 1;
    const frac = m.maxHp ? m.hp / m.maxHp : 1;
    m.maxHp = statAt(m.bases.hp, m.level, mult);
    m.atk = statAt(m.bases.atk, m.level, mult);
    m.def = statAt(m.bases.def, m.level, mult);
    m.spd = statAt(m.bases.spd, m.level, mult);
    m.hp = Math.max(1, Math.round(m.maxHp * frac)); // keep the same HP fraction
  }

  /** Award XP, leveling up as many times as the amount covers. */
  function grantXp(m, amount) {
    if (m.level >= MAX_LEVEL) return { levels: 0 };
    m.xp = (m.xp || 0) + amount;
    let levels = 0;
    while (m.level < MAX_LEVEL && m.xp >= xpToNext(m.level)) {
      m.xp -= xpToNext(m.level);
      m.level += 1;
      levels += 1;
    }
    if (levels) recomputeStats(m);
    return { levels };
  }

  /** XP for beating a wild, scaled by the level gap — punching up pays better. */
  function xpForWin(winnerLevel, loserLevel) {
    const gap = loserLevel - winnerLevel;
    return Math.max(12, Math.round((18 + loserLevel * 4) * (1 + gap * 0.15)));
  }

  const effectiveSpd = (m) =>
    m.status === 'drenched' ? Math.round(m.spd * STATUSES.drenched.spdMult) : m.spd;

  const bondBonusOf = (m) => (m.bond >= BOND_BONUS_THRESHOLD ? BOND_BONUS : 1.0);

  // ---------------------------------------------------------------------------
  // Damage (§5)
  // ---------------------------------------------------------------------------

  function damage(attacker, defender, move, rng, opts) {
    const mult = defenseMultiplier(move.element, defender.elements);
    const levelTerm = 1 + attacker.level / CONFIG.LEVEL_TERM_DIVISOR;
    const variance = opts && opts.noVariance ? 1 : range(rng, 0.9, 1.1);
    const raw =
      move.power *
      (attacker.atk / (defender.def + CONFIG.DEF_CONSTANT)) *
      levelTerm *
      mult *
      bondBonusOf(attacker) *
      CONFIG.K *
      variance;
    return { amount: Math.max(1, Math.round(raw)), multiplier: mult };
  }

  /** Expected damage with variance removed — used by the AI and the UI preview. */
  const expectedDamage = (a, d, mv) => damage(a, d, mv, null, { noVariance: true }).amount;

  // ---------------------------------------------------------------------------
  // Battle (§5)
  // ---------------------------------------------------------------------------

  function createBattle(playerTeam, wild, rng) {
    return {
      rng,
      team: playerTeam,
      activeIndex: 0,
      wild,
      playerFocus: CONFIG.FOCUS_START,
      wildFocus: CONFIG.FOCUS_START,
      turn: 1,
      log: [],
      over: false,
      outcome: null,
      // Highest HP fraction the wild monster has been seen below — drives the
      // taming window measurement.
      wildLowWater: 1,
    };
  }

  const activeMonster = (b) => b.team[b.activeIndex];

  function affordable(monster, focus) {
    return monster.moves.filter((mv) => mv.focus <= focus);
  }

  /** Baseline "competent player" AI: highest expected damage it can afford. */
  function chooseMove(attacker, defender, focus) {
    const options = affordable(attacker, focus);
    let best = options[0];
    let bestVal = -1;
    for (const mv of options) {
      const val = expectedDamage(attacker, defender, mv);
      if (val > bestVal) { bestVal = val; best = mv; }
    }
    return best;
  }

  /**
   * Wild creatures are not tacticians. They play the optimal move only
   * WILD_AI_ACCURACY of the time and otherwise pick at random from what they can
   * afford. An opponent that never misplays is the single biggest reason a
   * fight feels harder than the balance numbers suggest.
   */
  function chooseWildMove(attacker, defender, focus, rng) {
    const options = affordable(attacker, focus);
    if (!rng || rng() < CONFIG.WILD_AI_ACCURACY) {
      return chooseMove(attacker, defender, focus);
    }
    return options[Math.floor(rng() * options.length)];
  }

  function applyStatusTick(m, b) {
    if (!m.status) return;
    const s = STATUSES[m.status];
    if (s.tick) {
      const dmg = Math.max(1, Math.round(m.maxHp * s.tick));
      m.hp = Math.max(0, m.hp - dmg);
      b.log.push(`${m.name} takes ${dmg} from ${s.name}.`);
    }
    m.statusTurns -= 1;
    if (m.statusTurns <= 0) {
      b.log.push(`${m.name} is no longer ${STATUSES[m.status].name}.`);
      m.status = null;
    }
  }

  /**
   * Chance an incoming hit glances off a faster defender. This is damage
   * reduction rather than a miss — random whiffs feel bad, and a partial hit
   * reads as the defender being quick rather than the attacker being unlucky.
   */
  function glanceChance(attacker, defender) {
    const lead = effectiveSpd(defender) - effectiveSpd(attacker);
    if (lead <= 0) return 0;
    return Math.min(CONFIG.GLANCE_CAP, lead / CONFIG.GLANCE_DIVISOR);
  }

  function strike(attacker, defender, move, b, damageMult) {
    let { amount, multiplier } = damage(attacker, defender, move, b.rng);

    if (damageMult && damageMult !== 1) amount = Math.max(1, Math.round(amount * damageMult));

    const glanced = b.rng() < glanceChance(attacker, defender);
    if (glanced) amount = Math.max(1, Math.round(amount * CONFIG.GLANCE_DAMAGE));

    defender.hp = Math.max(0, defender.hp - amount);
    const tag = glanced ? ` ${defender.name} slips most of it!`
      : multiplier > 1.05 ? ' It hits hard!'
      : multiplier < 0.95 ? " It's not very effective." : '';
    b.log.push(`${attacker.name} used ${move.name} — ${amount} damage.${tag}`);

    if (move.status && b.rng() < move.statusChance && !defender.status) {
      defender.status = move.status;
      defender.statusTurns = STATUSES[move.status].turns;
      b.log.push(`${defender.name} is ${STATUSES[move.status].name}!`);
    }
    return amount;
  }

  /**
   * Resolve one full turn. `playerMove` may be null when the player switched or
   * attuned, in which case only the wild monster acts.
   */
  function resolveTurn(b, playerMove) {
    if (b.over) return b;
    const player = activeMonster(b);
    const wild = b.wild;

    if (playerMove) b.playerFocus -= playerMove.focus;
    const wildMove = chooseWildMove(wild, player, b.wildFocus, b.rng);
    b.wildFocus -= wildMove.focus;

    // Turn order by SPD; ties resolve on a visible coin flip (§5).
    let playerFirst;
    const ps = effectiveSpd(player);
    const ws = effectiveSpd(wild);
    if (ps !== ws) playerFirst = ps > ws;
    else {
      playerFirst = b.rng() < 0.5;
      b.log.push(`Speed tie — coin flip: ${playerFirst ? 'you' : wild.name} go first.`);
    }

    const order = playerFirst
      ? [[player, wild, playerMove], [wild, player, wildMove]]
      : [[wild, player, wildMove], [player, wild, playerMove]];

    for (const [atk, def, mv] of order) {
      if (b.over || atk.hp <= 0 || !mv) continue;
      // The player's monsters take reduced damage — see CONFIG.
      strike(atk, def, mv, b, atk === wild ? CONFIG.INCOMING_DAMAGE_MULT : 1);
      b.wildLowWater = Math.min(b.wildLowWater, wild.hp / wild.maxHp);
      if (def.hp <= 0) {
        b.log.push(`${def.name} fainted.`);
        if (def === wild) finish(b, 'wild_fainted');
        else if (!switchToNextAlive(b)) finish(b, 'player_wiped');
      }
    }

    if (!b.over) {
      applyStatusTick(player, b);
      applyStatusTick(wild, b);
      b.wildLowWater = Math.min(b.wildLowWater, wild.hp / wild.maxHp);
      if (wild.hp <= 0) finish(b, 'wild_fainted');
      else if (activeMonster(b).hp <= 0 && !switchToNextAlive(b)) finish(b, 'player_wiped');
    }

    if (!b.over) {
      b.turn += 1;
      // Outspeeding by a wide margin regenerates Focus faster, so SPD feeds the
      // action economy instead of only deciding who swings first.
      const cur = activeMonster(b);
      const pSpd = effectiveSpd(cur);
      const wSpd = effectiveSpd(wild);
      const pRegen = CONFIG.FOCUS_REGEN + (pSpd >= wSpd * CONFIG.FOCUS_SURGE_RATIO ? 1 : 0);
      const wRegen = CONFIG.FOCUS_REGEN + (wSpd >= pSpd * CONFIG.FOCUS_SURGE_RATIO ? 1 : 0);
      b.playerFocus = Math.min(CONFIG.FOCUS_MAX, b.playerFocus + pRegen);
      b.wildFocus = Math.min(CONFIG.FOCUS_MAX, b.wildFocus + wRegen);
    }
    return b;
  }

  function switchToNextAlive(b) {
    const i = b.team.findIndex((m) => m.hp > 0);
    if (i < 0) return false;
    b.activeIndex = i;
    return true;
  }

  function finish(b, outcome) {
    b.over = true;
    b.outcome = outcome;
  }

  // ---------------------------------------------------------------------------
  // Taming (§4)
  // ---------------------------------------------------------------------------

  const canAttune = (wild) => wild.hp > 0 && wild.hp / wild.maxHp < 0.5;

  /*
   * Attunement difficulty.
   *
   * The first version swept a needle continuously AND repositioned the target
   * zone between every tap, demanding three hits under time pressure. That is
   * two difficulty sources stacked, and playtesting found it simply too hard.
   *
   * The zone now stays put for the whole attempt, starts far wider, and grows
   * as the creature calms — while the needle slows down with each tap landed.
   * Both curves run in the player's favour, and both are thematic: the creature
   * is settling, so it gets easier to read.
   */
  const ATTUNE = {
    BASE_ZONE: 34,        // percent of the track, up from 21
    CRYSTAL_ZONE_BONUS: 12,
    LOW_HP_ZONE_BONUS: 10, // a hurt creature is calmer and easier to read
    PER_TAP_ZONE_BONUS: 6, // each landed tap settles it further
    BASE_SPEED: 0.62,      // down from 0.90
    PER_TAP_SLOWDOWN: 0.16,
    RARITY_SPEED: { common: 0, uncommon: 0.12, rare: 0.24 },
  };

  /** Width of the green zone, as a percentage of the track. */
  function attuneZoneWidth(wild, { crystalMatch, tapsLanded = 0 }) {
    let w = ATTUNE.BASE_ZONE;
    if (crystalMatch) w += ATTUNE.CRYSTAL_ZONE_BONUS;
    if (wild.hp / wild.maxHp < 0.25) w += ATTUNE.LOW_HP_ZONE_BONUS;
    w += tapsLanded * ATTUNE.PER_TAP_ZONE_BONUS;
    return Math.min(72, w);
  }

  /** Needle sweep speed — slows as the creature settles. */
  function attuneSpeed(wild, tapsLanded = 0) {
    const base = ATTUNE.BASE_SPEED + (ATTUNE.RARITY_SPEED[wild.rarity] || 0);
    return Math.max(0.25, base - tapsLanded * ATTUNE.PER_TAP_SLOWDOWN);
  }

  /**
   * Chance the creature bolts after a failed attunement. `fails` counts the
   * failures so far in THIS encounter, including the one just scored.
   */
  function fleeChanceAfterFailure(fails) {
    return Math.min(0.9, CONFIG.FLEE_BASE + (fails - 1) * CONFIG.FLEE_STEP);
  }

  /**
   * Score an attunement attempt.
   *   taps          — number of taps that landed in the green zone (0-3)
   *   crystalMatch  — a matching-element Resonance Crystal was offered
   *   banked        — Trust carried from previous failed attempts (caps at 3)
   */
  function attune(wild, { taps, crystalMatch, banked = 0 }) {
    const required = TRUST_REQUIRED[wild.rarity] || 2;
    let trust = taps;
    if (crystalMatch) trust += 1;
    if (wild.hp / wild.maxHp < 0.25) trust += 1;
    trust += banked;

    const success = trust >= required;
    return {
      success,
      trust,
      required,
      // Failure banks progress. This now accrues WITHIN a single encounter as
      // well as across encounters, so retrying in the same fight gets easier.
      newBanked: success ? 0 : Math.min(3, banked + 1),
    };
  }

  // ---------------------------------------------------------------------------
  // Breeding (§6)
  // ---------------------------------------------------------------------------

  const STAT_KEYS = ['hp', 'atk', 'def', 'spd'];

  function breed(a, b, rng) {
    const elsA = a.elements;
    const elsB = b.elements;

    // v1 does not support hybrid x hybrid (§6).
    if (elsA.length > 1 || elsB.length > 1) {
      return { error: 'Hybrid pairs are a v2 feature — breed two base monsters.' };
    }

    const sameElement = elsA[0] === elsB[0];
    const elements = sameElement ? [elsA[0]] : [elsA[0], elsB[0]];

    const bases = {};
    for (const key of STAT_KEYS) {
      const av = a.bases[key];
      const bv = b.bases[key];
      let value;
      if (rng() < 0.25) {
        value = Math.max(av, bv);       // 25% chance to inherit the better parent
      } else {
        value = (av + bv) / 2;          // otherwise average
      }
      if (sameElement) {
        // Same-element pairing rolls from the better half of the range (§6).
        value = Math.max(value, (value + Math.max(av, bv)) / 2);
      }
      bases[key] = Math.round(value * range(rng, 0.9, 1.1));
    }

    const rareBloom = rng() < RARE_BLOOM_CHANCE;

    let name, speciesId = null;
    if (sameElement) {
      const parent = rng() < 0.5 ? a : b;
      name = parent.name;
      speciesId = parent.speciesId;
    } else {
      name = hybridName(elsA[0], elsB[0]) + 'ling'; // placeholder naming
    }

    const child = createMonster({
      speciesId,
      elements,
      bases,
      name,
      level: 5,
      bond: 50,       // bred monsters start bonded (§7)
      rareBloom,
      bred: true,
    });

    return {
      child,
      rareBloom,
      kind: sameElement ? 'refined' : 'hybrid',
      hybridElement: sameElement ? null : hybridName(elsA[0], elsB[0]),
    };
  }

  // ---------------------------------------------------------------------------
  // Encounters
  // ---------------------------------------------------------------------------

  function randomWild(rng, level) {
    const pool = [];
    for (const s of SPECIES) {
      const w = SPAWN_WEIGHT[s.rarity];
      for (let i = 0; i < w; i++) pool.push(s);
    }
    const sp = pick(rng, pool);
    return createMonster({ speciesId: sp.id, level, bond: 0 });
  }

  // ---------------------------------------------------------------------------

  return {
    // config
    CONFIG, configure, MAX_LEVEL, TIERS, TRUST_REQUIRED,
    RARE_BLOOM_CHANCE, STATUSES,
    // data
    ELEMENT_CYCLE, ELEMENTS, SPECIES, HYBRID_NAMES,
    // helpers
    makeRng, speciesById, typeMultiplier, defenseMultiplier, oppositeElement,
    hybridName, hybridKey, statAt, movesFor,
    // core
    createMonster, damage, expectedDamage, chooseMove, chooseWildMove, effectiveSpd,
    createBattle, resolveTurn, activeMonster, affordable,
    canAttune, attune, attuneZoneWidth, attuneSpeed, fleeChanceAfterFailure, ATTUNE,
    breed, randomWild,
    // progression
    xpToNext, grantXp, xpForWin, recomputeStats,
  };
});
