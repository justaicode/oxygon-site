// Public telemetry adapter: shared catalogue/rules, app measurement components.
(function () {
  "use strict";
  if(!globalThis["oxygon-engine"]) return;
  const E = globalThis["oxygon-engine"].app.oxygon.shared.js;
  const G = E.ActivityMetricGroupsJs, M = window.Oxygon.measurements;


  document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="i-gauge" viewBox="0 0 24 24"><path d="M4.5 16.5a8.5 8.5 0 1 1 15 0"/><path d="M12 16l3.5-5"/><circle cx="12" cy="16" r="1.4" fill="currentColor" stroke="none"/></symbol><symbol id="i-ruler" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M7 7v4M12 7v5M17 7v4"/></symbol><symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20.5S4.5 15.6 4.5 10.4A4.2 4.2 0 0 1 12 7.7a4.2 4.2 0 0 1 7.5 2.7c0 5.2-7.5 10.1-7.5 10.1z" fill="currentColor" stroke="none"/></symbol><symbol id="i-mountain" viewBox="0 0 24 24"><path d="M2 19l6.5-11L13 15l2-3 7 7z"/></symbol><symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3c4.6 4.6 6 8.2 6 10.8a6 6 0 0 1-12 0C6 11.2 7.4 7.6 12 3z" fill="currentColor" stroke="none"/></symbol><symbol id="i-flame" viewBox="0 0 24 24"><path d="M12 2.8s5.4 4.6 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-2.1 1.1-3.7 2.2-4.8 0 2.1 1.1 3.2 2.2 3.2 1.6 0 1.1-4.2-1-8z" fill="currentColor" stroke="none"/></symbol><symbol id="i-cycle" viewBox="0 0 24 24"><path d="M4.2 13.4A7.8 7.8 0 0 1 17.4 7.7"/><path d="M17.8 3.9v4h-4"/><path d="M19.8 10.6A7.8 7.8 0 0 1 6.6 16.3"/><path d="M6.2 20.1v-4h4"/></symbol><symbol id="i-thermometer" viewBox="0 0 24 24"><path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z"/><path d="M12 8v10m5-11h3m-3 4h2"/><circle cx="12" cy="18" r="2" fill="currentColor"/></symbol><symbol id="i-bolt-heart" viewBox="0 0 24 24"><path d="M12 20.5S4.5 15.6 4.5 10.4A4.2 4.2 0 0 1 12 7.7a4.2 4.2 0 0 1 7.5 2.7c0 5.2-7.5 10.1-7.5 10.1z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12.5 10.5l-2.3 3h2.3l-1 4 3.5-4.5h-2.3l1.3-2.5z" fill="currentColor" stroke="none"/></symbol><symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13.6 2.2L5.6 13h5.2l-1.4 8.8L18.4 10h-5.2z" fill="currentColor" stroke="none"/></symbol><symbol id="i-check" viewBox="0 0 24 24"><path d="M4 12.5l5.5 5.5L20 6"/></symbol></svg>');
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const icon = (id, cls) => '<svg class="icon' + (cls ? " " + cls : "") + '"><use href="' + id + '"/></svg>';
  const ICONS = { speed: "#i-gauge", distance: "#i-ruler", heart: "#i-heart", climb: "#i-mountain", glucose: "#i-drop",
    energy: "#i-flame", power: "#i-bolt", cadence: "#i-cycle", conditions: "#i-thermometer", efficiency: "#i-bolt-heart" };
  const ICON_CLASS = { heart: "pink", glucose: "glucose", conditions: "temperature", efficiency: "efficiency" };

  const SLOTS = ["pace", "distance", "hr", "drift", "glucose", "conditions"];
  const sport = () => PLAN?.activityKind || "run";
  const finished = () => raceState() === "done";
  const storeKey = () => "oxygon.track.tiles.v1." + sport();
  let choices = {}, loadedKey = null;
  function loadChoices(){ if(loadedKey===storeKey()) return; loadedKey=storeKey();try{const saved=JSON.parse(localStorage.getItem(loadedKey)||"{}");choices=saved && typeof saved==="object" ? saved : {};}catch{choices={};} }
  function save(){try{localStorage.setItem(storeKey(),JSON.stringify(choices));}catch{}}
  function defaults(){return [finished()?"averagePace":"currentPace","distance",finished()?"averageHeartRate":"heartRate","cardiacDrift",finished()?"averageGlucose":"glucose","temperature"];}
  let driftKey=null, driftResult=null, driftAt=0, driftContextKey=null;
  function drift(){
    const rows=hrPoints().filter(q=>Number.isFinite(q.t));
    const key=JSON.stringify([PLAN?.driftContext,rows.length,rows.at(-1),LAST?.elapsed_sec]);
    const contextKey=JSON.stringify([PLAN?.driftContext,finished()]);
    if(key===driftKey || (!finished() && driftResult && contextKey===driftContextKey && Date.now()-driftAt<E.DriftTrendJs.liveRecomputeSeconds*1000)) return driftResult;
    driftAt=Date.now();driftContextKey=contextKey;
    driftKey=key;
    const context=PLAN?.driftContext;
    const end=LAST?.elapsed_sec || rows.at(-1)?.t || 0;
    const steps=context ? E.DriftTrendJs.steps({recorded:context.stepTimeline,segments:context.segments,sport:sport(),endSeconds:end,openEnded:OPEN_ENDED,poolLength:context.poolLength,poolUnit:context.poolUnit}) : [];
    driftResult=E.DriftTrendJs.build({samples:E.DriftTrendJs.trace(rows),steps,pauses:context?.pauses||[],endSeconds:end,ride:["ride","bike"].includes(sport())});
    return driftResult;
  }
  const missing=()=>({value:finished()?"Not recorded":"Waiting",unit:""});
  function reading(v){
    const hs=hrStats(),gs=glucStats(),ca=condAverages(),d=drift();
    const pace=LAST?.km>0 && LAST?.elapsed_sec>0 ? LAST.elapsed_sec/LAST.km : null;

    const one=(value,unit="",context="",title)=> value==null || typeof value==='number'&&!Number.isFinite(value) ? null : {value,unit,context,title};
    switch(v){
      case "distance": {const km=E.ActivityTileDefaultsJs.shownValue(v,LAST?.km,finished());if(km==null)return null;const f=E.ShareCardsJs.formatDistance(sport(),km,false);return one(f.value,f.unit);}
      case "remainingDistance": return TOTKM>0 ? one(Math.max(0,TOTKM-(LAST?.km||0)).toFixed(2),"km") : null;
      case "currentPace": case "averagePace": case "currentSpeed": case "averageSpeed": {
        const p=v.startsWith("current")?currentPace():pace, speed=p?3600/p:null;
        if(E.ActivityTileDefaultsJs.shownValue(v,speed,finished())==null)return null;
        return one(G.formatted(v,speed),v.endsWith("Speed")?"km/h":"/km","",v==="currentPace"?"Last km":undefined);
      }
      case "heartRate": return one(LAST?.bpm,"bpm","","Heart rate now");
      case "averageHeartRate": return one(hs?.avg,"bpm",hs?"max "+hs.max:"");
      case "maximumHeartRate": return one(hs?.max,"bpm");
      case "cardiacDrift": return d.percent==null ? one(d.valueText||"Too short") : {...one(d.valueText.replace(/\s*%$/,""),"%",d.detailText),tint:"var(--drift)"};
      case "glucose": return one(gs?Math.round(gs.last):null,"mg/dL","","Glucose now");
      case "averageGlucose": return one(gs?Math.round(gs.avg):null,"mg/dL",gs?Math.round(gs.min)+"–"+Math.round(gs.max):"");
      case "minimumGlucose": return one(gs?Math.round(gs.min):null,"mg/dL");
      case "maximumGlucose": return one(gs?Math.round(gs.max):null,"mg/dL");
      case "temperature": return ca ? one(Math.round(ca.tempRange[0])+"–"+Math.round(ca.tempRange[1])+"° "+Math.round(ca.humid)+"%","","","Conditions") : null;
      case "averageTemperature": return one(ca?Math.round(ca.temp):null,"°");
      case "minimumTemperature": return one(ca?Math.round(ca.tempRange[0]):null,"°");
      case "maximumTemperature": return one(ca?Math.round(ca.tempRange[1]):null,"°");
      case "humidity": return one(condPoints().at(-1)?.humid,"%");
      case "averageHumidity": return one(ca?Math.round(ca.humid):null,"%");
      case "metresPerBeat": {
        const modality=TREADMILL?"run.treadmill":sport();
        const result=finished()?E.EfficiencyJs.finished(modality,LAST?.km,LAST?.elapsed_sec,hs?.avg??null,TREADMILL):
          E.EfficiencyJs.live(modality,E.DriftTrendJs.trace(hrPoints()).map(p=>({seconds:p.t,speedMps:p.speed==null?null:p.speed/3.6,heartRateBpm:p.bpm})),LAST?.elapsed_sec||0);
        return result?.state==="ready"?one(result.value.toFixed(2),E.EfficiencyJs.unit()):null;
      }
      case "energyBurned": return one(LAST?.energy?.kcal>0?Math.round(LAST.energy.kcal):null,"kcal");
      case "averageEnergyRate": return one(LAST?.energy?.kcal>0&&LAST.elapsed_sec>0?Math.round(LAST.energy.kcal*3600/LAST.elapsed_sec):null,"kcal/h");
      default: return null;
    }
  }
  let AVAIL="";
  function availability(){
    const ids=[];
    for(const g of Array.from(G.tileGroupsForModality(sport())))for(const v of Array.from(G.variantIDs(g)))if(reading(v) && (v!=="cardiacDrift" || hrPoints().length))ids.push(v);
    return G.tileAvailable(finished()?"summary.web":"live.web",sport(),ids.join(","));
  }
  function variant(slot){const i=SLOTS.indexOf(slot),saved=choices[slot];return saved && G.groupID(saved) ? (G.select(G.groupID(saved),saved,AVAIL)||defaults()[i]) : defaults()[i];}

  function tileHTML(slot, variant) {
    const group = G.groupID(variant), r = reading(variant) || missing();
    const faces = Array.from(G.availableVariants(group, AVAIL));
    const value = r.html || M.reading(r.value, r.unit, r.tint);
    return '<div class="tile measurement-tile metric-tile" data-metric-slot="' + slot + '" data-metric-group="' + group +
      '" tabindex="0" role="button" aria-label="' + esc(G.variantTitle(variant)) + '">' +
      '<div class="measurement-label"><span class="measurement-content">' + icon(ICONS[group], variant === "cardiacDrift" ? "drift" : ICON_CLASS[group]) +
      esc(r.title || G.tileTitle(variant)) + "</span></div>" +
      '<div class="measurement-value"><div class="measurement-content measurement-readings">' + value +
      window.Oxygon.faceDotsHTML(faces.length, faces.indexOf(variant)) + "</div></div>" +
      '<div class="measurement-context"><span class="measurement-content">' + esc(r.context || "") + "</span></div></div>";
  }

  function drawTiles() {
    loadChoices(); AVAIL=availability();
    const tiles = SLOTS.map(slot => tileHTML(slot, variant(slot)));
    // Approved phone 3×2; intermediate 2×3; desktop 1×6.
    const rows = '<div class="measurement-grid" data-fixed-columns="' + (innerWidth >= 1100 ? 6 : innerWidth >= 620 ? 3 : 2) + '">' + tiles.join("") + "</div>";
    let host = document.getElementById("oxm-tiles");
    if (!host) {
      host = document.createElement("div"); host.id = "oxm-tiles"; host.className = "oxm-app oxm-tiles";
      $("stats-primary").before(host);
    }
    $("stats-primary").style.display = "none"; $("stats-metrics").style.display = "none";
    host.innerHTML = rows;
    M.refresh(host);
    // Prefer the full range. Only fall back when the rendered line has no room.
    requestAnimationFrame(()=>host.querySelectorAll('[data-metric-slot]').forEach(tile=>{
      if(variant(tile.dataset.metricSlot)!=="temperature")return;
      const line=tile.querySelector('.measurement-readings'),ca=condAverages();
      if(ca && line && line.getBoundingClientRect().right > tile.getBoundingClientRect().right-20){
        line.querySelector('.measurement-number').textContent=Math.round(ca.temp)+"° "+Math.round(ca.humid)+"%";
        M.refresh(host);
      }
    }));
  }

  function openMenu(slot) {
    const tile = document.querySelector('[data-metric-slot="' + slot + '"]');
    closeMenu();
    const current = G.groupID(variant(slot));
    const node = document.createElement("div");
    node.className = "oxm-app menu calendar-context metric-group-menu";
    node.innerHTML = Array.from(G.tileGroupsForAvailability(sport(), AVAIL)).map(g =>
      '<button role="menuitem" data-metric-group="' + g + '"' + (g === current ? ' class="current"' : "") +
      (G.availableVariants(g, AVAIL).length ? "" : " disabled") + ">" +
      '<span class="menu-action-icon ' + g + '">' + icon(ICONS[g] || "#i-heart", g) + "</span>" + esc(G.groupTitle(g)) +
      (g === current ? '<span class="check">' + icon("#i-check") + "</span>" : "") + "</button>").join("");
    document.body.appendChild(node);
    const r = tile.getBoundingClientRect(), box = node.getBoundingClientRect();
    // Page coordinates, so a full-page capture keeps it beside the held tile.
    node.style.position = "absolute";
    node.style.zIndex = "1500";   // above Leaflet's panes and controls (400–1000)
    node.style.left = Math.max(8, Math.min(r.right - box.width, innerWidth - box.width - 8)) + scrollX + "px";
    node.style.top = r.bottom + 6 + scrollY + "px";
    node.addEventListener("click",e=>{const b=e.target.closest("button[data-metric-group]");if(!b||b.disabled)return;choices[slot]=G.select(b.dataset.metricGroup,variant(slot),AVAIL);save();closeMenu();drawTiles();});
    node.querySelector("button:not(:disabled)")?.focus();
  }

  // Chart: HR on, the drift drawn the way the finished chart draws it (course-card.js), labels in HTML because the
  // profile SVG is stretched (preserveAspectRatio="none").
  const baseDraw = window.drawProfile;
  window.drawProfile = function (km) {
    baseDraw(km);
    $("profile").parentElement.querySelectorAll(".oxm-drift-label").forEach(n=>n.remove());
    if (!SHOW.hr || !PLAN || !LAST) return;
    const d = drift(), svg = $("profile"), W = 1000, H = 150, pad = 14;
    const hp = hrPoints(), kmAt = t => { const p = hp.find(h => h.t >= t) || hp.at(-1); return p.km; };
    const X = t => clamp((timeAxis()?t:kmAt(t)) / Math.max(axisMax(), 1e-6), 0, 1) * W;
    const r = autoRange("hr"), Y = v => H - pad - clamp((v - r[0]) / (r[1] - r[0]), 0, 1) * (H - 2 * pad);
    let shade = "", body = "", labels = "";
    (PLAN?.driftContext ? d.excluded || [] : []).forEach(x => {
      const a = X(x.start), b = X(x.end); if (!(b > a)) return;
      shade += `<rect x="${a}" y="0" width="${b - a}" height="${H}" fill="var(--text)" opacity=".08"/>`;
      const label = E.DriftTrendJs.excludedLabel(x.reason);
      if (label) labels += `<span class="oxm-drift-label" style="${x.reason === "coolDown" ? "right:" + (100 - b / 10) : "left:" + a / 10}%">${esc(label)}</span>`;
    });
    if (d.line && d.line.length === 2) body += `<path d="M${X(d.line[0].t)} ${Y(d.line[0].bpm)} L${X(d.line[1].t)} ${Y(d.line[1].bpm)}" stroke="var(--drift)" stroke-width="2.5" fill="none" vector-effect="non-scaling-stroke"/>`;
    (d.points || []).forEach(p => { body += `<circle data-drift-rep cx="${X(p.t)}" cy="${Y(p.bpm)}" r="3" fill="var(--drift)"/>`; });
    svg.insertAdjacentHTML("afterbegin", shade); svg.insertAdjacentHTML("beforeend", body);
    const wrap = svg.parentElement;
    wrap.querySelectorAll(".oxm-drift-label").forEach(n => n.remove());
    wrap.insertAdjacentHTML("beforeend", labels);
  };


  function closeMenu(){document.querySelectorAll(".metric-group-menu").forEach(n=>n.remove());}
  let hold=null, held=false, start=null;
  document.addEventListener("pointerdown",e=>{const tile=e.target.closest("[data-metric-slot]");if(!tile){if(!e.target.closest(".metric-group-menu"))closeMenu();return;}held=false;start=[e.clientX,e.clientY];hold=setTimeout(()=>{held=true;openMenu(tile.dataset.metricSlot);},500);});
  document.addEventListener("pointermove",e=>{if(start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])>10)clearTimeout(hold);});
  for(const event of ["pointerup","pointercancel"])document.addEventListener(event,()=>{clearTimeout(hold);start=null;});
  document.addEventListener("contextmenu",e=>{const t=e.target.closest("[data-metric-slot]");if(t){e.preventDefault();clearTimeout(hold);held=true;openMenu(t.dataset.metricSlot);}});
  document.addEventListener("click",e=>{const t=e.target.closest("[data-metric-slot]");if(!t)return;if(held){held=false;return;}const slot=t.dataset.metricSlot,faces=Array.from(G.availableVariants(G.groupID(variant(slot)),AVAIL));if(faces.length){choices[slot]=G.next(variant(slot),AVAIL);save();drawTiles();}});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu();const t=e.target.closest("[data-metric-slot]");if(t&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openMenu(t.dataset.metricSlot);}});
  addEventListener("resize",()=>{closeMenu();if(PLAN&&LAST)drawTiles();});
  const baseRender=window.render;
  window.render=function(){baseRender();if(PLAN&&LAST)drawTiles();};
  if(PLAN&&LAST)render();
})();
