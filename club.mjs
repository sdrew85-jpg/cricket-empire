const STAFF_ROLES=['Assistant coach','Batting coach','Bowling coach','Fielding coach','Fitness coach','Physio'];
const STAFF_NAMES=['Morgan','Taylor','Jordan','Casey','Avery','Riley','Jamie','Cameron','Drew','Robin','Hayden','Bailey'];
export const FACILITIES=['Training centre','Home ground','Medical centre'];
const cap=(n,min=1,max=5)=>Math.max(min,Math.min(max,n));
function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function leadershipFor(p){const h=hash(p.id);return {leadership:p.leadership??(45+h%51),composure:p.composure??(45+(h>>>7)%51),tacticalAwareness:p.tacticalAwareness??(40+(h>>>13)%56)};}
export function captaincyScore(p){const s=leadershipFor(p);return Math.round(s.leadership*.45+s.composure*.25+s.tacticalAwareness*.3);}
export function initializeClub(team,seed=1){
 for(const [i,p] of team.players.entries()){
  Object.assign(p,leadershipFor(p));p.fatigue??=0;p.preferredPosition??=(p.role==='Keeper'?6:p.role==='Bowler'?8+((i-7+10)%4):i+1);p.preferredPosition=cap(p.preferredPosition,1,11);
  p.wage??=Math.round((6000+(p.bat+p.bowl+p.field)*38)*(p.age<=21?.75:1));
 }
 team.club??={reputation:35,balance:500000,facilities:{training:1,ground:1,medical:1},staff:{},financeHistory:[]};
 const c=team.club;c.reputation??=35;c.boardConfidence??=55;c.balance??=500000;c.facilities??={training:1,ground:1,medical:1};for(const f of ['training','ground','medical'])c.facilities[f]=cap(c.facilities[f]||1);
 c.financeHistory??=[];c.staff??={};
 for(const [n,role] of STAFF_ROLES.entries())c.staff[role]??={name:`${STAFF_NAMES[(team.id*3+n+hash(seed)%12)%STAFF_NAMES.length]} ${role}`,role,rating:60+(hash(`${seed}:${team.id}:${role}`)%31),annualWage:0};
 for(const s of Object.values(c.staff))s.annualWage??=Math.round(s.rating*230);
 return c;
}
export function clubFor(s,teamId=s.team){return initializeClub(s.teams[teamId],s.seed);}
export const STAFF_ROLES_LIST=STAFF_ROLES;
const facilityKey={'Training centre':'training','Home ground':'ground','Medical centre':'medical'};
export function facilityUpgradeCost(level){return level*180000;}
function unlocked(s){if(s.active)throw Error('Finish the current match before changing club plans.');if(s.competition==='world')throw Error('International teams do not manage club finances or facilities.');}
export function upgradeFacility(s,name){unlocked(s);const c=clubFor(s),key=facilityKey[name];if(!key)throw Error('Choose a club facility.');const level=c.facilities[key];if(level>=5)throw Error(`${name} is already at its highest level.`);const cost=facilityUpgradeCost(level);if(c.balance<cost)throw Error(`The upgrade costs $${cost.toLocaleString()}; the club has $${c.balance.toLocaleString()}.`);c.balance-=cost;c.facilities[key]++;c.financeHistory.unshift({season:s.season,type:'Facility upgrade',detail:name,amount:-cost,balance:c.balance});}
export function improveStaff(s,role){unlocked(s);const c=clubFor(s),person=c.staff[role];if(!person)throw Error('Choose a staff role.');if(person.rating>=95)throw Error('This coach is already at the top rating.');const cost=(person.rating-49)*9000;if(c.balance<cost)throw Error(`The new appointment costs $${cost.toLocaleString()}; the club has $${c.balance.toLocaleString()}.`);const old=person.rating;person.rating=Math.min(95,person.rating+5);person.annualWage=Math.round(person.rating*230);person.name=`${STAFF_NAMES[hash(`${s.seed}:${s.season}:${role}:${person.rating}`)%STAFF_NAMES.length]} ${role}`;c.balance-=cost;c.financeHistory.unshift({season:s.season,type:'Staff appointment',detail:`${role} ${old} → ${person.rating}`,amount:-cost,balance:c.balance});}
export function setPreferredPosition(s,playerId,position){unlocked(s);if(!Number.isInteger(position)||position<1||position>11)throw Error('Choose a batting position from 1 to 11.');const p=s.teams[s.team].players.find(x=>x.id===playerId);if(!p)throw Error('Choose a player from your squad.');p.preferredPosition=position;}
function salaries(t){return {players:t.players.reduce((n,p)=>n+(p.wage||Math.round((6000+(p.bat+p.bowl+p.field)*38)),0),0),staff:Object.values(t.club.staff).reduce((n,p)=>n+p.annualWage,0)};}
export function settleClubSeason(s,summary,tableRows){if(s.competition==='world')return null;const c=clubFor(s),t=s.teams[s.team],comp=t.competition||s.competition,played=s.fixtures.filter(f=>f.result&&(f.competition||s.competition)===comp),wins=played.filter(f=>f.winner===s.team).length,rank=Math.max(1,(tableRows||[]).findIndex(r=>r.id===s.team)+1),champion=summary.champion===s.team||summary.champion?.[comp]===s.team||summary.champion?.[`${comp}:${s.format}`]===s.team||Object.entries(summary.champion||{}).some(([key,id])=>key.startsWith(`${comp}:`)&&id===s.team),salary=salaries(t),sponsor=Math.round(300000*(.8+c.reputation/100)),gate=played.length*(4500+c.facilities.ground*1800),prize=(champion?250000:0)+Math.max(0,8-rank)*18000+wins*9000,facilityCost=(c.facilities.training+c.facilities.ground+c.facilities.medical)*9000,totalIncome=sponsor+gate+prize,totalCosts=salary.players+salary.staff+facilityCost,net=totalIncome-totalCosts;c.balance+=net;c.reputation=cap(c.reputation+(champion?5:wins>=Math.ceil(played.length/2)?2:-1),1,100);const report={season:s.season,rank,wins,played:played.length,sponsor,gate,prize,playerWages:salary.players,staffWages:salary.staff,facilityUpkeep:facilityCost,net,balance:c.balance};c.financeHistory.unshift({season:s.season,type:'Season accounts',detail:`${wins} wins · ${rank===1?'1st':`${rank}th`} place`,amount:net,balance:c.balance,report});c.financeHistory=c.financeHistory.slice(0,30);summary.clubAccounts=report;return report;}
export function coachTrainingBonus(team,focus){const role={bat:'Batting coach',bowl:'Bowling coach',field:'Fielding coach'}[focus],rating=team.club?.staff?.[role]?.rating||60;return rating>=88?2:rating>=72?1:0;}
export function physioRecovery(team){const rating=team.club?.staff?.Physio?.rating||60;return (rating>=85?2:rating>=70?1:0)+Math.floor(((team.club?.facilities?.medical||1)-1)/2);}
