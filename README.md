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
