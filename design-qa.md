# AED local implementation — 6 October 2026

## Scope and source

Implement the approved Field Guide + Visual Situation direction in the existing Next.js app, not a new template. Source visual truth: `docs/design-audit-2026-10-06/figma-check-1.png` (390 × 876 clear state) and `figma-desktop-final.png` (1440 × 900). Original approved image is `C:/Users/Piyachet/.codex/generated_images/01a08466-fad8-76d2-aba0-3d0c08ad2a63/exec-ce058c11-59a6-4798-8617-3e9a784031d1.png`.

Figma get_design_context was attempted but the Starter MCP quota was exhausted. No new Figma prototype links were created; implementation proceeded from the selected image and accepted saved screen renders, as disclosed to the user. This is not a claim of a completed Figma design-to-code export.

## Comparison evidence

Source mobile and implementation `docs/aed-local-2026-10-06/clear-v2-390.png` were opened together in one comparison input; source desktop and `clear-v2-1440.png` were in the same input. Production captures: `production-clear-390.png`, `production-clear-1440.png`. CSS viewports 390 × 844 and 1440 × 900. Source images are 1× canvas renders; full-page implementation height follows content. Windows scrollbar reduces mobile captured usable width to approximately 375 px; compare content slots and typography at CSS size rather than infer pixel-perfect equivalence. Desktop usable content is 1040 px in both. Actual image slots are 180 px high on mobile and 480 × 280 px on desktop. Fonts/body text and warning are legible at full-view resolution; browser-read font and geometry measurements supplement that review, so a separate enlarged region was not necessary.

## Required fidelity surfaces

- Typography: website keeps LINE Seed Sans TH, confirmed by browser computed font `lineSeedSansThai`. Figma used temporary Anuphan, an intentional documented constraint; no font replacement on the website. AED heading 28/36 px, body 16/26 px, caption 14/22 px.
- Layout: single instruction hierarchy, character then action list on mobile, illustration left/actions right on desktop; duplicated global training progress removed only in AED. Cream canvas and consistent spacing preserved.
- Colors: existing paper/navy/red/warning tokens reused. Red is actionable; disabled analysis is distinguishable. Visible dark exit text fixes white-on-white AED header.
- Assets: real generated raster files, not UI screenshots, CSS art or substituted SVG. Approved character remains in its clear/shock scene slot. Adult pad diagram uses its own slot and semantic alt/caption; it is a new trial illustration, not instructor-certified equipment documentation. All images loaded with nonzero natural size in production browser evidence.
- Copy: concrete actions, simulation notice, no-shock warning, and distinction between returning to real CPR and completing the lesson. Native details disclose reasons rather than static text pretending to be a control.

## Iteration history

1. Initial mobile pads heading was too long and transition could retain lower scroll position (P2): shortened heading to the source-style "ติดแผ่นตามภาพกำกับ" and reset scroll on state/active change. Evidence `02-pads.png` → `pads-v2-390.png` / `pads-production.png`.
2. 320 px header wrapped exit label, and clear CTA could sit below first viewport (P2): compact AED header without shrinking 44 px control targets, keep exit label on one line, 140 px image and tighter gaps only below 360 px. Evidence `clear-final-320.png` → `production-clear-320.png`. CTA bottom measured 716.8 within 740 px.
3. Desktop vertical offset and leftover disclosure border differed materially from target (P2): scoped AED main top/bottom padding to 24 px and removed legacy disclosure border. Evidence `clear-final-1440.png` → `clear-v2-1440.png` / `production-clear-1440.png`.

No remaining actionable P0/P1/P2 finding in the tested AED scope. P3: legacy 37 brand/header differs from mock; retained because logo replacement was not authorized in this implementation pass. Safety icon and LINE Seed typography differ intentionally from the temporary Figma sketch while preserving the agreed hierarchy.

## Interactions and checks

Actual browser path: บทเรียน → AED → ทบทวน AED ทีละขั้น → power → pads → clear → analyzing → shock → resume → completion → ฝึกอีกผลวิเคราะห์ → no-shock → resume → completion → กลับบทเรียน. Disabled analysis button checked false for isEnabled. No shock button exists in no-shock state. Exit dialog pauses analysis; it remains analyzing while dialog is open, resumes after cancel, and returns focus to exit control. Native explanation opens. XP remained 0/300 and no new mission result appeared after both standalone rounds. Guest access did not require login. Existing server session 401 is expected for Guest; leaderboard returned 200. No browser error/warn observed in final production capture.

Production checks at 320/390/768/1440: scrollWidth never exceeds viewport, clear CTA bottom 716.8 / 762.8 / 846 / 550 px respectively. Captures saved in `docs/aed-local-2026-10-06/`. Lint, 23 unit tests, and production build passed after final source changes.

## Limits

Browser viewport simulation, not physical iPhone/iPad/Safari testing; no full screen-reader, 200% text zoom or WCAG certification. Audio controls are retained and synthetic cues exercised by interaction, but sound was not physically listened to. This run fully tested standalone AED, not a fresh full sequence/1669/CPR mission-to-score run. The integrated mission shares AEDSimulation and state-machine unit tests. No commit, deploy, account writes or database migration. New pad illustration still merits instructor review before public release; existing instructor approval is recorded only as user-reported, not independently certified.

## Handoff checklist

- [x] Local editable code and both image assets placed
- [x] Both AED recommendation paths clickable
- [x] Disclosure / confirm exit / Guest / no standalone XP verified
- [x] Responsive production captures and asset loading verified
- [x] Preserve unrelated local work and no deployment
- [ ] User tries the local build; review new illustration before release

final result: passed
