# TheSeekerLabyrinth

Made for **OpenAI DEV CHALLENGE: MAKE A GAME WE CAN PLAY**.

TheSeekerLabyrinth is an isometric browser game where the player collects gems, avoids coordinated seeker agents, and escapes through a gate after every gem is found.

Vercel link: https://the-seeker-labyrinth.vercel.app/

## Play Locally

```powershell
npm install
npm run dev
```

Then open:

[http://127.0.0.1:5173/](http://127.0.0.1:5173/)

The dev server is pinned to port `5173`.

## Build

```powershell
npm run build
```

The production build is written to `dist/` and can be hosted as a static site.

## Objective

Collect all gems before the seekers catch you. Once every gem is collected, the seekers learn your exact location and the escape gate activates. Reach the gate to clear the level.

The final score considers run time, gems collected, trap avoidance, seeker sightings, all-gem streaks, and escape performance.
Optional rover-assisted actions can also adjust the score, so using help or raising the pressure is reflected in the final breakdown.

## Controls

| Action | Default |
| --- | --- |
| Move | `WASD` or arrow keys |
| Run | `Shift` |
| Push boxes | Walk into a box |
| Pause | Open the in-game menu |

Controls can be remapped in game. Touch controls for mobile users can also be enabled from the controller settings.

## Features

- Shared seeker awareness, line of sight, pathfinding, prediction, and route traps
- Pushable boxes and blocking props that affect navigation
- Night-time atmosphere with seeker flashlight vision
- Difficulty settings for gem count, seeker count, and seeker speed
- Scoring screen with bonuses and rank
- Optional OpenAI API rover companion for mid-game difficulty changes

## Optional OpenAI Rover

The game works without an API key.

If an OpenAI API key is added, the rover can read natural text and adjust the run. It can slow or speed seekers, change player speed, add or remove seekers, change gem count, and add boxes.

Rover help and extra difficulty changes are reflected in the final score.

It can also handle deliberately extreme requests, including:

| Example prompt | What the rover can do |
| --- | --- |
| `make seekers speed 0.1x` | Heavily slow the seekers |
| `make the player speed 20x` | Give the player a huge temporary boost |
| `spawn 99 seekers` | Raise the seeker target and keep spawning agents |
| `remove more than half of the unclaimed gems` | Resolve the current unclaimed gem count and remove most of them |
| `remove all seekers except for 1` | Keep one seeker active and recall the rest |

When gem requests go beyond the hand-placed spawn points, the game falls back to random valid floor tiles so the command still works.

## OpenAI Inspiration

The seeker behavior is inspired by OpenAI's archived multi-agent hide-and-seek work:

[openai/multi-agent-emergence-environments](https://github.com/openai/multi-agent-emergence-environments#readme)

This project does not run the original Python/MuJoCo environment. Instead, it adapts the spirit of that work into a playable web game with hand-authored seeker systems.

## Public Build

The public build is focused on playing the game. Developer sandbox tools and map-editing controls are disabled in the UI.

During private development, the map editor can be re-enabled in code by changing the local developer flag, but that mode is not intended for public gameplay.

## How Codex Was Used

Codex helped turn those decisions into working code and made iteration faster. It was used to:

- tune player speed, run feel, seeker timing, and overall pacing
- build seeker systems for roles, vision, pathfinding, prediction, traps, and shared alerts
- create and refine the local map-building tools used during development
- implement gems, escape gates, scoring, menus, touch controls, and responsive UI
- integrate the optional OpenAI rover controller and its bounded game actions
- revise the map, props, stairs, bridges, and themed areas based on playtesting feedback
- run builds and local browser checks while the game evolved

The human side shaped the game direction. That included the isometric style, map layout, island themes, seeker-agent ideas, rover powers, and final gameplay choices.
