import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';

test('career objectives persist, are evaluated at season close, and affect board confidence',()=>{
 const s=E.createCareer(0,806,'T20','sydney');
 assert.equal(E.careerObjectives(s).length,3);
 const restored=E.decode(E.encode(s));
 assert.deepEqual(E.careerObjectives(restored),E.careerObjectives(s));
 const club=restored.teams[restored.team].club;
 restored.champion=restored.team;
 for(const f of restored.fixtures){f.result='Recorded result';f.winner=restored.team;f.innings=[];}
 E.nextSeason(restored);
 assert.equal(restored.history[0].boardReview.approved,true);
 assert.ok(restored.teams[restored.team].club.boardConfidence>55);
});

test('AI picks a role-balanced, form-aware XI and match confidence follows recent results',()=>{
 const s=E.createCareer(0,807,'T20','empire'),first=s.fixtures.find(f=>f.home===s.team||f.away===s.team),opponent=first.home===s.team?first.away:first.home;
 const opener=s.teams[s.team].players[s.teams[s.team].xi[0]],teamId=s.team;opener.fatigue=40;
 E.startMatch(s,first);
 assert.deepEqual(s.active.lineups[opponent],E.suggestedXI(s,opponent,'T20'));
 assert.equal(s.active.players[teamId].find(p=>p.id===opener.id).fatigue,40);
 E.finish(s);E.commit(s);
 const restedFatigue=opener.fatigue;assert.ok(restedFatigue>=0&&restedFatigue<=100);
 while(E.currentRound(s)===1){const f=s.fixtures.find(f=>!f.result&&f.round===1);E.startMatch(s,f);E.finish(s);E.commit(s);}
 const second=s.fixtures.find(f=>!f.result&&(f.home===teamId||f.away===teamId));
 E.startMatch(s,second);
 const matchPlayer=s.active.players[teamId].find(p=>p.id===opener.id);
 assert.equal(matchPlayer.confidence,E.playerConfidence(s,teamId,opener.id,'T20'));
 assert.equal(matchPlayer.fatigue,restedFatigue);
 assert.notEqual(matchPlayer.confidence,50);
});

test('season rollover retires veteran players and introduces same-role prospects',()=>{
 const s=E.createCareer(0,808,'T20','sydney'),team=s.teams[s.team],veteran=team.players[0],oldId=veteran.id,oldRole=veteran.role;
 veteran.age=37;s.champion=s.team;
 for(const f of s.fixtures){f.result='Recorded result';f.winner=s.team;f.innings=[];}
 E.nextSeason(s);
 const prospect=team.players[0];
 assert.equal(prospect.role,oldRole);assert.notEqual(prospect.id,oldId);assert.ok(prospect.age<=21);
 assert.ok(s.history[0].retirements.some(r=>r.name===veteran.name&&r.replacement===prospect.name));
 assert.deepEqual(E.decode(E.encode(s)),s);
});

test('contract wage offers meet player expectations and rejected offers change nothing',()=>{
 const s=E.createCareer(0,809,'T20','empire'),team=s.teams[s.team],p=team.players[team.xi[0]],demand=E.contractDemand(p,team),before={...p.contract},minimum=Math.round(demand.wage*.9);
 assert.throws(()=>E.renewContract(s,p.id,demand.term,minimum-1),/rejected the offer/);
 assert.deepEqual(p.contract,before);
 E.renewContract(s,p.id,demand.term,minimum);
 assert.equal(p.wage,minimum);assert.ok(p.contract.expires>=s.season+demand.term);
});
