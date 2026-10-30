# End-grain construction patterns

## Research status

External source verification is pending. On this task, the network proxy returned 403 for the Instructables search, an Instructables end-grain tutorial, and MTM Wood. These are research leads, not sources read or evidence for a particular recipe:

- https://www.instructables.com/howto/houndstooth+cutting+board/
- https://www.instructables.com/End-Grain-Cutting-Board/
- https://mtmwood.com/en

The following construction taxonomy and implemented algorithm are engineering proposals. Do not attribute them to those sites. The houndstooth study is generated from a two-color 2/2 twill model (four warp and four weft units per color cycle); it is not a verified reproduction of a woodworker's tutorial.

## Families and construction implications

| Family | Construction to investigate | Current support |
| --- | --- | --- |
| Checker / basket | Repeated striped panels, crosscut and alternate slice arrangements | Explicit row panels; identical rows reuse a panel |
| Brick / running bond | Wide bands offset between adjacent rows, with end pieces or trimming | Rectangular runs merged into long strips; alternating panel layouts |
| Houndstooth | A repeated interlocking two-color motif, assembled using multiple composite layouts; exact woodworking recipes vary | Twill-derived study; generic row-panel route, no claim of optimized traditional recipe |
| Chevron / herringbone | Angled segments and controlled grain orientation; may need additional cutting and glue-ups | Not implemented; requires polygon geometry and angle-aware stock calculations |
| Rhombus / tumbling blocks | Three-tone diamond units, often with angled composite stock | Composite-unit designer: three actual rhombi form a hexagonal slice; staggered tessellation and crop budgeting |
| Woven / optical patterns | Multiple band widths, offsets, and sometimes further panel slicing | Basket preset only; advanced interwoven joinery not implemented |

## Implemented two-glue-up schedule

For every finished preview row, merge horizontally adjacent same-species cells into strips. Group identical strip sequences of equal row depth into a single source panel. All strips run lengthwise with the grain. Mill strip width to the merged run width; mill the panel thickness to the final row depth. Glue the strips in the displayed order.

Crosscut the panel along its grain into slices of finished board thickness plus flattening allowance. Turn each slice end grain up: panel strip widths become board X, original panel thickness becomes board Y, and the crosscut dimension becomes board Z. Assemble slices in the generated row order without reversing left/right strip order. This reconstructs the preview rather than merely drawing a pattern unrelated to the cut list.

For N slices, source length = N × (slice thickness + kerf) + end-trim allowance. This reserves a separating kerf for each slice. Rough strips add the configured allowance to milled width and thickness. Rip kerf, defects and safe workholding length are additional. Thin border-panel thicknesses and very short stock require suitable fixtures and workshop judgment; generated lengths are geometric minima, not safe-machine-operation prescriptions.

Both borders participate in the same row geometry: the optional outer border surrounds the original inner border, and both remain end grain up. Panel and individual-block lists are alternative methods; do not buy or cut both lists.

## Next research / implementation work

Verify named examples with accessible primary tutorials; document each actual strip sequence, orientation and glue-up stage. Verify the independently derived composite-unit plans against practical workshop examples. Chevron and herringbone remain unsupported. Optimize reversed/offset rows only when trimming and resulting dimensions are explicitly modeled.


The new [composite-unit workflow](composite-units.md) adds triangular pinwheels, tumbling blocks, nested diamonds, and up to four border rings. It uses true polygons and source-prism schedules; this is separate from the original row-panel workflow above.
