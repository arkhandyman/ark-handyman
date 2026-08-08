# Infinimon — Design Document v1

**Status:** Sections 1–10 complete. Battle, taming, and breeding are implemented and simulation-validated in [`prototype/`](./prototype/) — several numbers in §3, §5, and §7 were corrected by what the simulation found.

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

Twelve tameable monsters, two per element.

> **These stat lines were solved by simulation, not assigned by hand.** The original design gave every monster a 180-point total for "trivial fairness." `prototype/balance.js` disproved that: equal budgets produced a **92-point win-rate spread** (Coalpaw 99.7%, Kitewing 7.7%), with `r = 0.987` correlation between `HP × (DEF + C) × ATK` and win rate. Stat points are not fungible — HP and DEF multiply each other, while SPD bought almost nothing. See §5 for the mechanical fix and §7 for the full finding.

| Name | Element | HP | ATK | DEF | SPD | Total | Rarity | Personality | Look |
|---|---|---|---|---|---|---|---|---|---|
| **Voltmoth** | Spark | 36 | 56 | 25 | 65 | 182 | Common | Skittish, drawn to light | Pale moth, lightning veins flickering through its wings |
| **Bolthorn** | Spark | 53 | 48 | 43 | 30 | 174 | Uncommon | Stubborn, plants its feet | Stocky ram, arcing charge between curled horns |
| **Puddlup** | Tide | 60 | 35 | 55 | 30 | 180 | Common | Cheerful, endlessly patient | Round puddle-creature, oversized eyes, wobbles |
| **Finwhisk** | Tide | 41 | 51 | 30 | 60 | 182 | Common | Playful, never still | Darting fish-otter with whisker fins |
| **Wickle** | Ember | 36 | 61 | 25 | 60 | 182 | Common | Timid but brave when cornered | Fox kit with a candle-flame tail |
| **Coalpaw** | Ember | 52 | 56 | 42 | 20 | 170 | Rare | Slow to trust, fiercely loyal after | Heavy badger, glowing cracks across its hide |
| **Sproutle** | Verdant | 55 | 40 | 55 | 30 | 180 | Common | Curious, follows you home | Sapling creature with leaf-bud ears |
| **Thornip** | Verdant | 39 | 59 | 30 | 50 | 178 | Common | Scrappy, picks fights | Bristly root-rodent, thorn ridge along its back |
| **Pebbet** | Terra | 60 | 40 | 65 | 15 | 180 | Uncommon | Unhurried, immovable | Small stone tortoise, moss on the shell |
| **Burrowl** | Terra | 44 | 49 | 39 | 45 | 177 | Uncommon | Watchful, hoards shiny things | Owl with earth-toned feathers and digging talons |
| **Kitewing** | Gale | 33 | 50 | 33 | 75 | 191 | Rare | Aloof, hard to hold onto | Paper-thin gliding manta, translucent |
| **Ruffle** | Gale | 48 | 48 | 39 | 40 | 175 | Common | Blustery, loud, harmless | Puffed-up bird, permanently windswept |

**Totals now range 170–191, and that spread is the point.** Fast, frail monsters need a slightly larger budget because SPD buys less than HP and DEF do. Measured win-rate spread is **10.8 points**, down from 92, and the correlation with the power formula has collapsed to `r = −0.145`.

**Rarity distribution:** 7 Common · 3 Uncommon · 2 Rare. Rarity sets the Trust requirement for taming (§4) and the spawn rate per zone — never raw power.

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

   > **Revised after playtesting.** The first version swept the needle *and* repositioned the target zone between every tap — two difficulty sources stacked, and it read as punishing. The zone now **stays put for the whole attempt**, starts far wider (34% of the track, up from 21%), and **grows with every tap that lands**, while the needle **slows down** as the creature settles. Both curves run in the player's favour, and both are thematic: it's calming down, so it gets easier to read.

5. **Score the Trust.**

| Source | Trust |
|---|---|
| Each tap inside the green zone | +1 |
| Matching Resonance Crystal offered | +1, and the zone widens further |
| Target is below 25% HP | +1, and the zone widens (a hurt creature is calmer) |
| Banked from earlier failed attempts | up to +3 |

6. **Compare against the requirement.**

| Rarity | Trust needed |
|---|---|
| Common | 2 |
| Uncommon | 3 |
| Rare | 4 |

A Common needs 2 of 3 taps — forgiving. Rare needs 4, which exceeds what taps alone can give, so it *requires* a crystal, a weakened target, or banked Trust from a previous attempt. Rarity is expressed through resources and preparation, never through demanding better reflexes.

7. **Resolve.**
   - **Trust met** → it joins your team. Dex entry unlocked.
   - **Trust short** → you **stay in the fight** with your Trust banked, and can weaken it further and try again. But each failure risks it bolting (**28%**, rising **22%** per subsequent failure), which caps retries at two or three.
   - **Knocked out instead of tamed** → no monster, no banked Trust. This is the real cost of being careless.

