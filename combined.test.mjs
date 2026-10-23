import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';

function resolve(s,f){E.startMatch(s,f);E.finish(s);E.commit(s);}

test('combined domestic career keeps three leagues separate and saves the selected club',()=>{
 const s=E.createCareer(20,731,'T20','combined');
 assert.equal(s.teams.length,24);assert.deepEqual(E.competitionKeys(s),['sydney','empire','franchise']);
 assert.equal(s.teams[s.team].name,'Valley Vipers Franchise');assert.equal(E.careerCompetition(s),'franchise');
 assert.ok(s.teams.every(E.validateXI));assert.ok(s.teams.every(t=>t.players.length===15));assert.equal(s.auction,undefined);
 assert.deepEqual(Object.fromEntries(E.competitionKeys(s).map(k=>[k,s.fixtures.filter(f=>f.competition===k).length])),{sydney:45,empire:15,franchise:28});
 const ai=s.fixtures.find(f=>f.competition==='empire');resolve(s,ai);
 assert.ok(ai.result);assert.equal(s.fixtures.filter(f=>f.competition==='sydney'&&f.result).length,0);assert.equal(s.fixtures.filter(f=>f.competition==='franchise'&&f.result).length,0);
 assert.equal(E.table(s,'empire').reduce((sum,t)=>sum+t.p,0),2);assert.equal(E.table(s,'sydney').reduce((sum,t)=>sum+t.p,0),0);
 const live=s.fixtures.find(f=>f.competition==='sydney');E.startMatch(s,live);for(let n=0;n<9;n++)E.step(s);const midMatch=E.decode(E.encode(s));E.finish(s);E.finish(midMatch);E.commit(s);E.commit(midMatch);assert.deepEqual(midMatch,s);
 s.viewCompetition='empire';const restored=E.decode(E.encode(s));assert.equal(restored.team,20);assert.equal(restored.viewCompetition,'empire');assert.equal(restored.competition,'combined');assert.deepEqual(restored.fixtures,s.fixtures);
});

test('combined domestic format choices create only competitions that offer that format',()=>{
 for(const format of ['T20','ODI','FC']){
  const s=E.createCareer(0,842,format,'combined'),expected=format==='T20'?['sydney','empire','franchise']:['sydney','empire'];
  assert.deepEqual(E.competitionKeys(s),expected,`${format} competition selection`);
  assert.ok(s.fixtures.length>0);assert.ok(s.fixtures.every(f=>expected.includes(f.competition)));
 }
 assert.throws(()=>E.createCareer(16,842,'FC','combined'),/T20 franchises are only included/);
 const all=E.createCareer(0,842,'ALL','combined');
 assert.deepEqual(E.competitionKeys(all),['sydney','empire','franchise']);
 assert.deepEqual(E.careerFormats(all,'franchise'),['T20']);
 assert.ok(all.fixtures.some(f=>f.competition==='franchise'&&f.format==='T20'));
 assert.ok(!all.fixtures.some(f=>f.competition==='franchise'&&f.format==='FC'));
});

test('combined competitions progress independently one match at a time and roll over together',()=>{
 const s=E.createCareer(0,782,'T20','combined');
 for(const competition of E.competitionKeys(s)){
  let guard=0;
  while(!Number.isInteger(s.champions[competition])&&guard++<60){
   const f=s.fixtures.find(x=>x.competition===competition&&!x.result);assert.ok(f);assert.equal(f.round,E.currentRound(s,competition));resolve(s,f);
  }
  assert.ok(Number.isInteger(s.champions[competition]),`${competition} champion should be decided`);
  assert.ok(s.fixtures.filter(f=>f.competition===competition).every(f=>f.result));
 }
 assert.equal(E.seasonComplete(s),true);assert.equal(s.champion,s.champions.sydney);assert.equal(s.fixtures.length,97);assert.ok(Buffer.byteLength(E.encode(s))<2_500_000,'a combined-season save should fit comfortably within browser storage');
 const old=s.fixtures[0];E.nextSeason(s);assert.equal(s.season,2);assert.deepEqual(s.champions,{});assert.equal(s.fixtures.length,88);assert.equal(s.fixtures[0].home,old.away);assert.equal(s.fixtures[0].away,old.home);assert.ok(s.fixtures.every(f=>!f.result));
 const restored=E.decode(E.encode(s));assert.equal(restored.season,2);assert.equal(restored.fixtures.filter(f=>f.competition==='sydney').length,45);assert.equal(restored.fixtures.filter(f=>f.competition==='empire').length,15);assert.equal(restored.fixtures.filter(f=>f.competition==='franchise').length,28);
});
