(function () {
  "use strict";

  var IMAGE_REPLACEMENTS = {
    "549ec65cce65d40f.png": {
      file: "549ec65cce65d40f-optimized.webp",
      width: 1400,
      height: 2032
    },
    "526f1e3c52771eb9.png": {
      file: "526f1e3c52771eb9-optimized.webp",
      width: 1600,
      height: 1440
    },
    "3b0b7386ccbb1063.png": {
      file: "3b0b7386ccbb1063-optimized.webp",
      width: 720,
      height: 1566
    },
    "b22450971251c564.png": {
      file: "b22450971251c564-optimized.webp",
      width: 720,
      height: 1566
    },
    "5863566aab9e8458.png": {
      file: "5863566aab9e8458-optimized.webp",
      width: 1600,
      height: 1103
    }
  };

  var LAZY_ONLY = {
    "0b7d6f6ac4f978e2.png": { width: 422, height: 514 },
    "8058d0b06fd69879.png": { width: 422, height: 514 },
    "c1e1545da59a3f72.png": { width: 512, height: 512 }
  };

  var CALCULATOR_REPLACEMENTS = [
    "pace",
    "cs",
    "predictor",
    "vo2",
    "hr",
    "training",
    "gap",
    "calories"
  ];

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function combineCoachAndDevices(template) {
    var greek = template.indexOf("Ένα μπλοκ προπόνησης που προσαρμόζεται") !== -1;
    var coachHeading = greek
      ? "Ένα μπλοκ προπόνησης που προσαρμόζεται"
      : "A training block that adapts";
    var deviceSectionMatch = template.match(/\n<section id="devices"[\s\S]*?<\/section>\n/);
    var coachHeadingIndex = template.indexOf(coachHeading);
    if (!deviceSectionMatch || coachHeadingIndex === -1) return template;

    var deviceImages = deviceSectionMatch[0].match(/<img\b[^>]*>/g) || [];
    if (deviceImages.length < 3) return template;
    var deviceSources = deviceImages.map(function (tag) {
      var match = tag.match(/\bsrc="([^"]+)"/);
      return match ? match[1] : "";
    });
    if (deviceSources.some(function (src) { return !src; })) return template;

    var coachRowOpening = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center">';
    var coachRowStart = template.lastIndexOf(coachRowOpening, coachHeadingIndex);
    if (coachRowStart === -1) return template;

    var coachImageStart = template.indexOf("<img ", coachHeadingIndex);
    var coachImageEnd = coachImageStart === -1 ? -1 : template.indexOf(">", coachImageStart);
    if (coachImageStart === -1 || coachImageEnd === -1) return template;

    var labels = greek
      ? {
          group: "Το Oxygon σε iPad και Apple Watch",
          ipad: "iPad — σχεδιασμός και ανασκόπηση",
          watch: "Apple Watch — ημέρα αγώνα",
          ipadAlt: "Σχεδιασμός και ανασκόπηση του Oxygon στο iPad",
          liveAlt: "Live αγώνας στο Apple Watch",
          checkpointAlt: "Επόμενος σταθμός στο Apple Watch"
        }
      : {
          group: "Oxygon on iPad and Apple Watch",
          ipad: "iPad — planning and review",
          watch: "Apple Watch — race day",
          ipadAlt: "Oxygon planning and review on iPad",
          liveAlt: "Live race on Apple Watch",
          checkpointAlt: "Next checkpoint on Apple Watch"
        };

    var combinedVisual =
      '<div class="ox-combined-devices" role="group" aria-label="' + labels.group + '">' +
        '<div class="ox-combined-ipad-card">' +
          '<div class="ox-combined-device-label">' + labels.ipad + '</div>' +
          '<img src="' + deviceSources[0] + '" alt="' + labels.ipadAlt + '" style="width:100%;height:auto;display:block">' +
        '</div>' +
        '<div class="ox-combined-watch-card">' +
          '<div class="ox-combined-device-label">' + labels.watch + '</div>' +
          '<div class="ox-combined-watch-images">' +
            '<img src="' + deviceSources[1] + '" alt="' + labels.liveAlt + '">' +
            '<img src="' + deviceSources[2] + '" alt="' + labels.checkpointAlt + '">' +
          '</div>' +
        '</div>' +
      '</div>';

    template =
      template.slice(0, coachRowStart) +
      coachRowOpening.replace("<div ", '<div id="coach-devices" ') +
      template.slice(coachRowStart + coachRowOpening.length);
    coachImageStart += ' id="coach-devices"'.length;
    coachImageEnd += ' id="coach-devices"'.length;
    template = template.slice(0, coachImageStart) + combinedVisual + template.slice(coachImageEnd + 1);
    template = template.replace(deviceSectionMatch[0], "\n");
    template = template.replaceAll('href="#devices"', 'href="#coach-devices"');
    return template;
  }

  function optimizeBundle() {
    var manifestElement = document.querySelector('script[type="__bundler/manifest"]');
    var templateElement = document.querySelector('script[type="__bundler/template"]');
    if (!manifestElement || !templateElement) return false;

    var manifest;
    var template;
    try {
      manifest = JSON.parse(manifestElement.textContent);
      template = JSON.parse(templateElement.textContent);
    } catch (error) {
      return false;
    }

    template = combineCoachAndDevices(template);

    Object.keys(manifest).forEach(function (uuid) {
      var entry = manifest[uuid];
      if (!entry || !entry.file) return;

      var replacement = IMAGE_REPLACEMENTS[entry.file];
      var dimensions = replacement || LAZY_ONLY[entry.file];
      if (replacement) {
        entry.file = replacement.file;
        entry.mime = "image/webp";
      }
      if (!dimensions) return;

      var imagePattern = new RegExp(
        '<img\\s+src="' + escapeRegExp(uuid) + '"(?![^>]*\\bloading=)',
        "g"
      );
      template = template.replace(
        imagePattern,
        '<img src="' + uuid + '" width="' + dimensions.width + '" height="' + dimensions.height + '" loading="lazy" decoding="async"'
      );
    });

    CALCULATOR_REPLACEMENTS.forEach(function (name) {
      template = template.replaceAll(
        "assets/site/calc-" + name + ".png",
        "assets/site/calc-" + name + "-optimized.webp"
      );
    });

    template = template.replace(
      "<head>",
      '<head><style id="oxygon-performance-styles">' +
        '.ox-page-shell img[loading="lazy"]{height:auto}' +
        '#coach-devices{scroll-margin-top:84px}' +
        '.ox-combined-devices{position:relative;width:100%;min-width:0;padding:12px 8px 76px;isolation:isolate}' +
        '.ox-combined-ipad-card,.ox-combined-watch-card{background:#212630;border:1px solid rgba(84,84,88,.58);box-shadow:0 24px 55px rgba(0,0,0,.38)}' +
        '.ox-combined-ipad-card{padding:14px;border-radius:20px}' +
        '.ox-combined-ipad-card img{border-radius:11px;border:1px solid rgba(84,84,88,.45)}' +
        '.ox-combined-device-label{margin:0 0 11px;color:rgba(235,235,245,.76);font-size:13px;font-weight:700}' +
        '.ox-combined-watch-card{position:absolute;right:-2px;bottom:4px;width:216px;padding:12px;border-radius:19px;z-index:2}' +
        '.ox-combined-watch-images{display:flex;gap:9px;align-items:flex-start;justify-content:center}' +
        '.ox-combined-watch-images img{width:calc(50% - 5px);height:auto;border-radius:13px;border:1px solid rgba(84,84,88,.5)}' +
        '.ox-combined-watch-images img:last-child{margin-top:15px}' +
        '@media(max-width:1023px){#features>#coach-devices{padding:0!important;scroll-margin-top:72px}.ox-combined-devices{width:min(100%,680px);margin:0 auto;padding-bottom:82px}.ox-combined-watch-card{right:2%}}' +
        '@media(max-width:430px){.ox-combined-devices{padding:6px 2px 64px}.ox-combined-ipad-card{padding:10px;border-radius:16px}.ox-combined-device-label{font-size:11px;margin-bottom:8px}.ox-combined-watch-card{width:168px;padding:9px;border-radius:15px;right:0;bottom:2px}.ox-combined-watch-images{gap:6px}.ox-combined-watch-images img{border-radius:10px}.ox-combined-watch-images img:last-child{margin-top:10px}}' +
      '</style>'
    );
    template = template.replace('preload="auto"', 'preload="metadata"');
    manifestElement.textContent = JSON.stringify(manifest);
    templateElement.textContent = JSON.stringify(template);
    return true;
  }

  optimizeBundle();
})();
