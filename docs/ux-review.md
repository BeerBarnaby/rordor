# UX review — 19 September 2026

## Design decisions

- Use a mobile-first “field protocol” direction: warm paper, dark ink, deep pine focus surfaces and one red-orange signal color for primary actions.
- Use IBM Plex Sans Thai Looped for the full interface and IBM Plex Mono only for short protocol codes and numeric progress.
- Remove generated illustration assets and the unused mascot component. Personality comes from typography, numbered steps, rules and interaction rather than decorative imagery.
- Make the first home viewport answer one question: what should I do next? The active scenario and one full-width action lead; the guide is secondary.
- Keep tablets on the mobile information order and bottom navigation. Switch to a wider two-column composition and top navigation only at desktop width.
- Hide global navigation during active training. A compact training header keeps an explicit exit action and preserves in-progress state.
- Show only the current training step plus four progress segments on small screens, avoiding wrapped progress labels.
- Treat modules as editorial rows, answers as interactive choices, CPR as a focused action surface and AED as a command panel. Avoid generic cards for normal content.

## Content decisions

- Update CPR/AED copy against AHA 2025 and NIEMS 2025 guidance: abnormal or gasping breathing, assessment within 10 seconds, 100–120 compressions per minute, 5–6 cm depth, full recoil and minimal interruptions.
- Give trained users a 30:2 practice route and give untrained or unwilling users a continuous-compression route following 1669 instructions.
- Replace placeholder agency-homepage links with direct NIEMS 2025 documents.
- Make 1669 distractor answers plausible but incomplete, and include repeat hazards as a reporting field.
- Keep expert-review status visible. The application remains a training prototype, not clinical certification.

## Verification

- `npm run lint`: passed.
- `npm test`: 6 tests passed.
- `npm run build`: production build passed.
- Browser flow verified from sequence through 1669, the continuous-compression CPR route, AED and results, including the AED analysis delay.
- Responsive checks cover 375, 390, 430, 768, 1024 and 1440 pixel widths with no horizontal overflow.
