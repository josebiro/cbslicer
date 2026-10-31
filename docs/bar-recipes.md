# Bar & slice construction recipes

New boards are designed from stock construction and shaping operations, rather than separate visual pattern families. The primary editor offers square-bar construction or the specialized 60° rhombus / tumbling-block recipe. Original triangle and shaped-piece diamond controls appear only when opening an archived project; the collection no longer starts new designs in those families. The old standalone square-block workspace has been removed from the home page.

## Four square-bar combinations

| Glue-up | Shaping | Result before crosscutting |
| --- | --- | --- |
| 2–4 strip laminations | None | Square bar with straight bands |
| 2–4 strip laminations | Four centered 45° cuts | Square bar with diagonal bands |
| Four equal square pieces | None | Square bar containing a 2 × 2 wood arrangement |
| Four equal square pieces | Four centered 45° cuts | Square bar with four triangular color regions |

"None" means **no shaping cuts**. All four recipes still crosscut the bar along its grain at the rough board thickness to expose end grain. They do not lay a long edge-grain bar on the board face.

For a full repeat side S, each of its four square slices has side q = S/2. Unshaped source bars have section q × q. For centered 45° shaping, source bars have section H × H with H = q√2. Connecting side midpoints marks the retained square; the milled section retains 50% of its area. No shaping retains 100% before crosscutting/cleanup. Raw stock estimates still include specified allowances, kerf and end trim in both cases.

A four-square source bar uses four long prisms of side H/2 in top-left, top-right, bottom-right, bottom-left order. The no-shape case uses H=q. Each 45° shaped square cuts through those four squares into four triangles, without requiring separately prepared triangular strips. The relative thickness controls are disabled for this assembly because the source pieces are equal squares; switching back to strips restores the saved weights.

Bars A and B remain independent. Assign either to each quarter and set each quarter's own 0°/90°/180°/270° clockwise rotation. "All quarters straight" keeps straight bands straight; "Rotate around the center" establishes the original diamond arrangement. Whole-repeat rotations remain an independent board-map operation. Project files preserve assembly, shaping and all quarter turns; CSV includes those settings alongside the stock schedule.

## Tumbling blocks: why 30° and 60° appear

The unit consists of three congruent rhombi, each with 60° and 120° interior corners. Their 120° corners meet at the center, completing 360°, and their outer edges form a regular hexagon. Join long rhombic prisms before crosscutting the composite hexagonal bar; arrange the end-grain hexagonal slices on a staggered lattice.

For side a, rhombus altitude is a√3/2 and the offset between its parallel bases is a/2. One canonical rectangular envelope is 1.5a × a√3/2. Its sloping edges are 60° to the base, or 30° to the base's perpendicular. These complementary geometry angles do **not** specify universal blade settings; machine tilt/readout and workholding orientation determine setup.

The current recipe budgets one rectangular blank per solid-species rhombic prism and three prisms per hexagonal bar. The net rhombus area is a²√3/2, versus 3a²√3/4 for that canonical rectangular envelope: the ideal profile retains 2/3 of the envelope, before allowances. No offcut recovery is credited. Internal strip laminations within each rhombus are not implemented yet; the recipe currently uses one species per rhombus.

Colors must stay in consistent top/right/left positions for a stable cube-lighting illusion. Arbitrary per-unit 120° rotations are possible, but intentionally change that illusion. Board crop geometry and full-slice stock budgeting remain the same as before.

## Compatibility and scope

Old saved projects are opened with their original geometry and recipe, not silently converted to a visually different construction. Old strip-diamond project files without recipe fields default to strips, centered 45° shaping, and quarter rotations 0°,90°,180°,270°. New gallery pinwheels use four-square bars plus centered shaping. Their gallery preview and editor use the same construction configuration.

These are cross-section and material-budget models, not machine-specific jig plans. Add stock for safe workholding, check scrap cross-sections and glue-up alignment, and verify the actual final dimensions before producing a board.
