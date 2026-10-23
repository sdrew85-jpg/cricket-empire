import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';
import {legacyCountrySkillModifiers,legacyCountryStartingRating} from './country-ratings.mjs';

test('generated squads specialize ratings by cricket role while keeping club strength close',()=>{
 const s=E.createCareer(0,690,'T20','sydney');
 const players=s.teams.flatMap(t=>t.players);
 const avg=(role,key)=>players.filter(p=>p.role===role).reduce((n,p)=>n+p[key],0)/players.filter(p=>p.role===role).length;
 assert.ok(avg('Batter','bat')-avg('Batter','bowl')>30);
 assert.ok(avg('Bowler','bowl')-avg('Bowler','bat')>30);
 assert.ok(avg('Keeper','field')-avg('Keeper','bowl')>50);
 assert.ok(Math.abs(avg('All-rounder','bat')-avg('All-rounder','bowl'))<15);
 const xi=s.teams.map(t=>t.players.slice(0,11).reduce((n,p)=>n+p.bat+p.bowl+p.field,0)/33);
 assert.ok(Math.max(...xi)-Math.min(...xi)<12);
});

test('fictional international squads and starting rankings reflect country strength',()=>{
 const s=E.createCareer(0,690,'T20','world'),india=s.teams.find(t=>t.name==='India'),usa=s.teams.find(t=>t.name==='United States');
 for(const key of ['bat','bowl','field'])assert.ok(E.teamRatings(india)[key]>E.teamRatings(usa)[key],`${key} country calibration`);
 assert.ok(india.players.reduce((n,p)=>n+p.bat,0)>usa.players.reduce((n,p)=>n+p.bat,0));
 assert.ok(E.worldRankings(s,'T20').findIndex(r=>r.name==='India')<E.worldRankings(s,'T20').findIndex(r=>r.name==='United States'));
 assert.equal(india.players.some(p=>/^(Rohit|Virat|Jasprit|Steve|Joe) /.test(p.name)),false);
});

test('team ratings summarize the best batting and bowling options, with fielding across the XI',()=>{
 const s=E.createCareer(0,42,'T20','world'),team=s.teams.find(t=>t.name==='Australia'),players=team.xi.map(i=>team.players[i]);
 const expected=(key,count)=>Math.round(players.map(p=>p[key]).sort((a,b)=>b-a).slice(0,count).reduce((sum,value)=>sum+value,0)/count);
 assert.deepEqual(E.teamRatings(team),{bat:expected('bat',7),bowl:expected('bowl',5),field:expected('field',11),available:true});
 assert.ok(E.teamRatings(team).bat>Math.round(players.reduce((sum,p)=>sum+p.bat,0)/players.length));
 assert.ok(E.teamRatings(team).bowl>Math.round(players.reduce((sum,p)=>sum+p.bowl,0)/players.length));
});


test('international strength and starting order follow current format-specific ICC team rankings',()=>{
 const expected={T20:['England','India','Australia','New Zealand','South Africa'],ODI:['India','New Zealand','South Africa','Pakistan','Australia'],FC:['Australia','South Africa','New Zealand','India','England']};
 for(const format of Object.keys(expected)){const career=E.createCareer(0,690,format,'world');assert.deepEqual(E.worldRankings(career,format).slice(0,5).map(team=>team.name),expected[format]);}
 assert.equal(E.countryRanking('England','T20'),1);assert.equal(E.countryRating('England','T20'),269);
 assert.equal(E.countryRanking('India','ODI'),1);assert.equal(E.countryRating('Pakistan','ODI'),103);assert.equal(E.countryRating('Australia','FC'),126);
 assert.equal(E.countryRanking('Scotland','T20'),17);assert.equal(E.countryRanking('Nepal','ODI'),17);assert.equal(E.countryRanking('United Arab Emirates','ODI'),19);
 const t20=E.createCareer(0,691,'T20','world'),india=t20.teams.find(t=>t.name==='India'),usa=t20.teams.find(t=>t.name==='United States');
 for(const key of ['bat','bowl','field'])assert.ok(E.teamRatings(india)[key]>E.teamRatings(usa)[key]);
 assert.ok(india.players.reduce((n,p)=>n+p.bat,0)>usa.players.reduce((n,p)=>n+p.bat,0));
});

test('existing international saves upgrade country-calibrated players and ICC starting ratings once',()=>{
 const current=E.createCareer(0,692,'T20','world'),legacy=structuredClone(current);legacy.countryRatingsModel=1;
 for(const team of legacy.teams){const old=legacyCountrySkillModifiers(team.name),now=E.countrySkillModifiers(team.name,'T20');for(const player of team.players)for(const key of ['bat','bowl','field']){const delta=old[key]-now[key];player[key]=Math.max(8,Math.min(95,player[key]+delta));player.potential[key]=Math.max(player[key],Math.min(100,player.potential[key]+delta));}}
 for(const format of Object.keys(E.FORMATS)){const rows=legacy.world.ratings[format],oldStarts=legacy.teams.map(t=>legacyCountryStartingRating(t.name,format)),mean=oldStarts.reduce((a,b)=>a+b,0)/oldStarts.length;rows.forEach((row,id)=>row.rating=oldStarts[id]-mean+1000);}
 const loaded=E.decode(JSON.stringify({format:'cricket-empire',version:8,career:legacy}));
 assert.equal(loaded.countryRatingsModel,2);assert.deepEqual(loaded.teams.map(t=>t.players.map(p=>[p.bat,p.bowl,p.field])),current.teams.map(t=>t.players.map(p=>[p.bat,p.bowl,p.field])));
 assert.deepEqual(E.worldRankings(loaded,'T20').map(t=>t.name),E.worldRankings(current,'T20').map(t=>t.name));
 const twice=E.decode(E.encode(loaded));assert.deepEqual(twice.teams.map(t=>t.players.map(p=>[p.bat,p.bowl,p.field])),loaded.teams.map(t=>t.players.map(p=>[p.bat,p.bowl,p.field])));
});

test('legacy roster alignment runs once and leaves completed scorecards unchanged',()=>{
 const s=E.createCareer(0,691,'T20','sydney');E.startMatch(s,s.fixtures[0]);E.finish(s);E.commit(s);
 const scorecard=structuredClone(s.fixtures[0].innings);delete s.ratingsModel;
 for(const t of s.teams)for(const p of t.players){if(p.role==='Batter')p.bowl=95;if(p.role==='Bowler')p.bat=95;p.potential={bat:100,bowl:100,field:100};}
 const raw=JSON.stringify({format:'cricket-empire',version:4,career:s}),migrated=E.decode(raw);
 assert.equal(migrated.ratingsModel,2);assert.deepEqual(migrated.fixtures[0].innings,scorecard);
 assert.ok(migrated.teams.every(t=>t.players.filter(p=>p.role==='Batter').every(p=>p.bowl<=55)));
 assert.ok(migrated.teams.every(t=>t.players.filter(p=>p.role==='Bowler').every(p=>p.bat<=55&&p.bowl>=60)));
 const stable=E.decode(E.encode(migrated));
 assert.deepEqual(stable.teams.map(t=>t.players.map(p=>[p.bat,p.bowl,p.field])),migrated.teams.map(t=>t.players.map(p=>[p.bat,p.bowl,p.field])));
});
