# AquaDocs application UI scope

Scope authorized by user: all existing routes/components, preserving business behavior; landing `/` remains included. This supersedes the earlier homepage-only scope. Do not add routes, dashboard statistics, APIs or business actions suggested by the banner.

Mode: reuse the confirmed banner on `/`; enhance other existing screens using its navy/blue/teal identity. There are no source-matched designs for authentication, organization or document screens; those are system adaptations, not measured replicas.

## Implementation plan before source changes

1. Centralize AquaDocs palette, Ant Design theme, typography, radius, surfaces and focus styles. Keep existing libraries/providers/API contracts.
2. Extract shared source-based AquaDocsBrand; apply to public header/footer and dashboard. Reuse original raster source through SVG viewports, with an accessible link name. No invented logo.
3. Authentication: preserve form fields/rules/submission handlers; reuse a shared branded illustration and responsive form surfaces. Wrap standalone result/reset/invitation routes in a common branded status shell without changing URLs or state logic.
4. Dashboard: navy sidebar, light canvas, white panels, source-style blue selection. Preserve menu destinations/actions and permission checks. Desktop collapsible sidebar; mobile Drawer using the same navigation, with explicit accessible toggle. User dropdown remains functional.
5. Organization/documents/search: central theme for all Ant Design tables/cards/modals/tabs/forms; add responsive toolbar/table constraints where existing inline fixed widths overflow. No service or permission refactors.
6. Landing: preserve verified banner geometry; align native feature/contact panels and button tokens with shared system. Retain contact information and submission limitations.

Affected files: App.jsx, main.jsx, index.html, styles/aquadocsTheme.js and aquadocs.css, shared Brand/AuthIllustration/StatusPageShell components, AppHeader/AppFooter/MainLayout, DashboardLayout JSX/CSS, authentication presentation, standalone route wrappers, organization/document/search toolbar markup and CSS, source asset imports. Existing providers, API modules and backend source stay unchanged.

## UI specifications

- Colors: navy #071b66, sidebar #081e4b, blue #0068ff, teal #00b890, canvas #f3f8ff, white surfaces, border #dce8f7, text #102552, secondary #526582.
- Be Vietnam Pro remains configured. No new font family. Controls 40px, radii 10px/16px, white panels with restrained blue shadows. Semantically distinct success/error/disabled colors retained.
- Sidebar 240px expanded/80px collapsed on desktop; below 992px navigation becomes a dismissible drawer and content uses available width. Public header remains 64px so banner comparison retains coordinates.
- Form panels max width 480px; register max width 520px; desktop 2-column marketing/form presentation, mobile single-column form. Avoid fixed page heights that clip validation messages.
- Tables retain columns/data/actions, with internal horizontal scroll when needed. Toolbars wrap. Menus/dialogs retain keyboard/focus behavior from Ant Design; icon-only controls receive accessible names where modified.
- No transparent/vector logo or alternative mobile banner supplied; preserve raster branding limitations.

## Verification plan

Inventory all existing route templates; capture default states at 1440×900 and 390×844 using clearly labelled backend fixtures where protected. Capture source-sized banner again at 1672×1005 and compare against supplied SVG. Include error/loading/empty states and reachable modals; test public form validation, navigation, mobile drawer, menu selection, representative search/upload/organization interactions and role-dependent controls. All fixture requests are intercepted; no real user data or mutation sent to backend.

Max initial capture plus two corrective passes per screen group. Keep prior artifacts untouched; store under `qa/application/`. No whole-application fidelity percentage without corresponding source screens. Run build, full lint (baseline recorded), changed-file lint and git diff checks. Record untested actions explicitly.

## Additional verified UI finding

## Reverification repair plan (2026-11-11)

New evidence: category upload and category/search preview callers pass obsolete modal props; multi-upload omits the backend-required categoryId. Repair only these existing flows using the current endpoints. Reuse UploadModal with a category metadata variant, existing organization departments and category API; validate files and fields before posting. Render one preview per page, use authenticated numeric-ID download for category/search records and UUID retrieve for encrypted files. Add visible loading/error/retry states and authenticated blob download while retaining WebViewer. No new route, permission rule or API contract.

Affected source: DocumentView.jsx, SearchResultsPage.jsx, UploadModal.jsx and FilePreviewModal.jsx. No new design tokens. Target 1440x900 and 390x844; test empty/valid upload, failure/retry, one preview instance, download authorization, closing/reopening and popup bounds. Preserve prior screenshots; new evidence under qa/reverification. Backend integration remains pending until these regressions are checked. Placeholder actions and contact endpoint remain business limitations, not verified features.

Further confirmed findings: range calendar measured 702px wide at a 390px viewport, then manual image review found vertical clipping after stacking. Use a mobile viewport-anchored scrollable calendar in AdvancedSearchModal and ActiveFiltersForm, testing all four bounds plus date selection. Static Ant Design feedback needs holderRender to inherit theme. Serve existing font locally because browser reported ERR_NETWORK_ACCESS_DENIED to Google Fonts. These extend the affected files to App.jsx, global.css, aquadocs.css and licensed font assets.

Live integration reveals /documents/all returns numeric id but omits fileId/storageCapacity. Use numeric IDs for selection/deletion; retain UUID operations only when supplied and visibly explain unavailable encrypted actions. Do not fabricate UUIDs or silently change backend DTOs. Vite must ignore runtime and screenshot output (Windows EBUSY on downloaded PDF was reproduced), and deny serving ignored QA credentials.

The existing toast utilities call react-toastify, but the app had no ToastContainer. Add the existing library renderer and its CSS, with AquaDocs feedback surface styling. Preserve message strings, timing options and handlers. Verify error/success rendering with intercepted fixtures; do not call a real delete endpoint. This is UI feedback wiring, not a new business service.
