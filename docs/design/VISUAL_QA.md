# AquaDocs landing page acceptance report

Historical first-pass checkpoint. Current implementation/acceptance: [REFINEMENT_REPORT.md](REFINEMENT_REPORT.md); latest continuation state: [CHECKPOINT.md](CHECKPOINT.md). The results below describe the first pass and its preserved screenshots.

Date: 2026-11-11. Overall status: **PARTIALLY_VERIFIED**. Public landing implementation and listed browser checks completed; backend workflows and approval of responsive adaptation remain unverified.

## Delivered screen and scope

Public route `/`: supplied AquaDocs promotional banner at its natural aspect ratio, semantic h1/description, mobile capability summary, guest/auth-aware CTA, retained feature cards and contact form. Header links now reach the correct home sections from authentication pages. Logo uses keyboard-accessible navigation and Vite asset import. Mobile header spacing and contact gutters prevent horizontal overflow.

The SVG is a raster banner, not a structured application screen. Its dashboard, process and search illustrations remain noninteractive artwork. The actual application remains functional HTML around it; no dashboard/business feature was inferred from the banner.

## Changed and created files

- Modified `src/pages/HomePage/HomePage.jsx`: replace carousel; retain feature/contact content and validation; section IDs and hash navigation; responsive contact gutter; bundled contact image.
- Created `src/pages/HomePage/AquaDocsBanner.jsx`: source artwork, accessible description, mobile text, existing auth context and CTA routes.
- Modified `src/pages/HomePage/HomePage.css`: scoped layout, local tokens, responsive sizing, focus and anchor offset.
- Modified `src/components/AppHeader/AppHeader.jsx` and `.css`: existing component reused; router links, navigation landmark, bundled logo, focus, small-screen spacing.
- Created `src/assets/aquadocs-ai-banner.png`: losslessly decoded supplied image, approximately 2.18 MB.
- Created `docs/design/SCREEN_SPECS.md`, `DESIGN_UNCERTAINTIES.md`, this report, `reference.png`, `verify.cjs`, `compare.py`, and evidence in `qa/`.
- User's existing package-lock.json change, root DESIGN.md, AGENTS.md, .agents/ and SVG preserved. No dependency manifest, API, context provider, route configuration or authentication implementation changed.

## Reuse and tokens

Reused MainLayout, AppHeader, AppFooter, AnimatedPage route wrapper, Ant Design Button/Row/Col/Card/Form/Input/Typography, AuthContext state, existing login/home routes, feature icons and contact image. Retained Be Vietnam Pro configuration.

Local HomePage tokens added: `--aqua-ink: #071b66`, `--aqua-blue: #0068ff`, `--aqua-surface: #f3f9ff`, `--aqua-border: #dceaff`. They do not modify the global Ant Design theme. These are implementation choices inspired by source colors, not approved extracted design variables.

## Visual evidence and comparison

Final screenshots: [1672](qa/home-1672.png), [1440](qa/home-1440.png), [768](qa/home-768.png), [390](qa/home-390.png). Dedicated source-sized [banner capture](qa/banner-1672.png), [overlay](qa/overlay.png), [difference](qa/diff.png), [metrics](qa/comparison.json).

Chrome headless, device scale 1, viewports 1672×1005 / 1440×900 / 768×1024 / 390×844. Waited for image decode, document fonts and route animation. Banner starts at y=64 below retained header. Its measured dimensions are 1672×941 / 1440×810.421875 / 768×432.21875 / 390×219.484375. No horizontal overflow in final captures.

Reproducible comparison: `python docs/design/compare.py`. Decode original PNG directly from SVG; compare RGB against browser banner element screenshot at 1672×941, without resizing, alignment adjustment or tolerance. Absolute mean channel error is **0.033880318369104094 on a 0–255 scale**; **15,046 of 1,573,352 pixels differ**. Differences remain; no whole-screen fidelity percentage is asserted. This measures reuse/rendering of the original image, not reconstruction of dashboard components. Header and subsequent HTML have no supplied visual reference and are excluded. Other viewports have no source-matched pixel comparison.

Bounded loop: initial render + one corrective pass. Initial checks found 4px mobile overflow and hash navigation failing from login; corrected contact gutters and explicit hash scrolling. Initial validation check ran before Ant Design finished rendering messages; final script waits for the three messages. `qa/initial-results.json` preserves the initial run; `qa/results.json` records the final result.

## Actual verification results

| Check | Result |
| --- | --- |
| `npm ci` | Eventually exit 0 after Windows ENOTEMPTY/locked esbuild failures; standard WebViewer postinstall completed. |
| Initial `npm install --package-lock=false --ignore-scripts` recovery | Exit 0, but resulting installation was incomplete; replaced by successful clean `npm ci`. |
| `npm run dev -- --host 127.0.0.1` | Running at http://127.0.0.1:5173 using locked Vite 7.0.6. |
| `npm run build` | Exit 0; warning: existing app JS chunk exceeds 500 kB. |
| `npm run lint` after complete install | Exit 1: 8,108 errors / 431 warnings; existing ESLint configuration also scans generated public/webviewer vendor files. No quality gate changed. |
| `npx --no-install eslint src` | Exit 1: 18 errors / 4 warnings in unchanged modules. |
| ESLint on three changed/new JSX files | Exit 0. |
| `git diff --check` | Exit 0. |
| Browser script final run | Exit 0: all 15 checks passed. |
| Type-check / existing unit tests | No scripts/framework configured; not run. |

Browser checks passed: no overflow at four widths; guest CTA to login; features link from login with visible section below fixed header; contact anchor; required fields and invalid email errors; logo to home; Tab reaches link; unauthenticated protected documents route redirects to login; register and forgot-password forms render; no uncaught browser errors.

Reproduce: start dev server, then `node docs/design/verify.cjs <path-to-playwright-package>`. This run used the already installed Playwright 1.57.0 package outside the project and system Chrome. No test dependency was added. Final run allowed existing external Google font requests; initial sandbox run blocked them. One final request was aborted for the Vite favicon during navigation; no uncaught browser errors occurred.

## Gap analysis / accessibility / known limitations

- **VERIFIED:** source aspect ratio, loaded source image, stated public navigation/validation checks, no overflow at target sizes, real HTML heading and text, image alternative, visible focus CSS and keyboard reachability. No full accessibility audit or contrast certification is claimed.
- **PARTIALLY_VERIFIED:** responsive layout has usable HTML summary, but source raster labels are small on mobile. No mobile reference or approved behavior states are available.
- **NOT_VERIFIED:** authenticated CTA execution, successful login, permission-specific UI, upload, preview, search, API loading/error/empty states. No backend account/session was used. Source API/context/route modules are untouched, which is not a substitute for backend regression testing.
- **Known content gap:** retained GENADATA header/footer and IMT contact details differ from AquaDocs banner identity. No broader rebranding was authorized by a structured reference.
- **Known existing behavior:** contact form validates but has no backend submission handler; no delivery success is claimed. Existing Google-login button also has no implementation and was not changed.
- **Known performance gap:** original lossless artwork is approximately 2.18 MB; no lossy optimization was applied because it would change source pixels.
- **Unknowns:** original raster font metrics, mobile artwork, component states, approved new copy, full organization branding and depicted capabilities. See DESIGN_UNCERTAINTIES.md.

Next recommended action: review the public-page screenshots and confirm branding/mobile treatment; then verify authenticated flows with the development backend and a suitable test account. A separate change can address baseline lint scope/errors and image delivery optimization. No commit, push, merge or deployment performed.
