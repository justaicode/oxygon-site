// Provisional view model, deliberately narrower than a full activity record.
export const distanceFree = sport => ['sauna','yoga','strength'].includes(sport);
const text = (value,limit=500) => typeof value==='string'?value.slice(0,limit):'';
const number = value => typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;
export function safeUrl(value,kind='media') {
  try {
    const url=new URL(value,location.origin);
    const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
    if(local&&url.origin===location.origin&&url.pathname.startsWith('/a/fixtures/'))return url.href;
    if(url.protocol!=='https:'||url.username||url.password)return null;
    const allowed=kind==='app'?['my.oxygon.app']:kind==='replay'?['my.oxygon.app','oxygon.app']:['dtpmhkjrmdssfejvoror.supabase.co','oxygon.app'];
    return allowed.includes(url.hostname)?url.href:null;
  } catch { return null; }
}
export function normalize(raw) {
  if(!raw||raw.public!==true||raw.revoked||!['oxygon','garmin'].includes(String(raw.source).toLowerCase())||!['run','bike','swim','sauna','yoga','strength'].includes(raw.sport))return null;
  const free=distanceFree(raw.sport), stats={};
  for(const key of ['elapsedSeconds','temperatureC','rounds','load',...(free?[]:['distanceKm','avgPaceSecondsPerKm','ascentM'])]){
    const value=number(raw.stats?.[key]);if(value!==null)stats[key]=value;
  }
  if(raw.sharing?.heartRate===true)for(const key of ['avgHeartRate','maxHeartRate']){const value=number(raw.stats?.[key]);if(value!==null)stats[key]=value;}
  // Only a server-trimmed route is accepted. Never trim a raw/private trace in the browser.
  const route=!free&&raw.sharing?.map===true&&raw.map?.startFinishHidden===true&&Array.isArray(raw.map.points)?raw.map.points.filter(p=>Array.isArray(p)&&p.length===2&&p.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=300)).slice(0,2000):[];
  const words=text(raw.athleteName,60).trim().split(/\s+/);
  const name=words.length>1?words[0]+' '+Array.from(words.at(-1))[0]+'.':words[0];
  const paceWords=/(?:pace|distance|\bkm\b|\bmiles?\b|\/km|ρυθμ|απόστασ|χλμ)/i;
  const heartWords=/(?:heart rate|\bbpm\b|\bHR\b|παλμ)/i;
  const publicText=(value,limit)=>{const result=text(value,limit);return (free&&paceWords.test(result))||(raw.sharing?.heartRate!==true&&heartWords.test(result))?'':result;};
  return {name,date:text(raw.date,40),sport:raw.sport,sportDetail:text(raw.sportDetail,40),title:publicText(raw.title,150),
    aiLines:publicText(raw.aiLines,600),note:publicText(raw.note,1500),photos:raw.sharing?.photos===true?(Array.isArray(raw.photos)?raw.photos:[]).slice(0,12).map(p=>({url:safeUrl(p.url),alt:text(p.alt,120)})).filter(p=>p.url):[],
    route,stats,replayUrl:route.length>1?safeUrl(raw.replayUrl,'replay'):null,appUrl:safeUrl(raw.appUrl,'app')||'https://my.oxygon.app/activities.html',
    reps:(Array.isArray(raw.reps)?raw.reps:[]).slice(0,100).map(r=>({seconds:number(r.seconds),...(free?{}:{distanceM:number(r.distanceM)})})).filter(r=>r.seconds!==null),
    plan:free?null:{count:number(raw.plan?.count),distanceM:number(raw.plan?.distanceM),paceLow:number(raw.plan?.paceLow),paceHigh:number(raw.plan?.paceHigh),recoverySeconds:number(raw.plan?.recoverySeconds)},
    heartRateShared:raw.sharing?.heartRate===true};
}
export function clock(seconds) { const n=Math.round(seconds);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`; }
