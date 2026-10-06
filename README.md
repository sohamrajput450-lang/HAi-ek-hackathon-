# YUDAANT · AI Behavioral Observatory

A deterministic laboratory for watching populations of interacting agents cooperate, compete,
trade, lie, form groups — and drift. Its reason for existing is not the animation: it is the
**controlled pair**. Two identical worlds, one differing setting, the same seed. Then a difference in
behaviour has exactly one candidate cause *inside the model*, and the app reports where the two
worlds first diverged and how large the difference is.

Everything runs locally in the browser (or headlessly in Node). There is no server, no account, and
no network call inside the simulation.

```bash
npm install
npm run dev          # http://localhost:5173  — the observatory UI
npm run simulate -- --agents 100 --rounds 200 --seed 1337 --pair --change MEMORY
npm run test         # 31 tests: engine invariants, analysis, UI integration
npm run shots        # real-browser pass over every tab (needs: npx playwright install chromium)
npm run build        # tsc --noEmit && vite build
npm run demo:quick   # pre-flight for presenting: verify + artefacts + numbers to quote
```

Presenting this to an audience? **`DEMO.md`** is the run-of-show: timed cuts (90 s / 3 min / 7 min),
the exact clicks and words, what to do when the browser dies, and the judge Q&A crib.

---

## The loop the UI is built around

| # | Step | Where |
|---|---|---|
| 1 | **Configure** a world: population, scarcity, memory, communication, reward structure, deception | Observe · left panel |
| 2 | **Run** it live (worker-driven canvas) or headless (thousands of rounds/sec) | Observe |
| 3 | **Watch structure appear**: groups, clusters, resource depletion, migrations | Observe · canvas |
| 4 | **X-ray a decision**: the utilities it compared, the weight of each factor, the memories it used | Observe · right panel |
| 5 | **Compare two worlds** that differ in exactly one setting, with first-divergence round and effect sizes | Compare |
| 6 | **Read the report**, run the next experiment it proposes, export everything | Report |

Press `?` anywhere in the UI for the shortcut sheet, or `▶ guided tour` in the status bar for a
seven-step walkthrough that drives the real app (every step actually runs).

---

## What an agent is

Six behavioural coefficients — `cooperation, competition, exploration, risk, adaptation, trust` —
generated from an archetype (`COOPERATOR`, `COMPETITOR`, `EXPLORER`, `CONSERVATIVE`, `OPPORTUNIST`,
`STRATEGIST`, `ADAPTIVE`), plus

* a **partner trust table** (sparse, decaying, per directed pair) — *this is memory*, and
* an **episodic record** of what happened to it (`OFF` / `SHORT` = last *N* / `LONG`).

Each round an agent enumerates legal actions, scores them linearly over ~30 factors computed from
state, memory and reinforcement history, and takes the maximum. There is a survival override: an
acute deficit outranks social actions, and if the needed resource is nowhere in sight it searches,
explores, or rests and converts stored food into energy.

That is the whole mind. Nothing is hidden: the X-ray panel reads the trace the scorer wrote *while
it decided* — chosen utility, alternatives, each factor's signed contribution, the exact input
values it consumed, and the realised reward on the next tick. No language model narrates the agent's
behaviour to you, and no model sits in the decision path.

### `memory: OFF` really means nothing is remembered

The trust ledger is disabled along with the episodic archive, because a trust table *is* a memory of
who did what. A control condition that quietly kept one would not be a control. Consequences that
follow mechanically: partner choice cannot be biased by history, groups cannot be founded (founding
needs ≥2 recorded interactions with that partner), conditional cooperation is undefined, and
`trustContingency` is exactly 0 by construction.

---

## Determinism

`sfc32` seeded streams, separated into `world | agents | events`, integer-indexed population,
typed-array state, no `Object.keys`/`Map` iteration order in the tick loop, no `Date.now()` or
`Math.random()` anywhere in the engine. Same config + same seed ⇒ bit-identical world.

```bash
npm run simulate -- --determinism-check --rounds 60 --agents 200
#   run 1 fingerprint: 502f503b / records 60
#   run 2 fingerprint: 502f503b / records 60
#   tail metrics identical: YES
```

The CLI and the browser run the *same* `Simulation` class, so an exhibit number and a scripted
number cannot drift apart.

---

## Metrics (29 per round, all exported)

