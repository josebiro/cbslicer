# Grain / cbslicer

Design end-grain cutting boards from the stock and glue-ups that make them. Start with a visual collection design or open the **Bar & slice designer** to compose your own.

## Run locally

Node.js 24 is recommended. There are no package dependencies to install.

```sh
npm run dev
```

Open http://localhost:3000. Development mode watches server code, restarts when it changes, and refreshes connected browsers after HTML, JavaScript or CSS edits. Stop an older server with Ctrl+C before starting an updated dev command. Save your board before editing source: live reload refreshes the page and discards unsaved changes. `npm start` runs without watching or the development reload client. Set `PORT` to change the listening port.

The page uses optional Google Fonts with local font fallbacks. Static assets and links also work under a repository subpath.

## Build the stock, then choose the cuts

The square-bar workflow has four recipes:

- Straight strip laminations, used without shaping.
- Straight strip laminations, shaped with four centered 45° cuts.
- Four square pieces glued as a 2 × 2 bar, used without shaping.
- Four square pieces glued as a 2 × 2 bar, shaped with four centered 45° cuts to reveal triangular regions.

"No shaping" still crosscuts the source bar at board depth to expose end grain. Bars A and B can use different woods and orders. Strip bars have 2–4 layers with editable relative thicknesses and actual milled-thickness readouts. The four-square recipe uses equal square sections. Assign A/B independently to each quarter and choose its clockwise rotation. The editor generates matching source diagrams, stock schedules, cut lists and a numbered assembly map.

The specialized **60° rhombi → tumbling blocks** recipe joins three long solid-species rhombic prisms into a hexagonal bar before crosscutting. Its end-view guide explains the 60°/120° corners and complementary 30° geometry. Layered laminations inside rhombi are not implemented.

All measurements are inches. Up to four independently sized/specied end-grain border rings use rectangular pieces and butt joints. The collection's previews and editor launches share the same recipe configuration.

## Compose, save and export

Use the rotation composer to select slices individually or by checkerboard/alternating rows and rotate the group together. Orientation Undo/Redo keeps up to 50 edits during the session; switching construction, changing unit size or automatic alternation clears that history. Quarter rotations and whole-repeat rotations are independent.

Name the board and choose **Save to workbench**. Saved composite projects preserve construction, shaping, species, layers, border rings and rotations in this browser's local storage. **Save as new board** keeps a separate variation. The home-page shelf holds up to 24 projects. Saving is explicit, not automatic; there is no account or cloud sync.

Download/import portable JSON project files to back up or transfer designs. Print the workshop plan or export a CSV stock list and placement map, or an SVG top view. Display dimensions round to 0.001 inch; CSV retains full numeric precision. SVG exports are proportioned layouts, not calibrated life-size cutting templates.

Older triangle and shaped-piece diamond projects open with original geometry through compatibility controls. Those families are no longer offered as new-project entry points; old files are not silently converted into different constructions.

## Planning assumptions

See [bar construction recipes](docs/bar-recipes.md) and [laminated diamond construction](docs/laminated-diamonds.md) for geometry and stock formulas. Original component-based models are documented in [composite-unit notes](docs/composite-units.md) for archived projects.

Stock schedules budget full intersecting slices before perimeter trimming. Centered 45° shaping retains 50% of milled square area; no shaping retains 100% before milling/crosscuts. Estimates include specified allowances, crosscut kerf and end trimming, but do not credit reusable offcuts or optimize multi-bar nesting. Add material for defects, rip losses and safe workholding.

Plans describe source sections and geometric cuts, not universal blade/fence settings. Validate a scrap unit, fixtures, grain direction, stock condition, wood suitability and actual dimensions before final fabrication. External tutorial verification remains pending; the bar recipes follow the user's clarified construction and independent geometry calculations.

Not implemented: metric units, arbitrary polygon drawing, machine-specific jig plans, optimized stock nesting, or laminated bands inside the tumbling-block rhombi.

## Validation

```sh
npm test
```

Tests cover geometry, coverage, source-stock counts/yield, rotations, recipe settings, CSVs and saved-project validation. Optional Chromium regression checks require Python Playwright and Chromium:

```sh
python3 tests/browser_editor.py
```

Each bar's layer composer includes a live source/slice preview and lists the quarters using it. An unused bar still previews its own edits but does not alter the finished board until assigned; an explicit action can assign it to the top-right quarter. Thickness edits update immediately without leaving the input. Browser coverage for layer reordering, source previews, assigned/unassigned bars and edit-then-arrow interactions is available with the dev server running:

```sh
python3 tests/browser_layer_previews.py
```
