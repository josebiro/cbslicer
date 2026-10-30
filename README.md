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

Plans require workshop review before fabrication. There is no nesting optimizer, saved-project storage, or metric mode yet.

## Panel assembly and borders

The workshop section now also offers an alternative two-glue-up panel schedule: ordered edge-grain strips, source panel lengths, crosscut slice counts, and the end-grain row assembly order. CSV includes both alternatives; choose one construction method. Contiguous same-species cells become rectangular strip runs. Brick and an explicitly labeled houndstooth twill study are available alongside the existing presets. The separate composite-unit workflow adds angled polygon geometry.

An optional outer border has independent width and wood selection; set its width to zero to disable it. Both border widths are deducted from the center dimensions and included in both construction schedules.

See [pattern construction notes](docs/pattern-construction.md) for assumptions, research status, and unsupported pattern families. External woodworking source verification remains pending network access.


## Composite-unit designer

Choose **Composite-unit designer** in the app to work with triangular pinwheels, tumbling blocks / 3D cubes, and nested diamonds. Paint individual motif components, repeat them at a physical size, rotate slices, and configure up to four end-grain border rings. The planner generates component angles and dimensions, source-blank batches, crosscuts, numbered placement maps, CSV/SVG exports, and a printable assembly guide.

See [composite-unit design and construction](docs/composite-units.md) for geometry, stock formulas, instructions, and limits. The plans are independently derived from geometry; the source photos do not establish original manufacturing recipes. Cut lists budget rectangular blanks and full cropped units rather than optimized angled-rip yields.
