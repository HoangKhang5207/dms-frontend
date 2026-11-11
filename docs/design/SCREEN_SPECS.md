# AquaDocs public landing page

Current authorized scope includes all existing application UI; see [APPLICATION_SPECS.md](APPLICATION_SPECS.md) and [APPLICATION_REPORT.md](APPLICATION_REPORT.md). Homepage-only notes below are historical and are superseded by the user's explicit expansion approval.

Status: implementation specification derived from supplied artwork; no separate approval recorded.

## Repository audit and compatibility

- React 19, Vite 7, React Router 7, Ant Design 5, adjacent CSS, React Context, Axios.
- `/` renders HomePage through MainLayout and AnimatedPage. Public authentication pages share MainLayout; `/home/*` uses ProtectedRoute and DashboardLayout.
- Preserve AppRouter, all four context providers, axiosInstance, tokenService, permission checks, dashboard/document/organization modules, login forms and contact form validation.
- Reuse MainLayout, AppHeader, AppFooter, Ant Design Row/Col/Card/Form/Input/Button/Typography and existing feature/contact content. No new API, library or business workflow.
- Existing working tree: modified package-lock.json; untracked .agents/, AGENTS.md, DESIGN.md and reference SVG. These are user inputs, not implementation changes.
- No configured test runner or type checker. Required commands: npm run dev, npm run lint, npm run build.

## Confirmed source

`AquaDocs_AI_banner_no_login.svg` is a 1672 × 941 SVG wrapper containing one embedded PNG of exactly the same size. It contains no vector text, components, variables or interactive controls. `reference.png` is the lossless decoded source.

The composition contains water-company identity at upper left, AquaDocs AI wordmark and platform description at left, four capability illustrations, a central dashboard mockup, six surrounding promotional panels, and water-treatment scenery with blue waves along the bottom. The dashboard, search pills and workflow steps are artwork, not application controls.

The supplied banner is reused as a promotional image, not as a replacement for the interactive application. Text alternatives and a semantic HTML summary accompany it. Do not recreate the depicted dashboard or imply these advertised capabilities have working backend implementations.

## Implementation plan / affected files

1. HomePage.jsx: replace the unrelated rotating hero with a dedicated AquaDocsBanner; retain existing feature cards and contact form; forward section IDs; import existing contact image through Vite.
2. AquaDocsBanner.jsx: responsive original artwork, semantic description and actual CTA linked to existing `/login` or `/home` according to existing auth state.
3. HomePage.css: scoped banner, summary, responsive sections, focus and anchor offsets. Remove duplicated page CSS and entrance hiding in this page only.
4. AppHeader.jsx: use real router links for logo/login and absolute home anchors so navigation also works from authentication pages; retain existing branding and styling.
5. src/assets/aquadocs-ai-banner.png: lossless original PNG, decoded from supplied SVG.
6. docs/design/: source, screen specification, uncertainties, reproducible QA script, screenshots, comparison and acceptance report.

## Layout and local tokens

- Public header remains 64px; banner is full available width, natural ratio 1672/941, never cropped or overlaid with invented controls.
- Reference comparison is the banner region at 1672 × 941, not the entire page: the retained header and subsequent real content are outside source scope.
- Desktop content max width: 1200px; section padding: 64px 32px. Mobile below 768px: 40px 20px.
- Local CSS variables: --aqua-ink #071b66, --aqua-blue #0068ff, --aqua-surface #f3f9ff, --aqua-border #dceaff. These are implementation values inspired by artwork, not extracted vector tokens.
- Typography: retain configured Be Vietnam Pro and fallback stack; source lettering is rasterized and cannot establish original font metrics.
- Reuse Ant Design interaction, form validation and focus behavior. Visible focus for new links; no new animation; semantic h1 and descriptive text.

## QA and risks

Targets: 1672 × 1005 (64px header + 941px banner), 1440 × 900, 768 × 1024, 390 × 844. The latter three verify responsive layout only; no matching source exists.

Verify rendered image dimensions, load completion, lossless region comparison, overflow, home anchors, logo, CTA, keyboard focus, protected-route redirection, public forms and required/invalid-email contact validation. Inspect browser console and failed resources. Max two corrective visual passes after initial capture.

Backend login, permissions, upload, search, server errors/loading/empty states require a backend and valid account; do not mark these passed based on public-page checks. Retained GENADATA header/footer identity differs from the AquaDocs artwork and needs a separate branding decision. Contact form has no submission integration in the existing system; preserve and report this limitation.

## Continuation plan — 2026-11-11

User requested continued refinement on this screen only and supplied the backend repository for verification. Prior verified banner geometry/comparison remains the baseline; do not redesign its artwork.

Largest documented mismatches: GENADATA public header/footer identity and unrelated IMT illustration next to AquaDocs content. Apply an AquaDocs brand variant only when MainLayout pathname is `/`; retain existing header/footer on authentication routes. Reuse the official wordmark region from the original banner through an SVG viewport, without inventing a replacement symbol. Remove only the unrelated contact illustration; retain contact details and form behavior. These changes do not authorize organization-wide rebranding or changes to contact ownership.

Affected implementation files: MainLayout.jsx, AppHeader.jsx/.css, AppFooter.jsx, HomePage.jsx/.css. Reuse existing components with optional brand props. New verification artifacts go in `qa/refinement/`, preserving prior checkpoint evidence.

Related regression targets: shared header/footer on login/register/reset-entry routes remain GENADATA; guest and authenticated landing CTA; hash navigation including repeated same-section selection; required/email contact validation; four existing viewport widths; tab focus. Authenticated/refresh/error UI may be checked with explicitly labelled fixtures derived from backend DTOs, never reported as live integration.

Backend audit: build/compile can run without app startup. Runtime must use isolated data: shipped properties point to non-loopback PostgreSQL with schema updates and DatabaseInitializer; do not start against those settings. Record configuration compatibility and runtime availability separately from browser fixture results.
