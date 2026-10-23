import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';

test('new players receive leadership ratings and preferred batting positions',()=>{
 const c=E.createCareer(0,81,'T20','sydney'),players=c.teams[0].players;
 for(const p of players){assert.ok(p.leadership>=45&&p.leadership<=95);assert.ok(p.composure>=45&&p.composure<=95);assert.ok(p.tacticalAwareness>=40&&p.tacticalAwareness<=95);assert.ok(p.preferredPosition>=1&&p.preferredPosition<=11);}
 const before=players[0].preferredPosition;E.setBattingPosition(c,players[0].id,3);assert.equal(players[0].preferredPosition,3);assert.throws(()=>E.setBattingPosition(c,players[0].id,12),/position/);assert.notEqual(before,players[0].preferredPosition);
 assert.equal(E.captaincyScore(players[0]),Math.round(players[0].leadership*.45+players[0].composure*.25+players[0].tacticalAwareness*.3));
});

test('club facilities and staff appointments spend money and affect the program',()=>{
 const c=E.createCareer(0,22,'T20','empire'),club=c.teams[0].club,player=c.teams[0].players[0],start=club.balance;
 E.upgradeFacility(c,'Training centre');assert.equal(club.facilities.training,2);assert.equal(club.balance,start-E.facilityUpgradeCost(1));
 const coach=club.staff['Batting coach'],old=coach.rating,balance=club.balance;E.improveStaff(c,'Batting coach');assert.equal(coach.rating,old+5);assert.ok(club.balance<balance);
 assert.ok(E.coachTrainingBonus(c.teams[0],'bat')>=0);assert.ok(player.wage>0);
 assert.throws(()=>E.upgradeFacility(c,'Swimming pool'),/facility/);
 const restored=E.decode(E.encode(c));assert.equal(restored.teams[0].players[0].preferredPosition,c.teams[0].players[0].preferredPosition);assert.equal(restored.teams[0].club.staff['Batting coach'].rating,coach.rating);assert.equal(restored.teams[0].club.balance,club.balance);
});

test('legacy saves migrate and completed seasons settle club accounts',()=>{
 const c=E.createCareer(0,52,'T20','sydney'),raw=E.encode(c),legacy=JSON.parse(raw);legacy.version=5;legacy.career.version=5;
 for(const p of legacy.career.teams[0].players){delete p.leadership;delete p.composure;delete p.tacticalAwareness;delete p.preferredPosition;delete p.wage;}
 delete legacy.career.teams[0].club;const migrated=E.decode(JSON.stringify(legacy));assert.equal(migrated.teams[0].club.balance,500000);assert.ok(migrated.teams[0].players[0].leadership);assert.equal(JSON.parse(E.encode(migrated)).version,8);
 for(const f of migrated.fixtures){f.result='completed';f.winner=migrated.team;f.innings=[];}migrated.champion=migrated.team;const balance=migrated.teams[0].club.balance;E.nextSeason(migrated);assert.equal(migrated.season,2);assert.equal(migrated.history[0].clubAccounts.season,1);assert.notEqual(migrated.teams[0].club.balance,balance);assert.equal(migrated.teams[0].club.financeHistory[0].type,'Season accounts');
});
