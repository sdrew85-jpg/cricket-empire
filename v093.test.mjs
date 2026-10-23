import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';

test('field placement presets map to live engine tactics',()=>{
 const s=E.createCareer();
 E.setFieldPreset(s,'Aggressive');assert.equal(s.tactics.fielding,'Attacking');
 E.setFieldPreset(s,'Balanced');assert.equal(s.tactics.fielding,'Balanced');
 E.setFieldPreset(s,'Defensive');assert.equal(s.tactics.fielding,'Defensive');
 assert.throws(()=>E.setFieldPreset(s,'Ultra'));
});

test('chase forecast reports rate, projection and a bounded estimate',()=>{
 const f=E.chaseForecast({target:181,runs:90,balls:60,limit:120,wickets:3,done:false});
 assert.equal(f.runsNeeded,91);assert.equal(f.ballsLeft,60);assert.equal(f.currentRate,9);assert.equal(f.requiredRate,9.1);assert.equal(f.projected,180);assert.ok(f.probability>=1&&f.probability<=99);
 assert.equal(E.chaseForecast({target:9,runs:9,balls:1,limit:120,wickets:0,done:true}),null);
});

test('custom tournaments create selected fixtures, playoffs and persist',()=>{
 const s=E.createCareer(2,101,'T20','sydney',{customTournament:{name:'Harbour Cup',teamIds:[0,2,4,6],rounds:1}});
 assert.equal(s.customTournament.name,'Harbour Cup');assert.deepEqual(new Set(s.fixtures.map(f=>f.home).concat(s.fixtures.map(f=>f.away))),new Set([0,2,4,6]));assert.equal(s.fixtures.length,6);assert.ok(s.fixtures.every(f=>f.competition==='sydney'&&f.format==='T20'));
 const restored=E.decode(E.encode(s));assert.equal(restored.customTournament.name,'Harbour Cup');assert.equal(restored.fixtures.length,6);
 while(s.champion===null){const f=s.fixtures.find(x=>!x.result);E.startMatch(s,f);E.finish(s);E.commit(s);}
 assert.equal(s.fixtures.length,9);assert.equal(E.table(s).length,4);assert.ok(E.table(s).every(t=>t.p===3));
});

test('home and away custom tournament doubles its league schedule',()=>{
 const s=E.createCareer(1,202,'ODI','empire',{customTournament:{name:'',teamIds:[0,1,2,3,4,5],rounds:2}});
 assert.equal(s.fixtures.length,30);assert.equal(new Set(s.fixtures.slice(0,30).map(f=>`${Math.min(f.home,f.away)}-${Math.max(f.home,f.away)}`)).size,15);
});

test('season awards and milestones identify leaders and thresholds',()=>{
 const stats=[{id:'a',name:'A',runs:1000,wickets:3,catches:1,runouts:0},{id:'b',name:'B',runs:200,wickets:50,catches:3,runouts:1}];
 const awards=E.seasonAwards(stats);assert.equal(awards.leadingRunScorer.id,'a');assert.equal(awards.leadingWicketTaker.id,'b');assert.ok(awards.playerOfSeason);
 const s=E.createCareer();s.history=[{stats:[{id:'a',runs:490,wickets:24}]}];
 assert.deepEqual(E.seasonMilestones(s,stats).map(x=>`${x.name}:${x.mark} ${x.kind}`),['A:500 career runs','A:1000 career runs','B:25 career wickets','B:50 career wickets']);
});
