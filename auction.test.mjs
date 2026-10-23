import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';

test('franchise careers start with an empty squad, 100-credit purse and 120 auction lots',()=>{
 const s=E.createCareer(0,77,'T20','franchise');
 assert.equal(s.phase,'Pre-season');assert.equal(s.teams.length,8);assert.ok(s.teams.every(t=>t.players.length===0));assert.equal(s.auction.purse,100);assert.deepEqual(s.auction.budgets,Array(8).fill(100));assert.equal(s.auction.remaining.length,120);assert.equal(s.fixtures.length,28);assert.throws(()=>E.createCareer(0,77,'ODI','franchise'));
});

test('manager bids are purse-limited, rivals bid, and the completed auction fills valid squads',()=>{
 const s=E.createCareer(3,9,'T20','franchise');
 assert.throws(()=>E.beginSeason(s),/Complete the franchise auction/);
 assert.equal(E.auctionBidLimit(s),52);s.auction.budgets[s.team]=52;assert.equal(E.auctionBidLimit(s),4);assert.throws(()=>E.bidAtAuction(s,5),/reserving funds/);s.auction.budgets[s.team]=100;
 const first=s.auction.current.playerId;E.bidAtAuction(s,5);assert.equal(s.auction.current.playerId,first);assert.equal(s.auction.current.round,2);assert.equal(s.auction.sold.length,0);assert.equal(s.auction.remaining.length,120);
 E.bidAtAuction(s,5);assert.equal(s.auction.current.round,3);assert.equal(s.auction.sold.length,0);E.bidAtAuction(s,5);
 assert.equal(s.auction.sold.length,1);assert.equal(s.auction.remaining.length,119);assert.ok(s.auction.sold[0].price>=1);
 E.simulateAuction(s);assert.equal(s.auction.complete,true);assert.equal(s.auction.remaining.length,0);assert.equal(s.auction.sold.length,120);
 assert.ok(s.teams.every(t=>t.players.length===15&&E.validateXI(t)));assert.ok(s.auction.budgets.every(n=>n>=0));assert.equal(s.freeAgents.length,0);
 E.beginSeason(s);assert.equal(s.phase,'Season');const restored=E.decode(E.encode(s));assert.equal(restored.competition,'franchise');assert.equal(restored.auction.complete,true);assert.ok(restored.teams.every(t=>t.players.length===15&&E.validateXI(t)));
});

test('partial auction state and franchise purchases persist through save/load',()=>{
 const s=E.createCareer(2,52,'T20','franchise');E.bidAtAuction(s,3);const restored=E.decode(E.encode(s));assert.equal(restored.auction.remaining.length,120);assert.equal(restored.auction.sold.length,0);assert.equal(restored.auction.current.round,2);assert.ok(restored.auction.current.history.some(x=>x.team===2));assert.ok(restored.auction.current.highestBid>=3);assert.equal(restored.teams.flatMap(t=>t.players).length,0);assert.deepEqual(restored.auction, s.auction);
});

test('v0.7 franchise saves migrate to the three-round auction state',()=>{
 const s=E.createCareer(1,53,'T20','franchise');E.bidAtAuction(s,0);delete s.auction.current;const restored=E.decode(E.encode(s));assert.equal(restored.auction.current.round,1);assert.equal(restored.auction.current.highestBid,0);assert.equal(restored.auction.current.playerId,restored.auction.remaining[0]);
});

test('AI bidding weighs player potential and role needs',()=>{
 const run=potential=>{const s=E.createCareer(0,99,'T20','franchise'),lot=s.freeAgents.find(p=>p.id===s.auction.current.playerId),ai=s.teams[1],moved=[];lot.potential.bat=potential;for(const [role,count] of [['Batter',4],['Keeper',1],['All-rounder',2],['Bowler',5]])moved.push(...s.freeAgents.filter(p=>p.id!==lot.id&&!moved.some(x=>x.id===p.id)&&p.role===role).slice(0,count-moved.filter(p=>p.role===role).length));ai.players.push(...moved);const ids=new Set(moved.map(p=>p.id));s.freeAgents=s.freeAgents.filter(p=>!ids.has(p.id));s.auction.budgets.fill(0);s.auction.budgets[1]=100;E.bidAtAuction(s,0);return s.auction.current.history.some(x=>x.team===1);};
 assert.equal(run(50),false);assert.equal(run(100),true);
});

test('auction reserves four credits for each unfilled starting XI slot',()=>{
 const s=E.createCareer(0,101,'T20','franchise');assert.equal(E.auctionBidLimit(s),52);
 const t=s.teams[0],lot=s.freeAgents.find(p=>p.id===s.auction.current.playerId),picked=[];for(const [role,count] of [['Batter',4],['Keeper',1],['Bowler',5]])picked.push(...s.freeAgents.filter(p=>p.id!==lot.id&&!picked.some(x=>x.id===p.id)&&p.role===role).slice(0,count-picked.filter(p=>p.role===role).length));t.players.push(...picked);
 assert.equal(E.auctionBidLimit(s),92);
});

test('an auction purchase cannot make a valid XI impossible within 15 squad places',()=>{
 const s=E.createCareer(0,102,'T20','franchise'),lot=s.freeAgents.find(p=>p.id===s.auction.current.playerId),t=s.teams[0];
 t.players.push(...s.freeAgents.filter(p=>p.id!==lot.id&&p.role==='Batter').slice(0,14));
 assert.equal(E.auctionPlayerEligible(s,lot.id),false);assert.throws(()=>E.bidAtAuction(s,1),/too few squad places/);
});
