# Infinimon — Naming Register

**Every name in the design document is a placeholder.** This file lists all of them in one place so they can be reviewed and replaced deliberately rather than discovered scattered through the design.

The **Convention** column explains the rule each name was built on. That rule matters more than the name itself — a consistent convention is what makes a world feel designed rather than assembled. Change the convention if you want, but change it for a whole category at once.

**How to use this file:** fill in the "Final" column. Anything still blank is unsettled. Once a name is final, it gets updated in `design-v1.md` and this file becomes the reference for it.

---

## 1. Title & top-level

| Placeholder | Convention | Final | Notes |
|---|---|---|---|
| **Infinimon** | Your original — "infinite" + creature suffix | | ⚠️ See trademark note below |
| **Infinidex** | Title + "index" | | Depends on the title |
| **Meridian Dynamics** | Corporate-neutral, sounds legitimate | | Villain should sound like a real company, not a villain |
| **Dr. Halcyon Reeve** | Slightly elevated, memorable, not sinister | | He believes he's right — the name shouldn't telegraph otherwise |
| *(family surname)* | Not yet chosen | | Needed for Act I dialogue |

### ⚠️ On the title

**Researched — see [`trademark-and-risk.md`](./trademark-and-risk.md) for the full findings.** Short version: no exact USPTO match for "Infinimon", and the bare `-mon` suffix looks far safer than feared (Digimon has coexisted with Pokémon since 1997). Nintendo enforces the **"Poké" prefix**, not `-mon`. Still do the following before any money, art budget, or store listing attaches to the name:

1. Run a **USPTO trademark search** (free, at tmsearch.uspto.gov) for the exact mark and near-misses
2. Check domain and app-store availability at the same time
3. **Have a backup name you'd be happy with** — the expensive version of this problem is discovering it after 200 hours of art carries the name

Renaming a game in pre-production costs an afternoon. Renaming after launch costs everything.

---

## 2. Elements (6)

**Convention:** single evocative English word, one syllable where possible, avoiding the literal element name — `Ember` not "Fire", `Tide` not "Water". Slightly more poetic than plain, still instantly readable by a child.

| Placeholder | Literal | Final |
|---|---|---|
| **Spark** | Electric | |
| **Tide** | Water | |
| **Ember** | Fire | |
| **Verdant** | Grass / Nature | |
| **Terra** | Earth / Rock | |
| **Gale** | Air / Wind | |

**Note:** `Verdant` and `Terra` are the two weakest here — `Verdant` is an adjective among nouns, and `Terra` is the only one that isn't plain English. Prime candidates if you want to start somewhere.

---

## 3. Hybrid elements (15)

**Convention:** the real-world result of combining the two parents. Physical and concrete — a player should be able to guess most of them before seeing the list.

| Parents | Placeholder | Final |
|---|---|---|
| Spark + Tide | **Current** | |
| Spark + Ember | **Plasma** | |
| Spark + Verdant | **Lumen** | |
| Spark + Terra | **Magnet** | |
| Spark + Gale | **Storm** | |
| Tide + Ember | **Steam** | |
| Tide + Verdant | **Marsh** | |
| Tide + Terra | **Clay** | |
| Tide + Gale | **Mist** | |
| Ember + Verdant | **Ash** | |
| Ember + Terra | **Magma** | |
| Ember + Gale | **Cinder** | |
| Verdant + Terra | **Grove** | |
| Verdant + Gale | **Spore** | |
| Terra + Gale | **Dust** | |

**Note:** `Lumen` (Spark + Verdant → bioluminescence) is the biggest reach — it's the only one a player won't guess. `Magnet` is the most mundane.

---

## 3b. Same-element blends (18)

**The everyday breeding result.** Two creatures of one element with different body
archetypes combine — a fire fox bred with a fire lizard gives a fire creature
carrying the fox's head on the lizard's frame.

**Convention:** a compound naming the two archetypes or the trait each parent
contributes, kept short and pronounceable.

