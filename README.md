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

