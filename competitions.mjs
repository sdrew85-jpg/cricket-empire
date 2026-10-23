export const COMPETITIONS = {
  world: {name:'International Championship',label:'International',venue:'World Cricket Ground',
    teams:['Australia','England','India','New Zealand','Pakistan','South Africa','Sri Lanka','West Indies','Bangladesh','Afghanistan','Ireland','Zimbabwe','Nepal','Scotland','Netherlands','Oman','United States','United Arab Emirates'],
    shorts:['AUS','ENG','IND','NZL','PAK','RSA','SRI','WI','BAN','AFG','IRE','ZIM','NEP','SCO','NED','OMA','USA','UAE']},
  sydney: {
    name:'Sydney Suburbs Competition',label:'Sydney Suburbs',venue:'Sydney Oval',
    teams:['Sydney East','Northern Beaches','Canterbury','Parramatta','Liverpool','Mascot','Redfern','Penrith','Hurstville','Blacktown'],
    shorts:['SYE','NBE','CAN','PAR','LIV','MAS','RED','PEN','HUR','BLK'],
  },
  empire: {
    name:'Empire League',label:'Empire League',venue:'Empire Oval',
    teams:['Harbour Falcons','Coastal Kings','Valley Vipers','Metro Comets','Highland Bears','River Wolves'],
    shorts:['HBF','CSK','VLV','MTC','HLB','RVW'],
  },
  franchise: {
    name:'Empire T20 Franchise League',label:'T20 Franchises',venue:'Empire T20 Arena',
    teams:['Sydney Strikers','Harbour Heat','Coastal Cyclones','Metro Meteors','Valley Vipers','Northern Knights','Western Wolves','Eastern Eagles'],
    shorts:['SYS','HBH','COC','MEM','VAV','NOK','WEW','EAE'],
  },
  combined: {
    name:'All Domestic Competitions',label:'All domestic comps',venue:'Domestic Grounds',
    teams:['Sydney East','Northern Beaches','Canterbury','Parramatta','Liverpool','Mascot','Redfern','Penrith','Hurstville','Blacktown','Harbour Falcons','Coastal Kings','Valley Vipers','Metro Comets','Highland Bears','River Wolves','Sydney Strikers','Harbour Heat','Coastal Cyclones','Metro Meteors','Valley Vipers','Northern Knights','Western Wolves','Eastern Eagles'],
    shorts:['SYE','NBE','CAN','PAR','LIV','MAS','RED','PEN','HUR','BLK','HBF','CSK','VLV','MTC','HLB','RVW','SYS','HBH','COC','MEM','VAV','NOK','WEW','EAE'],
  },
};
export function competitionOf(s){return COMPETITIONS[s.competition||'empire'];}
export function competitionTitle(s){if(s.competition==='world')return `World ${s.format==='FC'?'First-Class':s.format} Championship`;if(s.competition==='combined')return 'All Domestic Competitions';if(s.competition==='franchise')return 'Empire T20 Franchise League';if(s.competition!=='sydney')return s.format==='FC'?'Empire First-Class Championship':s.format==='ODI'?'Empire One-Day League':'Empire T20 League';return s.format==='FC'?'Sydney First-Class Championship':s.format==='ODI'?'Sydney One-Day Competition':'Sydney T20 Competition';}
