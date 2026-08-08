# Infinimon — Design Document v1

**Status:** Draft. Sections 1–6 (the game). Sections 7–10 (stats detail, story spine, art spec, cut list) pending.

**Scope target for v1:** 6 elements · 12 tameable base monsters · 15 bred hybrids · ~27 total dex · single-player · local save · no backend.

> This folder is self-contained and portable — it's expected to move to its own repository once the project starts building.

---

## 1. Core Loop

### One sentence

You are a scientist tracking creatures pulled out of a collapsing dimension, and you build your team by earning their trust in the wild and pairing them in your lab to discover hybrids nobody has seen before.

### The loop

```
        ┌─────────────────────────────────────────────┐
        │                                             │
   EXPLORE ──> ENCOUNTER ──> BATTLE ──> TAME ──> TEAM │
        ▲                       │                  │  │
        │                       │                  ▼  │
        │                       └──> earn CHARGE ──> BREED
        │                                            │
        └──────── stronger team unlocks new zone <───┘
```

### What each step gives the player

| Step | Player gets | Why they keep going |
|---|---|---|
| Explore | New species sightings, crystals, story beats | Curiosity — what lives here? |
| Battle | Charge (breeding fuel), levels | Competence — I'm getting better at this |
| Tame | A new team member, dex entry | Collection — I want one of those |
| Breed | A hybrid that didn't exist before | Discovery — what do these two make? |
| New zone | Higher-tier elements, harder tames | Progress — the story moves |

**Critical design point:** Charge (the resource that hatches eggs) is earned by *battling*, not by waiting on a real-time timer. Breeding is a reward for playing, not a reason to close the app. No energy meters in v1.

### Session shapes

- **2 minutes** — one wild battle, bank some Charge
- **10 minutes** — hunt a specific species and tame it
- **30 minutes** — clear a story beat, set up and hatch a breed, test the hybrid in a fight

### The story frame (short version, expanded in §8)

A corporation called **Meridian Dynamics** opened a rift and is strip-mining the world on the other side, extracting Infinimon in containment lattices. Your family — four scientists, and you pick one — is on the other side of that argument. The mechanical expression of the theme: **Meridian takes by force, you are the only faction that earns trust.** The player never uses a containment device.

---

## 2. Elements

Six elements arranged in a cycle. Each element is **strong against the next two** in the cycle, **weak against the previous two**, and **neutral against its opposite**.

```
              SPARK
          ↗           ↘
      GALE             TIDE
        ↑                ↓
     TERRA             EMBER
          ↖           ↙
             VERDANT
```

Cycle order: **Spark → Tide → Ember → Verdant → Terra → Gale → (back to Spark)**

### Matchup grid

Read as: row attacks column. `1.5` strong · `1.0` neutral · `0.75` weak.

| ATK ↓ / DEF → | Spark | Tide | Ember | Verdant | Terra | Gale |
|---|---|---|---|---|---|---|
| **Spark**   | 1.0  | 1.5  | 1.5  | 1.0  | 0.75 | 0.75 |
| **Tide**    | 0.75 | 1.0  | 1.5  | 1.5  | 1.0  | 0.75 |
| **Ember**   | 0.75 | 0.75 | 1.0  | 1.5  | 1.5  | 1.0  |
| **Verdant** | 1.0  | 0.75 | 0.75 | 1.0  | 1.5  | 1.5  |
| **Terra**   | 1.5  | 1.0  | 0.75 | 0.75 | 1.0  | 1.5  |
| **Gale**    | 1.5  | 1.5  | 1.0  | 0.75 | 0.75 | 1.0  |

The grid is fully symmetric — every element has exactly 2 strengths, 2 weaknesses, 1 neutral opponent, and is neutral against itself. Nothing is strictly better than anything else.

### Why each matchup reads true

| Matchup | Reasoning |
|---|---|
| Spark > Tide | Current travels through water |
| Spark > Ember | Energy surge smothers open flame |
| Tide > Ember | Water douses fire |
| Tide > Verdant | Flooding drowns roots |
| Ember > Verdant | Fire burns growth |
| Ember > Terra | Magma melts stone |
| Verdant > Terra | Roots split rock |
| Verdant > Gale | Forests break the wind |
| Terra > Gale | Mountains stop wind |
| Terra > Spark | Earth grounds electricity |
| Gale > Spark | Wind disperses charge |
| Gale > Tide | Wind scatters water |

