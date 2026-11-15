import {loadActivity,loadPhotos,revokePhotos,activityId} from './data.js?v=395e83a12853';
import {normalize,clock,distanceFree,planTargetLabel} from './model.js?v=aae290015a45';
const strings={en:{intervals:'Intervals',source:'Source',loading:'Loading activity…',unavailable:"This activity isn't public",notFound:'Page not found',open:'Open in Oxygon',watch:'Watch in 3D',hidden:'Start and finish hidden',reps:'Reps',rounds:'Rounds',rep:'Rep',round:'Round',plan:'Plan',easy:'min easy between',train:'Train with Oxygon',pitch:'Plan, record and share runs, rides, swims and more.',privacy:'shares this activity publicly.',summary:'Heart rate is shown as a summary only, never as a trace.',mapPrivacy:'Start and finish are hidden on the map.',run:'Run',bike:'Ride',swim:'Swim',sauna:'Sauna',yoga:'Yoga',strength:'Strength',distance:'Distance',time:'Time',pace:'Avg pace',hr:'Avg HR',max:'max',avgSpeed:'Avg speed',moving:'Moving time',energy:'Energy',power:'Power',maxHr:'Max HR',drift:'Drift',steady:'steady',publicLead:'Shown to anyone with this link:',and:'and',publicNames:{distance:'distance',time:'time',power:'power',hr:'heart rate'},ascent:'Ascent',load:'Load',temperature:'Temp.',photos:'Activity photos',route:'Route with start and finish hidden'},
el:{intervals:'Διαλειμματική',source:'Πηγή',loading:'Φόρτωση δραστηριότητας…',unavailable:'Αυτή η δραστηριότητα δεν είναι δημόσια',notFound:'Η σελίδα δεν βρέθηκε',open:'Άνοιγμα στο Oxygon',watch:'Προβολή σε 3D',hidden:'Αρχή και τέλος κρυμμένα',reps:'Επαναλήψεις',rounds:'Γύροι',rep:'Επανάληψη',round:'Γύρος',plan:'Πλάνο',easy:'λεπτά χαλαρά ανάμεσα',train:'Προπονήσου με το Oxygon',pitch:'Σχεδίασε, κατάγραψε και μοιράσου τρέξιμο, ποδήλατο, κολύμπι και άλλα.',privacy:'μοιράζεται δημόσια αυτή τη δραστηριότητα.',summary:'Οι παλμοί εμφανίζονται μόνο ως σύνοψη, ποτέ ως καμπύλη.',mapPrivacy:'Η αρχή και το τέλος είναι κρυμμένα στον χάρτη.',run:'Τρέξιμο',bike:'Ποδήλατο',swim:'Κολύμπι',sauna:'Σάουνα',yoga:'Γιόγκα',strength:'Δύναμη',distance:'Απόσταση',time:'Χρόνος',pace:'Μ. ρυθμός',hr:'Μ. παλμοί',max:'μέγ.',avgSpeed:'Μ. ταχύτητα',moving:'Χρόνος κίνησης',energy:'Ενέργεια',power:'Ισχύς',maxHr:'Μέγ. παλμοί',drift:'Απόκλιση',steady:'σταθερή',publicLead:'Ορατά σε όποιον έχει τον σύνδεσμο:',and:'και',publicNames:{distance:'απόσταση',time:'χρόνος',power:'ισχύς',hr:'παλμοί'},ascent:'Ανάβαση',load:'Φορτίο',temperature:'Θερμοκρ.',photos:'Φωτογραφίες δραστηριότητας',route:'Διαδρομή με κρυμμένη αρχή και τέλος'}};
const lang=new URLSearchParams(location.search).get('lang')==='el'?'el':'en',s=strings[lang],main=document.querySelector('main');
document.documentElement.lang=lang;
const language=document.querySelector('.language'),alternate=new URL(location.href);alternate.searchParams.set('lang',lang==='en'?'el':'en');language.href=alternate.pathname+alternate.search+alternate.hash;language.lang=lang==='en'?'el':'en';language.textContent=lang==='en'?'ΕΛ':'EN';language.setAttribute('aria-label',lang==='en'?'Ελληνικά':'English');
function node(tag,cls='',text=''){const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;}
function icon(id,cls=''){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','icon '+cls);svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href','#i-'+id);svg.append(use);return svg;}
function button(text,url,cls=''){const a=node('a','btn '+cls,text);a.href=url;return a;}
function setOpenLinks(url,visible=true){for(const a of document.querySelectorAll('.open')){a.textContent=s.open;a.href=url;}document.querySelector('.bar').hidden=!visible;document.querySelector('.top .open').hidden=!visible;}
function tile(key,label,value,unit='',context='',glyph='stopwatch',tint=''){
 const e=node('div','tile measurement-tile metric-tile');e.dataset.metric=key;e.setAttribute('role','group');e.setAttribute('aria-label',(key==='temperature'?(lang==='el'?'Θερμοκρασία':'Temperature'):label)+' '+value+' '+unit+(context?' '+context:''));
 const l=node('div','measurement-label'),lc=node('span','measurement-content');lc.append(icon(glyph,tint||(key==='hr'?'pink':'')),document.createTextNode(label));l.append(lc);
 const v=node('div','measurement-value'),readings=node('div','measurement-content measurement-readings'),reading=node('span','measurement-reading');reading.append(node('b','measurement-number',String(value)));if(unit)reading.append(node('span','measurement-unit',unit));readings.append(reading);v.append(readings);
 const c=node('div','measurement-context');c.append(node('span','measurement-content',context));e.append(l,v,c);return e;
}
function displayUnavailable(){main.replaceChildren();const empty=node('section','empty');empty.append(icon('lock'),node('h1','',activityId()||location.pathname.startsWith('/a/')?s.unavailable:s.notFound));main.append(empty);main.setAttribute('aria-busy','false');setOpenLinks('https://my.oxygon.app/',false);document.title='Oxygon';}
function render(data){
 const left=node('div','left'),right=node('div','right'),head=node('section','head');
 const who=node('div','who'),name=node('span');name.append(node('b','',data.name));
 const date=new Date(data.date);if(Number.isFinite(date.valueOf()))name.append(document.createTextNode(new Intl.DateTimeFormat(lang==='el'?'el-GR':'en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date)+' · '+new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(date)));
 who.append(node('span','av',data.name.charAt(0)),name);
 const sport=node('span','sport',s[data.sport]+(data.sportDetail?' · '+s.intervals:''));if(data.sport==='run')sport.prepend(icon('run'));
 const colors={run:'var(--sport-run)',bike:'var(--sport-ride)',swim:'var(--sport-swim)',sauna:'var(--sport-sauna)',yoga:'var(--sport-yoga)',strength:'var(--sport-strength)'};sport.style.color=colors[data.sport];
 if(data.sourceLabel){const source=node('small','source-label',s.source+': '+data.sourceLabel);who.append(source);}
 head.append(who,sport,node('h1','',data.title||s[data.sport]));if(data.aiLines)head.append(node('p','ai',data.aiLines));if(data.note)head.append(node('p','note',data.note));right.append(head);
 if(data.photos.length){const photos=node('section','photos'+(data.photos.length===1?' single':data.photos.length===2?' two':data.photos.length>3?' many':''));photos.setAttribute('aria-label',s.photos);for(const photo of data.photos){const img=node('img');img.src=photo.url;const caption=data.photoCaptions[photo.index];img.alt=caption||(lang==='el'?'Φωτογραφία δραστηριότητας ':'Activity photo ')+(photo.index+1);img.referrerPolicy='no-referrer';const figure=node('figure');figure.append(img);if(caption)figure.append(node('figcaption','',caption));photos.append(figure);}left.append(photos);}
 if(data.route.length>1){const map=node('section','mapc');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 300 160');svg.setAttribute('role','img');svg.setAttribute('aria-label',s.route);const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',data.route.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' '));for(const [k,v]of Object.entries({fill:'none',stroke:colors[data.sport],'stroke-width':'3','stroke-linejoin':'round','stroke-linecap':'round'}))path.setAttribute(k,v);svg.append(path);map.append(svg,node('small','',s.hidden));if(data.replayUrl)map.append(button(s.watch,data.replayUrl));left.append(map);}
 const tiles=node('section','tile-grid'),stats=data.stats;
 // Approved finished-activity faces in order; dots indicate the next statistic on tap or keyboard activation.
 const free=distanceFree(data.sport),ride=data.sport==='bike',f=(v,d=0)=>Number(v).toFixed(d);
 const groups=[
  ['distance',[!free&&stats.distanceKm!==undefined&&{label:s.distance,value:f(stats.distanceKm,2),unit:'km',glyph:'ruler'},
    !free&&stats.distanceKm>0&&stats.elapsedSeconds>0&&(ride||data.sport==='swim'?{label:s.avgSpeed,value:f(stats.distanceKm/(stats.elapsedSeconds/3600),1),unit:'km/h',glyph:'gauge'}:{label:s.pace,value:clock(stats.elapsedSeconds/stats.distanceKm),unit:'/km',glyph:'gauge'}),
    !free&&stats.ascentM>0&&{label:s.ascent,value:Math.round(stats.ascentM),unit:'m',glyph:'mountain'}]],
  ['time',[stats.elapsedTotalSeconds!==undefined?{label:s.time,value:clock(stats.elapsedTotalSeconds),glyph:'stopwatch'}:stats.elapsedSeconds!==undefined&&{label:s.time,value:clock(stats.elapsedSeconds),glyph:'stopwatch'},
    stats.elapsedTotalSeconds!==undefined&&stats.elapsedSeconds!==undefined&&{label:s.moving,value:clock(stats.elapsedSeconds),glyph:'stopwatch'},
    stats.energyKcal>0&&{label:s.energy,value:Math.round(stats.energyKcal),unit:'kcal',glyph:'flame',tint:'warn'}]],
  ['power',[stats.avgWatts!==undefined&&{label:s.power,value:Math.round(stats.avgWatts),unit:'W',context:stats.maxWatts!==undefined?s.max+' '+Math.round(stats.maxWatts):'',glyph:'bolt',tint:'warn'},
    stats.npWatts!==undefined&&{label:'NP',value:Math.round(stats.npWatts),unit:'W',glyph:'bolt',tint:'warn'}]],
  ['hr',[stats.avgHeartRate!==undefined&&{label:s.hr,value:stats.avgHeartRate,unit:'bpm',context:stats.maxHeartRate!==undefined?s.max+' '+stats.maxHeartRate:'',glyph:'heart',tint:'pink'},
    stats.maxHeartRate!==undefined&&{label:s.maxHr,value:stats.maxHeartRate,unit:'bpm',glyph:'heart',tint:'pink'},
    stats.driftPct!==undefined&&{label:s.drift,value:f(stats.driftPct,1),unit:'%',context:s.steady,glyph:'heart',tint:'pink'}]]];
 tiles.classList.add('groups');
 for(const [key,faces]of groups){const list=faces.filter(Boolean);if(!list.length)continue;let at=0;
  const show=()=>{const face=list[at],t=tile(key,face.label,face.value,face.unit||'',face.context||'',face.glyph,face.tint);
   if(list.length>1){t.insertAdjacentHTML('beforeend','<span class="ox-face-dots'+(list.length>5?' many':'')+'" aria-hidden="true">'+list.map((_,i)=>'<i'+(i===at?' class="on"':'')+'></i>').join('')+'</span>');t.tabIndex=0;t.setAttribute('role','button');t.setAttribute('aria-label',t.getAttribute('aria-label')+' · '+(at+1)+'/'+list.length);t.addEventListener('click',advance);t.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();advance();}});}
   t.dataset.face=String(at);return t;};
  const advance=()=>{at=(at+1)%list.length;const next=show();slot.setAttribute('aria-label',next.getAttribute('aria-label'));slot.dataset.face=next.dataset.face;slot.replaceChildren(...next.childNodes);};
  let slot=show();tiles.append(slot);}
 // The live page's other tiles stay as they are (one face each).
 if(stats.temperatureC!==undefined)tiles.append(tile('temperature',s.temperature,stats.temperatureC,'°C','','thermometer'));
 if(stats.rounds!==undefined)tiles.append(tile('rounds',s.rounds,stats.rounds));
 if(stats.load!==undefined)tiles.append(tile('load',s.load,'~'+stats.load,'','','bolt'));
 const shown=['distance','time','power','hr'].filter(k=>tiles.querySelector('[data-metric="'+k+'"]')).map(k=>s.publicNames[k]);
 if(tiles.children.length){right.append(tiles);if(shown.length)right.append(node('p','tiles-public',s.publicLead+' '+(shown.length>1?shown.slice(0,-1).join(', ')+' '+s.and+' '+shown.at(-1):shown[0])+'.'));}

 if(data.reps.length){const card=node('section','card'),free=distanceFree(data.sport);card.append(node('h2','',free?s.rounds:s.reps));const pace=data.reps.map(r=>r.paceSecPerKm??r.seconds),low=Math.min(...pace),high=Math.max(...pace);for(const [i,rep]of data.reps.entries()){const row=node('div','rep'),value=pace[i];row.append(node('span','',(free?s.round:s.rep)+' '+rep.number+(rep.distanceM!==null?' · '+new Intl.NumberFormat(lang==='el'?'el-GR':'en-GB',{maximumFractionDigits:2}).format(rep.distanceM/1000)+' km':'')),node('b','',clock(value)+(rep.paceSecPerKm!==null?' /km':'')));if(rep.target)row.firstChild.append(node('small','rep-target',planTargetLabel(rep.target,lang)));const bar=node('i');bar.setAttribute('aria-hidden','true');bar.style.width=(high===low?65:44+(high-value)/(high-low)*42)+'%';row.append(bar);card.append(row);}
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
