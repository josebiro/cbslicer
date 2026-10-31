# Grain / cbslicer

A browser-based end-grain cutting board designer. Choose wood species, dimensions, pattern, border, and milling allowances. Start with the Blank pattern, choose a wood brush, and paint individual center blocks (or use the eraser). Unassigned cells are excluded from estimates, and print/CSV export become available when every cell is assigned. Dimension and palette changes preserve painted cells; selecting a pattern starts a new layout. You can also print the plan, or download a CSV with a grouped cut list and the complete row-by-row layout.

## Develop

Requires Node.js 20.11+ (Node 24 recommended). No package dependencies or installation step.

```sh
npm run dev
npm test
```

The development server listens on port 3000; set PORT to change it. Open the server in a browser to use the designer. The page uses optional Google Fonts and falls back to local fonts when offline.

## Planning model

All measurements are inches. Patterns use equal-sized center blocks and an optional end-grain border with separate corner blocks. Grain runs along the thickness axis. The first cut list uses individual-block construction; the alternative panel schedule below it uses two glue-ups. Rough dimensions add the selected allowance once per axis. Mill cross-sections to final sizes before gluing, retaining excess height for final flattening. Rough block volume excludes kerf, defects, stock sizing and milling waste; it is not a lumber purchase estimate. The glue-up guide explains kerf budgeting and end-grain flattening.

Plans require workshop review before fabrication. There is no nesting optimizer or metric mode yet. Composite projects can be saved using the workbench.

## Panel assembly and borders

The workshop section now also offers an alternative two-glue-up panel schedule: ordered edge-grain strips, source panel lengths, crosscut slice counts, and the end-grain row assembly order. CSV includes both alternatives; choose one construction method. Contiguous same-species cells become rectangular strip runs. Brick and an explicitly labeled houndstooth twill study are available alongside the existing presets. The separate composite-unit workflow adds angled polygon geometry.

An optional outer border has independent width and wood selection; set its width to zero to disable it. Both border widths are deducted from the center dimensions and included in both construction schedules.

See [pattern construction notes](docs/pattern-construction.md) for assumptions, research status, and unsupported pattern families. External woodworking source verification remains pending network access.


## Composite-unit designer

Choose **Composite-unit designer** in the app to work with triangular pinwheels, tumbling blocks / 3D cubes, and nested diamonds. Paint individual motif components, repeat them at a physical size, rotate slices, and configure up to four end-grain border rings. The planner generates component angles and dimensions, source-blank batches, crosscuts, numbered placement maps, CSV/SVG exports, and a printable assembly guide.

See [composite-unit design and construction](docs/composite-units.md) for geometry, stock formulas, instructions, and limits. The plans are independently derived from geometry; the source photos do not establish original manufacturing recipes. Cut lists budget rectangular blanks and full cropped units rather than optimized angled-rip yields.

## Visual design collection

The home page opens with six editable board designs. Filter by pinwheels, cubes, or diamonds, then select a board to open its exact species, dimensions, rotation scheme, and border configuration in the composite editor. Previews and editor launches share the same preset data and geometry planner. The blank-canvas shortcut opens the original square designer in Blank mode. Composite designs can be saved to the browser workbench and downloaded as portable project files.


## Saved-project workbench

In the composite editor, name your board and choose **Save to workbench**. Reopen it from the home page with dimensions, species, all border layers, and unit rotations intact. **Save as new board** keeps a separate variation. Incomplete motifs can also be saved. The shelf holds up to 24 projects in this browser's local storage; no account or cloud sync is required. Save is explicit, not automatic.

Use **Download project** for a portable JSON backup. Import it from the workbench to restore or transfer the design. Removing a saved project asks for confirmation. Browser-storage failures and invalid imports display an error and do not silently replace the shelf. Square-block projects are not included in this persistence feature yet.

## Rotation composer

In the composite editor's preview, choose **Select slices** to build a group directly on the board. Use **All**, **Checkerboard**, **Alternate rows**, or **Invert** to establish a repeating rhythm, then turn the group left or right. Square units turn 90°; cube units turn 120°. Unselected orientations remain intact. **Finish selection** returns to the single-slice rotation brush.

Orientation Undo/Redo retains up to 50 edits during the session, including single-slice rotations and group turns. Switching family, changing unit size, or changing automatic alternation resets orientation history. Saved projects and CSV assembly maps retain the resulting orientations; selection highlights are editing aids and are excluded from print and SVG output.

## Live reload

Use Node.js 24 and run `npm run dev`. Development mode watches server code, restarts the server when it changes, and automatically refreshes connected browsers when HTML, JavaScript or CSS changes. After pulling an update to the dev command itself, stop the old process with Ctrl+C and run `npm run dev` again. `npm start` runs without watching or injecting the development reload client.

Save your board before editing source files: live reload refreshes the page and does not preserve unsaved editor changes. The editor also displays recovery instructions if a script cannot load. Assets use relative URLs so static deployments under a repository subpath can load the editor correctly.

Optional browser regression checks: `python3 tests/browser_editor.py` with Python Playwright and Chromium installed.


## Diamond proportion editor

Choose Nested diamonds in the composite editor (or open The Heirloom/Cinder from the collection). Pattern Architect controls independently adjust both diamond frames, with perpendicular milled-width readouts, a remaining-core dimension, and a radial budget bar. Fine line, Balanced and Bold frame presets establish starting proportions. Changes rebuild the real component polygons, stock envelopes and cut lists; project files preserve both proportions. Existing projects keep their original balanced geometry. Display dimensions round to 0.001 inch; use CSV for full precision and check thin components against your actual tooling.
