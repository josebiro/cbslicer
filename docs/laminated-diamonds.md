# Laminated diamond construction

The primary diamond designer now follows the user's clarified process: glue 2–4 straight rectangular laminations into a bar; shape it with four centered 45° cuts to obtain a **square cross-section with diagonal bands**; crosscut square quarter slices at board depth; turn and assemble those slices into diamond repeats.

Choose **Laminated diamonds · A/B bars**. The Heirloom and Cinder collection designs now use this model. Existing shaped-piece projects remain available under **Legacy shaped-piece diamonds**; they are not silently converted, since their independently painted regions may not be manufacturable from one lamination sequence.

## Bar A and bar B

Each bar has independently editable wood species, layer order, and relative thicknesses. Add/remove layers within the 2–4 layer limit, move layers up/down, or make B a reversed copy of A. The layer table displays actual milled thicknesses after scaling to the required stack height. Relative values are weights, not inch measurements: 2,1 and 20,10 give the same proportions.

Assign A or B independently to the top-left, top-right, bottom-right, and bottom-left quarters. The reference square quarter is oriented with layer 1 at its upper-left corner. Quarter rotations are 0°, 90°, 180°, and 270° clockwise, respectively. Whole-repeat rotations on the board map are applied after arranging the quarters.

## Geometry and yield

Let S be the full diamond repeat side. Each quarter square has side q = S/2. The square bar stack is H × H, where H = q√2 = S/√2. In its end view, connect the midpoints of adjacent sides to mark an inscribed square. Shape along those four lines, retaining the center. The resulting square has side H/√2 = q.

For layer weight wi, finished layer thickness is H × wi / sum(weights). In the shaped quarter's reference coordinates (x,y), the original stack's height coordinate is (x+y)/√2. Intersecting each lamination interval with that square gives the diagonal-band polygons. Those visible polygons are **not separately cut components**.

This centered, single-bar-per-stack model retains exactly half of the milled stack cross-sectional area. Four corner offcuts are not credited as reusable material. The rectangular lamination stock list already includes that shaping loss; do not add another 50% to its quantities. This is not a multi-bar nesting optimizer.

For N full repeats, count N times the number of A assignments as A quarter slices, and similarly for B. Each independently capped stock batch needs:

`grain length = slices × (finished board thickness + flattening allowance + crosscut kerf) + 2 × end trim`

Each batch lists one rectangular blank for each lamination, with source width H plus allowance and source layer thickness equal to its milled thickness plus allowance. Mill layers to their actual listed thickness **before** glue-up; dress the assembled width to H and verify height H without altering the layer thicknesses. Source widths and lengths include specified allowances; add material for your fixtures, defects and ripping operations. No optimized offcut recovery is assumed.

## Assembly and outputs

The on-screen process shows the straight lamination stack with the centered square marked, the shaped diagonal-band square, and the four-quarter repeat. The workshop plan lists rectangular laminations by bar and batch, quarter counts, source order, assembly rotations, whole-repeat placement, and borders. Print, CSV, SVG, and saved project files use the same geometry. CSV distinguishes visible colored regions from actual lamination cuts.

Cuts must retain the centered square, including its registration relative to the glue lines. Blade settings depend on the machine and fixture; the app supplies end-view geometry rather than a universal machine setup. Validate a scrap bar and support the work appropriately. Borders remain separate end-grain stock and glue-up steps. Perimeter repeats are budgeted as full quarters before trimming.
