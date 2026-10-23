export const MIN_SQUAD=12, MAX_SQUAD=20;
const roles=['Batter','Batter','Keeper','All-rounder','Bowler','Bowler'];
const first=['Alex','Ben','Chris','Dylan','Emir','Felix','Gabriel','Henry','Ishan','Joel','Kieran','Lucas','Mason','Nate','Omar','Perry','Quinn','Rohan','Stefan','Tariq'];
const last=['Avery','Brooks','Clarke','Desai','Evans','Foster','Green','Hart','Imran','James','Kumar','Lewis','Murray','Nash','Owen','Price','Rao','Silva','Turner','West'];
function random(s){s.marketSeed=(Math.imul(s.marketSeed,1664525)+1013904223)>>>0;return s.marketSeed/4294967296;}
function agentSkill(s,mean,spread){return Math.max(8,Math.min(95,Math.round(mean+(random(s)+random(s)+random(s)-1.5)*spread)));}
export function generateAgent(s,role){const n=s.nextPlayerId++,playerRole=role||roles[n%6],profiles={Batter:[74,34,70],Keeper:[66,15,82],'All-rounder':[65,66,74],Bowler:[38,76,68]},[batMean,bowlMean,fieldMean]=profiles[playerRole]||profiles.Batter,bat=agentSkill(s,batMean,10),bowl=agentSkill(s,bowlMean,10),field=agentSkill(s,fieldMean,11);return {id:`recruit-${n}`,name:`${first[n%20]} ${last[Math.floor(n/20)%20]}`,role:playerRole,bat,bowl,field,age:18+n%16,potential:{bat:Math.min(100,bat+10),bowl:Math.min(100,bowl+10),field:Math.min(100,field+10)},contract:null,listed:false};}
export function contractTypeFor(p){return (p.age??24)<=21?'Rookie':'Full';}
export function contractDemand(p,team){const frontline=team?.xi?.some(n=>team.players[n]?.id===p.id)??false,ratings=p.role==='Bowler'?p.bowl:p.role==='All-rounder'?(p.bat+p.bowl)/2:p.bat,potential=p.role==='Bowler'?p.potential?.bowl:p.role==='All-rounder'?Math.max(p.potential?.bat||0,p.potential?.bowl||0):p.potential?.bat,age=p.age??24;let term=1,reason='squad player';if(frontline&&age<=21&&(potential||ratings)>=72){term=2;reason='Rookie pathway player';}else if(age<=29&&ratings>=90){term=3;reason=frontline?'first-choice player':'established player';}else if(frontline&&age<=29&&ratings>=82){term=3;reason='first-choice player';}else if(frontline&&age<=31&&ratings>=72){term=2;reason='regular XI player';}else if(age<=30&&ratings>=80){term=2;reason='established player';}const base=p.wage||Math.round(6000+(p.bat+p.bowl+p.field)*38),wage=Math.round(base*(frontline?1.12:1.04)*(age>32?.92:1));return {term,reason,wage};}
export function makeContract(p,season,term){return {signedSeason:season,expires:season+term-1,type:contractTypeFor(p)};}
export function setupManagement(s){
 s.season??=1;s.history??=[];s.transactions??=[];s.phase??='Season';s.freeAgents??=[];s.nextPlayerId??=1;s.marketSeed??=(s.seed^0xa511e9b3)>>>0;
 for(const t of s.teams)for(const [n,p] of t.players.entries()){p.contract??={expires:s.season+n%3};p.listed??=n>=13;}
 if(!s.marketReady){while(s.freeAgents.length<18)s.freeAgents.push(generateAgent(s));s.marketReady=true;}
 return s;
}
export function isBowler(p){return p.role==='Bowler'||p.role==='All-rounder';}
export function prepareContracts(s){for(const t of s.teams)for(const p of t.players){p.contract??={expires:s.season};p.contract.type??=contractTypeFor(p);p.contract.signedSeason??=Math.min(s.season,p.contract.expires);}return s;}
export function squadIssue(t){if(t.players.length<MIN_SQUAD)return `Recruit at least ${MIN_SQUAD} players (${t.players.length} currently).`;if(!t.players.some(p=>p.role==='Keeper'))return 'Recruit a wicketkeeper.';if(t.players.filter(isBowler).length<5)return 'Keep at least five bowlers or all-rounders.';return null;}
export function chooseXI(t){
 const keeper=t.players.map((p,n)=>({p,n})).filter(x=>x.p.role==='Keeper').sort((a,b)=>b.p.bat-a.p.bat)[0];
 const bowlers=t.players.map((p,n)=>({p,n})).filter(x=>isBowler(x.p)).sort((a,b)=>b.p.bowl-a.p.bowl).slice(0,5);
 if(!keeper||bowlers.length<5||t.players.length<11){t.xi=[];if(t.formatSquads)for(const squad of Object.values(t.formatSquads))squad.xi=[];return;}
 const used=new Set([keeper.n,...bowlers.map(x=>x.n)]),batters=t.players.map((p,n)=>({p,n})).filter(x=>!used.has(x.n)).sort((a,b)=>b.p.bat-a.p.bat).slice(0,5);
 t.xi=[...batters, {p:keeper.p,n:keeper.n}, ...bowlers].sort((a,b)=>(a.p.preferredPosition??12)-(b.p.preferredPosition??12)||b.p.bat-a.p.bat).map(x=>x.n);
 if(t.formatSquads)for(const squad of Object.values(t.formatSquads))squad.xi=[...t.xi];
}
export function validateXI(t){return t.xi?.length===11&&new Set(t.xi).size===11&&t.xi.every(n=>t.players[n])&&t.xi.some(n=>t.players[n].role==='Keeper')&&t.xi.filter(n=>isBowler(t.players[n])).length>=5;}
function unlocked(s){if(s.active)throw Error('Finish the current match before changing contracts or squads.');}
function durationCheck(n){if(!Number.isInteger(n)||n<1||n>3)throw Error('Choose a contract term of one to three seasons.');}
function removalIssue(t,index){const after={players:t.players.filter((_,n)=>n!==index)};return squadIssue(after);}
function remove(t,index){const ids=t.xi.map(n=>t.players[n]?.id),formatIds=Object.fromEntries(Object.entries(t.formatSquads||{}).map(([format,squad])=>[format,squad.xi.map(n=>t.players[n]?.id)]));const [p]=t.players.splice(index,1);t.xi=ids.map(id=>t.players.findIndex(p=>p.id===id));for(const [format,playerIds] of Object.entries(formatIds))t.formatSquads[format].xi=playerIds.map(id=>t.players.findIndex(p=>p.id===id)).filter(n=>n>=0);if(!validateXI(t)||Object.values(t.formatSquads||{}).some(squad=>!validateXI({...t,xi:squad.xi})))chooseXI(t);return p;}
function record(s,type,p,from,to,term=null){s.transactions.unshift({season:s.season,type,playerId:p.id,name:p.name,from,to,expires:p.contract?.expires??null,term,contractType:p.contract?.type??null});}
function checkDemand(p,team,term){const demand=contractDemand(p,team);if(term<demand.term)throw Error(`${p.name} wants at least a ${demand.term}-season deal as a ${demand.reason}.`);}
export function renewContract(s,id,term,annualWage=null){unlocked(s);if(s.competition==='world')throw Error('National squads do not use club contracts.');durationCheck(term);const team=s.teams[s.team],p=team.players.find(p=>p.id===id);if(!p)throw Error('Player is no longer at your club.');const demand=contractDemand(p,team);checkDemand(p,team,term);const offer=annualWage??demand.wage,minOffer=Math.round(demand.wage*.9);if(!Number.isSafeInteger(offer)||offer<minOffer)throw Error(`${p.name} rejected the offer. They want at least $${minOffer.toLocaleString()} per season.`);p.wage=offer;p.contract={...p.contract,signedSeason:s.season,expires:Math.max(s.season,p.contract.expires)+term,type:contractTypeFor(p)};record(s,'Renewal',p,s.team,s.team,term);}
export function listPlayer(s,id,value=true){unlocked(s);if(s.competition==='world')throw Error('National squads do not use transfers.');const p=s.teams[s.team].players.find(p=>p.id===id);if(!p)throw Error('Player is no longer at your club.');p.listed=!!value;}
export function releasePlayer(s,id){unlocked(s);if(s.competition==='world')throw Error('National squads do not release players.');const t=s.teams[s.team],n=t.players.findIndex(p=>p.id===id);if(n<0)throw Error('Player is no longer at your club.');const issue=removalIssue(t,n);if(issue)throw Error(`Cannot release: ${issue}`);const p=remove(t,n);p.contract=null;p.listed=false;s.freeAgents.push(p);record(s,'Released',p,s.team,null);}
export function signPlayer(s,id,term=2){unlocked(s);durationCheck(term);const buyer=s.teams[s.team];if(buyer.players.length>=MAX_SQUAD)throw Error('Squad is full (20 players). Release or transfer a player first.');let seller=null,index=s.freeAgents.findIndex(p=>p.id===id),p;
 if(s.competition==='world')throw Error('National squads do not recruit players.');
 if(index>=0){p=s.freeAgents[index];checkDemand(p,null,term);s.freeAgents.splice(index,1);}else{
 seller=s.teams.find(t=>t.id!==s.team&&t.players.some(p=>p.id===id));if(!seller)throw Error('Player is no longer available.');index=seller.players.findIndex(p=>p.id===id);p=seller.players[index];if(!p.listed)throw Error('The club will only release transfer-listed players.');const issue=removalIssue(seller,index);if(issue)throw Error(`Selling club declined: ${issue}`);checkDemand(p,seller,term);p=remove(seller,index);}
 p.wage=Math.max(p.wage||0,contractDemand(p,seller).wage);p.contract=makeContract(p,s.season,term);p.listed=false;buyer.players.push(p);if(!validateXI(buyer))chooseXI(buyer);record(s,seller?'Transfer in':'Free signing',p,seller?.id??null,s.team,term);
}
export function sellPlayer(s,id,to,term=2){unlocked(s);if(s.competition==='world')throw Error('National squads do not use transfers.');durationCheck(term);const seller=s.teams[s.team],buyer=s.teams[to],n=seller.players.findIndex(p=>p.id===id);if(!buyer||to===s.team||n<0)throw Error('Choose another league club and a current player.');const p=seller.players[n];if(!p.listed)throw Error('List this player for transfer first.');if(buyer.players.length>=MAX_SQUAD)throw Error('The buying club has a full squad.');const issue=removalIssue(seller,n);if(issue)throw Error(`Cannot transfer: ${issue}`);checkDemand(p,seller,term);p.wage=Math.max(p.wage||0,contractDemand(p,seller).wage);remove(seller,n);p.contract=makeContract(p,s.season,term);p.listed=false;buyer.players.push(p);if(!validateXI(buyer))chooseXI(buyer);record(s,'Transfer out',p,s.team,to,term);}
export function expireContracts(s){for(const t of s.teams){for(let n=t.players.length-1;n>=0;n--){const p=t.players[n];if(p.contract.expires<s.season){remove(t,n);p.contract=null;p.listed=false;s.freeAgents.push(p);record(s,'Expired',p,t.id,null);}}}
 // Computer clubs replace departures; the manager handles their own recruitment.
 for(const t of s.teams){if(t.id===s.team)continue;while(squadIssue(t)||t.players.length<15){let role=!t.players.some(p=>p.role==='Keeper')?'Keeper':t.players.filter(isBowler).length<5?'Bowler':'Batter';let n=s.freeAgents.findIndex(p=>p.role===role);if(n<0){s.freeAgents.push(generateAgent(s,role));n=s.freeAgents.length-1;}const p=s.freeAgents.splice(n,1)[0],term=contractDemand(p,null).term;p.contract=makeContract(p,s.season,term);p.listed=false;t.players.push(p);record(s,'Club recruitment',p,null,t.id,term);}chooseXI(t);}
 while(s.freeAgents.length<18)s.freeAgents.push(generateAgent(s));if(!s.freeAgents.some(p=>p.role==='Keeper'))s.freeAgents.push(generateAgent(s,'Keeper'));while(s.freeAgents.filter(isBowler).length<8)s.freeAgents.push(generateAgent(s,'Bowler'));
}
export function beginSeason(s){unlocked(s);if(s.phase!=='Pre-season')throw Error('The season has already started.');if(s.competition==='franchise'&&!s.auction?.complete)throw Error('Complete the franchise auction before beginning the season.');const t=s.teams[s.team],issue=squadIssue(t);if(issue)throw Error(issue);if(!validateXI(t))chooseXI(t);if(!validateXI(t))throw Error('Pick a valid playing XI.');s.phase='Season';}

