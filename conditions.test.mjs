import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';

test('previews deterministic weather and lets the home club prepare a pitch',()=>{
 const s=E.createCareer(0,98,'FC'),f=s.fixtures[0];
 const preview=E.matchConditions(s,f,'Green');assert.equal(preview.pitch,'Green');assert.ok(['Clear','Overcast','Hot','Humid','Damp'].includes(preview.weather));assert.ok(['Fast','Standard','Slow'].includes(preview.outfield));
 E.startMatch(s,f,true,'Green');assert.deepEqual(s.active.conditions,preview);
});
test('fatigue and ball wear accrue only on legal deliveries and survive restore',()=>{
 const s=E.createCareer(0,89,'FC');E.startMatch(s,s.fixtures[0]);let guard=0;while(s.active.innings[0].balls<6&&guard++<30)E.step(s);
 const i=s.active.innings.at(-1);assert.equal(i.ball.age,i.balls);assert.ok(Object.values(s.active.players).flat().some(p=>p.fatigue>0));
 const restored=E.decode(E.encode(s));assert.deepEqual(restored.active.conditions,s.active.conditions);assert.deepEqual(restored.active.innings.at(-1).ball,i.ball);assert.ok(Object.values(restored.active.players).flat().some(p=>p.fatigue>0));
});
test('new red ball is available after 80 overs and resets its wear counter',()=>{
 const s=E.createCareer(0,23,'FC');E.startMatch(s,s.fixtures[0]);const i=s.active.innings.at(-1);i.bowl=s.team;i.balls=480;i.ball.age=480;i.overDeliveries=0;
 E.takeNewBall(s);assert.equal(i.ball.age,0);assert.equal(i.ball.changes,1);assert.match(i.pendingNote,/new ball/i);
});
test('match injuries carry into the squad and clear after two appearances',()=>{
 const s=E.createCareer(0,71,'T20'),f=s.fixtures[0],p=s.teams[s.team].players[s.teams[s.team].xi[0]];E.startMatch(s,f);s.active.injuries.push({team:s.team,id:p.id,name:p.name,type:'side strain',matches:2});E.finish(s);E.commit(s);assert.equal(p.injury.matchesRemaining,2);assert.equal(E.decode(E.encode(s)).teams[s.team].players.find(x=>x.id===p.id).injury.matchesRemaining,2);
 while(E.currentRound(s,'empire','T20')===1)E.simulateOtherTeams(s);const next=s.fixtures.find(x=>!x.result&&(x.home===s.team||x.away===s.team));if(next){E.startMatch(s,next);assert.ok(s.active.players.flat().some(x=>x.id===p.id&&x.injury?.matchesRemaining===2));E.finish(s);E.commit(s);assert.equal(p.injury.matchesRemaining,1);while(E.currentRound(s,'empire','T20')===2)E.simulateOtherTeams(s);const second=s.fixtures.find(x=>!x.result&&(x.home===s.team||x.away===s.team));E.startMatch(s,second);E.finish(s);E.commit(s);assert.equal(p.injury,undefined);}
});
