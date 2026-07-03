# Portfolio Site

A personal portfolio site (React + Vite) showcasing Arend Peter's projects, experience, and skills to prospective employers/clients.

## Language

**Active** (Project Card state):
The state of a `ProjectCard`'s media where its video crossfades in over its screenshot and plays. The default/resting state is the screenshot; a card becomes Active via **Hover** or **Centered**, and returns to resting when the trigger ends or the video reaches its natural end.
_Avoid_: Focused, focus — collides with DOM/accessibility `:focus`, which this is unrelated to (no keyboard interaction involved).

**Hover**:
The desktop trigger for **Active** — mouse pointer enters/leaves the card's bounds.

**Centered**:
The touch-device trigger for **Active** — a card crosses the vertical center of the viewport while scrolling, detected via `IntersectionObserver` (same technique as `useActiveSection`). Only applies on devices where hovering isn't possible (`(hover: none)`), so desktop scrolling never triggers it.

## Relationships

- A **ProjectCard** becomes **Active** via **Hover** (any device with a pointer) or **Centered** (touch-only devices).
- A **ProjectCard** leaving **Active** state resets its video to frame 0 so the next activation starts fresh — it does not resume where it left off.
- Reaching the video's natural end while still **Hover**ed or **Centered** ends the **Active** state (settles back to the screenshot); it does not loop automatically. A fresh **Hover**/**Centered** trigger is required to replay it.

## Example dialogue

> **Dev:** "Should the video keep looping while someone's hovering and reading the card text?"
> **Domain expert:** "No — once it plays through, fade back to the screenshot and stay there. If they want to see it again, they can move the mouse away and back."

## Flagged ambiguities

- "Focus" was initially used to describe the touch-viewport-centering trigger — resolved: renamed to **Centered**, and the resulting media state renamed to **Active**, to avoid colliding with the DOM's `:focus` semantics.
