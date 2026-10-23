# Cricket Empire v0.9.3

## v0.9.3 — Match insight and custom competitions

Adds a live chase outlook with required rate, projected total and a modelled estimate; ten-appearance player batting form charts; a career record book; end-of-season Player of the Season, leading batter, leading bowler and all-rounder awards; and career milestone announcements. Create a Sydney or Empire custom tournament for 4–10 even-numbered clubs, with single or home-and-away round robins and top-four finals. Field placement now has Aggressive, Balanced and Defensive presets with a graphic that moves 11 fielders to match the selected shape; presets use existing fielding effects in the match engine. Saves migrate to schema 8.

## iOS TestFlight setup (bare React Native)

The iOS app uses the React Native CLI and native Xcode project; it does not require Expo. On a Mac, run `npm ci`, then `cd ios && pod install`, and open `ios/CricketEmpireNative.xcworkspace` in Xcode. The displayed app name is Cricket Empire and the bundle identifier is `com.cricketempire.game`. See [TESTFLIGHT-SETUP.md](TESTFLIGHT-SETUP.md) for the full Apple Developer, App Store Connect, signing, and tester invitation guide.

GitHub Actions runs the game tests on pushes and pull requests. Codemagic uses `codemagic.yaml` to install packages, run tests, sign the iOS app, build an IPA, and upload it to TestFlight. Connect the GitHub repository to Codemagic, configure an App Store Connect API key integration named `cricket_empire_app_store_connect`, and upload the Apple distribution certificate and App Store provisioning profile for the bundle identifier. Apple requires an App Store Connect app record before the first automated upload. Change the bundle identifier in both `app.json`/Xcode settings and `codemagic.yaml` if it is already taken in your Apple account.

# Cricket Empire v0.9.2

## v0.9.2 — Format squads and selection insight

All-format careers now save a separate playing XI, batting order, captain and vice-captain for T20, ODI and First-class cricket. Matches use the matching format squad. The squad screen shows format-specific recent performance, recommends a role-balanced XI using ratings and recent form, and explains each player’s selection fit. Older all-format saves migrate by copying the previous XI and leaders into each format.

## v0.9.1 — Scoreboard and reliability fixes

Restores the live, completed and archived scorecard renderers, with clear empty states when match data is unavailable. The scorecard now shows batting, bowling, extras, totals and fielding contributions. The selected CE cricket-ball monogram is now the app’s logo in the interface and app icon. The grass backdrop now shows a wider cricket oval, central pitch and surrounding ground, while content panels use translucent navy surfaces rather than green boxes.

## v0.9.0 — Player leadership, club staff and finances

Adds player leadership and batting-order preferences, role-specific coaching and physiotherapy, club reputation, seasonal finances, and upgradeable facilities.

## v0.7.9 — Conditions, fatigue and injury

Match previews now show a generated weather forecast and outfield, with a home pitch-preparation choice: green, balanced, dry or slow. Conditions change swing, wicket chances, scoring and fielding. The live match tracks red/white-ball age, batter and bowler fatigue, and injury commentary. First-class captains may take a new red ball after 80 overs; AI captains make the same decision automatically. Workload-related strains can rule a bowler out for the rest of the match and reduce ability over the next two appearances. Injury status, conditions, ball wear and fatigue survive save/load. Older saves receive default conditions and match state when loaded.

## v0.7.8 — Match preparation and leadership

The pre-match preview shows the opponent’s recent results, top batters and top bowlers. Your batting order is clearly presented before the match and remains editable under Team → Squad. Appoint a captain and vice-captain for your club, review format-specific recent form for each XI player, and choose to bat or bowl when you win the toss. Toss choice can be saved and restored before the opening delivery. The existing ball-by-ball scoring rules and 0.7.7 visual theme remain in place.

## v0.7.7 — A calmer cricket palette

The interface now pairs deep pavilion navy and slate-green panels with chalk text, grass-green actions and restrained brass highlights. It keeps the same screens and gameplay while giving the app a more modern cricket look. The v0.7.7 background artwork features a cricket ball resting on grass.


