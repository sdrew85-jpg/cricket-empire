import * as E from './engine.mjs';

export const ARCADE_DIFFICULTIES = ['Easy', 'Standard', 'Hard'];

export function newArcadeMatch(team, opponent, format = 'T20', difficulty = 'Standard', seed = Date.now() >>> 0) {
  const clubs = E.COMPETITIONS.sydney.teams;
  if (!Number.isInteger(team) || !Number.isInteger(opponent) || team < 0 || opponent < 0 || team >= clubs.length || opponent >= clubs.length || team === opponent) {
    throw Error('Choose two different Sydney teams.');
  }
  if (!E.FORMATS[format]) throw Error('Choose T20, ODI or First-class.');
  if (!ARCADE_DIFFICULTIES.includes(difficulty)) throw Error('Choose Easy, Standard or Hard difficulty.');

  const career = E.createCareer(team, seed, format, 'sydney');
  career.arcade = true;
  career.arcadeDifficulty = difficulty;
  const scale = difficulty === 'Easy' ? 0.86 : difficulty === 'Hard' ? 1.14 : 1;
  if (scale !== 1) {
    const rival = career.teams[opponent];
    for (const player of rival.players) {
      for (const rating of ['bat', 'bowl', 'field']) {
        player[rating] = Math.max(8, Math.min(99, Math.round(player[rating] * scale)));
      }
    }
  }
  const fixture = { ...career.fixtures[0], id: 0, round: 1, home: team, away: opponent, stage: 'Arcade' };
  career.fixtures[0] = fixture;
  E.startMatch(career, fixture);
  return career;
}
