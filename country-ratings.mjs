const legacyRankings={
 T20:['India','England','Australia','New Zealand','South Africa','Pakistan','West Indies','Bangladesh','Sri Lanka','Afghanistan','Zimbabwe','Ireland','Netherlands','Scotland','Nepal','United Arab Emirates','Oman','United States'],
 ODI:['India','New Zealand','South Africa','Australia','Pakistan','England','Sri Lanka','Afghanistan','Bangladesh','West Indies','Zimbabwe','Ireland','Scotland','Netherlands','United States','Nepal','Oman','United Arab Emirates'],
 FC:['Australia','South Africa','India','England','New Zealand','Pakistan','Sri Lanka','West Indies','Bangladesh','Zimbabwe'],
};
// ICC men's team-rating snapshot checked 22 October 2026. The roster stays fictional;
// these country ratings calibrate squad skill and initial world-ranking strength by format.
// Explicit ranks preserve global ICC positions when the game omits other associate nations.
const tables={
 T20:[['England',269,1],['India',267,2],['Australia',260,3],['New Zealand',247,4],['South Africa',243,5],['Pakistan',240,6],['West Indies',236,7],['Bangladesh',222,8],['Sri Lanka',221,9],['Afghanistan',218,10],['Ireland',205,11],['Zimbabwe',202,12],['United States',183,13],['Nepal',181,14],['Netherlands',180,15],['Namibia',179,16],['Scotland',179,17],['United Arab Emirates',175,18],['Oman',152,19],['Canada',149,20]],
 ODI:[['India',115,1],['New Zealand',109,2],['South Africa',104,3],['Pakistan',103,4],['Australia',102,5],['England',95,6],['Sri Lanka',95,7],['Afghanistan',92,8],['Bangladesh',83,9],['West Indies',79,10],['Zimbabwe',61,11],['Ireland',51,12],['Scotland',45,13],['Netherlands',44,14],['United States',41,15],['Namibia',32,16],['Nepal',31,17],['Oman',24,18],['United Arab Emirates',14,19],['Canada',9,20]],
 FC:[['Australia',126,1],['South Africa',119,2],['New Zealand',106,3],['India',105,4],['England',102,5],['Bangladesh',77,6],['Sri Lanka',75,7],['West Indies',74,8],['Pakistan',71,9],['Zimbabwe',17,10]],
};
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const asMap=list=>new Map(list.map(([name,rating,rank],index)=>[name,{rank:rank??index+1,rating}]));
const ratingMaps=Object.fromEntries(Object.entries(tables).map(([format,list])=>[format,asMap(list)]));
function previousStrength(name,format=null){const formats=format&&format!=='ALL'?(format==='FC'&&!legacyRankings.FC.includes(name)?['T20','ODI']:[format]):['T20','ODI','FC'];const scores=formats.map(f=>{const list=legacyRankings[f],rank=list.indexOf(name);return rank<0?null:7-14*rank/(list.length-1);}).filter(Number.isFinite);return Math.round(clamp(scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0,-7,7));}
export function legacyCountrySkillModifiers(name){const overall=previousStrength(name);return {bat:overall,bowl:overall,field:Math.round(overall*.65)};}
export function legacyCountryStartingRating(name,format){return 1000+previousStrength(name,format)*10;}
export function countryRanking(name,format){return ratingMaps[format]?.get(name)?.rank??null;}
export function countryRating(name,format){return ratingMaps[format]?.get(name)?.rating??null;}
function strengthForTable(name,format){const item=ratingMaps[format]?.get(name);if(!item)return null;const values=tables[format].map(([,rating])=>rating),high=Math.max(...values),low=Math.min(...values);return 12-24*(high-item.rating)/(high-low);}
export function countryStrength(name,format=null){let formats=format&&format!=='ALL'?(format==='FC'&&!countryRating(name,'FC')?['T20','ODI']:[format]):['T20','ODI','FC'];const values=formats.map(f=>strengthForTable(name,f)).filter(Number.isFinite),rounded=Math.round(clamp(values.length?values.reduce((a,b)=>a+b,0)/values.length:0,-12,12));return rounded===0?0:rounded;}
export function countrySkillModifiers(name,format=null){const overall=countryStrength(name,format);return {bat:overall,bowl:overall,field:Math.round(overall*.65)};}
export function countryStartingRating(name,format){const rating=countryRating(name,format);if(Number.isFinite(rating)){const values=tables[format].map(([,value])=>value),midpoint=(Math.max(...values)+Math.min(...values))/2;return 1000+(rating-midpoint)*2;}return 1000+countryStrength(name,format)*9;}
