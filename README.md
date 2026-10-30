# Grain / cbslicer

A browser-based end-grain cutting board designer. Choose wood species, dimensions, pattern, border, and milling allowances. Paint individual center blocks, print the plan, or download a CSV with a grouped cut list and the complete row-by-row layout.

## Develop

Requires Node.js 20.11+ (Node 24 recommended). No package dependencies or installation step.

```sh
npm run dev
npm test
```

The development server listens on port 3000; set PORT to change it. Open the server in a browser to use the designer. The page uses optional Google Fonts and falls back to local fonts when offline.

## Planning model

All measurements are inches. Patterns use equal-sized center blocks and an optional end-grain border with separate corner blocks. Grain runs along the thickness axis. The cut list uses individual-block construction, not an optimized two-glue-up strip method. Rough dimensions add the selected allowance once per axis. Mill cross-sections to final sizes before gluing, retaining excess height for final flattening. Rough block volume excludes kerf, defects, stock sizing and milling waste; it is not a lumber purchase estimate. The glue-up guide explains kerf budgeting and end-grain flattening.

Plans require workshop review before fabrication. There is no nesting optimizer, saved-project storage, metric mode, or automated strip-panel construction schedule yet.
