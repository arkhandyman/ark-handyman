# Infinimon — Where We Are

Short handoff. Read this first; the other docs have the detail.

**Play it:** https://claude.ai/code/artifact/dd0ba62e-7be8-45d1-b607-9578d2dce288
**Branch:** `claude/game-idea-discussion-h6oh9z`

---

## What the game is

A creature-collecting game set across the United States. You travel between
regions, battle wild creatures, tame them by earning trust, and breed them to
get new ones. Breeding is the hook — it replaces evolution.

## What works right now

| Part | State |
|---|---|
| **18 creatures** | 3 each of fire, water, plant, earth, wind, electric |
| **Battle** | Pokémon-style screen, animated attacks, turn-based |
| **Moves** | Each creature has its own signature move; learned by level (1 / 4 / 8 / 12) |
| **Taming** | Weaken below 50% HP, then a 3-tap timing check |
| **Breeding** | Same type → 70% new creature, 30% improved parent copy |
| **Eggs** | Hatch by battling. Blends fast, rare fusions slow |
| **Regions** | 5 US regions, unlock as your creatures level up |
| **Saving** | Auto-saves in the browser |

## What's missing

- **Art.** Creatures are colored blobs. This needs the founder's drawings first.
- **Names.** Everything is a placeholder. See `naming.md`.
- **Towns, shops, NPCs.** Regions are spawn tables with a mood.
- **Story.** Outlined in `design-v1.md` §8, one beat per region, no dialogue.

---

## Files

| File | What it is |
|---|---|
| `design-v1.md` | Full design, sections 1–11 |
| `naming.md` | Every placeholder name, with a blank column to fill in |
| `trademark-and-risk.md` | Trademark research and the Nintendo question |
| `prototype/` | The working game plus its test scripts |
| `prototype/index.html` | The game |
| `prototype/engine.js` | All the rules |

---

## Decisions already made

- **Taming, not capture balls.** Weaken then earn trust. This also keeps us clear
  of the patents Nintendo asserted against Palworld.
- **Same-type breeding is the main way to get new creatures.** Cross-type fusion
  works but only succeeds 25% of the time.
- **Bred creatures inherit parent stats** and come out stronger 85% of the time,
  so breeding builds a bloodline.
- **Regions gate on level**, not keys or badges.
- **Cosmetic-only character choice** for the four family members in v1.

## Open questions for the founder

1. **Names** — `naming.md` has every placeholder waiting.
2. **A backup game name** — cheap insurance before art money is spent.
3. **Does the game feel right?** Difficulty, taming, breeding pace.
4. **Creature art** — draw 2–3 by hand to lock the style, then AI can help scale it.

## Likely next steps

- Towns and shops, so regions have somewhere to go
- A collection screen showing everything caught and bred
- Story dialogue
- Wiring in real art once sketches exist

---

## Working notes

- Keep sessions short. Long threads cost more every message.
- Avoid the heavy balance simulations in `prototype/` unless something is
  actually broken — they were the main cost driver.
- Plain language. No jargon.
