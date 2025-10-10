# Accessibility Checklist

This checklist documents the manual tests needed to understand the Flappy Bird web app's current accessibility posture and to verify future improvements. Record the date, device, browser, and any findings for each run so issues can be triaged.

## Test Environment Setup

1. Install dependencies with `npm install` (first run only).
2. Start the development server with `npm run dev` and open http://localhost:3000 in your test browser.
3. Disable browser extensions that might interfere with accessibility tooling.

## Keyboard-Only Playability

- Focus the game canvas (click once if focus management is unavailable).
- Use the **Space** or **Enter** keys to start and continue flapping.
- Confirm that gameplay, pausing, and restarting are achievable without a pointing device.
- Note any missing focus outlines, instructions, or pause controls that would block keyboard users.

## Screen Reader Smoke Test

1. With the game running locally, launch your preferred screen reader:
   - **Windows** – NVDA or Narrator.
   - **macOS** – VoiceOver.
   - **Linux** – Orca.
2. Navigate to the browser tab and attempt to reach the game canvas using standard navigation commands (`Tab`, rotor, landmarks, etc.).
3. Document what the screen reader announces when focus enters the canvas and during gameplay events (game start, collision, score changes).
4. Capture gaps such as silent interactions, lack of instructions, or missing focus order so they can be mapped to backlog fixes.

## Reduced Motion Preference

1. Enable the operating system's reduced-motion setting:
   - **macOS/iOS** – Settings → Accessibility → Display → Reduce Motion.
   - **Windows** – Settings → Accessibility → Visual effects → Animation effects (toggle off).
   - **Android** – Settings → Accessibility → Display size and text → Remove animations.
2. Refresh the game with the preference enabled and observe parallax scrolling, sprite animation speed, and transition effects.
3. Note whether any elements respect the preference; if everything animates at full speed, flag this as an open backlog item.
4. Restore the original system setting after testing.

## Follow-Up Backlog Items

Log unresolved issues against the outstanding accessibility priorities: honoring `prefers-reduced-motion`, adding structured keyboard focus/ARIA support, shipping high-contrast themes, vibration toggles, orientation guidance, and a dedicated Accessibility/Settings screen.
