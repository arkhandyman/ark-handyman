# Infinimon — Design Document v1

**Status:** Draft, sections 1–10 complete.

**Scope target for v1:** 6 elements · 12 tameable base monsters · 15 bred hybrids · ~27 total dex · single-player · local save · no backend.

> **All names in this document are placeholders.** See [`naming.md`](./naming.md) for the full register, the convention behind each name, and a column to record your final choices. Creature design is founder-led (§9) — names and designs are yours to set.

> This folder is self-contained and portable — it's expected to move to its own repository once the project starts building.

## Contents

| § | Section | |
|---|---|---|
| 1 | [Core Loop](#1-core-loop) | What the player does |
| 2 | [Elements](#2-elements) | Six-element cycle, matchup grid, 15 hybrids |
| 3 | [Base Roster](#3-base-roster) | The 12 tameable monsters |
| 4 | [Taming](#4-taming--attunement) | Attunement |
| 5 | [Battle](#5-battle) | Turn structure, Focus, damage formula |
| 6 | [Breeding](#6-breeding) | Pairing rules, inheritance, Rare Bloom |
| 7 | [Stats & Leveling](#7-stats--leveling) | Growth curve, XP, Bond |
| 8 | [Story Spine](#8-story-spine) | Four characters, three acts, six beats |
| 9 | [Art Specification](#9-art-specification) | Sketch → AI refinement pipeline, sprite specs |
| 10 | [Not in v1](#10-explicitly-not-in-v1) | The cut list |

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

| Tier | Power | Focus cost |
|---|---|---|
| Basic | 25 | 0 |
| Standard | 40 | 1 |
| Strong | 65 | 3 |

A typical turn uses Basic or Standard; Strong moves are what you save Focus for. Fights pace around the Basic/Standard tiers, so the turn counts below assume those.

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

The level term is `(1 + Level / 40)`, not `Level / 25`. See §7 — stats already grow proportionally, so a steep level term would double-scale damage.

**`K` is the primary tuning knob.** Lower it for longer fights, raise it for faster ones. Everything else can stay fixed while this is tuned.

### Stat growth

Defined in §7. All four stats grow proportionally: `stat = round(base × (1 + Level / 20))`.

### Worked example (validates the numbers)

At level 5 every stat is `base × 1.25`, and the level term is `1 + 5/40 = 1.125`.

Wickle attacks Puddlup with a Standard (Power 40) Ember move — Ember into Tide is 0.75:

```
Wickle ATK 60 → 75.  Puddlup DEF 55 → 69, HP 60 → 75.

40 × (75 / 119) × 1.125 × 0.75 × 0.6  ≈  13
13 / 75 HP  →  ~17% per hit  →  ~6 turns
```

Puddlup attacks Wickle with the same tier Tide move — Tide into Ember is 1.5:

```
Puddlup ATK 35 → 44.  Wickle DEF 25 → 31, HP 35 → 44.

40 × (44 / 81) × 1.125 × 1.5 × 0.6  ≈  22
22 / 44 HP  →  ~50% per hit  →  ~2-3 turns
```

**The same pair at level 25** (stats × 2.25, level term 1.625) gives ~17% and ~51% per hit — near-identical ratios. Proportional growth is what keeps fight length stable across the whole curve; this was verified, not assumed.

**Expected spread:** a lopsided matchup (frail attacker, tanky defender, type advantage) resolves in 2–3 turns. An even matchup on Basic/Standard moves runs 5–7. That spread is intended — type advantage should feel decisive, and the slow end leaves room to stop at the 50% and 25% HP thresholds taming needs.

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

---

## 7. Stats & Leveling

### The five stats

| Stat | Range (base) | Role |
|---|---|---|
| **HP** | 30–60 | Damage absorbed before fainting |
| **ATK** | 35–60 | Damage dealt |
| **DEF** | 25–65 | Damage reduced |
| **SPD** | 15–75 | Turn order; also the widest spread, so it's the most character-defining stat |
| **Bond** | 0–100 | Not a combat stat — see below |

### Stat growth

```
stat = round( base × (1 + Level / 20) )
```

All four combat stats grow at the same proportional rate. This matters more than it looks:

Flat growth (`base + Level × 2`) narrows every ratio as levels climb — Pebbet's DEF starts 2.6× Wickle's and drifts toward 1.5×, so by endgame every monster converges toward mush. Proportional growth holds Pebbet at 2.6× forever. **A monster's identity is its stat shape, and the shape has to survive the level curve.**

At max level a base stat of 60 becomes 135; a base stat of 25 becomes 56.

### Level curve

- **Max level: 25** for v1
- XP required for the next level: `round(15 × Level^1.5)`
- A wild win awards **40–120 XP**, scaled by the level gap — beating something above you pays much better than farming things below you
- **XP is shared across your party of 3**, so your whole team advances together and swapping in a fresh monster isn't punished

Total to max is roughly 30,000 XP — on the order of 300 battles for a single monster, which fits a 15–20 hour v1 without becoming a grind.

### Bond

Bond is the mechanical trace of how you got a monster and what you've done together.

| Event | Bond |
|---|---|
| Tamed through Attunement | starts at **30** |
| Hatched in the Resonance Chamber | starts at **50** — bred monsters are family |
| Win a battle with it on the field | +2 |
| It faints | −5 |
| Feed it a matching-element crystal | +5 (once per day) |

At **Bond ≥ 60** the monster gets the `BondBonus` of 1.05 from §5.

Bond exists to make the theme mechanical: monsters you earned and raised outperform monsters you merely acquired. It's also the hook for showing what's wrong with Meridian's method — extracted monsters sit at Bond 0 and are visibly unstable in battle, which is why the antagonists' teams underperform their levels.

### Inheritance

Covered in §6 — offspring average their parents per stat with a 25% chance per stat to inherit the higher value. Bond does not inherit; it starts at 50 for every hatch.

---

## 8. Story Spine

> Every proper noun in this section is a **placeholder**. See `naming.md` for the full register and the conventions behind each. Names are yours to set.

### The family

Four playable characters, one household of scientists. You pick one at the start.

| Character | Role | Angle |
|---|---|---|
| **Father** | Field biologist, ex-Meridian | Quit the company when he saw an extraction firsthand. Knows how they operate. |
| **Mother** | Rift physicist | Built the Resonator. The reason the family can cross at all. |
| **Son** (~14) | Behavioral prodigy | Reads monster body language better than any instrument. |
| **Daughter** (~12) | Self-taught engineer | Keeps the Lab running; built half of it from salvage. |

**Recommendation — cosmetic only in v1.** Each character gets their own portrait, dialogue voice, and corner of the Lab, but identical mechanics. This answers the open question from the last pass: character perks would multiply the balance work across every encounter for replay value that a v1 doesn't yet need. It also keeps the pitch honest — a parent and a child genuinely play the same game, at the same difficulty, and can talk to each other about it.

### The antagonist

**Meridian Dynamics** — a research corporation that opened the first stable rift and turned it into a supply chain. They extract Infinimon with **containment lattices**: fast, forced, and effective. Their director, **Dr. Halcyon Reeve**, is not a cackling villain — he believes he's securing a resource that will solve real problems on Earth, and the game should let him make that argument well.

### Three acts, six beats

**Act I — The Rift**

1. **First Contact** *(tutorial)* — A micro-rift opens in the family's backyard lab and a single Infinimon comes through, frightened. You attune to it. This is your starter, and it teaches battle and taming in one continuous scene rather than two tutorials.
2. **The Extraction** — You witness a Meridian crew lattice an entire wild herd. You are too small to stop it, and the game does not let you. Picking through the site afterward you recover a dropped **Rift Catalyst** — which unlocks the Resonance Chamber and your first hybrid. The inciting injury and the core mechanic arrive in the same beat.

**Act II — The Other Side**

3. **Crossing** — The family stabilizes a gate and reaches the native world. New zones, wild hybrids, and the first real scale of the damage: habitats that are simply empty.
4. **The Defector** — A Meridian researcher makes contact and trades the location of the main facility for protection. First major battle, against a company handler fielding extracted monsters — high level, Bond 0, visibly unstable. The player *feels* the Bond system land here.

**Act III — Collapse**

5. **The Facility** — Infiltration. The reveal: extraction is destabilizing the rift itself. The native world is collapsing *because* of the harvest. This raises the stakes past "poaching is wrong" into something the player can't just walk away from.
6. **The Choice** — Confronting Reeve, the obvious solution — close the rift — would strand every extracted monster on the wrong side of it forever. The endgame is a release-and-return sequence: you have to give monsters *back*, using bonding rather than battling, before the rift can close.

**The theme, mechanized:** they take, you return. The final sequence should be the one place where the game's central verb is giving a monster up — and it should cost the player something real to do it.

### Tone

Adventure, not grimdark. Children are a target audience. No monster dies; extracted monsters are "destabilized" and always recoverable. The corporation is wrong, not evil — and the strongest version of this story lets a kid and an adult read Reeve's argument differently.

---

## 9. Art Specification

### The pipeline

Creature design is **founder-led**. The workflow is your drawings refined by AI, never AI generating creatures from prompts.

```
1. YOU SKETCH        rough pencil or tablet — silhouette and key features.
                     Does not need to be clean.
        ↓
2. STYLE BIBLE       2-3 monsters finished fully by hand, first, as anchors.
                     Locks line weight, palette, proportion, eye style, shading.
        ↓
3. AI REFINEMENT     image-to-image, conditioned on your sketch AND on the
                     style bible. Cleanup and consistency, not invention.
        ↓
4. HUMAN PASS        every output gets manual correction. Non-negotiable.
        ↓
5. EXPORT            standardized sprite frames.
```

**Step 2 is the one people skip, and it's the one that decides whether this works.** Without hand-finished anchors, AI refinement drifts, and 27 monsters end up looking like 27 different games. Finish two or three completely by hand before refining anything.

**Step 4 is also non-negotiable.** AI reliably breaks limb counts, symmetry, and small details, and players notice on a creature they're going to look at a thousand times.

### Two practical cautions

**Keep every original sketch.** Refining your own drawings puts you in a much stronger position than generating from text prompts — commercially and creatively. Your sketches are evidence of human authorship, which matters if this ever earns money, gets licensed, or needs copyright registration. Archive them with dates alongside the finished art.

**Plan on disclosure.** App Store and Play Store policies around AI-assisted content have been tightening. Building the "human-authored, AI-refined" record from day one means disclosure is a checkbox later rather than a scramble.

### Sprite specs

| Property | Value |
|---|---|
| Source canvas | 512 × 512, transparent |
| Battle export | 256 × 256 |
| UI / dex export | 128 × 128 |
| List / party icon | 64 × 64 |
| States in v1 | **idle**, **attack**, **hurt** — 3 static frames minimum |
| Full animation | v2 |

**The 64px test:** every design has to stay recognizable at 64 × 64. If it doesn't read at icon size, the design is wrong — no amount of detail at 512 rescues it. Most mobile players see the small size more often than the large one.

### Style targets

- Bold, consistent outline weight
- Flat color plus a single shadow tone — cheap to produce, reads at any size, ages well
- Silhouette-first: each monster should be identifiable as a pure black shape
- High contrast against both light and dark backgrounds

### Palette

Six element palettes, five tones each (highlight / light / base / shadow / outline), plus a shared neutral ramp for eyes, teeth, claws, and UI. Hybrids draw from both parent palettes — typically the base body from the primary element and accents from the secondary.

### UI screens for v1

| # | Screen | Notes |
|---|---|---|
| 1 | Title & character select | Four family portraits |
| 2 | Zone map | Discrete zones, not open world |
| 3 | Battle | The screen that gets the most polish |
| 4 | Attunement | The frequency-bar minigame |
| 5 | Party management | 3 active + reserve |
| 6 | Infinidex | 27 entries, with silhouettes for undiscovered |
| 7 | Resonance Chamber | Breeding, egg status, Charge meter |
| 8 | Inventory | Crystals, catalysts |
| 9 | Dialogue / cutscene | Portrait + text box |
| 10 | Settings | Audio, text size, save |

---

## 10. Explicitly Not in v1

The purpose of this list is to make scope creep argue its way in. Everything below is a reasonable idea that has been deliberately cut.

### Cut — infrastructure

| Cut | Why |
|---|---|
| Accounts, cloud save, backend | Local save covers a single-player v1 entirely |
| Global species supply caps | Requires server-authoritative state; Rare Bloom (§6) delivers rarity without it |
| Trading, PvP, any multiplayer | Multiplies scope; needs the backend above |
| Player chat | COPPA exposure with a child audience, for near-zero v1 value |
| Monetization / IAP | Ship something people like first |

### Cut — game systems

| Cut | Why |
|---|---|
| Hybrid × hybrid breeding | The headline v2 feature; keeps the v1 dex hand-drawable at 27 |
| Recessive / hidden genes | Invisible depth is wasted across only 15 hybrids |
| Held items, abilities, natures | The classic "second layer" — each one multiplies balance work |
| More than 3 status effects | Three is enough to make type identity legible |
| Weather, day/night cycles | Content multiplier with no v1 payoff |
| Open-world traversal | Zones are discrete rooms on a map |
| Side quests beyond the 6 story beats | Main line first |

### Cut — production

| Cut | Why |
|---|---|
| Character customization | Wanted, and explicitly a v2 feature — it needs a modular art pipeline the 27-monster scope doesn't otherwise require |
| Full sprite animation | 3 static states ship; animation is polish |
| Voice acting | Text only |
| Original soundtrack | Licensed or minimal audio for v1 |
| Mobile builds | Web first. Capacitor wrap after the web version is fun |
| Localization | English only |

### The one rule

If something on this list gets promoted into v1, something else has to come off. The list is a budget, not a wishlist.

---

## Open questions for the next pass

1. **Move pools.** 27 species × 4 moves is the single largest remaining content task. Needs its own pass, and it's the last thing blocking a full prototype.
2. **Zone layout.** How many zones, which species spawn where, at what levels — this *is* the difficulty curve, and it can't be designed until move pools exist.
3. **Names.** Everything invented so far is a placeholder. See `naming.md`.
4. **Validate `K = 0.6` in simulation.** The §5 examples are now verified arithmetic at two points on the level curve, which is enough to justify building — but it is still not playtesting. A few hundred simulated battles across matchups is the actual check.
5. **Audio.** Untouched so far. Low risk, but it needs an owner eventually.
