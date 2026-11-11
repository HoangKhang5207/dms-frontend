# Design uncertainties

- Only one flattened promotional banner is supplied; there is no interactive dashboard design, mobile composition or state specification.
- Font family, exact original design tokens and source component bounds cannot be recovered reliably from raster text. No Figma source is linked.
- Preserve the full artwork on mobile; provide readable HTML summary because raster labels shrink. This responsive adaptation is unapproved and is not a pixel comparison target.
- User authorized applying AquaDocs to all existing UI. Shared identity/theme now cover public/auth/workspace/result pages; support contact details remain unchanged pending deployment-specific confirmation.
- Promotional claims (AI assistant, automation, knowledge base, analytics) do not establish available backend features. No new product behavior is inferred.
- CTA uses existing login/home routes. No new API contract or contact submission endpoint is inferred.
- The official wordmark/symbol is exposed through an SVG viewport into the raster banner; its original light background remains. No transparent/vector logo asset was supplied.
- Backend contracts are reviewed and compile succeeds, but real session/permission tests remain unverified until an isolated runtime is available. Browser fixture checks do not close this gap.
- Non-landing layouts and interaction styles are AquaDocs system adaptations; no native reference screens were supplied for them. Global theme application does not certify every third-party preview control or popup state.
