# Infinimon — Prototype

A playable implementation of the battle, taming, and breeding systems from
[`../design-v1.md`](../design-v1.md), plus the simulation harnesses that
validated (and corrected) the design's numbers.

No dependencies. No build step. No install.

## Play it

```bash
open index.html          # macOS
xdg-open index.html      # Linux
```

Or just double-click `index.html`. It works from `file://` — the engine loads
via a plain `<script src>` rather than an ES module specifically so it does.

`play.html` is the same thing as a single self-contained file, regenerated with
`node build-artifact.js`.

## What's implemented

- The six-element cycle and all 15 hybrid pairings (§2)
- All 12 base monsters with simulation-solved stat lines (§3)
- Attunement taming: the 50% HP gate, the three-tap frequency check, crystal
  offerings, the sub-25% bonus, and banked Trust on failure (§4)
- Turn-based battle: Focus economy, damage formula, glancing blows, Focus
  surge, three status effects, SPD turn order with visible coin flips (§5)
- Breeding: hybrid and same-element pairing, stat inheritance, Rare Bloom (§6)
- Proportional stat growth and the Bond bonus (§7)

## What's deliberately missing

Story, zones, the four playable characters, XP and leveling, save/load, and art.
The prototype exists to answer one question — *do taming and breeding feel
good?* — so everything not serving that was left out.

Creature art is placeholder colored blobs. Creature design is founder-led (§9);
these are stand-ins so the mechanics can be felt without waiting on art.

## Run the simulations

```bash
node simulate.js        # full validation report (~1 min)
node simulate.js 100    # more runs per matchup, tighter numbers
node balance.js         # per-monster win rates + power-score correlation
node tune.js            # sweep K / Focus / DEF constant against targets
node autobalance.js     # re-solve stat lines by gradient descent
```

Everything uses a seeded RNG, so runs are reproducible.

## What the simulations found

Three design assumptions failed on contact with measurement. All three are
fixed in the engine and corrected in the design doc.

**1. `K = 0.6` produced 2-turn fights, not 5–7.**
The hand-worked examples in the design used Power-40 Standard moves, but Focus
starting at 3 affords a Power-65 Strong move on turn one. `tune.js` swept 60
combinations; `K = 0.30` with `DEF + 70` now yields a median of 6 turns, flat
across the level curve.

**2. A quarter of wild monsters were impossible to tame.**
Attune unlocks below 50% HP. In 2-turn fights, monsters crossed 50% and fainted
in the same blow, so the window never opened — 20–27% of encounters, rising
with level. Now 0.0%, with a median 3-turn window.

**3. Equal 180-point stat totals did not produce equal monsters.**
This was the big one: a **92-point** win-rate spread (Coalpaw 99.7%, Kitewing
7.7%), with `r = 0.987` between `HP × (DEF + C) × ATK` and win rate.

Stat points are not fungible. Survivability is `HP × (DEF + C)` —
multiplicative, so stacking both is quadratically strong — while ATK is linear
and SPD, which only set turn order, was nearly free. Slow bulky monsters
converted their budget at a far better rate than fast frail ones.

Fixed in two parts:

- **SPD was given real value** — glancing blows and faster Focus regeneration
  when you outspeed by 1.5×. This alone cut the spread from 92 to 63.
- **`autobalance.js` solved the rest**, holding SPD fixed as each monster's
  identity and scaling HP/ATK/DEF by gradient descent on measured win rate.

Final spread: **10.8 points**, `r = −0.145`. Totals now range 170–191, and that
inequality is the finding — fast, frail monsters need a larger budget.

## Current measurements

| Metric | Result | Target |
|---|---|---|
| Median fight length | 6 turns (p10 3, p90 9) | 5–7 |
| Drift, level 5 → 25 | 0.3 turns | stable |
| Taming window | 3 turns median | ≥ 1 |
| Impossible-to-tame rate | 0.0% | < 10% |
| Element win-rate spread | 9.4 points | < 10 |
| Per-monster spread | 10.8 points | < 15 |
| Rare Bloom rate | 4.8% | 5% |
| Hybrids reachable | 15 / 15 | 15 |

## Known open item

Type advantage wins **89.9%** of fights (neutral 48.9%, disadvantage 10.3%).
That is decisive enough to nearly settle a fight at team-select. It is readable
for a young player, so this needs human judgement rather than more simulation.
If it feels deterministic in play, narrow the multipliers from 1.5/0.75 toward
1.35/0.8 in `engine.js`.

## Structure

| File | Role |
|---|---|
| `engine.js` | All rules. Shared by the browser and Node — one source of truth |
| `index.html` | Playable prototype |
| `play.html` | Generated single-file build |
| `build-artifact.js` | Inlines `engine.js` into `index.html` |
| `simulate.js` | Validation report |
| `tune.js` | Constant sweep |
| `balance.js` | Per-monster analysis |
| `autobalance.js` | Stat line solver |

Tuning constants live in `engine.js` under `CONFIG` and can be overridden at
runtime with `Infinimon.configure({ ... })`, which is how the sweeps work.