**Neutral (opposed) pairs** — these cancel rather than clash: Spark ↔ Verdant · Tide ↔ Terra · Ember ↔ Gale.

### Dual-element hybrids

Every bred monster has a **primary** and **secondary** element.

- **Attacking:** the multiplier comes from the move's element only.
- **Defending:** average the two multipliers, rounded to 2 decimals.

Averaging on defense means hybrids are *resilient but not immune* — a Steam hybrid (Tide/Ember) hit by Spark takes `(1.5 + 1.5) / 2 = 1.5`, but hit by Verdant takes `(0.75 + 1.5) / 2 = 1.13`. Hybrids trade sharp weaknesses for fewer clean answers. That's the reward for breeding.

### The 15 pairings

| Pair | Hybrid element |
|---|---|
| Spark + Tide | **Current** |
| Spark + Ember | **Plasma** |
| Spark + Verdant | **Lumen** |
| Spark + Terra | **Magnet** |
| Spark + Gale | **Storm** |
| Tide + Ember | **Steam** |
| Tide + Verdant | **Marsh** |
| Tide + Terra | **Clay** |
| Tide + Gale | **Mist** |
| Ember + Verdant | **Ash** |
| Ember + Terra | **Magma** |
| Ember + Gale | **Cinder** |
| Verdant + Terra | **Grove** |
| Verdant + Gale | **Spore** |
| Terra + Gale | **Dust** |

---

## 3. Base Roster

Twelve tameable monsters, two per element. **Every base monster has a base stat total of exactly 180** — they differ in distribution, not raw power. This makes v1 balance trivially fair; rarity affects how hard something is to tame and how desirable it is to breed, never how strong it is.

| Name | Element | HP | ATK | DEF | SPD | Rarity | Personality | Look |
|---|---|---|---|---|---|---|---|---|
| **Voltmoth** | Spark | 35 | 55 | 25 | 65 | Common | Skittish, drawn to light | Pale moth, lightning veins flickering through its wings |
| **Bolthorn** | Spark | 55 | 50 | 45 | 30 | Uncommon | Stubborn, plants its feet | Stocky ram, arcing charge between curled horns |
| **Puddlup** | Tide | 60 | 35 | 55 | 30 | Common | Cheerful, endlessly patient | Round puddle-creature, oversized eyes, wobbles |
| **Finwhisk** | Tide | 40 | 50 | 30 | 60 | Common | Playful, never still | Darting fish-otter with whisker fins |
| **Wickle** | Ember | 35 | 60 | 25 | 60 | Common | Timid but brave when cornered | Fox kit with a candle-flame tail |
| **Coalpaw** | Ember | 55 | 60 | 45 | 20 | Rare | Slow to trust, fiercely loyal after | Heavy badger, glowing cracks across its hide |
| **Sproutle** | Verdant | 55 | 40 | 55 | 30 | Common | Curious, follows you home | Sapling creature with leaf-bud ears |
| **Thornip** | Verdant | 40 | 60 | 30 | 50 | Common | Scrappy, picks fights | Bristly root-rodent, thorn ridge along its back |
| **Pebbet** | Terra | 60 | 40 | 65 | 15 | Uncommon | Unhurried, immovable | Small stone tortoise, moss on the shell |
| **Burrowl** | Terra | 45 | 50 | 40 | 45 | Uncommon | Watchful, hoards shiny things | Owl with earth-toned feathers and digging talons |
| **Kitewing** | Gale | 30 | 45 | 30 | 75 | Rare | Aloof, hard to hold onto | Paper-thin gliding manta, translucent |
| **Ruffle** | Gale | 50 | 50 | 40 | 40 | Common | Blustery, loud, harmless | Puffed-up bird, permanently windswept |

**Rarity distribution:** 7 Common · 3 Uncommon · 2 Rare. Rarity sets the Trust requirement for taming (§4) and the spawn rate per zone.

**Starter choice:** the player picks one of Wickle, Puddlup, or Sproutle at the start — a soft Fire/Water/Grass triangle that players already understand, without committing to it as the whole type system.

