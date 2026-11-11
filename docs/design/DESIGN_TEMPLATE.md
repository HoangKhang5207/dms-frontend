# DESIGN SYSTEM — DMS-FRONTEND

## 1. Design Authority
Source priority: approved Figma design and variables > approved design specs > original screenshots/assets > confirmed repository tokens > documented assumptions.
Mode: REPLICATION | NEW_DESIGN
Viewport references: Thoroughly review the entire project structure and files to fully understand the system.
Uncertain values: docs/design/DESIGN_UNCERTAINTIES.md

## 2. Design Principles
Visual identity: Thoroughly review the entire project structure and files to fully understand the system.
Density: [COMPACT | COMFORTABLE | SPACIOUS]
Do not invent new visual patterns if recreating an approved UI.
Preserve existing conventions when enhancing an existing application.

## 3. Design Tokens
Colors:
- --color-background: Thoroughly review the entire project structure and files to fully understand the system.
- --color-surface: Thoroughly review the entire project structure and files to fully understand the system.
- --color-primary: Thoroughly review the entire project structure and files to fully understand the system.
- --color-text: Thoroughly review the entire project structure and files to fully understand the system.
- --color-muted: Thoroughly review the entire project structure and files to fully understand the system.
- --color-border: Thoroughly review the entire project structure and files to fully understand the system.

Typography:
- Primary family: Thoroughly review the entire project structure and files to fully understand the system.
- Font source/license: Thoroughly review the entire project structure and files to fully understand the system.
- Weights: Thoroughly review the entire project structure and files to fully understand the system.
- Sizes / line-heights / letter spacing: Thoroughly review the entire project structure and files to fully understand the system.

Spacing scale: Thoroughly review the entire project structure and files to fully understand the system.
Container widths: Thoroughly review the entire project structure and files to fully understand the system.
Radius scale: Thoroughly review the entire project structure and files to fully understand the system.
Shadow tokens: Thoroughly review the entire project structure and files to fully understand the system.
Z-index layers: Thoroughly review the entire project structure and files to fully understand the system.
Breakpoints: Thoroughly review the entire project structure and files to fully understand the system.

## 4. Layout
App shell: [SIDEBAR | HEADER | CONTENT]
Grid: Thoroughly review the entire project structure and files to fully understand the system.
Max content width: Thoroughly review the entire project structure and files to fully understand the system.
Sidebar width: Thoroughly review the entire project structure and files to fully understand the system.
Header height: Thoroughly review the entire project structure and files to fully understand the system.
Responsive transitions: Thoroughly review the entire project structure and files to fully understand the system.

## 5. Components
For each component specify:
- Name and variants
- Dimensions and padding
- Typography
- Colors and borders
- States: default, hover, focus, active, selected, disabled, loading, error
- Accessibility
- Reuse and ownership

## 6. Screens
Reference SCREEN_SPECS.md, source assets, viewport sizes and expected states.
Do not infer hidden interactions from a static screenshot without documenting assumptions.

## 7. Assets
Maintain a list of logos, icons, images and illustrations with paths, licensing and source references.
No arbitrary substitutions without disclosure.

## 8. Responsive and Accessibility
Use CSS Grid/Flexbox appropriately.
No fixed viewport-only page hacks.
Test target viewports.
Support keyboard interaction and visible focus.
Follow agreed WCAG requirements and reduced-motion behavior.

## 9. Visual Verification
Capture actual browser screenshots at matching viewport, scale, browser and font loading conditions.
Compare reference and actual images.
Prioritize geometry > typography > assets > color/border/shadow > microdetails.
Track visual mismatches and retest after fixing.
Never claim 95%+ similarity without stating the metric and test conditions.

## 10. Change Control
Approved design tokens and components must not be changed without documenting affected screens and rationale.
Maintain DESIGN_UNCERTAINTIES.md and VISUAL_QA.md.
