# Video Learning Resources

## Outcome

Forge lessons can embed legitimate curated YouTube teaching resources alongside
official documentation and external tutorials without copying third-party
media.

## Resource contract

Every runtime resource record contains a title, provider, URL, topic,
difficulty, duration, resource type, last-reviewed date, and quality status.
Optional YouTube IDs are stored separately from URLs so the interface can build
only privacy-enhanced `youtube-nocookie.com` embed URLs.

## Learner experience

- A matching lesson features one responsive, lazy-loaded video player.
- Provider, duration, difficulty, review date, and quality status stay visible.
- A direct YouTube link remains available if embedding is blocked or unwanted.
- Videos supplement practice and never silently award lesson completion.

## Safety and verification

- Forge hosts no copied video files.
- The document CSP allows frames only from YouTube's privacy-enhanced host.
- Focused tests validate all normalized metadata and the exact embed/fallback.
- The full browser regression verifies the Event Loop lesson at production
  viewport sizes without console errors or horizontal overflow.
