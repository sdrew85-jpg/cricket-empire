// These are the fictional Empire competition rules, independent of UI and saves.
export const FORMATS = {
  T20: {name:'T20',title:'Empire T20 League',overs:20,bowlerOvers:4,inningsPerTeam:1,description:'20 overs per side. Four overs per bowler. Fast decisions, immediate pressure.'},
  ODI: {name:'ODI',title:'Empire One-Day League',overs:50,bowlerOvers:10,inningsPerTeam:1,description:'50 overs per side. Ten overs per bowler. Build an innings, then accelerate.'},
  FC: {name:'First-class',title:'Empire First-Class Championship',overs:null,bowlerOvers:null,inningsPerTeam:2,days:4,dayOvers:90,description:'Two innings per side across four days. Declarations, aggregate leads and draws.'},
};
export const formatOf = s => FORMATS[s.format || 'T20'];
export const matchBalls = m => m.innings.reduce((total,i)=>total+i.balls,0);
export const totalFor = (m,team) => m.innings.filter(i=>i.bat===team).reduce((total,i)=>total+i.runs,0);
export const regulationInnings = (s,f) => (f.format||s.format)==='FC'?f.innings:f.innings.slice(0,2);
export function sessionOf(m){const balls=matchBalls(m);return {day:Math.min(4,Math.floor(balls/540)+1),session:Math.min(3,Math.floor((balls%540)/180)+1),remaining:Math.max(0,2160-balls)};}
export function competitionRules(s){return s.format==='FC'?'Four days of 90 overs; two innings each. Win 16 points, tie 8, draw 5. Rank by points, wins, then run quotient. A drawn or tied knockout advances the higher league seed. No follow-on in this competition.':'2 points for a win, 1 for a league tie. All-out innings use the full innings quota for NRR. Tied knockouts use repeated Super Overs.';}
