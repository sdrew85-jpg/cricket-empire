import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';

test('all-formats careers schedule independent T20, ODI and first-class seasons',()=>{
 for(const competition of ['world','sydney','empire']){
  const s=E.createCareer(0,19,'ALL',competition);
  assert.equal(s.formatMode,'ALL');
  assert.deepEqual([...new Set(s.fixtures.map(f=>f.format))],['T20','ODI','FC']);
  assert.equal(E.currentRound(s,competition,'ODI'),1);
  assert.ok(E.table(s,competition,'FC').every(t=>t.p===0));
  s.viewFormat='ODI';s.format='ODI';const f=s.fixtures.find(x=>x.format==='ODI'&&(x.home===s.team||x.away===s.team));
  E.startMatch(s,f);for(let n=0;n<40&&!s.active.result;n++)E.step(s);
  const resumed=E.decode(E.encode(s));assert.equal(resumed.active.format,'ODI');assert.equal(resumed.formatMode,'ALL');
  E.finish(s);E.finish(resumed);E.commit(s);E.commit(resumed);assert.deepEqual(resumed,s);
  assert.equal(E.table(s,competition,'ODI').find(t=>t.id===s.team).p,1);
  assert.equal(E.table(s,competition,'T20').reduce((n,t)=>n+t.p,0),0);
  if(competition==='world'){
   assert.equal(E.worldRankings(s,'ODI').reduce((n,r)=>n+r.played,0),2);
   assert.equal(E.worldRankings(s,'T20').reduce((n,r)=>n+r.played,0),0);
  }
 }
});

test('combined domestic careers keep franchises T20-only while other leagues include all formats',()=>{
 const s=E.createCareer(0,77,'ALL','combined');
 assert.equal(s.fixtures.filter(f=>f.competition==='franchise'&&f.format==='T20').length,28);
 assert.equal(s.fixtures.filter(f=>f.competition==='franchise'&&f.format!=='T20').length,0);
 assert.equal(s.fixtures.filter(f=>f.competition==='sydney'&&f.format==='ODI').length,45);
 assert.equal(s.fixtures.filter(f=>f.competition==='empire'&&f.format==='FC').length,15);
 s.viewFormat='ODI';s.format='ODI';assert.equal(E.decode(E.encode(s)).fixtures.length,s.fixtures.length);
 const f=s.fixtures.find(x=>x.competition==='sydney'&&x.format==='ODI'&&(x.home===s.team||x.away===s.team));E.startMatch(s,f);for(let n=0;n<10;n++)E.step(s);assert.equal(E.decode(E.encode(s)).active.format,'ODI');
});

test('all three format finals complete before domestic season rollover',()=>{
 const s=E.createCareer(0,121,'ALL','empire');
 while(!E.seasonComplete(s)){
  const f=s.fixtures.find(x=>!x.result);assert.ok(f,'expected another fixture before season completion');
  E.startMatch(s,f);E.finish(s);E.commit(s);
 }
 assert.deepEqual(Object.keys(s.champions).sort(),['empire:FC','empire:ODI','empire:T20']);
 assert.ok(Object.values(s.champions).every(Number.isInteger));
 assert.equal(s.fixtures.filter(f=>f.stage==='Final').length,3);
 const odiRuns=E.leaders(s,'ODI').reduce((n,p)=>n+p.runs,0);E.nextSeason(s);assert.equal(s.season,2);assert.equal(s.fixtures.length,45);
 assert.equal(s.history[0].formatTables.length,3);assert.ok(s.history[0].formatStats.ODI);assert.equal(E.careerLeaders(s,'ODI').reduce((n,p)=>n+p.runs,0),odiRuns);
 assert.equal(s.formatMode,'ALL');assert.equal(E.decode(E.encode(s)).fixtures.length,45);
});

test('combined all-format season crowns each format available in each competition',()=>{
 const s=E.createCareer(0,808,'ALL','combined');let played=0;
 while(!E.seasonComplete(s)){const f=s.fixtures.find(x=>!x.result);assert.ok(f);E.startMatch(s,f);E.finish(s);E.commit(s);played++;}
 assert.equal(played,229);assert.deepEqual(Object.keys(s.champions).sort(),['empire:FC','empire:ODI','empire:T20','franchise:T20','sydney:FC','sydney:ODI','sydney:T20']);
 E.nextSeason(s);assert.equal(s.fixtures.length,208);assert.equal(s.history[0].formatTables.length,7);assert.deepEqual(E.decode(E.encode(s)),s);
});


test('calendar careers move through formats in date order without a format picker',()=>{
 const s=E.createCareer(0,421,'CALENDAR','empire');
 assert.equal(s.calendarMode,true);assert.equal(s.formatMode,'ALL');
 assert.deepEqual([...new Set(s.fixtures.map(f=>f.format))],['T20','ODI','FC']);
 assert.ok(s.fixtures.find(f=>f.calendarRound===2).id>s.fixtures.filter(f=>f.calendarRound===1).at(-1).id);
 assert.deepEqual([...new Set(s.fixtures.filter(f=>f.calendarRound===1).map(f=>f.format))],['T20']);
 assert.equal(E.nextCalendarFixture(s).format,'T20');assert.equal(E.currentRound(s,'empire'),1);
 assert.throws(()=>E.startMatch(s,s.fixtures.find(f=>f.calendarRound===2)),/earlier calendar matchday/);
 const dayOne=s.fixtures.filter(f=>f.calendarRound===1);
 for(const f of dayOne){E.startMatch(s,f);E.finish(s);E.commit(s);}
 assert.equal(E.currentRound(s,'empire'),2);assert.equal(E.nextCalendarFixture(s).format,'ODI');assert.equal(s.format,'ODI');
 const saved=E.decode(E.encode(s));assert.equal(saved.calendarMode,true);assert.deepEqual(saved,s);
});
