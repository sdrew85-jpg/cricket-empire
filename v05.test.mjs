import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';
test('world ratings update once at commit, persist and stay independent by format',()=>{
 const s=E.createCareer(0,52,'T20','world');assert.equal(E.worldRankings(s).length,18);assert.ok(s.teams.every(t=>['bat','bowl','field'].every(k=>Number.isInteger(E.teamRatings(t)[k]))));
 E.startMatch(s,s.fixtures[0]);E.finish(s);assert.ok(E.worldRankings(s).every(r=>r.played===0));E.commit(s);E.commit(s);
 const rows=E.worldRankings(s);assert.equal(rows.reduce((n,r)=>n+r.played,0),2);assert.ok(Math.abs(rows.reduce((n,r)=>n+r.rating,0)-18000)<.000001);
 const odi=E.worldRankings(s,'ODI');assert.ok(odi.every(r=>r.played===0));assert.ok(odi[0].rating>odi.at(-1).rating);assert.ok(Math.abs(odi.reduce((n,r)=>n+r.rating,0)-18000)<.000001);assert.deepEqual(E.decode(E.encode(s)),s);
});
test('legacy ten-team international saves expand safely at next season',()=>{
 const s=E.createCareer(0,991,'T20','world');s.teams=s.teams.slice(0,10);s.fixtures=[];s.champion=0;for(const format of Object.keys(E.FORMATS))s.world.ratings[format]=s.world.ratings[format].slice(0,10);
 const restored=E.decode(E.encode(s));assert.equal(restored.teams.length,10);E.nextSeason(restored);
 assert.equal(restored.teams.length,18);assert.equal(restored.fixtures.length,153);assert.ok(restored.teams.slice(10).every(t=>t.players.length===15));
 assert.ok(Object.keys(E.FORMATS).every(format=>restored.world.ratings[format].length===18));assert.deepEqual(E.decode(E.encode(restored)),restored);
});
test('every domestic and international team exposes usable batting, bowling and fielding ratings',()=>{
 for(const [competition,format] of [['sydney','T20'],['empire','T20'],['combined','ALL'],['franchise','T20'],['world','T20']]){
  const s=E.createCareer(0,1304,format,competition);
  for(const team of s.teams){const rating=E.teamRatings(team);for(const key of ['bat','bowl','field'])assert.ok(Number.isInteger(rating[key])&&rating[key]>=0&&rating[key]<=100,`${competition} ${team.name} ${key}`);}
 }
});
test('international multi-season careers preserve players and rankings in all formats',()=>{
 for(const format of ['T20','ODI','FC']){const s=E.createCareer(0,71,format,'world'),ids=s.teams.flatMap(t=>t.players.map(p=>p.id));
 while(s.champion===null){E.startMatch(s,s.fixtures.find(f=>!f.result));E.finish(s);E.commit(s);}
 const rankings=E.worldRankings(s);E.nextSeason(s);assert.equal(s.phase,'Season');assert.equal(s.history.length,1);assert.deepEqual(E.worldRankings(s),rankings);assert.deepEqual(s.teams.flatMap(t=>t.players.map(p=>p.id)),ids);assert.deepEqual(E.decode(E.encode(s)),s);
 }
});
test('XI swapping protects balance, supports reordering and locks during matches',()=>{
 const s=E.createCareer();E.swapXI(s,10,14);assert.equal(s.teams[0].xi[10],14);assert.throws(()=>E.swapXI(s,4,11));
 E.moveXI(s,0,1);assert.equal(s.teams[0].xi[1],0);assert.ok(E.validateXI(s.teams[0]));
 E.startMatch(s,s.fixtures[0]);assert.throws(()=>E.swapXI(s,0,11));assert.throws(()=>E.moveXI(s,0,1));
});
test('opponents adapt at death and under chase pressure while own tactics persist',()=>{
 const s=E.createCareer();E.startMatch(s,s.fixtures[0]);const i=E.innings(5,0);i.balls=100;i.target=180;i.runs=80;
 assert.equal(E.effectiveTactics(s,i).batting,'Aggressive');E.setTactic(s,'bowling','Attack');assert.equal(E.effectiveTactics(s,i).bowling,'Attack');
});
test('scoring distributions stay within broad gameplay ranges across 100 fixtures per format',()=>{
 for(const [format,min,max] of [['T20',95,190],['ODI',170,310],['FC',130,400]]){
 let total=0;for(let seed=1;seed<=100;seed++){const s=E.createCareer(0,seed,format);E.startMatch(s,s.fixtures[0]);E.finish(s);total+=s.active.innings[0].runs;}
 const avg=total/100;assert.ok(avg>min&&avg<max,`${format}: ${avg}`);
 }
});
