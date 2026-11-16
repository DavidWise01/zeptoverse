# zeptoverse

**NCI-002 — Noble-shell closure and Fibonacci comparison**

A visual, deterministic research notebook for the proposed `60/20/3/3/1/1` variable-cube model and electron-shell closure.

## Open the laboratory

Open [index.html](index.html) locally or, when GitHub Pages is enabled, visit https://davidwise01.github.io/zeptoverse/ .

## Verified reference sequence

Noble-gas atomic numbers: `2, 10, 18, 36, 54, 86, 118`.

Successive increments: `2, 8, 8, 18, 18, 32, 32`.

Distinct period-length magnitudes: `2n² = 2, 8, 18, 32` for `n = 1,2,3,4`. The repetition of some lengths reflects subshell filling; the formula alone does not predict exact shell configurations.

Fibonacci numbers: `1, 1, 2, 3, 5, 8, 13, 21, 34, ...`. Of the distinct period lengths, **2 and 8 occur in Fibonacci; 18 and 32 do not**. A Fibonacci branching rule remains a modeling hypothesis, not an established chemical law.

## Proposed kernel semantics

```text
{ brace [ BOX : constant ( TORROID : variable ) ] }
60 / 20 / 3 / 3 / 1 / 1
CLOSED(G) => identity(G) = 1/1  # END END
```

- 60: rotational symmetry-group order for a regular dodecahedron/icosahedron.
- 20: geometrical vertex/face count depending on the dual shape.
- 3, 3: **proposed** variable-cube directions/orientations, not electron quantum numbers.
- 1/1: terminal identity for a completed model generation, not an electron shell.
- Fibonacci: optional generational recursion, **not** asserted to generate the electron counts.

These interpretations are mathematical design hypotheses. Nothing here demonstrates that atoms are dodecahedra or that space is base-60.

## Tests

The browser laboratory performs five local assertions: shell totals match atomic numbers; differences reproduce the noble-gas period-length sequence; the distinct magnitudes agree with `2n²`; `60/20=3`; and the Fibonacci overlap is correctly identified. It contains no dependencies.

## Source ancestry

The observed chemistry sequence and this repository's geometric interpretation are **not independent witnesses** of the same underlying physical structure. Preserve the distinction until there is an independently testable prediction.

## Next experiment

Define a recurrence for the variable-cube model that predicts a held-out closure sequence without directly inserting electron counts. Freeze counterexamples as immutable test vectors before altering the recurrence.


## NCI-003 — Generational consumption of elements

Open the [interactive consumption simulator](consumption.html). It traverses Z=1…118 one neutral-atom electron per element address and can consume address steps in Fibonacci batch sizes (1,1,2,3,5,8,…). Every intermediate noble-gas closure is detected and preserved even if a batch crosses multiple boundaries. The browser contains six deterministic assertions for period totals, closure addresses, conservation, checkpoint crossing, Fibonacci recursion, and terminal geometry.

This is an **address-occupancy model**, not an actual nucleosynthesis simulator. Chemical elements are defined by proton count; producing heavier nuclei physically requires nuclear reactions, not simply adding electrons. The shell/period lengths are reference inputs, so matching their checkpoints does not establish a predictive theory of atom formation. The Fibonacci batch sizes govern exploration only and do not by themselves predict noble gases.


## NCI-004 — Conservation and comparison

Run [conservation.html](conservation.html) for two variable-cube reservoirs and an unallocated token pool with invariant `A + B + pool = 118`. Consume draws tokens into A; release returns them; transfer sends A to B; combine moves all of B into A. Every move adds a deterministic ledger entry. Fibonacci batches control *how many address tokens* to consume at once, not the physical nuclear reaction rate.

A separate candidate generator constructs `[2,8,8,18,18,32,32]` using `2n²` with the larger lengths repeated; it then cumulatively predicts `[2,10,18,36,54,86,118]`. The browser hides reference labels until the operator chooses comparison. **This is not a genuinely independent blind prediction**: the rule itself is motivated by known periodic-table patterns. Its usefulness is as a regression test and precursor to held-out predictions, not proof of a new physical law. The app tests six programmatic invariants.

`1/1 END END` is the proposed completed-generation identity. Reservoir tokens are modeling addresses, **not conserved physical electron numbers during nuclear transmutation**; chemical elements are defined by proton count and actual synthesis requires nuclear physics.


## NCI-005 — Two-cube generational competition

[Open the NCI-005 Canvas2D laboratory](competition.html).

Two abstract populations (A and B) compete for a shared finite pool. The rule set has four bookkeeping quantities:

