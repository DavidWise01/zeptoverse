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
