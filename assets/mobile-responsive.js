(function () {
  "use strict";

  var STYLE_ID = "oxygon-mobile-responsive-styles";
  var MENU_ID = "oxygon-mobile-menu";

  function addStyles() {
    if (!document.head || document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      ".ox-menu-toggle{display:none}" +
      ".ox-mobile-menu{display:none}" +
      "@media(max-width:1023px){" +
        "html,body,#dc-root,.sc-host,.ox-page-shell{width:100%;max-width:100%;overflow-x:clip!important}" +
        ".ox-page-shell,.ox-page-shell *{box-sizing:border-box}" +
        "nav.ox-responsive-nav{padding:11px 18px!important;gap:10px!important;min-height:58px;width:100%;max-width:100%;justify-content:flex-start}" +
        "nav.ox-responsive-nav>.ox-nav-links{display:none!important}" +
        "nav.ox-responsive-nav>.ox-nav-actions{margin-left:auto!important;gap:8px!important}" +
        "nav.ox-responsive-nav>.ox-nav-actions>a:last-child{display:none!important}" +
        ".ox-menu-toggle{display:grid;place-items:center;width:40px;height:40px;padding:0;border:1px solid rgba(255,255,255,.16);border-radius:11px;background:rgba(33,38,48,.78);color:#fff;cursor:pointer;flex:none}" +
        ".ox-menu-toggle:focus-visible{outline:2px solid #0A84FF;outline-offset:2px}" +
        ".ox-menu-toggle-lines,.ox-menu-toggle-lines:before,.ox-menu-toggle-lines:after{display:block;width:18px;height:2px;border-radius:2px;background:currentColor;transition:transform .2s ease,opacity .2s ease}" +
        ".ox-menu-toggle-lines{position:relative}" +
        ".ox-menu-toggle-lines:before,.ox-menu-toggle-lines:after{content:'';position:absolute;left:0}" +
        ".ox-menu-toggle-lines:before{top:-6px}" +
        ".ox-menu-toggle-lines:after{top:6px}" +
        ".ox-responsive-nav.is-menu-open .ox-menu-toggle-lines{background:transparent}" +
        ".ox-responsive-nav.is-menu-open .ox-menu-toggle-lines:before{top:0;transform:rotate(45deg)}" +
        ".ox-responsive-nav.is-menu-open .ox-menu-toggle-lines:after{top:0;transform:rotate(-45deg)}" +
        ".ox-mobile-menu{position:absolute;left:12px;right:12px;top:calc(100% + 8px);z-index:60;flex-direction:column;gap:5px;padding:10px;border:1px solid rgba(84,84,88,.72);border-radius:16px;background:rgba(17,22,33,.97);box-shadow:0 22px 60px rgba(0,0,0,.52);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}" +
        ".ox-responsive-nav.is-menu-open .ox-mobile-menu{display:flex}" +
        ".ox-mobile-menu a{display:flex;align-items:center;min-height:44px;padding:10px 12px!important;border-radius:10px;color:rgba(235,235,245,.76)!important;font-size:15px!important;font-weight:650;text-decoration:none}" +
        ".ox-mobile-menu a:hover,.ox-mobile-menu a:focus-visible{background:rgba(255,255,255,.07);color:#fff!important;outline:none}" +
        ".ox-mobile-menu .ox-mobile-download{justify-content:center;margin-top:5px;background:#0A84FF!important;color:#fff!important}" +
        "#top{width:100%!important;max-width:100%!important;padding:58px 20px 36px!important;grid-template-columns:minmax(0,1fr)!important;gap:42px!important;align-items:start!important}" +
        "#top>.ox-hero-copy{width:100%;max-width:560px;gap:18px!important}" +
        "#top>.ox-hero-copy h1{font-size:clamp(44px,13vw,56px)!important;line-height:1.01!important;letter-spacing:-.035em!important;text-wrap:balance}" +
        "#top>.ox-hero-copy>p{font-size:17px!important;line-height:1.55!important;max-width:100%!important}" +
        "#top>.ox-hero-copy>.ox-hero-actions{gap:10px!important}" +
        "#top>.ox-hero-copy>.ox-hero-stats{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important;width:100%;margin-top:8px!important}" +
        "#top>.ox-hero-copy>.ox-hero-stats>div{min-width:0}" +
        "#top>.ox-hero-screenshot-target{width:min(76vw,286px)!important;justify-self:center!important;margin:2px 0 18px!important}" +
        "#top>.ox-hero-screenshot-target>:not(:first-child){display:none!important}" +
        ".ox-feature-ticker{max-width:100vw;contain:inline-size}" +
        "#features,#devices,#crew,#tools,#races,#about,#download{width:100%!important;max-width:100%!important;padding-left:20px!important;padding-right:20px!important}" +
        "#features{padding-top:64px!important;gap:68px!important}" +
        "#features>.ox-feature-row{grid-template-columns:minmax(0,1fr)!important;gap:28px!important}" +
        "#features>.ox-feature-row>.ox-feature-copy{order:1}" +
        "#features>.ox-feature-row>.ox-feature-visual{order:2;min-width:0;max-width:100%;overflow:hidden}" +
        "#features h2,#devices h2,#tools h2,#races h2{font-size:34px!important;line-height:1.08!important}" +
        "#devices{padding-top:72px!important}" +
        "#devices>.ox-devices-grid{grid-template-columns:minmax(0,1fr)!important;gap:16px!important}" +
        "#crew{padding-top:72px!important}" +
        "#crew .ox-crew-grid{grid-template-columns:minmax(0,1fr)!important;gap:30px!important;padding:30px 22px 0!important}" +
        "#tools{padding-top:72px!important;grid-template-columns:minmax(0,1fr)!important;gap:30px!important;align-items:start!important}" +
        "#tools>*{min-width:0}" +
        "#races{padding-top:72px!important;grid-template-columns:minmax(0,1fr)!important;gap:30px!important;align-items:start!important}" +
        "#races>.ox-races-copy{order:1}" +
        "#races>img{order:2;width:100%!important;height:auto!important}" +
        "#about{padding-top:76px!important}" +
        "#download{padding-top:64px!important;padding-bottom:74px!important}" +
        "#download h2{font-size:38px!important;line-height:1.08!important}" +
        ".ox-faq{width:100%;max-width:100%;padding-left:20px!important;padding-right:20px!important}" +
        ".ox-page-shell img{max-width:100%}" +
        "footer>div{width:100%;max-width:100%;padding:26px 20px!important;flex-wrap:wrap!important;gap:15px!important}" +
        "footer>div>span[style*='margin-left: auto']{width:100%;margin-left:0!important;order:20}" +
      "}" +
      "@media(max-width:430px){" +
        "nav.ox-responsive-nav{padding-left:14px!important;padding-right:14px!important}" +
        "nav.ox-responsive-nav>a:first-child{font-size:16px!important;gap:8px!important}" +
        "nav.ox-responsive-nav>a:first-child img{width:24px!important;height:24px!important}" +
        "#top{padding-left:18px!important;padding-right:18px!important}" +
        "#top>.ox-hero-copy>.ox-hero-stats{gap:8px!important}" +
        "#top>.ox-hero-copy>.ox-hero-stats>div{font-size:11px}" +
        "#features,#devices,#crew,#tools,#races,#about,#download{padding-left:18px!important;padding-right:18px!important}" +
        ".ox-faq{padding-left:18px!important;padding-right:18px!important}" +
      "}" +
      "@media(prefers-reduced-motion:reduce){.ox-menu-toggle-lines,.ox-menu-toggle-lines:before,.ox-menu-toggle-lines:after{transition:none}}";
    document.head.appendChild(style);
  }

  function markLayout() {
    var hero = document.getElementById("top");
    var heading = hero && hero.querySelector("h1");
    if (heading && heading.parentElement) {
      var copy = heading.parentElement;
      copy.classList.add("ox-hero-copy");
      if (copy.children[3]) copy.children[3].classList.add("ox-hero-actions");
      if (copy.children[4]) copy.children[4].classList.add("ox-hero-stats");
    }

    document.querySelectorAll("#features > div").forEach(function (row) {
      row.classList.add("ox-feature-row");
      Array.prototype.forEach.call(row.children, function (child) {
        child.classList.add(child.querySelector("h2") ? "ox-feature-copy" : "ox-feature-visual");
      });
    });

    var devicesGrid = document.querySelector("#devices > div:last-child");
    if (devicesGrid) devicesGrid.classList.add("ox-devices-grid");

    var crewGrid = document.querySelector("#crew [style*='grid-template-columns: 1fr 1.4fr']");
    if (crewGrid) crewGrid.classList.add("ox-crew-grid");

    var races = document.getElementById("races");
    if (races) {
      Array.prototype.forEach.call(races.children, function (child) {
        if (child.tagName !== "IMG") child.classList.add("ox-races-copy");
      });
    }
  }

  function closeMenu(nav, button) {
    nav.classList.remove("is-menu-open");
    button.setAttribute("aria-expanded", "false");
  }

  function configureNavigation() {
    var nav = document.querySelector("nav");
    if (!nav || nav.classList.contains("ox-responsive-nav")) return !!nav;

    var links = nav.children[1];
    var actions = nav.children[2];
    if (!links || !actions) return false;

    nav.classList.add("ox-responsive-nav");
    links.classList.add("ox-nav-links");
    actions.classList.add("ox-nav-actions");

    var button = document.createElement("button");
    button.type = "button";
    button.className = "ox-menu-toggle";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", MENU_ID);
    button.setAttribute("aria-label", /\/el\.html$/.test(window.location.pathname) ? "Άνοιγμα μενού" : "Open menu");
    var lines = document.createElement("span");
    lines.className = "ox-menu-toggle-lines";
    lines.setAttribute("aria-hidden", "true");
    button.appendChild(lines);

    var menu = document.createElement("div");
    menu.id = MENU_ID;
    menu.className = "ox-mobile-menu";
    Array.prototype.forEach.call(links.querySelectorAll("a"), function (link) {
      menu.appendChild(link.cloneNode(true));
    });
    var download = actions.querySelector("a[href='#download']");
    if (download) {
      var mobileDownload = download.cloneNode(true);
      mobileDownload.classList.add("ox-mobile-download");
      menu.appendChild(mobileDownload);
    }

    nav.appendChild(button);
    nav.appendChild(menu);

    button.addEventListener("click", function () {
      var opening = !nav.classList.contains("is-menu-open");
      nav.classList.toggle("is-menu-open", opening);
      button.setAttribute("aria-expanded", String(opening));
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(nav, button);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu(nav, button);
    });
    document.addEventListener("pointerdown", function (event) {
      if (!nav.contains(event.target)) closeMenu(nav, button);
    });
    return true;
  }

  function mount() {
    var hero = document.getElementById("top");
    if (!hero) return false;
    addStyles();
    markLayout();
    return configureNavigation();
  }

  if (!mount()) {
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (mount() || attempts > 120) window.clearInterval(timer);
    }, 100);
  }
})();
