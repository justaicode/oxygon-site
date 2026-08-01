(function () {
  "use strict";

  var STYLE_ID = "oxygon-page-parallax-styles";
  var LAYERS = [
    { name: "far", src: "assets/img/oxygon-parallax-far.webp", pointerX: -0.5, pointerY: -0.35, scrollY: 2, scale: 1.01 },
    { name: "mid", src: "assets/img/oxygon-parallax-mid.webp", pointerX: 1.5, pointerY: 0.9, scrollY: 5, scale: 1.02 },
    { name: "foreground", src: "assets/img/oxygon-parallax-foreground.webp", pointerX: 3.5, pointerY: 2, scrollY: 9, scale: 1.035 }
  ];
  var MOBILE_STATIC_LAYER = {
    name: "mobile-static",
    src: "assets/img/oxygon-parallax-mobile-static.webp",
    pointerX: 0,
    pointerY: 0,
    scrollY: 0,
    scale: 1.02
  };
  var VIDEO = {
    desktop: {
      webm: "assets/video/ridge-web.webm?v=r11",
      mp4: "assets/video/ridge-web.mp4?v=r11"
    },
    mobile: {
      webm: "assets/video/ridge-mobile.webm?v=r11",
      mp4: "assets/video/ridge-mobile.mp4?v=r11"
    }
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");
  var mobileViewport = window.matchMedia("(max-width: 767px)");
  var tabletViewport = window.matchMedia("(max-width: 1023px)");
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  var scene = null;
  var sceneShell = null;
  var sceneMode = "";
  var renderedLayers = [];
  var pointerX = 0;
  var pointerY = 0;
  var scrollDepth = -1;
  var currentX = 0;
  var currentY = 0;
  var currentScroll = -1;
  var frame = 0;
  var listenersAttached = false;
  var lastObservedScrollY = -1;
  var scrollTimer = 0;

  function addStyles() {
    if (!document.head || document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "html{overflow-x:clip}" +
      ".ox-page-shell{background:transparent!important;isolation:isolate}" +
      ".ox-page-shell>:not(.ox-page-parallax){position:relative;z-index:1}" +
      ".ox-page-parallax{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:#0B0F19}" +
      ".ox-page-parallax-layer{position:absolute;inset:-8%;width:116%;height:116%;object-fit:cover;object-position:center;transform-origin:center;will-change:transform;user-select:none;-webkit-user-drag:none}" +
      ".ox-page-parallax-layer--far{opacity:.5}" +
      ".ox-page-parallax-layer--mid{opacity:.16}" +
      ".ox-page-parallax-layer--foreground{opacity:.1}" +
      ".ox-page-parallax-layer--mobile-static{opacity:.48;will-change:auto}" +
      ".ox-page-parallax-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,15,25,.34),rgba(11,15,25,.18) 52%,rgba(11,15,25,.3)),linear-gradient(180deg,rgba(11,15,25,.2),rgba(11,15,25,.4))}" +
      "#top>.ox-hero-screenshot-target,#top>div[style*=\"justify-self:center\"]{width:292px!important;height:auto!important;aspect-ratio:1320/2868;background:url(\"assets/site/live-activity-sensors-iphone-optimized.webp\") center/100% 100% no-repeat!important;border-radius:38px;overflow:visible;border:1px solid rgba(84,84,88,.6);box-shadow:0 40px 80px rgba(0,0,0,.55);perspective:900px;transform-style:preserve-3d}" +
      "#top>.ox-hero-screenshot-target>:first-child,#top>div[style*=\"justify-self:center\"]>:first-child{display:none!important}" +
      "#top>.ox-hero-screenshot-target>:not(:first-child),#top>div[style*=\"justify-self:center\"]>:not(:first-child){display:block!important;pointer-events:auto!important;will-change:transform;transform-style:preserve-3d;cursor:default;transition:border-color .25s ease,box-shadow .25s ease}" +
      "#top>.ox-hero-screenshot-target>:nth-child(2){left:-118px!important;right:auto!important;top:165px!important;bottom:auto!important}" +
      "#top>.ox-hero-screenshot-target>:nth-child(3){left:-104px!important;right:auto!important;top:auto!important;bottom:70px!important}" +
      "#top>.ox-hero-screenshot-target>:nth-child(4){left:auto!important;right:-88px!important;top:125px!important;bottom:auto!important}" +
      "#top>.ox-hero-screenshot-target>.ox-next-fuel-card{position:absolute;left:auto!important;right:-112px!important;top:auto!important;bottom:88px!important;min-width:112px;background:#212630;border:1px solid rgba(84,84,88,.6);border-radius:14px;padding:10px 14px;box-shadow:0 16px 40px rgba(0,0,0,.5);font-variant-numeric:tabular-nums}" +
      ".ox-next-fuel-label{color:#FF8A1F;font-size:10px;font-weight:800;letter-spacing:.09em;white-space:nowrap}" +
      ".ox-next-fuel-value{margin-top:2px;color:#fff;font-size:25px;font-weight:800;line-height:1}" +
      ".ox-next-fuel-value span{margin-left:4px;color:rgba(235,235,245,.56);font-size:12px;font-weight:650}" +
      ".ox-next-fuel-detail{margin-top:5px;color:rgba(235,235,245,.48);font-size:9px;font-weight:600;white-space:nowrap}" +
      "#top>.ox-hero-screenshot-target>:nth-child(2),#top>.ox-hero-screenshot-target>:nth-child(3){animation:oxMetricFloatLeft 6.5s ease-in-out infinite!important;transform-origin:right center}" +
      "#top>.ox-hero-screenshot-target>:nth-child(3){animation-delay:-2.4s!important}" +
      "#top>.ox-hero-screenshot-target>:nth-child(4),#top>.ox-hero-screenshot-target>:nth-child(5){animation:oxMetricFloatRight 7s ease-in-out -4s infinite!important;transform-origin:left center}" +
      "#top>.ox-hero-screenshot-target>:nth-child(5){animation-delay:-1.6s!important}" +
      "@keyframes oxMetricFloatLeft{0%,100%{transform:translate3d(0,0,22px) rotateY(7deg)}50%{transform:translate3d(0,-8px,28px) rotateY(5deg)}}" +
      "@keyframes oxMetricFloatRight{0%,100%{transform:translate3d(0,0,22px) rotateY(-7deg)}50%{transform:translate3d(0,-8px,28px) rotateY(-5deg)}}" +
      "@keyframes oxMetricHoverLeft{from{transform:translate3d(2px,-2px,30px) rotateY(6deg) scale(1)}to{transform:translate3d(13px,-2px,48px) rotateY(-2deg) scale(1.035)}}" +
      "@keyframes oxMetricHoverRight{from{transform:translate3d(-2px,-2px,30px) rotateY(-6deg) scale(1)}to{transform:translate3d(-13px,-2px,48px) rotateY(2deg) scale(1.035)}}" +
      "@media(hover:hover) and (pointer:fine){#top>.ox-hero-screenshot-target>:nth-child(2):hover,#top>.ox-hero-screenshot-target>:nth-child(3):hover{animation:oxMetricHoverLeft .8s ease-in-out infinite alternate!important;border-color:rgba(10,132,255,.7)!important;box-shadow:0 20px 48px rgba(0,0,0,.58),0 0 24px rgba(10,132,255,.13)!important}#top>.ox-hero-screenshot-target>:nth-child(4):hover,#top>.ox-hero-screenshot-target>:nth-child(5):hover{animation:oxMetricHoverRight .8s ease-in-out infinite alternate!important;border-color:rgba(10,132,255,.7)!important;box-shadow:0 20px 48px rgba(0,0,0,.58),0 0 24px rgba(10,132,255,.13)!important}}" +
      "@media(max-width:767px){.ox-page-parallax-layer{inset:-12%;width:124%;height:124%;object-position:58% center}.ox-page-parallax-layer--far{opacity:.44}.ox-page-parallax-layer--mid{opacity:.13}.ox-page-parallax-layer--foreground{opacity:.08}.ox-page-parallax-shade{background:rgba(11,15,25,.42)}#top>.ox-hero-screenshot-target,#top>div[style*=\"justify-self:center\"]{width:76vw!important}#top>.ox-hero-screenshot-target>:not(:first-child),#top>div[style*=\"justify-self:center\"]>:not(:first-child){display:none!important}}" +
      "@media(prefers-reduced-motion:reduce){.ox-page-parallax-layer{will-change:auto}#top>.ox-hero-screenshot-target>:not(:first-child){animation:none!important;transform:translateZ(18px)!important}}";
    document.head.appendChild(style);
  }

  function shouldSaveData() {
    return !!(connection && connection.saveData);
  }

  function getSceneMode() {
    if (reduceMotion.matches || shouldSaveData() || mobileViewport.matches) return "static";
    if (tabletViewport.matches) return "tablet";
    return "desktop";
  }

  function getLayerConfigs(mode) {
    if (mode === "static") return [MOBILE_STATIC_LAYER];
    if (mode === "tablet") {
      return [
        { name: "far", src: LAYERS[0].src, pointerX: 0, pointerY: 0, scrollY: 1.5, scale: 1.01 },
        { name: "mid", src: LAYERS[1].src, pointerX: 0, pointerY: 0, scrollY: 3, scale: 1.015 }
      ];
    }
    return LAYERS;
  }

  function createPageScene(shell) {
    var wrapper = document.createElement("div");
    wrapper.className = "ox-page-parallax ox-page-parallax--" + sceneMode;
    wrapper.setAttribute("aria-hidden", "true");

    renderedLayers = getLayerConfigs(sceneMode).map(function (config, index) {
      var image = document.createElement("img");
      image.className = "ox-page-parallax-layer ox-page-parallax-layer--" + config.name;
      image.src = config.src;
      image.alt = "";
      image.decoding = "async";
      image.draggable = false;
      if (index === 0) {
        image.loading = "eager";
        image.setAttribute("fetchpriority", "high");
      }
      wrapper.appendChild(image);
      return { element: image, config: config };
    });

    var shade = document.createElement("div");
    shade.className = "ox-page-parallax-shade";
    wrapper.appendChild(shade);
    shell.insertBefore(wrapper, shell.firstChild);
    return wrapper;
  }

  function rebuildPageScene() {
    if (!sceneShell || !sceneShell.isConnected) return;
    if (scene && scene.isConnected) scene.remove();
    renderedLayers = [];
    currentX = 0;
    currentY = 0;
    currentScroll = sceneMode === "static" ? 0 : -1;
    scene = createPageScene(sceneShell);
  }

  function setVideoSources(video) {
    if (reduceMotion.matches || shouldSaveData()) {
      if (video.__oxygonPlayTimer) window.clearInterval(video.__oxygonPlayTimer);
      video.__oxygonPlayTimer = 0;
      video.__oxygonVideoMode = "static";
      video.pause();
      while (video.firstChild) video.removeChild(video.firstChild);
      video.removeAttribute("src");
      video.preload = "none";
      video.style.display = "none";
      video.load();
      return;
    }

    var mode = tabletViewport.matches ? "mobile" : "desktop";
    if (video.__oxygonVideoMode === mode) return;
    video.__oxygonVideoMode = mode;

    while (video.firstChild) video.removeChild(video.firstChild);
    var sources = VIDEO[mode];
    [
      { src: sources.webm, type: "video/webm" },
      { src: sources.mp4, type: "video/mp4" }
    ].forEach(function (sourceData) {
      var source = document.createElement("source");
      source.src = sourceData.src;
      source.type = sourceData.type;
      video.appendChild(source);
    });

    video.style.display = "block";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.addEventListener("canplay", function () { playVideo(video); }, { once: true });
    video.load();
    playVideo(video);
    if (video.__oxygonPlayTimer) window.clearInterval(video.__oxygonPlayTimer);
    var playAttempts = 0;
    video.__oxygonPlayTimer = window.setInterval(function () {
      playAttempts += 1;
      if (!video.isConnected || reduceMotion.matches || !video.paused || playAttempts > 20) {
        window.clearInterval(video.__oxygonPlayTimer);
        video.__oxygonPlayTimer = 0;
        return;
      }
      playVideo(video);
    }, 250);
  }

  function configureHeroScreenshot(hero) {
    var wrapper = Array.prototype.find.call(hero.children, function (child) {
      return child.style && child.style.justifySelf === "center" && !child.querySelector("h1");
    });
    if (!wrapper) return;
    if (!wrapper.querySelector(".ox-next-fuel-card")) {
      var nextFuel = document.createElement("div");
      nextFuel.className = "ox-next-fuel-card";
      var label = document.createElement("div");
      label.className = "ox-next-fuel-label";
      label.textContent = "NEXT FUEL";
      var value = document.createElement("div");
      value.className = "ox-next-fuel-value";
      value.appendChild(document.createTextNode("12"));
      var unit = document.createElement("span");
      unit.textContent = "min";
      value.appendChild(unit);
      var detail = document.createElement("div");
      detail.className = "ox-next-fuel-detail";
      detail.textContent = "45 g carbs · 250 ml";
      nextFuel.appendChild(label);
      nextFuel.appendChild(value);
      nextFuel.appendChild(detail);
      wrapper.appendChild(nextFuel);
    }
    wrapper.classList.add("ox-hero-screenshot-target");
    wrapper.setAttribute("role", "img");
    wrapper.setAttribute(
      "aria-label",
      /\/el\.html$/.test(window.location.pathname)
        ? "Ζωντανή δραστηριότητα Oxygon με παλμούς, γλυκόζη, συνθήκες, επόμενο σταθμό και επόμενη τροφοδοσία"
        : "Oxygon live activity with heart rate, glucose, conditions, next checkpoint and next fuel"
    );
  }

  function playVideo(video) {
    if (reduceMotion.matches || shouldSaveData()) return;
    var playback = video.play();
    if (playback && playback.catch) playback.catch(function () {});
  }

  function attachListeners(shell) {
    if (listenersAttached) return;
    listenersAttached = true;
    shell.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    document.addEventListener("scroll", updateScroll, { passive: true, capture: true });
    document.documentElement.addEventListener("mouseleave", resetPointer, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    if (mobileViewport.addEventListener) mobileViewport.addEventListener("change", handleViewportChange);
    else if (mobileViewport.addListener) mobileViewport.addListener(handleViewportChange);
    if (tabletViewport.addEventListener) tabletViewport.addEventListener("change", handleViewportChange);
    else if (tabletViewport.addListener) tabletViewport.addListener(handleViewportChange);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", handleViewportChange);
    else if (reduceMotion.addListener) reduceMotion.addListener(handleViewportChange);
    if (connection && connection.addEventListener) connection.addEventListener("change", handleViewportChange);
    scrollTimer = window.setInterval(function () {
      if (window.scrollY === lastObservedScrollY) return;
      lastObservedScrollY = window.scrollY;
      updateScroll();
    }, 200);
  }

  function mount() {
    var hero = document.getElementById("top");
    if (!hero || !hero.parentElement) return false;

    addStyles();
    var shell = hero.parentElement;
    shell.classList.add("ox-page-shell");
    sceneShell = shell;
    sceneMode = getSceneMode();
    scene = shell.querySelector(".ox-page-parallax") || createPageScene(shell);
    attachListeners(shell);
    configureHeroScreenshot(hero);

    var video = hero.querySelector("video");
    if (video) setVideoSources(video);
    updateScroll();
    scheduleRender();
    return true;
  }

  function updatePointer(event) {
    if (sceneMode !== "desktop" || !finePointer.matches || reduceMotion.matches) return;
    pointerX = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    pointerY = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    scheduleRender();
  }

  function resetPointer() {
    pointerX = 0;
    pointerY = 0;
    scheduleRender();
  }

  function updateScroll() {
    if (sceneMode === "static" || reduceMotion.matches) {
      scrollDepth = 0;
      return;
    }

    var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollDepth = Math.max(-1, Math.min(1, (window.scrollY / maxScroll) * 2 - 1));
    scheduleRender();
  }

  function scheduleRender() {
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  function render() {
    frame = 0;
    if (!scene || !scene.isConnected) return;

    if (sceneMode === "static" || reduceMotion.matches) {
      currentX = currentY = currentScroll = pointerX = pointerY = scrollDepth = 0;
    } else {
      currentX += (pointerX - currentX) * 0.03;
      currentY += (pointerY - currentY) * 0.03;
      currentScroll += (scrollDepth - currentScroll) * 0.025;
    }

    renderedLayers.forEach(function (layer) {
      var config = layer.config;
      var x = currentX * config.pointerX;
      var y = currentY * config.pointerY + currentScroll * config.scrollY;
      layer.element.style.transform =
        "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) scale(" + config.scale + ")";
    });

    var unsettled =
      Math.abs(pointerX - currentX) +
      Math.abs(pointerY - currentY) +
      Math.abs(scrollDepth - currentScroll);
    if (sceneMode !== "static" && !reduceMotion.matches && unsettled > 0.002) scheduleRender();
  }

  function handleViewportChange() {
    var nextSceneMode = getSceneMode();
    if (nextSceneMode !== sceneMode) {
      sceneMode = nextSceneMode;
      rebuildPageScene();
    }
    resetPointer();
    var heroVideo = document.querySelector("#top video");
    if (heroVideo) setVideoSources(heroVideo);
    updateScroll();
  }

  if (!mount()) {
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (mount() || attempts > 120) window.clearInterval(timer);
    }, 100);
  }
})();