`population · cooperationRate · repeatCoopRate · conditionalCoop · trustContingency ·
competitionRate · avgReward · totalReward · foodLevel · energyLevel · wealthLevel · avgTrust ·
commRate · msgAcceptedRate · groupCount · largestGroupShare · behavioralDiversity ·
behavioralEntropy · driftCount · inequality · tradeVolume · scarcityIndex · migrationIndex ·
clusterCount · densityMax · deceptionDetected · deceptionUndetected · falseAccusations · survivalRate`

Each has a published definition (hover a tile in the Metrics tab, or open the `raw` disclosure). A
few that matter for reading the results honestly:

* **cooperationRate** = `(COOPERATE + SHARE + 0.5·TRADE) / social actions`.
* **conditionalCoop** = `P(coop | partner cooperated last round) − P(coop | partner did not)`,
  accumulated over the run (a single round is too sparse to estimate it).
* **trustContingency** = within-agent `E[trust held | agent cooperated] − E[trust held | it did
  something else]`. Differenced per agent so personality cannot leak in; 0 exactly when memory is
  off, because there is then nothing to condition on.
* **deceptionDetected** counts a deceiver only when its claim failed `realityCheck` or its partner
  turned hostile. The observer never gets a ground-truth label in the decision path.
* **driftCount**: an agent leaves *its own* baseline frozen at round 12, needing a semantic change
  in a behaviour dimension and `distance > 1.5 × max(0.20, 1.4·populationShift + 0.06)` for three
  consecutive checks. Comparing against the configured genome instead would flag everyone.

---

## The analysis layer

`src/analysis` is deliberately a text generator over the run's own numbers, not an LLM wrapper.

* **discovery.ts** — trend (segment `z > 2.6`), abrupt shift (`|Δ| > 4.2σ` of the round-to-round
  change), lead/lag (`|r| > 0.45`, ≥20 aligned pairs), drift share, inequality, attrition,
  deception bookkeeping, social structure, action mix, and a *stability* finding when nothing cleared
  its floor. Every finding carries its evidence numbers and the command that reproduces it.
* **compare.ts** — refuses to attribute anything unless the configs differ in **exactly one**
  non-cosmetic key with equal seeds and equal round counts (`wellFormed`). Facts, interpretation and
  caveats are separate arrays; the UI renders them under those headings verbatim.
* **scientist.ts** — a report (question / method / facts / findings / comparison / threats / next)
  plus up to six proposed **hypotheses**, each changing one setting, each with a prediction and a
  one-click run.
* **report.ts** — CSV of every metric, Markdown, a self-contained printable HTML (inline CSS + SVG,
  zero external requests), a lossless JSON bundle, and a `bash` script of the whole experiment plan.
* **aiProvider.ts** — *optional*. An OpenAI-compatible endpoint may add one interpretive paragraph,
  labelled "generated · commentary only, not a measurement", capped at 140 words, forbidden from
  inventing statistics, with a hard instruction to state a limitation. If it is off, unreachable or
  slow, the deterministic text stays and nothing else changes.

Interpretation is always hedged to the simulation: *"within this simulation, holding the initial
world fixed"*. Temporal order in one trajectory is never presented as causation.

---

## Architecture

```
src/engine/       headless core: types · config · rng · world · memory · agents · policy ·
                  simulation · pack · protocol · client · worker
src/observation/  metrics · pairs (decaying ledger) · drift · emergence · observer
src/analysis/     causal · compare · discovery · templates · scientist · aiProvider · report
src/state/        store (selector-based external store) · app · live · derive
src/ui/           App · layout/TopBar · charts · components · panels · views
scripts/simulate.ts  CLI mirror of the UI: single run, --pair, --determinism-check, --out
```

* The engine runs in a **Web Worker** (`engine/worker.ts`) hosting up to two worlds (A/B) with a
  pacing loop that batches rounds per animation tick and pushes **transferable typed arrays**
  (structured clone = pointer move). React re-renders only when a *selector's output* changes, so
  500 agents and 60 fps coexist.
* Render frames bypass React entirely and go to a canvas renderer (`ui/panels/renderer.ts`); the
  metric strip, timeline and X-ray read from throttled status pushes. `src/state/live.ts` folds
  those into rolling per-round series so charts move before the run finishes.
* Seeking is honest: the timeline replays **stored** frames from the replay buffer and labels them;
  it never re-simulates to fake a rewind.