- \`occupied(A)\` and \`occupied(B)\`: consumed structural address tokens.
- \`pool\`: unallocated resource units.
- \`spent\`: resources paid for closure events.

**Conservation:** \`occupied(A) + occupied(B) + pool + spent = initial_budget\`.

At each discrete round, the two populations request units at user-selected rates. Alternating turn order avoids permanently prioritizing A or B. A node cannot pass its next reference closure address \`[2,10,18,36,54,86,118]\`. When it reaches a boundary, it becomes pending, and the specified closure cost is paid from the pool before the checkpoint is sealed and growth resumes. A node may remain pending indefinitely if the pool is exhausted. The browser allows one round, ten rounds, or run-until-stalled and includes five deterministic counterexample scenarios. Changing parameters resets the ledger to maintain reproducibility.

An optional Fibonacci schedule multiplies per-round *requested demand*, not chemical shell capacity. The finite-pool, token-cost, and competition rules are a **toy generational model**, not chemical binding-energy estimates, nuclear transmutation, or measured noble-gas thermodynamics. The known chemical closures serve as provided address targets, so reaching them is not predictive confirmation.

**NCI-006 candidate:** Remove the supplied closure-address lookup, derive boundaries from a separately specified occupancy rule, and compare predictions on a withheld sequence without modifying the recurrence after inspection.


## NCI-006 — Derive closure addresses from subshell filling

[Open the interactive NCI-006 orbital closure generator](orbital-closure.html).

The generator constructs subshell labels for n = 1..7, with l = 0..min(n-1,3), each capacity 2(2l+1). It sorts subshells by increasing (n+l), breaking ties by n, and fills in that approximate Aufbau order. A generated closure is declared after a filled 1s² or after a fully filled ns² np⁶ pattern. Candidate closure addresses are computed as cumulative occupancies, without reading the reference noble-gas address array.

The separate comparison reference is [2,10,18,36,54,86,118]; the interface reveals it only when the user chooses comparison. A Fibonacci batch control and stepwise electron addition preserve intermediate closure crossings. Built-in assertions check ordering, capacity, electron totals, monotonic closures, recursion, and boundary traversal.

**Limitations:** This is a chemistry-informed reconstruction, not an independently blind prediction or a derivation from the proposed 60-fold variable cube. The Madelung (n+l) ordering is approximate, has known exceptions, and does not replace many-electron quantum calculations. Oganesson's physical behavior is affected by relativistic effects. A successful comparison does not establish the geometric model. The 1/1 terminal mark is a modeling label applied at detected boundaries.

**NCI-007 candidate:** Use a fully declared generational model to predict a held-out quantity (not an address already implicit in known shell structure), preserve failures, and compare it with an independent dataset.


## NCI-007 — Held-out first ionization energy prediction

[Open prediction.html](prediction.html).

The independent target observable is neutral-atom first ionization energy in electronvolts, from NIST ASD. The model is fitted to three preceding noble gases and evaluated on a selected held-out noble gas (Kr, Xe, or Rn). The reference remains sealed in the UI until the prediction is frozen.

Models:
- Least-squares regression: E(n) = a + b/n, fitted to the three previous noble gases.
- Fibonacci-weighted least squares with weights (1, 2, 3) as an exploratory heuristic.
- Persistence baseline: use the most recent known energy.

NIST neutral first ionization energies (eV), as recorded in the source: He 24.587389011, Ne 21.564541, Ar 15.7596119, Kr 13.9996055, Xe 12.1298437, Rn 10.74850.

Radon training on Ar/Kr/Xe using unweighted reciprocal-n regression predicts 11.4507521 eV. The NIST reference is 10.74850 eV; the absolute error is 0.7022521 eV (6.53349%). **Preserve this counterexample; do not claim exact prediction.**

Source: [NIST Atomic Spectra Database — Ionization Energies](https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html), ver. 5.12; query for neutral atoms: https://physics.nist.gov/cgi-bin/ASD/ie.pl?at_num_out=on&el_name_out=on&shells_out=on&spectra=H-Og+i&units=1

These are retrospective holdouts, not new measurements or genuinely prospective predictions. The model does not follow from the 60/20/3/3/1/1 geometry; Fibonacci weights are a hypothesis that can be compared against the unweighted and persistence baselines. Neither GitHub and its Pages mirror nor this page and its data source are independent confirmations of the hypothesis.

**NCI-008 candidate:** Preserve prediction packets and run leave-one-generation-out scoring across several targets, comparing the Fibonacci heuristic against a non-Fibonacci baseline before making claims of improvement.


## NCI-008 — Generational error ledger

[Open error-ledger.html](error-ledger.html).

**Protocol frozen before comparison:** For each chronological holdout Kr, Xe, and Rn, fit using only the preceding three noble gases. Compare three declared candidate models: unweighted least-squares in 1/n; Fibonacci-weighted least-squares with weights [1,2,3]; and the last-observation persistence baseline. Prediction packets contain the target, the model, and the specific training triple; they are frozen before the UI reveals the target measurement. Scoring uses MAE (mean absolute error in eV).

Reference data lineage: all neutral-atom first ionization energy measurements come from the same NIST ASD source cited in NCI-007. Overlapping training windows are not independent witness roots.

Expected retrospective absolute errors (eV; approximate):

| Holdout | Ordinary | Fibonacci-weighted | Persistence |
|---|---:|---:|---:|
| Kr | 2.455527 | 1.855863 | 1.760006 |
| Xe | 0.002284 | 0.156148 | 1.869762 |
| Rn | 0.702252 | 0.583869 | 1.381344 |
| **MAE** | **1.053354** | **0.865293** | **1.670371** |

The Fibonacci-weighted candidate improves aggregate MAE over the unweighted regression by approximately 0.188061 eV in this tiny retrospective set, but it loses on the Xe holdout and on Kr relative to persistence. It is **not validated as a general law**: three correlated cases are too few, and choices informed by prior known chemistry create model-selection bias. All errors are preserved, including unfavorable comparisons.

**Technical note:** The in-browser frozen ledger is session-local and is not automatically persisted to GitHub. The protocol and the expected reference comparison are stored in the repository. NCI-009 should prioritize a new out-of-sample dataset and explicit source-independent verification instead of interpreting this tiny benchmark as physical discovery.


## NCI-009 — Zeptometer to Planck scale

[Open the GitHub scale chapter](planck-scale.html).

At one zeptometer (10^-21 m) versus Planck length (approximately 1.616255 × 10^-35 m), the ratio is 6.187 × 10^13 (around 61.9 trillion), or 13.79 decimal orders, equivalent to about 7.76 successive divisions by 60.

An illustrated JPG and a fully standalone, JPG-embedded HTML companion were generated in the conversation. The GitHub chapter currently contains an inline SVG scale visualization; the binary JPG has **not** been uploaded to GitHub. Keep mathematical lengths separate from claims of observed physical discreteness. This comparison does not establish a real "zeptoverse" realm or Planck-scale lattice.

Project artwork convention: create one fresh narrative JPG and an offline, self-contained HTML with embedded JPG for each subsequent documented experiment.


## NCI-010 — Void, gravity and quantum-foam analogues

[Open interactive Canvas2D manifold](void-gravity-foam.html). Three adjustable terms depict a gravitational depression, an underdensity-associated rise, and a short-wavelength ripple. The scalar height function is purely illustrative and does not solve Einstein's equations. Neither cosmic voids nor Planck foam can be inferred from literal dents in a 2D sheet. A companion self-contained JPG-embedded HTML illustration was delivered in the conversation; the repository's page contains its own interactive canvas, not that JPG binary.

The base-60 zeptometer-to-Planck gap is log_60(10^-21 / (1.616255e-35)) ≈ 7.76 generations. Sub-Planck divisions are mathematical extrapolations rather than measured cells.


## NCI-011 — Triadic Engine

[Open the NCI-011 HTML experiment](triadic-engine.html). A visual, normalized-budget model couples three **distinct analogies**, not a confirmed unified physical process: Casimir boundary effects, Kelvin/Peltier/Seebeck thermoelectric transfer, and Newtonian mechanical response. Three proposed semantic operators are **diatomic** (couple), **diodic** (directional gating), and **divisive** (conservative partition). The interactive sliders demonstrate strict allocation of a toy input budget into output, stored, and remaining/loss quantities. The separate high-definition JPG-embedded standalone HTML is delivered as a conversation artifact; the GitHub version includes a vector diagram rather than the image binary.

Physical notes: the Casimir effect involves quantum electromagnetic boundary conditions; Kelvin relations connect Seebeck, Peltier, and Thomson coefficients; a candle-powered thermoelectric generator relies on a temperature difference and the Seebeck effect, whereas Peltier pumping consumes electric work. Newton's law models classical mechanical response. Planck-scale spacetime foam remains hypothetical. The shared 60/20/3/3/1/1 notation is model metadata, not experimentally demonstrated physics.


## NCI-012 — Ice IX hydrogen-lattice driver

[Open the interactive hydrogen-ordering experiment](ice-ix-driver.html).

Ice IX is the proton-ordered counterpart of ice III, at low temperatures and high pressure. The water lattice has approximately tetrahedral, four-neighbor hydrogen-bond coordination. Real Ice IX is tetragonal and may retain residual proton disorder. The 2D canvas graph is a **schematic routing analogy**, not the actual structure or guaranteed enforcement of all Bernal-Fowler constraints.

Conceptual operators: **diatomic** (connect two sites), **diodic** (conditionally direct an edge), **divisive** (split an abstract conserved resource). None has been demonstrated as an Ice IX engine or a Planck-foam driver. The full NCI-012 narrative JPG is embedded in a separately generated standalone HTML delivered with the experiment; the interactive GitHub page does not yet include that binary JPG.

Source: [J. Chem. Phys. 154, 114502 (2021)](https://doi.org/10.1063/5.0032485).


## NCI-013 — Death-Roll Diodic Accretion

[Open the interactive five-part chapter](nci-013.html). Five parts: (1) diatomic/diodic/divisive operators; (2) conservation and lineage witnesses; (3) legal split/branch partitions; (4) Ice IX inspired lattice analogy; (5) live two-stage lineage test (A captures B to form AC, AC captures D to form ACD). This is an abstract computational model, not a validated chemical or quantum-gravity mechanism. The published GitHub chapter itself now embeds the original neon JPG as a base64 data URI, making the chapter self-contained; the standalone chat attachment contains the same illustrated chapter.

## NCI-013 — Executable Death-Roll Diodic Accretion kernel

**Source of truth:** [kernel/nci-013-kernel.mjs](kernel/nci-013-kernel.mjs) and [kernel/nci-013.test.mjs](kernel/nci-013.test.mjs).

This is a deterministic state-transition kernel, **not** an image. It provides five implementations:

1. **Formal operators:** `pair` (diatomic link), `capture` (directional diodic accretion), `divide` (partition).
2. **Conservation:** each original root appears in exactly one active composite; its integer unit budget cannot change or double count.
3. **Branch/split:** a state can divide into disjoint root partitions, producing two descendants with unique labels.
4. **Lattice:** `orient` specifies directed bonds; `iceRule` checks four bonds and two inbound/two outbound directed bonds at selected vertices. This is a graph-level ice-rule analogy, **not a chemically exact proton-location simulation**.
5. **Runnable harness and previous HTML storyboard:** `replay` deterministically replays a specified sequence, and `checkpoint` seals a snapshot with `1/1 END END`. The illustrated [nci-013.html](nci-013.html) remains documentary, not the kernel.

Run with Node.js using `node kernel/nci-013.test.mjs`. Example:

```js
import {createKernel,capture,checkpoint} from "./kernel/nci-013-kernel.mjs";
let state=createKernel(["A","B","D"].map(id=>({id,units:1})));
state=capture(state,"A","B","AC");       // label AC, roots [A,B]
state=capture(state,"AC","D","ACD");    // label ACD, roots [A,B,D]
state=checkpoint(state,"END END");
```

**Naming convention:** `AC` is a user-defined composite label; ancestry always records `[A,B]`, so root B is not silently replaced by root C. Events are append-only within each new state snapshot and source input states are not mutated. This is a conceptual computational model, not evidence of Ice IX nuclear chemistry or quantum foam behavior.


## NCI-014 — Recursive Diodic Selection (executable kernel)

**Run it:** [nci-014.html](nci-014.html) imports and executes [kernel/nci-014-kernel.mjs](kernel/nci-014-kernel.mjs) alongside the NCI-013 kernel. Tests: [kernel/nci-014.test.mjs](kernel/nci-014.test.mjs).

Rules: `candidates` evaluates adjacency between preserved underlying root sites and ranks by number of boundary edges, smaller combined unit count, then lexicographic ID. `attempt` refuses capture if participants are inactive, aren't neighbors, violate the four-edge/two-in/two-out directed rule, exceed a unit cap, or collide with an existing label. Rejections append an immutable-style evidence event without changing active roots or occupied units. `selectAndCapture` tries ranked neighbors deterministically. `iterate` repeats with a bounded step count and an explicit stop reason, preserving all ancestry. The older source state remains unmodified; each operation returns a separate snapshot.

The demonstration `makeDemo` creates a **five-site mathematical complete graph K5 with regular orientation**, so each vertex has four neighbors and two incoming/two outgoing edges. K5 is **not** the crystallographic geometry of ice IX; this tests abstract local ice-rule bookkeeping only. Capture groups lattice sites but does not delete or rearrange microscopic bonds. The kernel does not model actual proton hopping, activation energies, quantum foam, or autonomous chemical synthesis.

To test with Node 22:

```sh
node kernel/nci-013.test.mjs
node kernel/nci-014.test.mjs
```

[GitHub Actions kernel tests](.github/workflows/kernel-tests.yml) run both files on commits affecting the kernel. CI passing is a separate runtime observation, not inferred from file creation. The existing NCI-013 JPG story remains optional documentation only.

**NCI-015 candidate:** Add a real crystallographic lattice graph and proton-position constraints, keeping the 2-in/2-out graph invariant distinct from physically correct ice proton configurations.

## NCI-015 — Microscopic proton constraints and loop moves

[Open the NCI-015 executable HTML runner](nci-015.html). Its actual source is [kernel/nci-015-kernel.mjs](kernel/nci-015-kernel.mjs), with [deterministic Node assertions](kernel/nci-015.test.mjs).

**Physical motivation:** real ice IX is a proton-ordered counterpart of ice III, crystallizing in the tetragonal P4₁2₁2 space group. It may retain small residual hydrogen disorder. References: [AIP J. Chem. Phys. 154, 114502 (2021)](https://doi.org/10.1063/5.0032485); [Royal Society of Chemistry Ice IX crystallography supplement](https://www.rsc.org/suppdata/d0/nj/d0nj04687f/d0nj04687f1.pdf).

**Model fidelity:** The simulator uses an abstract four-coordinated five-site K5 graph, NOT measured Ice IX atomic coordinates. It assigns one bond proton to one donor endpoint and two donor/two acceptor assignments per vertex. It distinguishes conceptual composite grouping (NCI-013/014) from changing the microscopic proton assignment.

- A single directed bond reversal changes endpoint donor counts from 2/2 to 3/1 and 1/3: reject and append an unmodified-state counterexample.
- Reversing a closed oriented triangle preserves 2/2 at every vertex: accept, copy the state, append the transition.
- Deterministic cycle enumeration and bounded iteration make replay reproducible.
- Every edge retains exactly one donor endpoint: total bonded proton assignments stay constant.
- Invalid cycle selection is recorded, not silently repaired.

This is **not** a physically accurate Ice IX unit cell, dynamical proton-tunneling model, thermodynamic transition model, or Planck-foam validation. The next step should import crystallographic data with independently verified atom coordinates, periodic bonds, and hydrogen positions before claiming Ice IX-specific topology.

## NCI-016 — Reversible geometry, irreversible evidence lineage

[Execute the kernel in HTML](nci-016.html) · [Source](kernel/nci-016-kernel.mjs) · [Node tests](kernel/nci-016.test.mjs).

**Invariant:** A legal directed bond-cycle reversal changes the orientation of an abstract ice-rule graph while retaining each site's 2-in/2-out condition. Reversing that same cycle in reverse orientation recovers the **identical canonical model state**, but the event history contains both transitions. Thus `state_2 = state_0` does not imply `history_2 = history_0`.

- `beginMemory` captures an immutable-style genesis snapshot and a deterministic state checksum.
- `transition` adds an accepted loop reversal or a rejected counterexample and records both before/after checksums.
- `reverseLast` constructs the inverse of the most recently accepted directed cycle.
- `settle` issues `1/1 END END` only when the current model state exactly matches genesis.
- `verifyMemory` checks continuous event ancestry, unchanged state for rejected operations, and local ice-rule validity.

Checksums use **FNV-1a 32-bit** solely to detect accidental state mismatch; collisions are possible, so this is not a cryptographic witness or formal proof of exact equality. Future work should also compare full canonical structures and, if adversarial integrity is needed, use a cryptographic digest.

The model still uses the five-site **K5 surrogate**, not physical Ice IX coordinates. The algorithm demonstrates reversible graph transformations and permanent computational history, not laboratory-reversible thermodynamics or evidence that spacetime is elastic memory foam.

Test with `node kernel/nci-016.test.mjs`. GitHub CI runs the test on changes to the kernel.

## NCI-017 — Identical physical state, different learning history

[Interactive runnable laboratory](nci-017.html) · [Source](kernel/nci-017-kernel.mjs) · [Test suite](kernel/nci-017.test.mjs)

**Separate two state layers:**
- Physical state: original microscopic graph, directed proton bonds, and conservation/ice-rule checks from NCI-015.
- Policy state: ordered, append-only *simulated observations* about attempted choices. A policy observation does not change microscopic orientation.

`evidence` records the outcome of a previously selectable directed-cycle action; `choices` ranks available cycles deterministically using `score=successes-2×failures` and lexicographic ties; `act` performs the selected legal directed-cycle reversal; `inverse` restores the microscopic configuration while preserving all policy evidence; `validateWorld` checks local ice rules and contiguous policy event sequence.

**Core test:** Worlds `W0` and `W1` have byte-for-byte identical physical state. Adding simulated failure feedback to `W1.policy` changes the preferred action, while keeping `W1.physical===W0.physical` structurally. This demonstrates *path-dependent decision policy*, not physical time hysteresis.

**Important limitations:** Feedback is deliberately synthetic in the initial test, not observed experimental Ice IX behavior. The bond topology is still the K5 surrogate, not crystallographic Ice IX. The policy ledger is append-only by returned-state convention but not cryptographically tamper-proof. No self-learning is inferred from the geometry itself.

Node test: `node kernel/nci-017.test.mjs`; committed workflow includes NCI-017.

## NCI-018 — Closed-loop generational self-correction

[Interactive kernel runner](nci-018.html) · [ES module](kernel/nci-018-kernel.mjs) · [Node assertions](kernel/nci-018.test.mjs)

**New invariant:** `physical_state_after_trial === physical_state_before_trial` for each bounded policy-calibration trial, while the feedback ledger grows. The successor policy may choose a different action from the same microscopic state based on its recorded outcomes.

1. `objectiveFor` declares a fixed *synthetic* task: select the lexicographically last legal directed cycle in genesis. This target is not a property of physical Ice IX.
2. `trial` selects a candidate using NCI-017, performs a legal microscopic cycle reversal (NCI-015), reverses the same cycle to restore genesis (NCI-017), checks exact microscopic orientation equality, then appends feedback and an evaluation event.
3. `train` executes at most a caller-specified number of generations, stopping early on target success, no candidate, or budget exhaustion.
4. `audit` checks all evaluations recorded restoration, physical state still matches original genesis, and local ice-rule remains valid.
5. `kernel/nci-018.test.mjs` asserts scores improve from -1 to +1 over two generations in the declared toy task and that repeated runs produce structurally identical results.

**Evidence boundary:** this proves a software policy can improve against a fixed, constructed score while its surrogate graph remains invariant; it is **not** experimental learning by water molecules, full crystallographic Ice IX simulation, or quantum-gravity evidence. The runtime and tests are authored in the repository, and CI pass must be checked separately.

Run: `node kernel/nci-018.test.mjs`.

## NCI-019 — Transferable learning without duplicate witnesses

[Runnable laboratory](nci-019.html) · [Kernel source](kernel/nci-019-kernel.mjs) · [Node tests](kernel/nci-019.test.mjs).

**Invariant:** identical directed graph structure under a validated one-to-one site relabeling can support *mapped policy transfer*. Raw node labels need not match, but every graph bond and its donor→acceptor orientation must match exactly.

- `findMapping` checks all one-to-one mappings for at most seven original sites, returning a verified directed graph isomorphism (no approximation).
- `renameSurrogate` produces a disconnected naming surface for an identical abstract graph; it is not a second scientific witness.
- `transfer` maps source `POLICY_FEEDBACK` to a target legal cycle, canonicalizes its cyclic starting vertex, and preserves the source event's ancestry.
- A repeated import with the same `sourceId#sequence` is rejected as duplicate, rather than counted as corroboration.
- `checkTransfer` verifies independent-witness status stays false for imported observations, root keys are unique, and the local ice rule holds.
- The underlying target orientation never changes during policy transfer.

