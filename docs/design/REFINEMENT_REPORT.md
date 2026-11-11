# AquaDocs landing refinement

Historical homepage-only continuation. The user's later application-wide scope approval supersedes its scope restrictions. Current delivery: [APPLICATION_REPORT.md](APPLICATION_REPORT.md).

Date: 2026-11-11. Status: **PARTIALLY_VERIFIED**. Scope remains public route `/`; shared components use a route-specific brand variant. Previous [first-pass report](VISUAL_QA.md) and `qa/` screenshots remain preserved. Current evidence is under `qa/refinement/`.

## Implemented and reused

1. **Major identity mismatch corrected:** homepage header uses the exact AquaDocs wordmark region from the supplied artwork. Mobile uses the original water-drop region. No replacement icon or generated logo was introduced.
2. Homepage footer uses the AquaDocs platform identity and source tagline. Login/register/password-entry pages retain GENADATA through the existing component default variant.
3. Removed the unrelated IMT contact illustration on HomePage; retained all contact information, required/email validation and existing business behavior.
4. Hash navigation handles selecting the same section again. A font-loaded browser check exposed an additional timing error; scrolling now waits for `document.fonts.ready`, cancels on route changes and positions the section below the fixed header without depending on a timed animation.
5. Reviewed backend architecture and contracts; compiled backend without starting against configured databases. No frontend auth/API/permission contract changed.

Reused MainLayout, AppHeader, AppFooter, AuthContext, HomePage content and Ant Design controls; original banner asset is also the logo source. No new design tokens, font, dependency or raster asset added in this continuation. Brand rendering is controlled by optional component props; MainLayout passes AquaDocs only for pathname `/`.

## Files in this continuation

Modified source:

- `src/layouts/MainLayout.jsx`
- `src/components/AppHeader/AppHeader.jsx` and `.css`
- `src/components/AppFooter/AppFooter.jsx`
- `src/pages/HomePage/HomePage.jsx` and `.css`

Verification/documentation:

- Updated `SCREEN_SPECS.md`, `DESIGN_UNCERTAINTIES.md`, `VISUAL_QA.md`, `verify.cjs`, `compare.py`.
- Added `verify-auth-fixtures.cjs`, `BACKEND_AUDIT.md`, `backend-inventory.json`, `REFINEMENT_REPORT.md`, `CHECKPOINT.md` and `qa/refinement/` artifacts.
- Preserved pre-existing package-lock.json edits and all other user inputs. Backend source and configuration hashes unchanged; compile produced ignored build output only.

## Screenshots and comparison

Final full-page captures: [1672](qa/refinement/home-1672.png), [1440](qa/refinement/home-1440.png), [768](qa/refinement/home-768.png), [390](qa/refinement/home-390.png). Browser viewport sizes: 1672×1005, 1440×900, 768×1024, 390×844; device scale 1. Additional 320px width overflow assertion passed. Final public run loaded Be Vietnam Pro faces and recorded **zero failed requests / zero uncaught errors**.

Reference comparison: [banner](qa/refinement/banner-1672.png), [overlay](qa/refinement/overlay.png), [diff](qa/refinement/diff.png), [metrics](qa/refinement/comparison.json). Source-sized banner stays at 1672×941, y=64 below retained public header. Same reproducible zero-tolerance RGB comparison as previous checkpoint: mean channel absolute error **0.033880318369104094 / 255**, **15,046 differing pixels out of 1,573,352**. Banner pixels/geometry have not regressed. This verifies reuse of original raster art only, not reconstruction of dashboard components or whole-page visual similarity.

Header/footer, HTML sections and mobile adaptation have no matching source screen. Visual review confirms the legacy header/footer brand and unrelated large contact illustration are removed on `/`; no pixel-fidelity percentage is assigned to those regions.

## Verification results

| Command / check | Actual result |
| --- | --- |
| Backend `mvnw.cmd -B -DskipTests compile` | Exit 0; 295 Java files compiled; existing MapStruct/deprecation warnings. |
| Backend tests | No Java test files found; not claimed passed. |
| Frontend `npm run build` | Exit 0; existing >500kB JS chunk warning. |
| `npm run lint -- --format json --output-file node_modules/.cache/aquadocs-qa/lint.json` | Exit 1; 8,108 errors / 431 warnings, same baseline totals. Existing configuration includes generated WebViewer. |
| Application portion of lint report | 18 errors / 4 warnings in unchanged source modules, same baseline. |
| ESLint on five changed/new JSX files | Exit 0. |
| `git diff --check` | Exit 0. |
| Public browser regression | Exit 0; **23/23 assertions passed**. |
| Browser backend-contract fixtures | Exit 0; **14/14 assertions passed**, explicitly mocked, not live integration. |
| Type-check | Not configured. |

Public regressions cover four reference target widths plus 320px overflow; AquaDocs identity; default login identity; guest CTA; cross-route and repeated hash navigation; contact required/invalid-email states; logo return; keyboard link reachability; homepage footer; protected-route guest redirect; existing register/password-entry forms still render.

Fixture regressions cover authenticated CTA destination, withheld CTA while user data loads, Bearer header, successful token refresh and rotation, expired session cleanup/redirect and existing service-error logout fallback. No auth implementation was modified. Fixture screenshot is supplemental and may use fallback fonts; it is excluded from visual metrics.

Bounded visual loop: first continuation capture, font-complete capture, one correction to font-dependent hash scrolling and final capture. A fixture wait was also corrected to observe stable login UI across StrictMode's duplicate requests; production token/interceptor logic was preserved. No further visual modifications after final successful capture.

## Remaining gaps and acceptance

- **VERIFIED:** public navigation/validation assertions above, target-width overflow, source banner ratio/comparison, brand variant isolation to homepage, unchanged backend source, backend compilation.
- **PARTIALLY_VERIFIED:** source-faithful branding uses an SVG viewport into raster artwork. It retains the original light sky background; a separate transparent/vector wordmark was not supplied. Desktop/mobile native text and header remain additional UI outside source scope. Raster labels remain small on mobile, with HTML summary providing readable core information.
- **NOT_VERIFIED:** real login, signed token validation, refresh persistence, permission enforcement, upload/preview/search and live API error/loading/empty states. Backend service is not running; port mismatch and required isolated runtime services remain unresolved. See [backend audit](BACKEND_AUDIT.md).
- Existing support/contact text is unchanged and still needs confirmation for the water-company deployment. No replacement phone/address was invented. Contact form still has no submission endpoint.
- No full screen-reader/contrast/WCAG audit performed. Semantic heading, image description, nav landmark, focus styles and keyboard link reachability are present; these do not establish full accessibility conformance.
- AuthProvider's existing bootstrap hides children until user data resolves. Fixture verifies no premature CTA; no new loading-screen design is inferred from the static banner.
- Banner remains approximately 2.18 MB and the application JS chunk remains large; image optimization or code splitting would be a separate scoped change.

Next action: prepare isolated backend runtime configuration and a suitable test account to replace fixture-only session checks with live verification; confirm support contact data and mobile treatment. No commit, push, merge or deployment performed.

## Reproduction

```powershell
npm run dev -- --host 127.0.0.1
node docs/design/verify.cjs <playwright-package-path> http://localhost:5173 qa/refinement
python docs/design/compare.py docs/design/qa/refinement
node docs/design/verify-auth-fixtures.cjs <playwright-package-path> http://localhost:5173
```

This environment uses the existing Playwright 1.57.0 package under the user's local cache and installed Chrome; no test dependency was added. Font network access is required for matching the recorded public captures.