* Nothing flows back: analysis, charts and rendering cannot alter a decision. The only inputs to the
  engine are its config and its own state.

---

## Reproducible experiment (the flagship)

```bash
npm run simulate -- --pair --change MEMORY --agents 100 --rounds 200 --seed 1337 --quiet
```

| metric | A mean (memory LONG) | B mean (memory OFF) | Δ | first divergence |
|---|---|---|---|---|
| Groups | 13 | 0.00 | −13 | round 2 |
| Cooperation | 0.60 | 0.54 | −0.06 | — |
| Repeated cooperation | 0.94 | 0.78 | −0.16 | — |
| Conditional cooperation | 0.74 | 0.47 | −0.27 | — |
| Trust-contingent choice | −0.02 | 0.00 | +0.02 | round 8 |
| Energy level | 66 | 52 | −14 | — |
| Avg reward | 181 | 121 | −60 | — |
| Survival | 0.90 | 0.87 | −0.03 | — |
| Behavior drift | 0.84 | 2.48 | +1.64 | round 33 |

Read with the caveats the tool prints: one replicate per condition, effect sizes descriptive not
inferential, agents are utility maximisers rather than language models, and every label depends on
the detector thresholds above. Groups not forming without memory is a *mechanical* consequence of
the founding gate, not a discovery about real organisations.

Measured here (`npx tsx scripts/simulate.ts`, Node 20, single core, unloaded machine): 100 agents ×
200 rounds in 0.94–1.15 s (≈4.7 ms/round), 500 agents × 120 rounds in 2.37 s (19.75 ms/round, ≈51
rounds/s). The browser worker runs the same code, so a 200-round world fills its charts in about a
second — which is why the demo's headless button is the fast path, not a compromise.

---

## Tests

```
npm run test       # 31 passing
```

* `tests/engine.test.ts` — determinism (two runs, identical fingerprints **and** identical
  per-round metrics; a changed seed must differ), resource caps at every agent (a mis-clamped
  transfer once let energy exceed its cap and was invisible in aggregate statistics — this test is
  why it cannot happen again), metric range invariants, region-index bounds for non-square grids at
  300 agents, and that groups never form without memory.
* `tests/analysis.test.ts` — the worker payload round-trips to wire precision, discovery findings
  always carry numbers and a reproduce command, interpretation strings stay hedged, the report
  keeps facts and reading in separate sections, exports are complete and self-contained (the HTML
  must not reference the network), and the AI provider cannot be reached unless explicitly enabled.
* `tests/ui.test.tsx` — the shell mounts in jsdom, a **missing worker degrades loudly** (the error
  appears in the UI rather than hanging on a spinner), a saved bundle rehydrates into charts and
  report, the event stream cannot list one detection twice, and the selector hook re-renders exactly
  once per real change.
* `scripts/shots.mjs` (`npm run shots`) — drives the running app in headless Chromium through all eight
  tabs, asserts the pair reaches `well-formed pair` and the report contains its limits section, and
  **exits non-zero on any console error**. It is what found the three layout/keying bugs listed above.

Four bugs were found by testing rather than looking: memoryless agents founding groups anyway; a
selector returning a fresh array per render driving React into `Maximum update depth exceeded`; a
sticky table header painting *over* the status bar so its buttons could not be clicked; and duplicate
React keys from an event batch appended twice — which was also a doubled row in the detections list.
The first two came from vitest, the last two from `npm run shots`.

---

## Deliberate limits

* These are not language models. The transferable claim is about **mechanism design** — what memory,
  payoff structure and information access do to a population of optimisers — not about GPT behaviour.
* One run is not evidence. The tool says so in the report and offers the seed replication first.
* "Emergent" means "crossed a threshold", and the threshold is printed next to it.
* The taxonomy defines the labels; change the action set and "cooperative" means something else.
* Reward is cumulative and unbounded, so inequality partly measures run length.
* Wealth is soft-capped at 1000 and food/energy at 140 by a single clamp pass per round; `food` and
  `energy` are stocks, `wealth` accumulates by design.

## Files worth reading first

`src/engine/policy.ts` (how a decision is made and traced) · `src/engine/simulation.ts` (how the
world enforces it) · `src/observation/observer.ts` (how it is measured) · `src/analysis/discovery.ts`
(what counts as a finding) · `src/state/live.ts` (why the UI stays smooth).
