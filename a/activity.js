import {loadActivity,loadPhotos,revokePhotos,activityId} from './data.js?v=0e458134862d';
import {normalize,clock,distanceFree} from './model.js?v=bd1d9a9b4780';
const strings={en:{loading:'Loading activity…',unavailable:"This activity isn't public",notFound:'Page not found',open:'Open in Oxygon',watch:'Watch in 3D',hidden:'Start and finish hidden',reps:'Reps',rounds:'Rounds',rep:'Rep',round:'Round',plan:'Plan',easy:'min easy between',train:'Train with Oxygon',pitch:'Plan, record and share runs, rides, swims and more.',privacy:'shares this activity publicly.',summary:'Heart rate is shown as a summary only, never as a trace.',mapPrivacy:'Start and finish are hidden on the map.',run:'Run',bike:'Ride',swim:'Swim',sauna:'Sauna',yoga:'Yoga',strength:'Strength',distance:'Distance',time:'Time',pace:'Avg pace',hr:'Avg HR',max:'max',ascent:'Ascent',load:'Load',temperature:'Temp.',photos:'Activity photos',route:'Route with start and finish hidden'},
el:{loading:'Φόρτωση δραστηριότητας…',unavailable:'Αυτή η δραστηριότητα δεν είναι δημόσια',notFound:'Η σελίδα δεν βρέθηκε',open:'Άνοιγμα στο Oxygon',watch:'Προβολή σε 3D',hidden:'Αρχή και τέλος κρυμμένα',reps:'Επαναλήψεις',rounds:'Γύροι',rep:'Επανάληψη',round:'Γύρος',plan:'Πλάνο',easy:'λεπτά χαλαρά ανάμεσα',train:'Προπονήσου με το Oxygon',pitch:'Σχεδίασε, κατάγραψε και μοιράσου τρέξιμο, ποδήλατο, κολύμπι και άλλα.',privacy:'μοιράζεται δημόσια αυτή τη δραστηριότητα.',summary:'Οι παλμοί εμφανίζονται μόνο ως σύνοψη, ποτέ ως καμπύλη.',mapPrivacy:'Η αρχή και το τέλος είναι κρυμμένα στον χάρτη.',run:'Τρέξιμο',bike:'Ποδήλατο',swim:'Κολύμπι',sauna:'Σάουνα',yoga:'Γιόγκα',strength:'Δύναμη',distance:'Απόσταση',time:'Χρόνος',pace:'Μ. ρυθμός',hr:'Μ. παλμοί',max:'μέγ.',ascent:'Ανάβαση',load:'Φορτίο',temperature:'Θερμοκρ.',photos:'Φωτογραφίες δραστηριότητας',route:'Διαδρομή με κρυμμένη αρχή και τέλος'}};
const lang=new URLSearchParams(location.search).get('lang')==='el'?'el':'en',s=strings[lang],main=document.querySelector('main');
document.documentElement.lang=lang;
const language=document.querySelector('.language'),alternate=new URL(location.href);alternate.searchParams.set('lang',lang==='en'?'el':'en');language.href=alternate.pathname+alternate.search+alternate.hash;language.lang=lang==='en'?'el':'en';language.textContent=lang==='en'?'ΕΛ':'EN';language.setAttribute('aria-label',lang==='en'?'Ελληνικά':'English');
function node(tag,cls='',text=''){const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;}
function icon(id,cls=''){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','icon '+cls);svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href','#i-'+id);svg.append(use);return svg;}
function button(text,url,cls=''){const a=node('a','btn '+cls,text);a.href=url;return a;}
function setOpenLinks(url,visible=true){for(const a of document.querySelectorAll('.open')){a.textContent=s.open;a.href=url;}document.querySelector('.bar').hidden=!visible;document.querySelector('.top .open').hidden=!visible;}
function tile(key,label,value,unit='',context='',glyph='stopwatch'){
 const e=node('div','tile measurement-tile metric-tile');e.dataset.metric=key;e.setAttribute('role','group');e.setAttribute('aria-label',(key==='temperature'?(lang==='el'?'Θερμοκρασία':'Temperature'):label)+' '+value+' '+unit+(context?' '+context:''));
 const l=node('div','measurement-label'),lc=node('span','measurement-content');lc.append(icon(glyph,key==='hr'?'pink':''),document.createTextNode(label));l.append(lc);
 const v=node('div','measurement-value'),readings=node('div','measurement-content measurement-readings'),reading=node('span','measurement-reading');reading.append(node('b','measurement-number',String(value)));if(unit)reading.append(node('span','measurement-unit',unit));readings.append(reading);v.append(readings);
 const c=node('div','measurement-context');c.append(node('span','measurement-content',context));e.append(l,v,c);return e;
}
function displayUnavailable(){main.replaceChildren();const empty=node('section','empty');empty.append(icon('lock'),node('h1','',activityId()||location.pathname.startsWith('/a/')?s.unavailable:s.notFound));main.append(empty);main.setAttribute('aria-busy','false');setOpenLinks('https://my.oxygon.app/',false);document.title='Oxygon';}
function render(data){
 const left=node('div','left'),right=node('div','right'),head=node('section','head');
 const who=node('div','who'),name=node('span');name.append(node('b','',data.name));
 const date=new Date(data.date);if(Number.isFinite(date.valueOf()))name.append(document.createTextNode(new Intl.DateTimeFormat(lang==='el'?'el-GR':'en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date)+' · '+new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(date)));
 who.append(node('span','av',data.name.charAt(0)),name);
 const sport=node('span','sport',s[data.sport]+(data.sportDetail?' · '+data.sportDetail:''));if(data.sport==='run')sport.prepend(icon('run'));
 const colors={run:'var(--sport-run)',bike:'var(--sport-ride)',swim:'var(--sport-swim)',sauna:'var(--sport-sauna)',yoga:'var(--sport-yoga)',strength:'var(--sport-strength)'};sport.style.color=colors[data.sport];
 head.append(who,sport,node('h1','',data.title||s[data.sport]));if(data.aiLines)head.append(node('p','ai',data.aiLines));if(data.note)head.append(node('p','note',data.note));right.append(head);
 if(data.photos.length){const photos=node('section','photos'+(data.photos.length===1?' single':data.photos.length===2?' two':data.photos.length>3?' many':''));photos.setAttribute('aria-label',s.photos);for(const photo of data.photos){const img=node('img');img.src=photo.url;img.alt=(lang==='el'?'Φωτογραφία δραστηριότητας ':'Activity photo ')+(photo.index+1);img.referrerPolicy='no-referrer';photos.append(img);}left.append(photos);}
 if(data.route.length>1){const map=node('section','mapc');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 300 160');svg.setAttribute('role','img');svg.setAttribute('aria-label',s.route);const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',data.route.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' '));for(const [k,v]of Object.entries({fill:'none',stroke:colors[data.sport],'stroke-width':'3','stroke-linejoin':'round','stroke-linecap':'round'}))path.setAttribute(k,v);svg.append(path);map.append(svg,node('small','',s.hidden));if(data.replayUrl)map.append(button(s.watch,data.replayUrl));left.append(map);}
 const tiles=node('section','tile-grid'),stats=data.stats;
 if(stats.distanceKm!==undefined)tiles.append(tile('distance',s.distance,stats.distanceKm.toFixed(2),'km','','ruler'));
 if(stats.elapsedSeconds!==undefined)tiles.append(tile('time',s.time,clock(stats.elapsedSeconds)));
 if(stats.avgPaceSecondsPerKm!==undefined)tiles.append(tile('pace',s.pace,clock(stats.avgPaceSecondsPerKm),'/km','','gauge'));
 if(stats.temperatureC!==undefined)tiles.append(tile('temperature',s.temperature,stats.temperatureC,'°C','','thermometer'));
 if(stats.rounds!==undefined)tiles.append(tile('rounds',s.rounds,stats.rounds));
 if(stats.avgHeartRate!==undefined)tiles.append(tile('hr',s.hr,stats.avgHeartRate,'bpm',stats.maxHeartRate!==undefined?s.max+' '+stats.maxHeartRate:'','heart'));
 else if(stats.maxHeartRate!==undefined)tiles.append(tile('hr',s.max+' '+s.hr,stats.maxHeartRate,'bpm','','heart'));
 if(stats.ascentM!==undefined)tiles.append(tile('ascent',s.ascent,stats.ascentM,'m','','mountain'));
 if(stats.load!==undefined)tiles.append(tile('load',s.load,'~'+stats.load,'','','bolt'));if(tiles.children.length)right.append(tiles);
 if(data.reps.length){const card=node('section','card'),free=distanceFree(data.sport);card.append(node('h2','',free?s.rounds:s.reps));const pace=data.reps.map(r=>r.paceSecPerKm??r.seconds),low=Math.min(...pace),high=Math.max(...pace);for(const [i,rep]of data.reps.entries()){const row=node('div','rep'),value=pace[i];row.append(node('span','',(free?s.round:s.rep)+' '+rep.number),node('b','',clock(value)+(rep.paceSecPerKm!==null?' /km':'')));if(rep.target)row.firstChild.append(node('small','rep-target',rep.target));const bar=node('i');bar.setAttribute('aria-hidden','true');bar.style.width=(high===low?65:44+(high-value)/(high-low)*42)+'%';row.append(bar);card.append(row);}
  const p=data.plan;if(p?.count&&p.distanceM&&p.paceLow&&p.paceHigh){card.append(node('div','plan',`${s.plan}: ${p.count} × ${p.distanceM/1000} km ${lang==='el'?'σε':'at'} ${clock(p.paceLow)}–${clock(p.paceHigh)} /km, ${(p.recoverySeconds||0)/60} ${s.easy}`));}right.append(card);}
 const cta=node('section','card cta'),pitch=node('p');pitch.append(node('b','',s.train),document.createTextNode(s.pitch));cta.append(pitch,button(s.open,data.appUrl,'primary'));right.append(cta);
 const privacy=node('div','priv'),sentences=[data.name+' '+s.privacy];if(data.heartRateShared&&(stats.avgHeartRate!==undefined||stats.maxHeartRate!==undefined))sentences.push(s.summary);if(data.route.length>1)sentences.push(s.mapPrivacy);privacy.append(icon('lock'),node('span','',sentences.join(' ')));right.append(privacy);
 main.replaceChildren(...(left.children.length?[left]:[]),right);if(!left.children.length)main.classList.add('no-media');else main.classList.remove('no-media');setOpenLinks(data.appUrl);main.setAttribute('aria-busy','false');document.title=(data.title||s[data.sport])+' · Oxygon';
}
let loadGeneration=0,activePhotos=[],controller;
function clearPhotos(){revokePhotos(activePhotos);activePhotos=[];}
async function start(){
 const generation=++loadGeneration;controller?.abort();controller=new AbortController();const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(10000)]);
 clearPhotos();const alternate=new URL(location.href);alternate.searchParams.set('lang',lang==='en'?'el':'en');language.href=alternate.pathname+alternate.search+alternate.hash;document.title='Oxygon';main.replaceChildren(node('p','status',s.loading));main.setAttribute('aria-busy','true');setOpenLinks('https://my.oxygon.app/',false);
 try{const id=activityId(),data=normalize(await loadActivity(id,signal),id);if(generation!==loadGeneration)return;
  if(!data){displayUnavailable();return;}
  const photos=await loadPhotos(data.id,data.photoIndexes,signal);if(generation!==loadGeneration){revokePhotos(photos);return;}
  activePhotos=photos;data.photos=photos;render(data);
 }catch{if(generation===loadGeneration){clearPhotos();displayUnavailable();}}
}
window.addEventListener('hashchange',start);
window.addEventListener('pagehide',()=>{++loadGeneration;controller?.abort();clearPhotos();main.replaceChildren();document.title='Oxygon';setOpenLinks('https://my.oxygon.app/',false);});
window.addEventListener('pageshow',event=>{if(event.persisted)start();});start();
