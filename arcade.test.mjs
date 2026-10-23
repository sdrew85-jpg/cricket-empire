import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';
import { newArcadeMatch } from './arcade.mjs';

test('arcade validates teams, formats and difficulty', () => {
  assert.throws(() => newArcadeMatch(0, 0), /different Sydney teams/);
  assert.throws(() => newArcadeMatch(0, 1, 'bad'), /T20, ODI or First-class/);
  assert.throws(() => newArcadeMatch(0, 1, 'T20', 'Very hard'), /Easy, Standard or Hard/);
});

test('arcade starts an isolated match, applies difficulty to the rival, and completes with a scorecard', () => {
  const easy = newArcadeMatch(0, 1, 'T20', 'Easy', 77);
  const standard = newArcadeMatch(0, 1, 'T20', 'Standard', 77);
  const hard = newArcadeMatch(0, 1, 'T20', 'Hard', 77);
  assert.equal(easy.arcade, true);
  assert.equal(easy.active.fixture, 0);
  assert.equal(easy.fixtures[0].stage, 'Arcade');
  assert.deepEqual(easy.teams[0].players.map(p => p.bat), standard.teams[0].players.map(p => p.bat));
  assert.ok(easy.teams[1].players.reduce((sum, p) => sum + p.bat, 0) < standard.teams[1].players.reduce((sum, p) => sum + p.bat, 0));
  assert.ok(hard.teams[1].players.reduce((sum, p) => sum + p.bat, 0) > standard.teams[1].players.reduce((sum, p) => sum + p.bat, 0));
  E.finish(easy);
  assert.ok(easy.active.result);
  assert.equal(easy.active.innings.length, 2);
  assert.ok(easy.active.innings.every(i => Array.isArray(i.batting) && i.batting.length === 11 && Array.isArray(i.bowling)));
});