---

## 4. Taming — "Attunement"

### Design principles

1. **No cages.** Meridian Dynamics uses containment lattices; you use a **Resonator**. This is the mechanical expression of the story's central conflict, so it isn't decoration.
2. **Fail forward.** A failed tame never destroys anything. Progress carries to the next encounter. Kids should never lose 10 minutes to bad luck.
3. **Skill plus resources.** Timing matters, and consumables bridge the gap when timing isn't enough.

### The Resonator

A handheld device the family built from salvaged rift tech. It reads a monster's elemental frequency and lets you match it. Matching frequency is what builds **Trust**.

### The sequence

1. **Battle the wild Infinimon.** The **Attune** action is greyed out above 50% HP — you have to weaken it first.
2. **Below 50% HP, Attune unlocks.** Choosing it pauses the battle and opens the Resonator.
3. **Optionally offer a Resonance Crystal** matching the monster's element. Mismatched crystals do nothing and are consumed — reading the element right is part of the skill.
4. **The attunement check.** A needle sweeps across a frequency bar. You tap three times, trying to land inside the green zone. Works identically with touch or mouse.
5. **Score the Trust.**

| Source | Trust |
|---|---|
| Each tap inside the green zone | +1 |
| Matching Resonance Crystal offered | +1, and the green zone widens ~40% |
| Target is below 25% HP | +1 |

6. **Compare against the requirement.**

| Rarity | Trust needed |
|---|---|
| Common | 3 |
| Uncommon | 4 |
| Rare | 5 |

With three taps you can just barely clear a Common on perfect timing. Uncommon and Rare *require* crystals or a low-HP bonus — resources and tactics both matter.

7. **Resolve.**
   - **Trust met** → it joins your team. Dex entry unlocked.
   - **Trust short** → it flees, but the shortfall is remembered. Your next encounter with *that species* starts with **+1 banked Trust** (caps at +2). Two failures make the third attempt substantially easier.
   - **Knocked out instead of tamed** → no monster, no banked Trust. This is the real cost of being careless, and it's the tension that makes the 50%-to-25% HP window interesting.

### Why this shape

The player is always choosing between "hit it once more to reach the +1 low-HP bonus" and "attune now before I knock it out." That's a genuine decision every single encounter, and it costs nothing to learn.

---

## 5. Battle

### Format

- **1v1 on the field, party of 3.** Switching is allowed and costs your turn.
- **Turn order by SPD.** Ties resolve with a coin flip shown on screen — never silently.
- **Turn-based, fully deterministic** apart from a small damage roll. Everything is server-verifiable later without redesign.

### Focus (the action economy)

Every monster has a **Focus** pool instead of per-move PP.

- Starts each battle at **3**
- Regenerates **+1 at the start of your turn**
- Caps at **6**

| Move tier | Focus cost |
|---|---|
| Basic | 0 |
| Standard | 1 |
| Strong | 3 |

You cannot open with your best move and you cannot spam it. This gives fights a rhythm and replaces PP bookkeeping, which children track poorly.

### Moves

Each monster carries **4 moves**. A move has: name, element, power, Focus cost, and an optional effect.

### Damage formula

```
damage = round(
    Power
  × ( ATK / (DEF + 50) )
  × ( 1 + Level / 25 )
  × TypeMultiplier
  × BondBonus
  × K
  × Variance
)
```

| Term | Value |
|---|---|
| `TypeMultiplier` | 1.5 / 1.0 / 0.75 from the §2 grid (averaged on defense for hybrids) |
| `BondBonus` | 1.05 if the monster was tamed or bred by this player and Bond is high, else 1.0 |
| `K` | **0.6** — the global balance constant |
| `Variance` | random 0.9 – 1.1 |

**`K` is the primary tuning knob.** Lower it for longer fights, raise it for faster ones. Everything else can stay fixed while this is tuned.

### Stat growth

| Stat | Growth per level |
|---|---|
| HP | base + (Level × 4) |
| ATK / DEF / SPD | base + (Level × 2) |

### Worked example (validates the numbers)

Both monsters at level 5, so stats are base + growth: Wickle ATK 60+10 = **70**, DEF 25+10 = **35**, HP 35+20 = **55**. Puddlup ATK 35+10 = **45**, DEF 55+10 = **65**, HP 60+20 = **80**.