## v0.7.6 — Arcade quick matches

Arcade Mode starts a standalone match without entering or overwriting a career. Choose two Sydney clubs, T20, ODI or First-class cricket, and Easy, Standard or Hard difficulty. Easy and Hard adjust only the opposing XI. Play one ball or advance six balls at a time, open the scorecard, and rematch or choose another matchup.

`npm run preview` serves the included production web build in `dist`. The preview server falls back to the app entry page for client-side routes such as `/**`.

## v0.7.5 — Every format in one season

Choose All formats when starting an International or domestic career to play T20, ODI and First-class in the same season. Each format has separate fixtures, standings and finals, and International rankings remain separate by format. Combined domestic careers include all three formats in Sydney and Empire; the franchise league stays T20-only. Statistics and archived season tables can be reviewed by format. Each format has its own playing XI, batting order and leadership. Older careers migrate to save version 8.

# Cricket Empire v0.7.4

## v0.7.4 — A simpler career screen

The career navigation keeps the five main destinations in view and folds secondary screens behind More. All existing features remain available, and gameplay and saves are unchanged.

## v0.7.3 — Domestic and international career choices

New careers now start by choosing Domestic or International. Domestic managers can select Sydney, Empire, Franchise, or All domestic competitions. The combined T20 career keeps the Sydney, Empire and Franchise leagues separate, with their own fixtures, standings and finals, in one save. Pick one club to control; matches in the other leagues remain manual, one at a time. All combined clubs start with generated squads, while the individual Franchise career retains its auction. International Career remains a separate national-team choice. Combined save, league progression, finals, standings and season rollover are covered by automated tests.

## v0.7.2 — Budget-aware franchise bidding

Each franchise reserves four credits for every starting-XI place it still needs and one credit for each remaining bench place. Bid controls show affordable raises, and the auction engine rejects bids above the spendable purse. Clubs cannot buy a player if their squad composition and 15-player cap would make it impossible to field a valid XI with a wicketkeeper and five bowling options. Rival valuations account for budget per required XI place as well as current ability, potential and role needs. Wages and wider club finances remain outside this release.

## v0.7.1 — Three-round franchise auctions

## v0.7.1 — Three-round franchise auctions

Each player now goes through three bidding rounds. The manager and rival franchises can raise or pass once each round; the screen shows the current highest bid, leading team and remaining manager chances. Rival decisions weigh player potential, current ability, roster role gaps and purse limits. Existing v0.7 franchise saves migrate into the new round-based auction state.


## v0.7.0 — T20 franchise auctions

Added an eight-club T20 franchise competition with 120 fictional players in a shared auction pool. Each club starts with 100 credits and builds a 15-player squad through bidding or by simulating the remaining auction. Rival bids reflect player quality and squad needs; the auction protects enough purse to complete each squad. Auction state saves with the career. This release adds auction credits only; wages and wider club finances remain outside v0.7.


## v0.6.9 — Standings and squad ratings

Standings now label played, wins, losses and ties explicitly, with draws shown for first-class. New squads and recruits use role-focused ratings: specialist batters, wicketkeepers, all-rounders and bowlers have more believable skill profiles, while team strength varies modestly. Existing careers receive a one-time role-balancing pass when no match is active; completed scorecards and live match snapshots remain intact.

## v0.6.8 — Match by match

Fixtures progress in scheduled order, one game at a time. Only the next unplayed fixture can be started, watched or simulated; finishing a match does not run any other games. Matchday controls use less space, with filters and round recaps collapsed until requested.

## v0.6.7 — Manual matchdays

Fixtures now wait for the manager’s decision. Play your own club’s match, simulate an AI-versus-AI fixture instantly, or watch one ball by ball as a spectator without controlling either team. The Matchday screen shows the active round, progress, recent round recap and standings movement, with round, team-name and result-status filters. Later rounds unlock only after the current round is complete.