const auctionTargets={Batter:4,Keeper:1,'All-rounder':2,Bowler:8};
const auctionRating=(p,key='')=>{const value=k=>key?p.potential?.[k]??p[k]:p[k];return p.role==='Bowler'?value('bowl'):p.role==='All-rounder'?(value('bat')+value('bowl'))/2:value('bat');};
const auctionRoleCount=(t,role)=>t.players.filter(p=>p.role===role).length;
function newAuctionLot(s){const id=s.auction.remaining[0];return id?{playerId:id,round:1,highestBid:0,highestTeam:null,history:[]}:null;}
export function setupAuctionState(s){if(s.competition!=='franchise'||!s.auction)return s.auction;s.auction.current??=newAuctionLot(s);return s.auction;}
function isAuctionBowler(p){return p.role==='Bowler'||p.role==='All-rounder';}
function requiredXISquadSize(t,candidate=null){const players=candidate?[...t.players,candidate]:t.players,keepers=players.some(p=>p.role==='Keeper')?1:0,bowlers=players.filter(isAuctionBowler).length;return Math.max(11,players.length+(keepers?0:1)+Math.max(0,5-bowlers));}
function canAcquireAuctionPlayer(t,p){return t.players.length<15&&requiredXISquadSize(t,p)<=15;}
function auctionReserve(a,t){const slots=15-t.players.length,xiSlots=Math.min(slots,Math.max(0,requiredXISquadSize(t)-t.players.length));return xiSlots*4+Math.max(0,slots-xiSlots);}
function auctionMaxSpend(a,t){return Math.max(0,a.budgets[t.id]-auctionReserve(a,t));}
export function auctionBidLimit(s,teamId=s.team){if(s.competition!=='franchise'||!s.auction||!s.teams[teamId])return 0;return auctionMaxSpend(s.auction,s.teams[teamId]);}
export function auctionPlayerEligible(s,playerId,teamId=s.team){const t=s.teams[teamId],p=s.freeAgents.find(x=>x.id===playerId);return s.competition==='franchise'&&!!t&&!!p&&canAcquireAuctionPlayer(t,p)&&auctionMaxSpend(s.auction,t)>=1;}
function aiAuctionPlan(s,team,player,currentBid){
 const a=s.auction,slots=15-team.players.length;if(slots<=0||!canAcquireAuctionPlayer(team,player))return null;const purse=auctionMaxSpend(a,team);if(purse<=currentBid)return null;
 const rating=auctionRating(player),potential=auctionRating(player,'potential.'),blend=rating*.58+potential*.42,target=auctionTargets[player.role]||0,deficit=Math.max(0,target-auctionRoleCount(team,player.role));
 const weakest=team.players.filter(p=>p.role===player.role).map(p=>auctionRating(p)).sort((x,y)=>x-y)[0]??0,upgrade=blend-weakest;
 if(!deficit&&team.players.length>=12&&blend<88&&upgrade<8)return null;
 const needBonus=deficit?2+Math.min(2,deficit-1):0,quality=Math.max(0,Math.floor((blend-70)/8)),urgency=team.players.length<11?2:0,slotsLeft=Math.max(1,15-team.players.length),averageSpend=a.budgets[team.id]/slotsLeft,needFactor=deficit?1:.55,ceiling=Math.min(purse,Math.max(1,Math.floor(averageSpend*needFactor+quality+needBonus*.6+urgency)));
 if(ceiling<=currentBid)return null;
 return {ceiling,priority:deficit*10+urgency*4+blend/20+Math.max(0,upgrade)/15};
}
function awardAuctionLot(s){
 const a=s.auction,current=a.current,player=s.freeAgents.find(p=>p.id===current?.playerId);if(!current||!player)throw Error('The next auction lot is unavailable.');
 let winner=current.highestTeam,price=current.highestBid;
 if(winner===null){const fallback=s.teams.filter(t=>canAcquireAuctionPlayer(t,player)&&auctionMaxSpend(a,t)>=1).map(t=>({t,need:Math.max(0,(auctionTargets[player.role]||0)-auctionRoleCount(t,player.role)),rating:auctionRating(player,'potential.')+auctionRating(player)})).sort((x,y)=>y.need-x.need||y.rating-x.rating||x.t.players.length-y.t.players.length||x.t.id-y.t.id)[0];if(!fallback)throw Error('No club can afford the remaining auction lots.');winner=fallback.t.id;price=1;}
 const buyer=s.teams[winner],idx=s.freeAgents.findIndex(p=>p.id===player.id);s.freeAgents.splice(idx,1);player.contract={signedSeason:s.season,expires:s.season+99,type:'Full'};player.listed=false;buyer.players.push(player);a.budgets[winner]-=price;a.remaining.shift();a.sold.unshift({playerId:player.id,name:player.name,role:player.role,team:winner,price});if(winner!==s.team)record(s,'Auction signing',player,null,winner);if(!validateXI(buyer))chooseXI(buyer);
 a.last={player:player.name,team:buyer.name,price,userWon:winner===s.team};if(!a.remaining.length){a.complete=true;a.current=null;for(const t of s.teams)chooseXI(t);}else a.current=newAuctionLot(s);return a.last;
}
function advanceAuctionRound(s,userIncrement=0){
 if(s.competition!=='franchise'||s.phase!=='Pre-season'||s.auction?.complete)throw Error('There is no live franchise auction.');
 if(!Number.isInteger(userIncrement)||![0,1,3,5].includes(userIncrement))throw Error('Choose a bid increase of 1, 3 or 5 credits, or pass.');
 const a=setupAuctionState(s),current=a.current,player=s.freeAgents.find(p=>p.id===current?.playerId);if(!player)throw Error('The next auction lot is unavailable.');
 const user=s.teams[s.team],userMax=auctionMaxSpend(a,user),minNext=current.highestBid+1;
 if(userIncrement){if(!canAcquireAuctionPlayer(user,player))throw Error('This player would leave too few squad places to complete a valid XI. Keep space for a keeper and five bowling options.');const bid=current.highestBid+userIncrement;if(bid>userMax)throw Error(`Your purse can bid up to ${userMax} credits while reserving funds for the players still needed to complete an XI.`);current.highestBid=bid;current.highestTeam=s.team;current.history.push({round:current.round,team:s.team,bid});}
 const ai=s.teams.filter(t=>t.id!==s.team).map(t=>({t,plan:aiAuctionPlan(s,t,player,current.highestBid)})).filter(x=>x.plan).sort((x,y)=>y.plan.priority-x.plan.priority||x.t.id-y.t.id);
 for(const {t,plan} of ai){if(current.highestTeam===t.id)continue;const room=auctionMaxSpend(a,t),minimum=current.highestBid+1;if(room<minimum||plan.ceiling<minimum)continue;const need=Math.max(0,(auctionTargets[player.role]||0)-auctionRoleCount(t,player.role)),blend=auctionRating(player)*.58+auctionRating(player,'potential.')*.42,raise=Math.max(1,Math.min(4,1+Math.floor(Math.max(0,blend-70)/12)+(need?1:0))),bid=Math.min(room,plan.ceiling,current.highestBid+raise);if(bid>=minimum){current.highestBid=bid;current.highestTeam=t.id;current.history.push({round:current.round,team:t.id,bid});}}
 current.round++;if(current.round>3)return awardAuctionLot(s);return {player:player.name,team:current.highestTeam===null?null:s.teams[current.highestTeam].name,price:current.highestBid,userWon:current.highestTeam===s.team,round:current.round-1,remaining:4-current.round};
}
export function bidAtAuction(s,increment=0){unlocked(s);return advanceAuctionRound(s,increment);}
export function simulateAuction(s){unlocked(s);if(s.competition!=='franchise'||s.phase!=='Pre-season')throw Error('The franchise auction is not available.');setupAuctionState(s);let guard=0;while(!s.auction.complete&&guard++<400)advanceAuctionRound(s,0);if(!s.auction.complete)throw Error('The auction could not fill every squad.');return s.auction;}