### Why this shape

Failure had to stop ending the encounter — losing a creature outright to three mistimed taps is the worst feel-bad in the loop. But simply removing that penalty made taming a formality: simulation showed **12 tames from 12 encounters**, because retrying with banked Trust eventually always works. The creature's finite patience restores the stakes without ever wasting progress you earned.

The live decision is still the good one: "hit it once more to reach the +1 low-HP bonus" versus "attune now before I knock it out." That costs nothing to learn and recurs every encounter.

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

### What SPD does

Originally SPD only decided turn order, which made it nearly worthless — that is what broke the stat budget in §3. It now does three things:

| Effect | Rule |
|---|---|
| **Turn order** | Higher effective SPD acts first; ties resolve on a visible coin flip |
| **Glancing blows** | A faster defender has a `min(0.40, SPDlead / 120)` chance that an incoming hit deals half damage |
| **Focus surge** | Outspeed the opponent by 1.5× or more and you regenerate **+2 Focus** per turn instead of +1 |

Glancing is damage reduction, not a miss — random whiffs feel bad, and a partial hit reads as the defender being quick rather than the attacker being unlucky. Focus surge is the important one: it ties SPD to the action economy, so a fast monster reaches its Strong moves roughly twice as often.

### Damage formula

```
damage = round(
    Power
  × ( ATK / (DEF + 70) )
  × ( 1 + Level / 40 )
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
| `K` | **0.30** — the global balance constant |
| `Variance` | random 0.9 – 1.1 |

The level term is `Level / 40`, not `Level / 25`: stats already grow proportionally (§7), so a steeper term would double-scale damage.

> **`K` was 0.6 in the original design and that was wrong.** At 0.6 the measured median fight was **2 turns**, not the intended 5–7 — because Focus starting at 3 affords a Power-65 Strong move on turn one, which the hand-worked examples (built on Power 40) never accounted for. Worse, 2-turn fights meant **~25% of wild monsters were impossible to tame**: they crossed 50% HP and fainted in the same blow, so Attune never unlocked. `prototype/tune.js` swept 60 combinations of `K`, starting Focus, and the DEF constant to find values that hold.

### Stat growth

Defined in §7. All four stats grow proportionally: `stat = round(base × (1 + Level / 20))`.

### Measured behaviour

These are simulation results across all 144 pairings, not hand arithmetic:

| Metric | Result | Target |
|---|---|---|
| Median fight length | **6 turns** (p10 3, p90 9) | 5–7 |
| Drift, level 5 → 25 | **0.3 turns** | stable |
| Taming window | **3 turns** median below 50% HP | ≥ 1 |
| Impossible-to-tame rate | **0.0%** | < 10% |
| Element win-rate spread | **9.4 points** | < 10 |
| Per-monster win-rate spread | **10.8 points** | < 15 |

Fight length is now flat across the whole level curve — proportional stat growth is what holds it there, and that was verified rather than assumed.

**One knob still worth a look:** type advantage currently wins **89.9%** of fights (neutral 48.9%, disadvantage 10.3%). That is decisive to the point of nearly settling a fight at team-select. Readable for a young player, but if it feels deterministic in testing, narrowing the multipliers from 1.5/0.75 toward 1.35/0.8 is the lever.

Reproduce any of this with `node simulate.js` in `prototype/`.

### Difficulty is separate from balance

Playtesting exposed a gap the balance harness could not see. `simulate.js` measures **equal-level 1v1 with both sides played optimally** — the right test for whether the *game* is fair, and the wrong test for whether a *player* is having a good time. A real player carries damage between fights, starts with one creature rather than three, and faces an AI that never misplays.

Four player-facing adjustments close that gap. None of them touch the symmetric balance above:

| Knob | Value | Why |
|---|---|---|
| **Wild AI accuracy** | 50% | Wild creatures aren't tacticians. They play their best move half the time and pick at random otherwise. An opponent that never misplays is the single largest reason a fight feels harder than the numbers predict. |
| **Incoming damage** | ×0.7 | Damage dealt *to* the player's creatures only. |
| **Post-battle heal** | 50% of max HP | Restored after every encounter. A loss recalls you to the Lab at full health — losing costs crystals, not time. |
| **Wild level** | tracks your best | Wild creatures roll at your strongest creature's level, or one below. Previously they rolled 5–7 against a starter permanently stuck at level 5. |

Plus **XP and leveling**, which the prototype was missing entirely — creatures now grow, which was the deepest cause of the difficulty complaint.

These knobs are neutralized inside the balance harnesses (`INCOMING_DAMAGE_MULT: 1, WILD_AI_ACCURACY: 1`), because otherwise they hand a permanent edge to whichever creature occupies the "player" slot and corrupt every matchup number. `playtest.js` is where they're exercised.

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

Every creature has an **element** and a **body archetype** — fox, lizard, crab, beetle, and so on. The archetype is what makes blending mean anything: without it, "they combine" has nothing to combine.

| Pairing | Result | Frequency |
|---|---|---|
| **Same element, different archetypes** | **Blend** — a new species carrying features of both parents | Always. This is the everyday case |
| Same species with itself | **Refined** line — stronger, same creature | Always |
| **Different elements** | **Rare hybrid** — the dual-element species (§2) | **10%**. Otherwise a throwback to one parent's line |

**Same-element blending is the core mechanic.** A fire fox bred with a fire lizard reliably produces a fire creature with the fox's ears and brush tail on a lizard's frame. It needs no explanation to a child, and it gives the art pipeline a clean rule: **head and markings from one parent, body and stance from the other, shared element palette.**

Three creatures per element × 3 pairings each = **18 blends**.

**Cross-element hybrids are the rare find.** You can attempt one any time, but only about 1 in 10 pairings actually fuses; the rest produce a throwback to one parent's species. Hybrids also need roughly **three times the Charge** to hatch. Rarity and patience reinforce each other, so a Kettlepup feels earned rather than selected from a menu.

### Eggs

Breeding produces an **egg**, not a creature. The result is decided at pairing time but stays hidden until it hatches.

An egg needs **Charge** to hatch, and Charge is earned by **battling** — never by a real-time timer. Every egg in the chamber draws from each battle you fight, so keeping several going is rewarded rather than punished.

| Outcome | Charge to hatch |
|---|---|
| Refined line | 40 |
| **Blend** | 65 |
| Throwback (failed fusion) | 65 |
| **Rare hybrid** | 190 |

This is what makes *some eggs hatch long before others*: a blend arrives quickly, a hybrid takes roughly three times as long. The chamber holds **4 eggs** at once.

| Requirement | Amount |
|---|---|
| **Rift Catalyst** | 1 per pairing — consumed |

**Rift Catalysts** are the pacing lever: story and quest rewards early, so breeding unlocks gradually and can't be farmed on day one. Charge is no longer spent to *start* a pairing — it's what the egg feeds on.

### What the offspring inherits

| Trait | Rule |
|---|---|
| **Species** | Fully deterministic — Ember + Tide always produces Kettlepup, in either selection order |
| **Stats** | Parents averaged (25% chance per stat at the higher value, ±6% variance), then reshaped by the hybrid's own stat bias — see below |
| **Moves** | Drawn from its two elements, primary first |
| **Bond** | Starts high — bred monsters are family, and they get the BondBonus from birth |

### Hybrid identity

Averaging two parents produces a creature with no character of its own. A Steam played and looked like "the mean of a Wickle and a Puddlup," which is not a discovery — it's arithmetic.

**Each hybrid element now carries a stat bias**, so every Kettlepup is recognizably steam-like — fast, vaporous, fragile — regardless of which Ember and which Tide made it. Parent stats still drive individual variation, so your Kettlepup differs from mine; the *species* is what's now consistent.

| Element | Creature | Character | Shape |
|---|---|---|---|
| Current | Voltfin | Restless, never settles | fast, high ATK |
| Plasma | Arcflare | Volatile, burns bright and brief | **+46% ATK, −33% DEF** — the glass cannon |
| Lumen | Glimmoss | Gentle, glows around those it trusts | bulky, low ATK |
| Magnet | Lodefang | Immovable, collects metal debris | high DEF, slow |
| Storm | Squallwing | Arrives before you hear it | **+42% SPD**, fragile |
| Steam | Kettlepup | Excitable, whistles when happy | fast, balanced |
| Marsh | Bogbloom | Patient to the point of seeming asleep | **+35% HP**, very slow |
| Clay | Siltshell | Steady, reshapes when nervous | high DEF/HP |
| Mist | Hazewisp | Rarely where you last looked | **+45% SPD**, evasive |
| Ash | Sootleaf | Smoulders quietly, holds a grudge | bulky bruiser |
| Magma | Cragmelt | Slow, heavy, absolutely certain | **+34% ATK**, slowest tier |
| Cinder | Emberkite | Playful, leaves scorch marks | fast attacker, paper defence |
| Grove | Barkroot | Ancient-feeling even when young | **+32% DEF**, the wall |
| Spore | Puffcap | Drifts wherever the wind decides | fast, low ATK |
| Dust | Grithare | Kicks up cover and vanishes into it | **+53% SPD**, the fastest |

**The bias redistributes, it does not strengthen.** After applying it, HP/ATK/DEF are rescaled to hit a power target — otherwise "biased toward HP and DEF" would just mean "stronger," which is exactly the trap the 180-point stat budget fell into (§7).

That rescale alone wasn't enough. Two further findings from `prototype/hybrids.js`:

1. **The power formula was blind to SPD.** It read `HP × (DEF + C) × ATK` — correct when SPD only set turn order, wrong once glancing blows and Focus surge gave it teeth. Fast hybrids were getting a full HP/ATK/DEF budget *plus* free speed, producing a **71.9-point win-rate spread** that tracked SPD almost perfectly. The formula now carries a SPD term.
2. **Equal power still doesn't mean equal strength.** Flattening the type grid entirely left a ~53-point spread, which ruled out matchups and pointed back at shape: extreme distributions underperform what the power product predicts. So each hybrid carries its own **power multiplier**, solved by gradient descent on measured win rate — from **0.84** for Hazewisp to **1.19** for Sootleaf.

Result: **23-point spread** (from 71.9), nobody dominant, nobody unplayable.

**Is breeding worth it?** A hybrid beats one of its own parents **63%** of the time — a real upgrade that doesn't make the base roster disposable.

Reproduce with `node hybrids.js`; re-solve with `node hybrids.js solve`.

### Rare Bloom

Every hatch has a **5% chance** to be a **Rare Bloom**: an alternate palette plus **+10% to all stats**.

This is the entire chase mechanic for v1. It gives collectible rarity without needing global supply caps, a server, or accounts — which is what lets v1 ship with a local save.

### Deliberately deferred to v2

- **Breeding two bred creatures.** Blends and hybrids can't currently pair. This is the obvious expansion and the reason the dex can grow later. The data model does not preclude it.
- **Globally capped species.** Requires server-authoritative state. The design is compatible with adding it; v1 simply doesn't need it.
- **Recessive/hidden genes.** Fun, but invisible depth is wasted when there are only 15 hybrids to find.

---

---

## 7. Stats & Leveling

### The five stats

| Stat | Range (base) | Role |
|---|---|---|
| **HP** | 33–60 | Damage absorbed before fainting |
| **ATK** | 35–61 | Damage dealt |
| **DEF** | 25–65 | Damage reduced |
| **SPD** | 15–75 | Turn order, glancing blows, and Focus regeneration (§5) — the widest spread and the most character-defining stat |
| **Bond** | 0–100 | Not a combat stat — see below |

### Stat growth

```
stat = round( base × (1 + Level / 20) )
```

All four combat stats grow at the same proportional rate. This matters more than it looks:

Flat growth (`base + Level × 2`) narrows every ratio as levels climb — Pebbet's DEF starts 2.6× Wickle's and drifts toward 1.5×, so by endgame every monster converges toward mush. Proportional growth holds Pebbet at 2.6× forever. **A monster's identity is its stat shape, and the shape has to survive the level curve.**

At max level a base stat of 60 becomes 135; a base stat of 25 becomes 56.

### The stat budget finding

The most useful thing the prototype produced is a negative result, and it is worth stating plainly because it generalizes:

**Equal stat totals do not produce equal monsters.** The design assumed a flat 180-point budget made balance trivial. Simulation showed a 92-point win-rate spread, because:

- Survivability is `HP × (DEF + C)` — **multiplicative**, so stacking both is quadratically strong
- ATK is **linear**
- SPD, when it only set turn order, was **nearly free** — points spent there were close to wasted

So a slow, bulky monster converted its budget at a far better exchange rate than a fast, frail one. The fix was two-sided: give SPD real mechanical value (§5), then solve the remaining imbalance numerically with `prototype/autobalance.js`, which holds SPD fixed as each monster's identity and scales HP/ATK/DEF by gradient descent on measured win rate.

Result: **10.8-point spread**, totals ranging 170–191. Budget by measured power, never by stat total.

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
4. ~~**Validate `K` in simulation.**~~ **Done** — and it failed. `K = 0.6` produced 2-turn fights and a 25% impossible-tame rate. Now `K = 0.30` with a swept, measured configuration. See §5.
5. **Type advantage may be too strong** at 89.9%. Needs human playtesting to judge; the multipliers are the lever.
6. **Audio.** Untouched so far. Low risk, but it needs an owner eventually.

---

## Prototype

`prototype/` implements §2–§7 as a shared engine used by both the browser build and the simulations.

| File | What it does |
|---|---|
| `engine.js` | The rules. No dependencies, runs in Node and the browser |
| `index.html` | Playable prototype — explore, battle, tame, breed |
| `play.html` | Single-file build of the above, generated by `build-artifact.js` |
| `simulate.js` | Full validation sweep — fight length, taming, balance, breeding rates |
| `tune.js` | Sweeps `K`, starting Focus, and the DEF constant against design targets |
| `balance.js` | Per-monster win rates, and the power-score correlation |
| `autobalance.js` | Solves stat lines by gradient descent on measured win rate |

```bash
cd prototype
node simulate.js        # validate everything
open index.html         # play it
```