## v0.6.6 — Cricket contract negotiations

Domestic contracts distinguish Rookie and Full deals, record the signing season and expiry, and show seasons remaining plus playing-XI status. Players request a minimum term based on age, development potential and role in the XI; short offers are blocked and each player’s request is shown before offering a renewal, free-agent deal or transfer. AI clubs issue role-appropriate contract lengths, and transfer history records the deal. Player and staff wages, sponsorship, matchday income, prizes and facility upkeep are now included in club accounts; transfer fees remain outside this build.

## v0.6.5 — Streamlined screens

Related career screens are grouped under Home, Team, Matches, Competition and Club. The live Match centre keeps the score and key controls visible, folds commentary behind a button, and hides match tactics and the bowler list until requested. Full scorecards remain on the dedicated Scorecard screen.


## v0.6 Player development and scorecards

Each player has an age and potential ceiling for batting, bowling and fielding. Your academy starts at level 1 and supports one training plan each season. Select a player and focus before the season ends; training takes effect on rollover, adding 2 points (plus half the academy level, rounded down) up to potential. Every completed season awards one academy token. In pre-season, spend tokens equal to the next level to upgrade the academy, up to level 5; each level adds a training place. Club finances are not part of this version. AI clubs train one developing player automatically and age their squads. Players over 34 slowly decline.

The Academy screen lists the selected team's ages, current ratings and potential. The full Scorecard screen is available during live play and from completed fixtures, and lists all batters, did-not-bat players, strike rates, extras and bowling figures.

The selected team is the only team the player can change, train or direct during a match. Other fixtures are completed by the AI before the next fixture involving the selected team.

International careers: select International when starting a new career, then choose one of ten nations and T20, ODI or first-class. Players and ratings are fictional. Each format starts at Elo 1,000; K=24, draw/tie=half result. Ratings update once on Continue season after each result, including finals. Rankings persist across seasons; unplayed formats stay at their starting rating. A career schedules one format. National squads remain fixed between seasons; club recruitment is domestic only.

Squad selection: Auto-pick XI, select an ordered XI position and then a reserve to swap, or use arrows to reorder. A keeper and five bowling options are required. Changes lock during a match.

The revised engine uses separate outcome distributions for each format, tail-end batting ratings for newly generated squads, tactical risk/reward and adaptive opponent plans. Existing player ratings, completed results and active score totals are retained. Future deliveries use the updated engine.

## Project history: v0.4.1 — Sydney Suburbs

React Native game for web and iOS. This release adds player contracts, recruitment, transfers and repeatable multi-season careers across the existing T20, ODI and first-class formats.

## Play

From this folder, run `npm ci` and `npm start` to start the React Native Metro bundler. iOS simulator builds require macOS and Xcode; TestFlight builds run on Codemagic.

For the already exported web build run `python -m http.server 8083 --bind 127.0.0.1 --directory dist`, then open http://127.0.0.1:8083. Retain the same browser origin for the local career save.

## Contracts, recruitment and transfers

- Contracts tab shows each player's expiry season. Renewals add one, two or three seasons to their current expiry when the player accepts the minimum term shown on their contract card.
- Recruitment lists free agents and transfer-listed players at other clubs, with role/source filters and ratings.
- Choose a one-to-three-season term for new signings. The current season counts as the first: a three-season signing in season 2 runs through season 4.
- List your own players for transfer, transfer a listed player to another club, or release them into the free-agent pool. Releases and outgoing transfers require confirmation.
- Clubs protect at least 12 players, one wicketkeeper and five bowlers/all-rounders. Maximum squad size is 20. Squad and contract changes are blocked during a match.
- Transactions are recorded with the player, season and clubs. Computer clubs replace expired players before a new season and list their reserves.
- v0.4 transfers use direct agreement for listed players. Wages, fees, budgets and negotiation systems are not included; finances remain later roadmap work.

## Multiple seasons

Finish the final, choose Continue season on the result, then select Start next season from Overview. Review expiring contracts before confirming.

