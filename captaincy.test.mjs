import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';

test('heads or tails toss and bat or bowl choice survive save/load',()=>{
 const s=E.createCareer(0,1);E.startMatch(s,s.fixtures[0],true);
 assert.equal(s.active.toss,null);assert.equal(s.active.tossDecision,null);assert.equal(s.active.innings.length,0);
 const restored=E.decode(E.encode(s));assert.equal(restored.active.tossDecision,null);
 const outcome=E.chooseTossCall(restored,'heads');assert.ok(['heads','tails'].includes(restored.active.coinResult));
 if(outcome.won){const beforeChoice=E.decode(E.encode(restored));assert.equal(beforeChoice.active.innings.length,0);E.chooseTossDecision(beforeChoice,'bowl');assert.equal(beforeChoice.active.innings[0].bat,beforeChoice.active.toss===beforeChoice.active.home?beforeChoice.active.away:beforeChoice.active.home);assert.equal(beforeChoice.active.tossDecision,'bowl');E.finish(beforeChoice);E.commit(beforeChoice);assert.equal(beforeChoice.fixtures[0].tossDecision,'bowl');assert.throws(()=>E.chooseTossDecision(beforeChoice,'bat'));}
 else {assert.equal(restored.active.innings.length,1);assert.ok(['bat','bowl'].includes(restored.active.tossDecision));}
});
test('format squads and leadership stay independent and are used in matches',()=>{
 const s=E.createCareer(0,27,'ALL','sydney'),t=s.teams[s.team],t20=[...E.teamXI(s,s.team,'T20')],odi=[...E.teamXI(s,s.team,'ODI')];
 E.moveXI(s,0,1,'ODI');assert.notDeepEqual(E.teamXI(s,s.team,'ODI'),odi);assert.deepEqual(E.teamXI(s,s.team,'T20'),t20);
 const cap=t.players[t20[2]].id,vice=t.players[t20[3]].id;E.setLeadership(s,cap,vice,'T20');
 const odiCap=t.players[odi[2]].id,odiVice=t.players[odi[3]].id;E.setLeadership(s,odiCap,odiVice,'ODI');
 assert.equal(E.formatSquad(s,s.team,'T20').captain,cap);assert.equal(E.formatSquad(s,s.team,'T20').viceCaptain,vice);
 assert.equal(E.formatSquad(s,s.team,'ODI').captain,odiCap);assert.throws(()=>E.setLeadership(s,odiCap,odiCap,'ODI'));
 const f=s.fixtures.find(x=>x.format==='ODI'&&(x.home===s.team||x.away===s.team));E.startMatch(s,f);assert.deepEqual(s.active.lineups[s.team],E.teamXI(s,s.team,'ODI'));E.finish(s);E.commit(s);
 const player=t.players[E.teamXI(s,s.team,'ODI')[0]],form=E.recentForm(s,s.team,player.id,'ODI',5);
 assert.equal(form.length,1);assert.ok(Number.isInteger(form[0].runs));assert.equal(E.recentForm(s,s.team,player.id,'T20',5).length,0);
 const restored=E.decode(E.encode(s));assert.deepEqual(restored.teams[s.team].formatSquads,t.formatSquads);
});
test('selection guidance recommends a balanced format-specific XI and includes recent form',()=>{
 const s=E.createCareer(0,29,'ALL','empire'),xi=E.suggestedXI(s,s.team,'T20');
 assert.equal(xi.length,11);assert.ok(E.validateXI({...s.teams[s.team],xi}));
 for(const i of xi)assert.ok(E.selectionInsight(s,s.team,s.teams[s.team].players[i].id,'T20').recommended);
 const f=s.fixtures.find(x=>x.format==='T20'&&(x.home===s.team||x.away===s.team));E.startMatch(s,f);E.finish(s);E.commit(s);
 const player=s.teams[s.team].players[xi[0]],insight=E.selectionInsight(s,s.team,player.id,'T20');assert.equal(insight.form.matches.length,1);
});
test('v0.9.1 all-format saves gain independent default squads when loaded',()=>{
 const s=E.createCareer(0,31,'ALL','empire');for(const t of s.teams)delete t.formatSquads;const legacy={format:'cricket-empire',version:6,career:{...s,version:6}},restored=E.decode(JSON.stringify(legacy));
 assert.ok(restored.teams.every(t=>['T20','ODI','FC'].every(f=>E.validateXI({...t,xi:t.formatSquads[f].xi}))));
 assert.equal(JSON.parse(E.encode(restored)).version,9);
});
