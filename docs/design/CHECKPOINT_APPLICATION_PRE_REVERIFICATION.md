# Stable checkpoint — AquaDocs application

2026-11-11. User explicitly approved expanding to all existing pages/components while retaining and completing `/`. Earlier homepage-only restriction is superseded. Previous checkpoint preserved in CHECKPOINT_LANDING.md.

Read Git status, root DESIGN.md, APPLICATION_SPECS.md, APPLICATION_REPORT.md and ROUTE_COVERAGE.md before continuing. Do not redo verified source forensics or backend audit without new evidence.

Implemented: central AquaDocs Ant Design/CSS system; shared source-based identity; all public/auth/result/workspace route groups; mobile drawer/desktop collapse; responsive tables/toolbars and modal rows; labels/focus/reduced motion; source-derived favicon; existing toast renderer now mounted. `/` retains verified source banner and uses light native panels. API/auth/permission logic and route paths remain intact.

Evidence: `qa/application/`. 22 route/state cases at two widths = 44 before/after captures plus 44 labelled comparisons; dialog/state/feedback captures; final landing source comparison. Application assertions 148/148 (full-suite evidence plus targeted six-view auth repair), landing 23/23, session fixtures 14/14, feedback fixtures 6/6. Total 191. Protected/API-dependent checks are intercepted fixtures, never real backend integration.

Build: exit 0 after final source changes. Changed JSX/theme lint: exit 0, existing fetchDocuments hook warning retained. Full lint: 8,103 errors/431 warnings including generated WebViewer; application source 13 errors/4 warnings in baseline modules. No gate disabled. git diff --check passes.

Visual baseline: 12 mobile overflow cases before, zero in final 44 cases. Final source-sized banner 1672x941 at y=64; RGB MAE 0.033880318369104094/255, 15,046 differing pixels vs source. It is identical to the previously verified browser banner region. No whole-application similarity score; other screens have no exact reference.

Known limitations: live backend ports 8080/8081 and Redis 6379 closed in this turn. Use isolated runtime/test account before live QA; do not start shipped schema-updating/seeding configuration against non-loopback databases. Existing incomplete AI/profile/bookmark/shared actions and sample recent data preserved. Preview SDK streaming, category/document modal prop-shape inconsistencies and actual upload/download not verified or rewritten. Contact details await deployment confirmation and contact form has no endpoint. Full WCAG audit and every popup state unverified. Raster logo background/small mobile art text, large bundle/image and baseline lint debt remain documented.

Next: visual review through ROUTE_COVERAGE.md, then isolated backend integration QA and separately scoped business/preview repairs. Original DESIGN.md template archived under docs/design/DESIGN_TEMPLATE.md; all old screenshots/reports preserved. No commit, push, merge or deployment authorized.