| Element | Parents | Placeholder | Final |
|---|---|---|---|
| Spark | Voltmoth + Bolthorn | **Voltram** | |
| Spark | Voltmoth + Snapcoil | **Coilmoth** | |
| Spark | Bolthorn + Snapcoil | **Hornsnap** | |
| Tide | Puddlup + Finwhisk | **Whiskpool** | |
| Tide | Puddlup + Brineclaw | **Poolclaw** | |
| Tide | Finwhisk + Brineclaw | **Clawfin** | |
| Ember | Wickle + Scorchtail | **Scorchkit** | |
| Ember | Wickle + Coalpaw | **Coalkit** | |
| Ember | Coalpaw + Scorchtail | **Cindermaw** | |
| Verdant | Sproutle + Thornip | **Thornsprout** | |
| Verdant | Sproutle + Fernfawn | **Leaffawn** | |
| Verdant | Thornip + Fernfawn | **Bramblefawn** | |
| Terra | Pebbet + Burrowl | **Shellowl** | |
| Terra | Pebbet + Shalebug | **Cragshell** | |
| Terra | Burrowl + Shalebug | **Beetlebeak** | |
| Gale | Kitewing + Ruffle | **Kiteplume** | |
| Gale | Kitewing + Breezel | **Glidetail** | |
| Gale | Ruffle + Breezel | **Windruff** | |

**Notes:**
- Each blend also carries a **look** line in `prototype/engine.js` under `BLENDS`,
  describing which features come from which parent. Those are the seeds for your
  designs, not constraints.
- `Scorchkit` is the one from your example — fox ears and brush tail on a lizard frame.
- `Coalkit` and `Scorchkit` are close in sound and both Ember. Worth separating.

---

## 3c. Rare hybrid creatures (15)

The creatures produced by the **rare** cross-element fusion (§3 lists those elements).
Only about 1 in 10 cross-element pairings actually fuses, and the egg takes roughly
three times as long to hatch — so these are a genuine discovery.

**Convention:** same as the base roster — a compound of an element trait and a creature or body noun, two syllables where possible, pronounceable by a young child.

| Element | Placeholder | Built from | Final |
|---|---|---|---|
| Current | **Voltfin** | volt + fin | |
| Plasma | **Arcflare** | arc + flare | |
| Lumen | **Glimmoss** | glimmer + moss | |
| Magnet | **Lodefang** | lodestone + fang | |
| Storm | **Squallwing** | squall + wing | |
| Steam | **Kettlepup** | kettle + pup | |
| Marsh | **Bogbloom** | bog + bloom | |
| Clay | **Siltshell** | silt + shell | |
| Mist | **Hazewisp** | haze + wisp | |
| Ash | **Sootleaf** | soot + leaf | |
| Magma | **Cragmelt** | crag + melt | |
| Cinder | **Emberkite** | ember + kite | |
| Grove | **Barkroot** | bark + root | |
| Spore | **Puffcap** | puff + cap | |
| Dust | **Grithare** | grit + hare | |

**Notes:**
- `Arcflare`, `Squallwing`, and `Cragmelt` lean grander than the base roster, which is deliberate — hybrids should sound like an achievement. If that clashes with the cuter base names, this is the set to adjust.
- `Emberkite` reuses "ember" as a word while Ember is also an element name. Possibly confusing.
- `Kettlepup` and `Puffcap` are the most kid-friendly. `Lodefang` is the most severe.
- Each hybrid also has a **look** and a **personality** line in `prototype/engine.js` under `HYBRID_PROFILES`. Those are placeholder characterizations too — they're the seed for your creature designs, not a constraint on them.

---

## 3d. Regions (5)

**Convention:** two words, evocative and grounded — a landform or feature plus a qualifier. Lightly fictionalised rather than real place names, the way Pokémon regions map onto real geography without borrowing the name.

| Placeholder | Inspiration | Final |
|---|---|---|
| **Hollow Ridge** | Appalachia — the Smokies | |
| **Bayou Verge** | Gulf Coast — Louisiana wetlands | |
| **Sunstone Basin** | Desert Southwest — Sonoran canyons | |
| **Thunder Flats** | Great Plains — tornado alley | |
| **Evergreen Reach** | Pacific Northwest — Cascades old growth | |

**Notes:**
- `Hollow Ridge` is the starting region and the one closest to home for you — worth getting right first.
- `Thunder Flats` is the most on-the-nose. `Evergreen Reach` is the most generic.
- The native world on the other side of the rift **still has no name at all**.
---

## 4. Base creatures (18)

**Convention:** a portmanteau or compound of a trait and an animal, kept pronounceable by a young child, two syllables where possible. Deliberately avoiding the `-mon` / `-chu` / `-saur` endings that read as derivative.