Wickle attacks Puddlup with a Power-40 Ember move (Ember into Tide is 0.75):

```
40 × (70 / 115) × 1.2 × 0.75 × 0.6  ≈  13
13 / 80 HP  →  ~16% per hit  →  ~6-7 turns
```

Puddlup attacks Wickle with a Power-40 Tide move (Tide into Ember is 1.5):

```
40 × (45 / 85) × 1.2 × 1.5 × 0.6  ≈  23
23 / 55 HP  →  ~42% per hit  →  ~3 turns
```

**Target: 3–7 turn fights.** Type advantage roughly doubles your damage — decisive but not instant, and slow enough that you can stop at the 50%/25% HP thresholds taming needs.

### Status effects

Exactly three in v1. Resist the urge to add more.

| Status | From | Effect | Duration |
|---|---|---|---|
| **Scorched** | Ember, Spark | Loses 5% max HP at end of turn | 3 turns |
| **Drenched** | Tide, Gale | SPD halved | 3 turns |
| **Rooted** | Verdant, Terra | Cannot switch out | 2 turns |

### Losing

All three monsters fainted → you're recalled to the Lab, lose half your carried Resonance Crystals, keep everything else. **No permadeath, no lost monsters, no lost levels.** A loss costs consumables and time, nothing more.

---

## 6. Breeding

### Where

**The Resonance Chamber**, in the family Lab (your home base). Two monsters go in; an egg comes out.

### Compatibility

| Pairing | Result |
|---|---|
| Two different base elements | **Hybrid** — the dual-element species for that pair (§2) |
| Two of the same element | **Refined base** — same species as a parent, but rolls stats from the better half of the range |
| Any pair involving a hybrid | **Not available in v1** — see below |

Same-element pairing isn't a wasted slot: it's how you improve a monster you already like. Different-element pairing is how you discover.

### Cost and time

| Requirement | Amount |
|---|---|
| **Rift Catalyst** | 1 per breed — consumed |
| **Charge** | 50–100 depending on parent rarity |

**Charge is earned by battling** (roughly 8–15 per wild win). An egg does not tick down on a real-time clock — it fills as you play. This is a deliberate rejection of the free-to-play wait-timer pattern.

**Rift Catalysts** are the pacing lever: they're story and quest rewards early, so breeding unlocks gradually and can't be farmed on day one.

### What the offspring inherits

| Trait | Rule |
|---|---|
| **Species** | Fully deterministic — Ember + Tide always produces the Steam-family hybrid |
| **Stats** | Average of both parents per stat, ±10% variance, with a **25% chance per stat** to inherit the higher parent's value instead |
| **Moves** | 2 drawn from its hybrid element's pool, plus a **50% chance** to inherit one move from either parent |
| **Bond** | Starts high — bred monsters are family, and they get the BondBonus from birth |

### Rare Bloom

Every hatch has a **5% chance** to be a **Rare Bloom**: an alternate palette plus **+10% to all stats**.

This is the entire chase mechanic for v1. It gives collectible rarity without needing global supply caps, a server, or accounts — which is what lets v1 ship with a local save.

### Deliberately deferred to v2

- **Breeding two hybrids.** This is the obvious expansion and the reason the dex can grow from 27 to hundreds later. Leaving it out of v1 keeps the species count hand-drawable and the balance tractable. The data model should not preclude it.
- **Globally capped species.** Requires server-authoritative state. The design is compatible with adding it; v1 simply doesn't need it.
- **Recessive/hidden genes.** Fun, but invisible depth is wasted when there are only 15 hybrids to find.

---

## Open questions for the next pass

1. **Move pools.** 27 species × 4 moves is the largest remaining content task in the game section. Needs its own pass.
2. **Zone layout.** How many explorable areas, and which species spawn where — this is the actual difficulty curve.
3. **Does the family choice change anything mechanically?** Four characters (father, mother, son, daughter) could be purely cosmetic, or each could carry a small perk. Cosmetic-only is safer for balance and much cheaper to build.
4. **Validate `K = 0.6`** by simulating a few hundred battles once the prototype exists. The worked examples above are arithmetic, not playtesting.
