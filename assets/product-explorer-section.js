(function () {
  "use strict";

  var SOURCE_URL = "product-explorer-fullbleed-preview.html?v=20260804-centered2";
  var LEGACY_IDS = ["features", "crew", "tools", "races"];
  var PANEL_FOR_HASH = {
    "#features": 1,
    "#coach-devices": 0,
    "#crew": 4,
    "#tools": 3,
    "#races": 2
  };
  var ELEMENT_NAME = "oxygon-product-explorer";
  var LEGACY_STYLE_ID = "oxygon-product-explorer-legacy-styles";

  var sourcePromise = window.fetch(SOURCE_URL, { credentials: "same-origin" })
    .then(function (response) {
      if (!response.ok) throw new Error("Product Explorer source returned " + response.status);
      return response.text();
    })
    .then(function (html) {
      var parsed = new DOMParser().parseFromString(html, "text/html");
      var sourceStyle = parsed.querySelector("head style");
      var story = parsed.querySelector(".story");
      var dialog = parsed.querySelector(".telemetry-dialog");
      if (!sourceStyle || !story || !dialog) throw new Error("Product Explorer source is incomplete");
      return { style: sourceStyle.textContent, story: story, dialog: dialog };
    });

  function storyTop(story) {
    return story.getBoundingClientRect().top + window.scrollY;
  }

  function ensureLegacyStyles() {
    if (document.getElementById(LEGACY_STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = LEGACY_STYLE_ID;
    style.textContent =
      "#legacy-features,#legacy-crew,#legacy-tools,#legacy-races{display:none!important}";
    document.head.appendChild(style);
  }

  function wireExplorer(root, host) {
    var story = root.getElementById("story");
    var panels = Array.prototype.slice.call(root.querySelectorAll(".panel"));
    var tabs = Array.prototype.slice.call(root.querySelectorAll(".tab"));
    var progressCount = root.querySelector(".progress-count");
    var navCount = root.querySelector(".nav-count");
    var fill = root.querySelector(".progress-fill");
    var previous = root.querySelector(".previous");
    var next = root.querySelector(".next");
    var toolPickers = Array.prototype.slice.call(root.querySelectorAll(".tool-picker"));
    var toolImages = Array.prototype.slice.call(root.querySelectorAll(".tool-image"));
    var activityCopies = Array.prototype.slice.call(root.querySelectorAll(".activity-copy-panel"));
    var activitySteps = Array.prototype.slice.call(root.querySelectorAll(".activity-step"));
    var activityScreens = Array.prototype.slice.call(root.querySelectorAll(".activity-screen"));
    var activityPeekScreens = Array.prototype.slice.call(root.querySelectorAll(".activity-peek-screen"));
    var activityPrevious = root.querySelector(".activity-previous");
    var activityNext = root.querySelector(".activity-next");
    var activityCurrentLabel = root.querySelector(".activity-current");
    var activityScrollHint = root.querySelector(".activity-scroll-hint");
    var activityVisual = root.querySelector(".activities-visual");
    var activityDevice = root.querySelector(".activity-device");
    var telemetryLaunch = root.querySelector(".telemetry-window");
    var telemetryDialog = root.getElementById("telemetry-dialog");
    var telemetryFrame = root.querySelector(".telemetry-frame");
    var telemetryClose = root.querySelector(".dialog-close");
    var current = 0;
    var activityCurrent = 0;
    var ticking = false;
    var telemetryPrepared = false;
    var panelCount = panels.length;
    var activityPanelIndex = panels.findIndex(function (panel) {
      return panel.getAttribute("aria-label") === "Activities";
    });
    var scrollMomentCount = activitySteps.length + panelCount - 1;
    var programmaticPanel = null;
    var panelScrollTimer = 0;

    function label(index) {
      return String(index + 1).padStart(2, "0") + " / " + String(panelCount).padStart(2, "0");
    }

    function momentForPanel(index) {
      if (index < activityPanelIndex) return index;
      if (index === activityPanelIndex) return activityPanelIndex;
      return index + activitySteps.length - 1;
    }

    function scrollToMoment(moment) {
      var range = story.offsetHeight - window.innerHeight;
      var target = storyTop(story) + range * ((moment + 0.5) / scrollMomentCount);
      programmaticPanel = current;
      window.clearTimeout(panelScrollTimer);
      window.scrollTo({
        top: target,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
      panelScrollTimer = window.setTimeout(function () {
        programmaticPanel = null;
        updateFromScroll();
      }, 900);
    }

    function setPanel(index, updateScroll) {
      current = Math.max(0, Math.min(panelCount - 1, index));
      panels.forEach(function (panel, panelIndex) {
        panel.classList.toggle("active", panelIndex === current);
      });
      tabs.forEach(function (tab, tabIndex) {
        tab.setAttribute("aria-selected", String(tabIndex === current));
      });
      progressCount.textContent = label(current);
      navCount.textContent = label(current);
      fill.style.transform = "translate3d(0," + (current * 100) + "%,0)";
      previous.disabled = current === 0;
      next.disabled = current === panelCount - 1;
      if (updateScroll) scrollToMoment(momentForPanel(current));
    }

    function setActivityStep(index) {
      activityCurrent = Math.max(0, Math.min(activitySteps.length - 1, index));
      activityCopies.forEach(function (copy, copyIndex) {
        copy.classList.toggle("active", copyIndex === activityCurrent);
      });
      activityScreens.forEach(function (screen, screenIndex) {
        screen.classList.toggle("active", screenIndex === activityCurrent);
        screen.classList.toggle("before", screenIndex < activityCurrent);
      });
      var peekIndex = activityCurrent === activitySteps.length - 1
        ? activityCurrent - 1
        : activityCurrent + 1;
      activityPeekScreens.forEach(function (screen, screenIndex) {
        screen.classList.toggle("active", screenIndex === peekIndex);
      });
      activitySteps.forEach(function (step, stepIndex) {
        step.setAttribute("aria-selected", String(stepIndex === activityCurrent));
      });
      activityPrevious.disabled = activityCurrent === 0;
      activityNext.disabled = activityCurrent === activitySteps.length - 1;
      activityCurrentLabel.textContent = String(activityCurrent + 1).padStart(2, "0");
      activityScrollHint.textContent = activityCurrent === activitySteps.length - 1
        ? "Scroll to Library"
        : "Scroll to continue";
    }

    function updateFromScroll() {
      if (programmaticPanel !== null) {
        setPanel(programmaticPanel, false);
        ticking = false;
        return;
      }
      var range = story.offsetHeight - window.innerHeight;
      var progress = Math.max(0, Math.min(1, (window.scrollY - storyTop(story)) / Math.max(1, range)));
      var moment = Math.min(scrollMomentCount - 1, Math.floor(progress * scrollMomentCount));
      if (moment < activityPanelIndex) {
        setPanel(moment, false);
      } else if (moment < activityPanelIndex + activitySteps.length) {
        setActivityStep(moment - activityPanelIndex);
        setPanel(activityPanelIndex, false);
      } else {
        setPanel(moment - activitySteps.length + 1, false);
      }
      ticking = false;
    }

    function navigateActivity(index) {
      setActivityStep(index);
      setPanel(activityPanelIndex, false);
      scrollToMoment(activityPanelIndex + activityCurrent);
    }

    function onWindowScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateFromScroll);
    }
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var index = Number(tab.dataset.index);
        if (index === activityPanelIndex) setActivityStep(0);
        setPanel(index, true);
      });
    });
    previous.addEventListener("click", function () { setPanel(current - 1, true); });
    next.addEventListener("click", function () { setPanel(current + 1, true); });
    activitySteps.forEach(function (step) {
      step.addEventListener("click", function () {
        navigateActivity(Number(step.dataset.activityStep));
      });
    });
    activityPrevious.addEventListener("click", function () { navigateActivity(activityCurrent - 1); });
    activityNext.addEventListener("click", function () { navigateActivity(activityCurrent + 1); });

    activityVisual.addEventListener("pointermove", function (event) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 851) return;
      var rect = activityVisual.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      activityDevice.style.setProperty("--activity-tilt-y", (x * 5) + "deg");
      activityDevice.style.setProperty("--activity-tilt-x", (y * -4) + "deg");
    });
    activityVisual.addEventListener("pointerleave", function () {
      activityDevice.style.setProperty("--activity-tilt-y", "0deg");
      activityDevice.style.setProperty("--activity-tilt-x", "0deg");
    });

    toolPickers.forEach(function (picker) {
      picker.addEventListener("click", function () {
        var selected = Number(picker.dataset.tool);
        toolPickers.forEach(function (item, index) {
          item.setAttribute("aria-pressed", String(index === selected));
        });
        toolImages.forEach(function (image, index) {
          image.classList.toggle("active", index === selected);
        });
      });
    });

    function prepareTelemetryFrame() {
      if (telemetryPrepared) return;
      var attempts = 0;
      var timer = window.setInterval(function () {
        attempts += 1;
        var frameDocument;
        try { frameDocument = telemetryFrame.contentDocument; } catch (error) { frameDocument = null; }
        var telemetryApp = frameDocument && frameDocument.getElementById("app");
        if (!telemetryApp || telemetryApp.classList.contains("hidden")) {
          if (attempts > 120) window.clearInterval(timer);
          return;
        }

        if (!frameDocument.getElementById("telemetry-embed-styles")) {
          var style = frameDocument.createElement("style");
          style.id = "telemetry-embed-styles";
          style.textContent =
            "html,body{min-height:100%!important;overflow-x:hidden!important;background:var(--bg)!important}" +
            "html{scrollbar-color:var(--line) var(--bg);scrollbar-width:thin}" +
            ".wrap{padding-top:24px!important}.adminbar{display:none!important}" +
            ".telemetry-embed-close{position:fixed;top:20px;right:24px;z-index:3500;border:1px solid var(--line);background:var(--card);color:var(--text);font:700 12px/1 inherit;padding:8px 12px;border-radius:999px;cursor:pointer}" +
            ".telemetry-embed-close:hover{border-color:var(--accent);background:var(--card2)}" +
            ".telemetry-embed-close:focus-visible{outline:2px solid var(--accent);outline-offset:2px}" +
            "@media(max-width:820px){.telemetry-embed-close{position:static;margin-left:0}}";
          frameDocument.head.appendChild(style);
        }

        window.clearInterval(timer);
        telemetryPrepared = true;
      }, 100);
    }

    telemetryFrame.addEventListener("load", prepareTelemetryFrame);
    telemetryLaunch.addEventListener("click", function () {
      if (!telemetryFrame.getAttribute("src")) telemetryFrame.setAttribute("src", telemetryFrame.dataset.src);
      telemetryDialog.showModal();
      telemetryDialog.focus({ preventScroll: true });
      prepareTelemetryFrame();
    });
    telemetryClose.addEventListener("click", function () { telemetryDialog.close(); });
    telemetryDialog.addEventListener("click", function (event) {
      if (event.target === telemetryDialog) telemetryDialog.close();
    });

    function onWindowResize() { setPanel(current, false); }
    window.addEventListener("resize", onWindowResize);

    host.goToPanel = function (index) {
      if (index === activityPanelIndex) setActivityStep(0);
      setPanel(index, true);
    };
    host.getExplorerState = function () {
      return { panel: current, activityStep: activityCurrent };
    };

    setActivityStep(0);
    setPanel(0, false);
    updateFromScroll();

    return function () {
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("resize", onWindowResize);
      window.clearTimeout(panelScrollTimer);
    };
  }

  function bindMainNavigation() {
    function navigateToHash(hash) {
      var activeHost = document.querySelector(ELEMENT_NAME);
      if (!activeHost || typeof activeHost.goToPanel !== "function") return false;
      activeHost.goToPanel(PANEL_FOR_HASH[hash]);
      return true;
    }

    if (!document.__oxygonProductExplorerNavigationBound) {
      document.__oxygonProductExplorerNavigationBound = true;
      document.addEventListener("click", function (event) {
        var link = event.target && event.target.closest
          ? event.target.closest("a[href]")
          : null;
        if (!link) return;
        var hash = link.getAttribute("href");
        if (PANEL_FOR_HASH[hash] === undefined) return;
        event.preventDefault();
        event.stopPropagation();
        if (!navigateToHash(hash)) return;
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", hash);
        }
      }, true);
    }

    if (PANEL_FOR_HASH[window.location.hash] !== undefined) {
      window.setTimeout(function () {
        navigateToHash(window.location.hash);
      }, 80);
    }
  }

  function defineExplorerElement(source) {
    if (window.customElements.get(ELEMENT_NAME)) return;
    window.customElements.define(ELEMENT_NAME, class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return;
        var root = this.attachShadow({ mode: "open" });
        var style = document.createElement("style");
        style.textContent =
          ":host{display:block;min-width:0;color-scheme:dark;--ox-bg:#0b0f19;--ox-text:#fff;--ox-muted:rgba(235,235,245,.64);--ox-quiet:rgba(235,235,245,.38);--ox-line:rgba(84,84,88,.48);--ox-blue:#0a84ff;--ox-green:#30d158;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}" +
          source.style +
          ".showcase{background:rgba(9,13,22,.14)!important}" +
          ".showcase::before{background:radial-gradient(circle at 80% 35%,rgba(10,132,255,.1),transparent 34%),linear-gradient(115deg,rgba(10,15,25,.3) 0%,rgba(16,23,37,.2) 48%,rgba(9,13,22,.34) 100%)!important}" +
          ".dialog-header{position:absolute!important;top:20px;right:24px;z-index:40;display:flex!important;pointer-events:none}" +
          ".dialog-header>:not(.dialog-close){display:none!important}" +
          ".dialog-close{position:static!important;display:inline-flex!important;align-items:center;justify-content:center;min-height:34px;padding:8px 12px!important;border:1px solid rgba(255,255,255,.18)!important;border-radius:999px!important;color:#fff!important;background:rgba(17,23,34,.92)!important;box-shadow:0 8px 24px rgba(0,0,0,.3);font:700 12px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;cursor:pointer;pointer-events:auto;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}" +
          ".dialog-close:hover{border-color:rgba(10,132,255,.7)!important;background:rgba(28,36,48,.96)!important}" +
          "@media(max-width:600px){.dialog-header{top:12px;right:12px}}";
        root.appendChild(style);
        root.appendChild(document.importNode(source.story, true));
        root.appendChild(document.importNode(source.dialog, true));
        root.querySelector(".dialog-close").textContent = "Close";
        this.__explorerCleanup = wireExplorer(root, this);
      }

      disconnectedCallback() {
        if (typeof this.__explorerCleanup === "function") this.__explorerCleanup();
        this.__explorerCleanup = null;
      }
    });
  }

  function createHost() {
    var host = document.createElement(ELEMENT_NAME);
    host.id = "features";
    host.className = "ox-product-explorer-section";
    host.setAttribute("aria-label", "Explore Oxygon features");
    return host;
  }

  function mount(source) {
    if (document.querySelector(".ox-product-explorer-section")) return true;
    var legacyFeatures = document.getElementById("features");
    if (!legacyFeatures || !legacyFeatures.parentElement) return false;
    ensureLegacyStyles();

    var legacySections = {};
    LEGACY_IDS.forEach(function (id) {
      var section = document.getElementById(id);
      if (!section) return;
      legacySections[id] = section;
      section.id = "legacy-" + id;
    });

    var host = createHost();
    legacyFeatures.parentElement.insertBefore(host, legacyFeatures);

    LEGACY_IDS.forEach(function (id) {
      var section = legacySections[id];
      if (!section) return;
      section.hidden = true;
      section.setAttribute("aria-hidden", "true");
      section.style.setProperty("display", "none", "important");
    });

    bindMainNavigation();
    return true;
  }

  sourcePromise.then(function (source) {
    defineExplorerElement(source);
    if (mount(source)) return;
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (mount(source) || attempts > 160) window.clearInterval(timer);
    }, 100);
  }).catch(function (error) {
    console.warn("[Oxygon] Product Explorer integration unavailable; keeping legacy sections.", error);
  });
})();
