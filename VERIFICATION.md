# v0.9.5 implementation notes

- Board objective progress now uses the current season baseline and only recognizes finals participation after qualification. Schema 9 resets current objective progress in every existing save when the app loads its saved slots.
- The live display uses a classic ground scoreboard treatment. Batting and bowling figures wrap into compact mobile rows so long player names and numeric stats stay visible.
- Player profiles summarize career and recent batting, bowling and fielding performance, ratings and potential, mental attributes, fatigue and injury status.
- Recent performance, batting and bowling skill, player confidence and composure, team XI strength, pitch and weather conditions, and tactical choices now feed match outcomes.
- The match preview includes a pitch report before the toss. The toss lets the manager call heads or tails, shows an animated coin flip, and offers the bat-or-bowl decision after a win.

Automated tests were not run for this update.