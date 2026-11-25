# Responsive composition contract

The site uses three bounded compositions selected by the available CSS viewport, never by user-agent or physical display resolution.

| Composition | Minimum canvas | Reference | Maximum canvas |
| --- | --- | --- | --- |
| Desktop | 1280 × 720 | 1600 × 900 | 1920 × 1080 |
| Tablet | 600 × 800 | 768 × 1024 | 1024 × 1365 |
| Mobile | 320 × 640 | 390 × 780 | 480 × 960 |

Desktop: viewport width >= 1101 CSS px. Tablet: 600–1100 CSS px except narrow landscape windows. Mobile: width <= 599 CSS px or width <= 1000 and height <= 500 CSS px.

- The shared canvas contract owns the reference geometry and scaling. All five stylesheets use rem design lengths and canvas-relative spacing instead of independently reacting to viewport units.
- Desktop sizing follows the limiting viewport axis; tablet and mobile retain a readable minimum text scale. Content may grow in the vertical direction and technical diagrams retain narrow-container fallbacks.
- The maximum width is centered against the theme-aware surround. Below the composition's minimum width, document scrolling is intentional. Browser zoom and user font settings remain enabled.
- Homepage stages distinguish the bounded reference composition from the outer viewing frame. The frame reserves at least one viewport to keep adjacent projects isolated; surplus height is placed outside the content composition. Natural content may exceed the reference height to remain readable. Long-form pages remain naturally scrollable.
- The same navigation breakpoint is used by CSS and the menu controller.
- Borders of one or two pixels are deliberately retained.

## Validation

Run `npm ci`, `npm run format:check`, `npm run build`, and the existing browser smoke and responsive matrix scripts against the built site. The expanded matrix exercises all six routes and both themes, including oversized monitors, compact laptops, tablets, foldables, landscape phones, and boundaries. Intended minimum-width scrolling is distinguished from accidental overflow.

This is a draft implementation; visual and browser regression review is required before production deployment.