Rollover archives the completed season, increments the season number, ends expired contracts and generates fresh fixtures with reversed home/away pairings. Your club, tactics and unexpired contracts carry forward. There is no fixed season-count cap.

In pre-season, renew or recruit to meet the squad requirements, then choose Begin season. Computer clubs may sign expired free agents while filling their own squads. Player attributes do not grow and players do not age/retire in this release.

History stores champions, final league tables, player totals, fixtures and scorecards from previous seasons. Statistics can switch between current-season and career totals. Player identity snapshots keep scorecards and statistics correct after transfers. Club labels in current/career totals show current affiliation; archived season totals retain the labels recorded when archived.

## Saves and compatibility

v0.1, v0.2 and v0.3 careers migrate into season 1 with generated contract terms and a recruitment pool, preserving all played results and any active match. Match RNG is preserved during migration. Completed old careers can immediately review contracts and advance to season 2.

New saves use schema 4 and cannot be opened by old builds. Web saves use IndexedDB with legacy localStorage reads; native builds use AsyncStorage. Settings offers portable backup text. Long histories grow with each season, so backup/export remains useful; native large-save/device limits have not been verified.

Completed current-season matches retain their latest 30 commentary entries per innings. Archived seasons retain complete scorecards/statistics and omit delivery commentary. Only participating players are stored in each archived innings snapshot to reduce save size.

## Validation

`npm test` covers the scoring/format/tactics regression suite plus contracts, renewal, release, transfer safeguards, historical identity, expiry, pre-season, migration and save/load. Multi-season tests play ten consecutive seasons in each of T20, ODI and first-class.

The web build in `dist` is retained for browser preview. Browser testing covers management transactions, season rollover, archive scorecards, pre-season reload and playable season two. See VERIFICATION.md for final results.

## Existing format rules and boundaries

T20: 20 overs, four per bowler. ODI format: 50 overs, ten per bowler. First-class: two innings each with a fixed four-day/360-over match budget, declarations, aggregate results and draws; no follow-on. Limited-overs knockout ties use Super Overs. Drawn/tied first-class knockouts advance the higher league seed.

The v0.7 auction is available only in the new T20 franchise competition. Club finances/facilities, achievements, nation creation and stadium builder remain outside this release.

The retained SDK dependency tree previously reported 35 audit findings (12 moderate, 23 high). Dependency modernization and native phone testing remain before production distribution.


## Sydney Suburbs update (v0.4.1)

New Career now offers Sydney Suburbs (selected by default) or the original Empire League. Sydney is available in T20, ODI and first-class with generated players, contracts, recruitment, transfers and multi-season careers.

The ten clubs, in the requested order:

1. Sydney East (SYE)
2. Northern Beaches (NBE)
3. Canterbury (CAN)
4. Parramatta (PAR)
5. Liverpool (LIV)
6. Mascot (MAS)
7. Redfern (RED)
8. Penrith (PEN)
9. Hurstville (HUR)
10. Blacktown (BLK)

Sydney plays a single round robin: nine rounds, five fixtures per round, nine matches per club, 45 league fixtures. First plays fourth and second plays third in the semi-finals, followed by the final: 48 matches in a completed season. Home/away pairings reverse in the next season. Sydney Oval is a fictional shared venue in this initial competition setup.

Competition membership is fixed for each career. Existing Empire careers keep their six clubs, fixtures, history and active match. Choose New Career → Sydney Suburbs to play the Sydney league. Starting a new career replaces the single device save; export the previous career from Settings if you want to keep both. v0.4.1 retains save schema 4 and adds competition metadata; older Empire saves infer the Empire League automatically. Ten-club Sydney saves require this update.

All 49 tests pass, including three consecutive Sydney seasons in each format across three seeds, ten-team scheduling/finals, Blacktown save/load and transfers to club nine. Browser checks verified all ten club names, Blacktown career selection, a live score restored unchanged after reload, and the ten-team table.
