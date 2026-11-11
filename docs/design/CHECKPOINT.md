# AquaDocs — stable checkpoint after live reverification

2026-11-11. All existing application UI remains authorized; no new screens/routes. Read Git status, DESIGN.md, APPLICATION_SPECS.md and **REVERIFICATION_REPORT.md** first. Previous checkpoint archived as CHECKPOINT_APPLICATION_PRE_REVERIFICATION.md. Do not repeat verified banner/backend forensics.

## Implemented this continuation

Repaired category upload and category/search preview props, removed duplicate preview instances. UploadModal now validates before posting, supports existing metadata upload and supplies required categoryId for multi-upload. One authenticated preview per page, visible error/retry, proper viewer lifecycle and authenticated blob download. WebViewer and existing license retained. Numeric id used for global table selection/deletion; UUID-dependent actions visibly disabled when backend omits fileId, without fabricated values or API changes.

Fixed 702px range-calendar overflow at 390px; second visual pass corrected vertical clipping. Mobile months stack inside a viewport-anchored scrollable popup; date selection verified. Static Ant Design feedback inherits AquaDocs theme. Existing Be Vietnam Pro weights now locally served with OFL because Google Fonts was blocked. No new design tokens.

Vite ignores runtime/screenshot output to prevent reproduced Windows EBUSY watcher crash; .runtime.local is denied over HTTP (403). User package-lock diff preserved. Backend source untouched and git status clean. No commit/push/merge/deploy.

## Evidence and checks

docs/design/qa/reverification/ contains 44 new route/state captures at 1440x900 and390x844, with local font; 44 labelled before/after comparisons plus44 overlays/diffs. Initial full sweep148/148; final geometry/branding+interaction rerun123/123 using the44 captures. Additional modal/contract/calendar/PDF/missing-UUID/numeric-delete fixture checks **31/31**. Landing **23/23**, fontLoaded=true at1672/1440/768/390;320px overflow also checked. Distinguish fixtures from live integration.

Banner1672x941 at y64: RGB MAE0.033880318369104094/255,15,046 differing pixels/1,573,352. Same source comparison as prior verified render. No application-wide similarity percentage.

Final npm run build exit0; targeted JSX/config lint exit0 with one existing fetchDocuments hook warning. Full lint exit1:8099 errors/431 warnings including generated WebViewer. Source lint9 errors/4 warnings in baseline modules. git diff --check exit0. Java21 Maven package exit0; tests skipped/no test sources, not a test pass.

## Real backend is now running

Docker project aquadocs-ui-qa has isolated PostgreSQL55432, Redis56379, Mailpit SMTP51025/inbox58025 bound to loopback. Backend at127.0.0.1:8080, frontend http://localhost:5173. Existing database5432 and shipped remote DB/SMTP settings not used. spring.config.location replaces shipped configuration entirely. Camunda startup schema issue fixed with search_path for QA role/database only. Runtime settings/logs/credentials/uploads under Git-ignored .runtime.local. Do not print them. Setup/reproduction: scripts/qa/README.md.

Account manager@aquadocs.invalid registered and email-verified through real frontend/SMTP. Ignored credentials.json contains password. QA manager role and AquaDocs QA organization seeded. Explicit sample PDF in QA water samples, category8/document12 at this snapshot. Prefer query by sample title rather than assuming IDs for a fresh DB. Sample is seed data, not successful upload.

Real verified: signup → local SMTP → verification → login/current account; organization detail; category creation; seed PDF preview; byte-identical download; title search; mobile category; Redis-backed refresh; anonymous API rejection401. Account6/7 checks (email branding failure); seeded12/13 (missing UUID failure); transfers4/5 (upload500). Workspace script stopped on metadata-upload500, not PASS. Real reports deliberately exit1 for unresolved failures.

## Remaining acceptance failures / next step

1. Both POST /documents and /documents/upload-multiple fail500 because backend inserts confidentiality=null into NOT NULL column. Metadata DTO offers no corresponding field. Do not invent security classification, weaken constraints or add DB defaults to mask this. Resolve intended backend business rule before upload can pass.
2. GET /documents/all omits fileId UUID required by retrieve/password/ZIP APIs (and storageCapacity). Frontend selection/deletion uses correct numeric IDs; encrypted actions remain unavailable pending contract-compatible resolution. Do not infer UUID from paths.
3. Backend email subject/template branding remains GENADATA. Frontend route branding is AquaDocs.

Not real-tested: password reset, invitations, all member/department mutations and permission branches, real deletion, encrypted preview/wrong password/ZIP/watermark, workflow/Kafka/Azure. Existing Google login/AI/profile/bookmark/shared placeholders, static recent data and contact form without endpoint remain business limitations. No full WCAG audit. WebViewer demo watermark, raster logo background and bundle/image/font sizes remain documented.

Stop at this buildable, running checkpoint; do not declare entire app/end-to-end PASS. Next work must resolve the concrete backend classification/UUID/email findings, then rerun the blocked flows and remaining permission branches. Full gap analysis, changed files and evidence links: REVERIFICATION_REPORT.md.