The demonstration uses synthetic feedback from NCI-017 and a mathematical K5 proton-rule surrogate. It proves neither real Ice IX structure nor learning by hydrogen bonds. **Exact policy transfer is allowed only after structural verification**; no transfer is assumed on a different graph.

Run with Node 22: `node kernel/nci-019.test.mjs`. CI must be independently checked for success.

## NCI-020 — Balanced ternary nested-foam kernel, not literal kelvin

[Interactive executable runner](nci-020.html) · [kernel source](kernel/nci-020-kernel.mjs) · [tests](kernel/nci-020.test.mjs)

The kernel now preserves the canonical **`{-1, [0, (+1)]}`** set. The three digits are dimensionless signs of relative deformation or adjustment: `-1` negative, `0` reference, `+1` positive. They **do not mean** physically measured -1 K, 0 K, or +1 K. Negative temperatures have special thermodynamic interpretations in restricted systems and are not simply less than zero kelvin. Casimir vacuum-energy changes can be negative *relative to the reference vacuum* for certain boundaries but are not a source of infinite energy. Hypothetical Planck-scale spacetime foam is not observed three-level material.

- `balancedDigits` and `decodeDigits` implement signed base-3 integer representation.
- `newFoam` recursively partitions one root into ordered three-child generations: each child has sign `-1,0,+1` and preserves a single `witnessRoot`. Depth is bounded to 7.
- `rotate` cyclically permutes sibling signs without changing net signed balance.
- `redistribute` changes an opposing signed pair to a neutral pair and reverses that operation; invalid transfers record a `REJECT` event.
- `verifyFoam` and `audit` check three children per parent, local sum zero, total signed balance zero at each depth, identical root ancestry, sequence continuity and unchanged root units.
- `terminate` emits `1/1 END END` only after conservation checks.
- `kernel/nci-020.test.mjs` checks signed digits, 1/3/9/27 generation sizes, inverse rotations, pair operations, rejection, checkpoint and replay.