| Placeholder | Element | Built from | Final |
|---|---|---|---|
| **Voltmoth** | Spark | volt + moth | |
| **Bolthorn** | Spark | bolt + horn | |
| **Puddlup** | Tide | puddle + pup | |
| **Finwhisk** | Tide | fin + whisker | |
| **Wickle** | Ember | wick + diminutive | |
| **Coalpaw** | Ember | coal + paw | |
| **Sproutle** | Verdant | sprout + diminutive | |
| **Thornip** | Verdant | thorn + turnip | |
| **Pebbet** | Terra | pebble + diminutive | |
| **Burrowl** | Terra | burrow + owl | |
| **Kitewing** | Gale | kite + wing | |
| **Ruffle** | Gale | ruffled feathers | |
| **Snapcoil** | Spark | snap + coil (serpent) | |
| **Brineclaw** | Tide | brine + claw (crab) | |
| **Scorchtail** | Ember | scorch + tail (lizard) | |
| **Fernfawn** | Verdant | fern + fawn (deer) | |
| **Shalebug** | Terra | shale + bug (beetle) | |
| **Breezel** | Gale | breeze + weasel | |

**Notes:**
- `Wickle`, `Sproutle`, and `Pebbet` all use the same `-le/-et` diminutive. Three is arguably one too many of the same trick.
- `Ruffle` is the only one that's a plain existing word — it reads a little flat next to the others.
- Every one of these should get a quick search before it's final. Two-syllable animal portmanteaus are heavily populated territory.

---

## 5. Mechanics & items

**Convention:** the taming and breeding systems are built on a **resonance / frequency** metaphor, deliberately opposed to Meridian's **containment / extraction** language. The two vocabularies should never overlap — that contrast is the story working through the interface.

| Placeholder | What it is | Convention | Final |
|---|---|---|---|
| **Resonator** | The taming device | Your side: frequency language | |
| **Attunement** | The taming action | Your side | |
| **Resonance Crystal** | Taming consumable | Your side | |
| **Resonance Chamber** | Where breeding happens | Your side | |
| **Trust** | The taming meter | Your side — plain, warm | |
| **Bond** | Relationship stat | Your side — plain, warm | |
| **Rift Catalyst** | Breeding unlock item | Rift tech, neutral | |
| **Charge** | Breeding fuel from battles | Neutral, energy | |
| **Focus** | Combat action economy | Neutral, mental | |
| **Rare Bloom** | 5% alt-palette hatch | Organic, positive | |
| **Containment Lattice** | Meridian's capture device | **Their** side: cold, industrial | |
| **Extraction** | What Meridian does | **Their** side | |
| **Destabilized** | State of a mistreated monster | **Their** side — clinical euphemism | |

**Note:** `Resonator` / `Resonance Crystal` / `Resonance Chamber` share a root three times. Consistent, but possibly repetitive in UI where all three appear together.

---

## 6. Status effects (3)

**Convention:** past-participle adjectives describing a visible physical state. Short enough to fit a battle UI badge.

| Placeholder | Effect | Final |
|---|---|---|
| **Scorched** | Damage over time | |
| **Drenched** | SPD halved | |
| **Rooted** | Cannot switch out | |

---

## 7. Not yet named

These don't exist yet and will need names when their sections get written:

- The **native world** on the other side of the rift, which has no name at all yet
- **~108 moves** (27 species × 4) — the largest naming job in the project by far, and worth setting a convention for *before* starting rather than during
- **The family surname**
- **The starter trio's in-fiction framing** — how the game presents the Wickle / Puddlup / Sproutle choice
- **The Lab** — currently just called "the Lab"

---

## Recommended process

1. **Settle conventions before individual names.** Deciding "hybrids are named for the physical result" takes five minutes and then generates fifteen names almost by itself. Deciding fifteen names one at a time takes an afternoon and produces an inconsistent set.
2. **Name the categories in dependency order** — title, then elements, then monsters, then moves. Later names lean on earlier ones.
3. **Search before committing.** USPTO for the title, plain web search for creature names.
4. **Say every monster name out loud.** These get spoken by children. If it's awkward in the mouth, it's wrong regardless of how it reads.
5. **Keep the placeholders in the code as IDs.** Use stable internal identifiers (`monster_01`, `element_ember`) so that renaming is a display-string change and never a code change. This is worth doing from the first commit — it makes renaming free, forever.
