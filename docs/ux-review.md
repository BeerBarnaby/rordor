# UX review — 19 September 2026

## Decisions

- Keep persistent navigation consistent; remove duplicate contextual links within the same page. Home now has one guide action instead of a second guide section.
- In guide details, use the selected module as the page title; avoid repeating the same title beneath the module tabs.
- Put provenance and review status behind one clearly labeled disclosure. Keep the prototype warning visible on the guide index and simulation opening.
- Keep immediate answer feedback. Collapse the call checklist after completion instead of repeating all feedback again before the final review.
- Show scored CPR results in the final review, not another intermediate metrics panel. Keep the live rhythm feedback and AED transition.
- Preserve the blue/white palette, Noto Sans Thai, touch navigation on phones, and top navigation on larger displays.

## Scope and limitations

This is a UI refactor, not clinical validation. Existing content still requires expert review; reviewer identity is not fabricated. Existing institutional links remain labeled as agency websites rather than verified direct document links. Completed results retain the existing localStorage key. In-progress state survives in-app navigation, not a full reload.

## Research

- Nielsen Norman Group, [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/): prioritize common actions and reveal secondary details on request.
- Nielsen Norman Group, [Reduce Redundancy](https://www.nngroup.com/articles/reduce-redundancydecrease-duplicated-design-decisions/): improve the placement of a missed action rather than duplicating it.

## Verification

Lint, production build and the six existing rhythm tests pass. Browser checks cover the complete sequence → call → CPR → AED → results flow, retained completed results after reload, keyboard CPR input, keyboard module tabs, dialog focus containment/restoration, and lazy video loading. Responsive checks use 375, 390, 430, 768, 1024 and 1440px widths, with no horizontal page overflow or clipped navigation; interactive training buttons meet the 44px minimum height.
