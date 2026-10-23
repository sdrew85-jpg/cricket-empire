import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';

test('career achievements derive from saved match results and season history',()=>{
 const career=E.createCareer(0,42,'T20','sydney');
 const locked=E.careerAchievements(career);
 assert.equal(locked.find(a=>a.id==='debut').unlocked,false);
 const batting=Array.from({length:11},(_,n)=>({runs:n===0?105:0}));
 const bowling=Array.from({length:11},(_,n)=>({wickets:n===0?5:0}));
 career.fixtures=[1,2,3].map((id)=>({id,home:0,away:1,round:id,result:'Sydney East won',winner:0,stage:id===3?'Final':'League',innings:[{bat:0,bowl:1,runs:150,batting,bowling:Array(11).fill({wickets:0})},{bat:1,bowl:0,runs:100,batting:Array(11).fill({runs:0}),bowling}]}));
 const earned=E.careerAchievements(career);
 assert.equal(earned.find(a=>a.id==='debut').unlocked,true);
 assert.equal(earned.find(a=>a.id==='first-win').unlocked,true);
 assert.equal(earned.find(a=>a.id==='winning-run').unlocked,true);
 assert.equal(earned.find(a=>a.id==='century').unlocked,true);
 assert.equal(earned.find(a=>a.id==='five-for').unlocked,true);
 assert.equal(earned.find(a=>a.id==='finalist').unlocked,true);
 career.history=[{season:1,champion:0,fixtures:[]},{season:2,champion:null,fixtures:[]},{season:3,champion:null,fixtures:[]}];
 const dynasty=E.careerAchievements(career);
 assert.equal(dynasty.find(a=>a.id==='champion').unlocked,true);
 assert.equal(dynasty.find(a=>a.id==='dynasty').unlocked,true);
});

test('achievement progress never exceeds its target',()=>{
 const career=E.createCareer(0,42,'T20','sydney');
 career.fixtures=Array.from({length:12},(_,id)=>({id,home:0,away:1,result:'win',winner:0,round:id+1,innings:[]}));
 const wins=E.careerAchievements(career).find(a=>a.id==='ten-wins');
 assert.equal(wins.total,12);
 assert.equal(wins.progress,10);
 assert.equal(wins.unlocked,true);
});
