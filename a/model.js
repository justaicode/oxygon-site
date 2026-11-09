// public_activity v1: a narrow, permission-filtered view; never a private activity record.
export const distanceFree=sport=>['sauna','yoga','strength'].includes(sport);
export const validId=id=>typeof id==='string'&&/^[a-f0-9]{32}$/.test(id);
const text=(v,n=500)=>typeof v==='string'?v.slice(0,n):'';
const number=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;
export function safeUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='my.oxygon.app'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export function projectRoute(route){
 if(!route||route.hideStartM<300||route.hideEndM<300||!Number.isFinite(route.hideStartM)||!Number.isFinite(route.hideEndM)||!Array.isArray(route.points)||route.points.length<2)return [];
 const points=route.points.slice(0,20000);if(!points.every(p=>p&&Number.isFinite(p.lat)&&Math.abs(p.lat)<=90&&Number.isFinite(p.lon)&&Math.abs(p.lon)<=180&&(p.lat!==0||p.lon!==0)))return [];
 const lat=points.map(p=>p.lat),lon=points.map(p=>p.lon),loLat=Math.min(...lat),hiLat=Math.max(...lat),loLon=Math.min(...lon),hiLon=Math.max(...lon);if(hiLon-loLon>180)return [];
 const xScale=Math.cos((loLat+hiLat)/2*Math.PI/180),dx=(hiLon-loLon)*xScale,dy=hiLat-loLat,scale=Math.min(264/(dx||1e-9),124/(dy||1e-9));if(!dx&&!dy)return [];
 return points.map(p=>[150+(p.lon-(loLon+hiLon)/2)*xScale*scale,80-(p.lat-(loLat+hiLat)/2)*scale]);
}
export function normalize(raw,expectedId){
 const sport=raw?.sport==='ride'?'bike':raw?.sport;
 if(!raw||Array.isArray(raw)||raw.version!==1||!validId(raw.id)||(expectedId&&raw.id!==expectedId)||raw.source==='strava'||!['run','bike','swim','sauna','yoga','strength'].includes(sport))return null;
 const free=distanceFree(sport),stats={},summary=raw.summary||{};
 // Optional summary columns come from the SQL allowlist; derive running pace only as contracted.
 for(const [key,source]of [['elapsedSeconds','movingSec'],['temperatureC','tempC'],['load','load'],...(free?[]:[['distanceKm','distanceKm'],['ascentM','elevationGainM']])]){const value=number(summary[source]);if(value!==null)stats[key]=value;}
 for(const [key,source]of [['avgHeartRate','avgHR'],['maxHeartRate','maxHR']]){const value=number(summary[source]);if(value!==null)stats[key]=value;}
 if(sport==='run'&&stats.elapsedSeconds>0&&stats.distanceKm>0)stats.avgPaceSecondsPerKm=stats.elapsedSeconds/stats.distanceKm;
 const heartRateShared=stats.avgHeartRate!==undefined||stats.maxHeartRate!==undefined;
 const paceWords=/(?:pace|distance|\bkm\b|\bmiles?\b|\/km|ρυθμ|απόστασ|χλμ)/i,heartWords=/(?:heart rate|\bbpm\b|\bHR\b|παλμ)/i;
 const publicText=(v,n)=>{const s=text(v,n);return (free&&paceWords.test(s))||(!heartRateShared&&heartWords.test(s))?'':s;};
 const words=text(raw.athlete,60).trim().split(/\s+/),name=words.length>1?words[0]+' '+Array.from(words.at(-1))[0]+'.':words[0];
 const route=free?[]:projectRoute(raw.route);
 const photoIndexes=[...new Set((Array.isArray(raw.photos)?raw.photos:[]).map(p=>p?.index).filter(i=>Number.isInteger(i)&&i>=0&&i<=3))];
 // Populated rep shape is defined by shared StravaServerUpload.PublicRep / StravaServerJs.
 const reps=(Array.isArray(raw.reps)?raw.reps:[]).slice(0,100).filter(r=>r&&number(r.seconds)!==null).map((r,i)=>({number:Number.isInteger(r.number)&&r.number>0?r.number:i+1,seconds:r.seconds,paceSecPerKm:free?null:number(r.paceSecPerKm),target:publicText(r.target,150)}));
 return {id:raw.id,name,date:text(raw.startedAt,40),sport,sportDetail:'',title:publicText(raw.title,150),aiLines:publicText(raw.aiLines,600),note:publicText(raw.note,10000),stats,heartRateShared,route,photoIndexes,photos:[],reps,plan:null,replayAvailable:raw.replay===true&&route.length>1,replayUrl:null,appUrl:safeUrl(raw.openUrl)||'https://my.oxygon.app/'};
}
export function clock(seconds){const n=Math.round(seconds);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
