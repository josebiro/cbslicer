# Composite-unit workflow

Open **Composite-unit designer** from the application navigation. The original square-block designer remains available with its blank canvas and row-panel plans.

## Design a repeat

1. Choose triangular pinwheels, tumbling blocks, or nested diamonds.
2. Set the finished board dimensions, thickness, and physical unit size. Square families use the square side; tumbling blocks use the rhombus side. Units are never stretched to fit the board.
3. Assign species with the component controls or paint the numbered motif diagram. **Clear woods** starts an unassigned composite blank; **Use suggested woods** restores that family's palette. Assign every component to enable print and downloads.
4. Click units in the board preview to rotate them. Squares turn 90°, hexagonal cube units turn 120°. Triangular layouts can also alternate rotations automatically. Family switching retains that family's edits for the current session; save to the workbench before leaving to preserve the current design.
5. Configure up to four independent border rings, ordered from inside to outside. A width of zero disables any ring without disabling the others. These rings have end-grain rectangular pieces and butt joints, not the mitered corners visible in some reference photos.
6. Review the finished component geometry, rectangular source-blank budget, crosscut schedule, and placement map. Print includes the reference end view and map. CSV includes full-precision component polygons, stock dimensions, slice counts, orientations, border positions, and assembly steps; SVG exports the final top view.

All dimensions are inches. The display rounds to 0.001 inch; calculations and CSV retain floating-point precision. SVG previews/exports preserve proportions but have no life-size calibration.

## Geometry and construction

### Triangular pinwheel

Four right isosceles triangles meet with their 90° corners at a square's center. For square side S, each triangle has hypotenuse S, equal legs S/√2, and area S²/4. Glue four long triangular prisms into one square-section blank with all grain along its length. Crosscut thickness becomes the final board's grain direction. The motif's face numbers run clockwise from the top.

### Tumbling blocks

Three equal 60°/120° rhombi meet at their 120° corners to form a regular hexagon. For rhombus side S, the hexagon is √3S wide and 2S tall. A canonical rhombus has a rectangular envelope 1.5S by √3S/2. Hexagon centers are spaced √3S horizontally and 1.5S vertically, with alternate rows offset horizontally by √3S/2. The three numbered faces are top, lower right, and lower left. Consistent light/medium/dark colors produce the cube illusion.

### Nested diamonds

A square unit contains four right-triangle corner fills, two concentric diamond frames, and a square core: 13 component prisms. Diamond radii are 0.5S, 0.34S, and 0.18S. Each ring has four mitered trapezoids. For adjacent radii R and r, trapezoid bases are √2R and √2r, and perpendicular thickness is (R−r)/√2, with interior angles 45°/135°. The core side is 0.18√2S. These fixed ring proportions scale with the unit size; free ring-width editing is not implemented.

Frames require additional subassembly glue-ups. Assemble the inner core and frame, then the outer frame, then the corner fills, preserving the component diagram. Do not interpret "two stages" as exactly two adhesive operations for every pattern or border combination.

## Source-stock model

- Every component prism gets its own rectangular source blank. Envelopes use a canonical milling orientation; rotate the shaped prisms about their grain axis to match the reference cross-section. No two-for-one yield, nesting, reversed-unit optimization, or shared-rip recovery is assumed.
- For angled parts, rough bounding dimensions equal the finished shape's canonical rectangular envelope plus the selected allowance plus two kerfs per dimension. For rectangular border pieces, add the allowance once per dimension.
- Slice thickness = finished board thickness + flattening allowance.
- A batch for N slices requires N × (slice thickness + kerf) + 2 × end trim of grain-length stock. This conservatively budgets one separating kerf per slice.
- The configured maximum stock length limits the slices per composite blank. Partial final batches use the calculated shorter length. Add working length for fixtures and actual machine operations; the calculated length is not a safe minimum workpiece size.
- Rough board feet = sum of rectangular blank width × height × length × quantity / 144. It includes component envelopes, configured allowance, crosscut kerf and end trimming. It excludes defects, extra workholding stock, long rip losses outside those envelopes, and errors or additional cleanup.
- The map clips polygons to the final center rectangle but the cut list budgets every intersecting unit as a full slice. Keep sacrificial perimeter material attached through the center glue-up, then trim. Exact-fit square layouts do not add an extra perimeter machining margin; account for that in unit sizing or your workshop plan.
- Border stock is separate. Each ring's top and bottom span its outside width, and its two sides span the enclosed center length. All grain still runs through board thickness. Border rings add glue-up operations after trimming the center.

The list provides stock envelopes and interior geometry, **not blade tilt, fence positions, or a machine-specific cutting sequence**. Verify an actual scrap cross-section and appropriate fixtures before producing the long blanks.

## Reference and validation limits

The three user-provided photographs establish visual requirements, not the original makers' cutting sequences, species, or grain orientation. These are independently derived construction plans. External tutorial verification is still pending network access. No source images are bundled or attributed as verified recipes.

Tests verify polygon area and sampled non-overlap/coverage, rotations, four-ring coverage, exact source lengths and crosscut counts, crop material budgeting, incomplete designs, and export content. Chromium checks cover painting, all families, rotations, border updates, CSV/SVG downloads, print rendering, mobile width, and navigation back to the original designer.

Not implemented: arbitrary polygon drawing, adjustable diamond-frame proportions, chevron/herringbone recipes, metric units, machine-specific machining automation, or saving multiple family variants in a single project.