**Bound:** This models a nested signed-state algebra and bookkeeping across scale, not a physically validated Casimir/quantum-foam law. A physically faithful follow-up needs measurable energy units, boundary conditions and separate thermodynamic variables.

## NCI-021 — Signed boundary force kernel in SI units

[Executable browser lab](nci-021.html) · [physical kernel module](kernel/nci-021-kernel.mjs) · [Node invariant tests](kernel/nci-021.test.mjs).

Physical layer uses the standard ideal, perfectly conducting, zero-temperature, parallel-plate Casimir solution for separation `a` and plate area `A`:
- `E(a) = -π² ħ c A / (720 a³)` in joules.
- `P(a) = -π² ħ c / (240 a⁴)` in pascals, always attractive (negative for the chosen gap coordinate).
- `F(a) = P(a) A` in newtons.
Sources: [NIST Casimir measurements review](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=906575); [Casimir-energy formula review](https://www.osti.gov/servlets/purl/1850190).

Independent ternary layer maps *relative separation from genesis* to `-1` for compressed, `0` for unchanged, `+1` for expanded. These numbers are **not kelvin**, nor do they imply that the attractive force reverses sign at `+1`.

For a quasistatic, lossless idealized plate displacement `a0 → a1`, the change in field interaction energy is `ΔE=E(a1)-E(a0)`. A tracked external-work reservoir is debited by `ΔE`, so `E + reservoir = E_initial` to floating-point tolerance. The ledger records each move and permits moving back to reference; a restored checkpoint receives `1/1 END END`. Invalid nonpositive or nonfinite gaps produce an immutable-style rejection event.

**Model boundary:** finite conductivity, roughness, edge effects, plate elasticity, temperature corrections, dielectric response, inertia, dissipative mechanics, and quantum gravity are not included. No physical Planck-foam three-state model is asserted. Test with `node kernel/nci-021.test.mjs`; publication does not imply CI passed.

## NCI-022 — Three Casimir boundaries, one conserved energy ledger

[Execute the browser kernel](nci-022.html) · [ES source](kernel/nci-022-kernel.mjs) · [Node regression tests](kernel/nci-022.test.mjs).

**Invariant:** `Σ_i E_Casimir(gap_i) + Σ_i stored_work_credit_i + external_reservoir = initial_total`. Three independent ideal parallel-plate gaps are measured in meters, interaction energies in joules, and pressures in pascals. The `−1/0/+1` ternary state is solely relative to the original *gap*, never a kelvin measurement or an independently signed Casimir interaction force.

- **Diatomic:** `diatomic(A,B,gapA,gapB)` changes two physical plate separations in one deterministic action and updates the external reservoir by the negative Casimir interaction-energy change.
- **Diodic:** `diodic(A,B,J)` permits work-credit transfer in the directed cycle `A→B→C→A`. These transferable credits are abstract, initially supplied energy bookkeeping; no mechanism converting Casimir force directly to stored electrical energy is asserted.
- **Divisive:** `divisive(B,"main",f,"left","right")` splits a credit account into two children without duplicating energy, lineage or a physical plate. `join` recombines them.
- **Rejection and evidence:** `attemptDiodic` records prohibited reverse transfers as failed events without mutating physical gaps or stored credits.
- **Closure:** a signed `1/1 END END` checkpoint requires restoration of all three physical gaps, the original credit account identities and balances, and the external work reservoir.
- The deterministic test performs paired deformation, (A→B), a credit split/join, (B→C→A), restoration, and ledger closure.

**Limits:** The model assumes perfectly conducting, flat, effectively infinite plates at zero temperature, quasistatic displacements, zero losses, and an illustrative externally supplied credit reservoir. It is **not** a demonstrated Casimir heat engine, thermoelectric power source, physically accurate Ice IX lattice, negative absolute-temperature model, or Planck-foam experiment. More physically useful steps would add measured thermal conductivity, losses and work-to-electricity conversion efficiencies.

Local test command: `node kernel/nci-022.test.mjs`; CI success and Pages publication require independent verification.

## NCI-023 — Kelvin–Peltier thermal loss and second-law invariant

[Run the browser kernel](nci-023.html) · [ES module](kernel/nci-023-kernel.mjs) · [Node tests](kernel/nci-023.test.mjs).

Three-boundary Casimir physical and credit accounts from NCI-022 remain a separate subsystem. NCI-023 adds a conventional **ideal thermoelectric cooling module**, with fixed hot/cold reservoir temperatures `Th` and `Tc` in kelvin, constant Seebeck coefficient `α`, current `I`, internal resistance `R`, and thermal conductance `K`. This constant-Seebeck model omits Thomson heating and temperature-dependent material properties.

- Cold heat absorbed: `Qc = α I Tc − ½ I²R − K(Th−Tc)` (watts).
- Hot heat released: `Qh = α I Th + ½ I²R − K(Th−Tc)` (watts).
- Electrical input: `P = α I (Th−Tc) + I²R = Qh−Qc` (watts).
- Entropy generation rate: `Sdot = Qh/Th − Qc/Tc >= 0` in W/K. Joule heating and Fourier thermal leakage contribute positive entropy.
- Cold-side coefficient of performance `COP = Qc/P` when Qc and P are positive, bounded by the cooling Carnot limit `Tc/(Th−Tc)` for `Th>Tc`.

The `tick(seconds)` operation updates separate cold reservoir, hot reservoir and electrical store energies while preserving the NCI-022 triad energy ledger. Total energy including those accounts is unchanged by the fixed-temperature bookkeeping step. `audit()` asserts both energy conservation and nonnegative total thermal entropy production. `pairCasimir()` allows changing the pair of Casimir gaps while maintaining independent thermal accounts. Invalid time steps append `REJECT` events with no physical change.

**Model caveats:** Fixed temperatures imply ideal large thermal reservoirs. The model does not include finite thermal capacity, electrical conversion of Casimir work, cooling hardware control, material-dependent α/R/K, radiation, friction, gravity, or quantum foam. This is a software verification of textbook formulas, not a demonstrated energy-producing device. The ternary `−1/0/+1` gap signs remain dimensionless and distinct from kelvin.

References: [MathWorks Peltier model](https://www.mathworks.com/help/simscape-electrical/ref/peltierdevice.html) and [Ferrotec thermoelectric equations](https://thermal.ferrotec.com/technology/thermoelectric-reference-guide/thermalRef11/).

Run `node kernel/nci-023.test.mjs`. GitHub CI success requires verification.

## NCI-024 — Finite heat reservoirs and homeostatic control

[Runnable HTML](nci-024.html) · [Executable kernel](kernel/nci-024-kernel.mjs) · [Test suite](kernel/nci-024.test.mjs)

Unlike fixed-`Tc`/`Th` NCI-023, this step gives both reservoirs finite constant heat capacities. For each short explicit-Euler step `dt` in seconds:

```
Tc' = Tc − Qc_dot dt / Cc
Th' = Th + Qh_dot dt / Ch
E_electrical' = E_electrical − P_electrical dt
S_created = Cc ln(Tc'/Tc_initial) + Ch ln(Th'/Th_initial) >= 0
E_total = Cc Tc + Ch Th + E_electrical + E_Casimir_triad = CONSTANT
```

`Qc_dot`, `Qh_dot`, and `P_electrical` reuse the Kelvin–Peltier + Joule + Fourier heat-leak formulas from NCI-023 with temperatures at the beginning of each short step. A negative-`Qc` step warms the cold reservoir (passive conductive leak). The step is refused if it violates positive-temperature, electrical budget, or entropy constraints.

**Dimensionless control triad, distinct from kelvin:**
- `−1` / **PUMP**: current applied if the cold reservoir is above the target band and energy is available.
- `0` / **COAST**: electric current zero, thermal contact intact; passive conduction may warm the cold reservoir.
- `+1` / **STOP**: current zero and an *idealized* thermal disconnect (`K=0`), with zero heat exchange.

The controller uses a specified deadband, an upper hot-temperature cutoff and a finite electrical store. Every accepted step carries its controller decision, measured kernel outputs, and entropy change. Rejected steps preserve an append-only witness event and leave thermal/physical accounts unchanged.

**Limits:** STOP assumes an ideal isolation switch, and constant thermal coefficients and capacities are approximations. Explicit-Euler time integration is suitable only for sufficiently small steps, which the kernel checks in part through thermodynamic invariants. This is not an experimental device, nor any demonstration of Planck foam or Ice IX quantum learning. Coupled Casimir boundaries are carried unchanged from NCI-022 and keep their independent internal conservation audit.

Run: `node kernel/nci-024.test.mjs`. CI success and live GitHub Pages serving require separate verification.

## NCI-025 — Hysteresis and predicted-versus-observed thermal feedback

[Runnable interactive HTML](nci-025.html) · [Executable module](kernel/nci-025-kernel.mjs) · [Node tests](kernel/nci-025.test.mjs).

The **physical state** continues to use the NCI-024 finite-capacity Peltier/Joule/Fourier reservoir model. NCI-025 adds a separate **controller policy** that retains (1) an operating-mode latch, (2) bounded switching thresholds, and (3) mode-specific estimates of the cold-side temperature slope, in K/s.

- **PUMP (−1)** activates above `target + onBand`, and if latched remains on until the cold reservoir reaches `target − offBand`, provided sufficient electrical power and safe hot-side temperature exist.
- **COAST (0)** allows passive conductive contact when the cold reservoir is below `target − coastBand`.
- **STOP (+1)** uses the prior ideal isolation abstraction inside the target band, at a hot-temperature cutoff or without cooling power.
- **Prediction:** `predicted_Tc' = Tc + estimatedSlope[mode] × Δt`; after the physical `step`, record `error=observed−predicted`. Update only the policy slope by an exponential average `newEstimate=(1−α)×prior+α×measuredSlope`. The physics is not revised by a bad forecast.
- **Witness history:** every observation records the selected mode, cause, predicted temperature, observed temperature, error, old/new slope, and underlying physical event sequence. Source states remain unchanged; returned states append evidence.
- **Verification:** the tests assert the hysteresis hold, local prediction-error reduction under similar consecutive pumping conditions, energy conservation, second-law consistency, upper thermal cutoff, zero-budget fallback and deterministic replay.

The hysteresis prevents a *specific kind* of chattering at the switching threshold, but does not guarantee global convergence, optimal control, exact predictions, or stability in arbitrary physical conditions. The rate estimation learns only from deterministic synthetic NCI-024 observations. This is **not** a physical Planck-foam memory effect.

Run: `node kernel/nci-025.test.mjs`. A code commit is not evidence of successful CI or live Pages availability.
