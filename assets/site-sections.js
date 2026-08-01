(function () {
  "use strict";

  var STYLE_ID = "oxygon-site-sections-styles";
  var CONTENT = {
    en: {
      tickerLabel: "Oxygon features",
      backToTop: "Back to top",
      features: [
        "Adaptive training plans",
        "Checkpoint fuelling",
        "Live race telemetry",
        "Crew tracking",
        "90+ GPX race courses",
        "8 free calculators",
        "BLE heart rate",
        "Glucose and conditions",
        "Apple Watch support",
        "Private by design"
      ],
      eyebrow: "FAQ",
      heading: "Questions, answered.",
      intro: "The essentials about planning, race-day execution, connected sensors and your data.",
      questions: [
        [
          "What is Oxygon?",
          "Oxygon is a training and race-execution toolkit for endurance athletes. It combines adaptive planning, checkpoint-by-checkpoint fuelling, live telemetry, calculators and crew tracking in one place."
        ],
        [
          "Who is Oxygon for?",
          "It is built for runners, cyclists, swimmers and triathletes, with an emphasis on long events where pacing, fuelling and clear race-day information matter most."
        ],
        [
          "How does the fuelling planner work?",
          "Set your hourly targets for water, carbohydrate and sodium, or start from a suggestion based on your profile and conditions. Oxygon distributes the plan across checkpoints, while keeping every stop editable."
        ],
        [
          "Do I need an account?",
          "No account is required for the free calculators. An account is optional for features that need cross-device sync, saved plans or live sharing."
        ],
        [
          "What can my crew see?",
          "A shared live link can show your course position, pace, checkpoint progress and the telemetry you choose to share. Crew members can open it in a browser without installing the app or creating an account."
        ],
        [
          "Which sensors and data sources are supported?",
          "Oxygon can combine GPS, compatible Bluetooth heart-rate sensors, conditions and authorised health data such as glucose. What appears during an activity depends on the devices and permissions you have enabled."
        ],
        [
          "Does it work across iPhone, iPad and Apple Watch?",
          "Yes. iPhone owns the live plan, iPad provides more space for planning and review, and Apple Watch keeps the most important race information available at a glance."
        ],
        [
          "How does Oxygon handle my data?",
          "Oxygon is private by design: no advertising profiles and no hidden sharing. You decide when to sync data and what to expose through a live crew link."
        ],
        [
          "Is Oxygon free?",
          "The calculators and a product demo are free. Oxygon Pro unlocks advanced planning and live guidance; current availability is shown inside the app."
        ]
      ]
    },
    el: {
      tickerLabel: "Δυνατότητες του Oxygon",
      backToTop: "Πίσω στην κορυφή",
      features: [
        "Προσαρμοζόμενα πλάνα προπόνησης",
        "Τροφοδοσία ανά σταθμό",
        "Live δεδομένα αγώνα",
        "Παρακολούθηση από το crew",
        "90+ διαδρομές GPX",
        "8 δωρεάν εργαλεία",
        "Παλμοί μέσω Bluetooth",
        "Γλυκόζη και συνθήκες",
        "Υποστήριξη Apple Watch",
        "Ιδιωτικότητα από τον σχεδιασμό"
      ],
      eyebrow: "ΣΥΧΝΕΣ ΕΡΩΤΗΣΕΙΣ",
      heading: "Όσα χρειάζεται να γνωρίζεις.",
      intro: "Τα βασικά για τον σχεδιασμό, την εκτέλεση του αγώνα, τους συνδεδεμένους αισθητήρες και τα δεδομένα σου.",
      questions: [
        [
          "Τι είναι το Oxygon;",
          "Το Oxygon είναι ένα ολοκληρωμένο εργαλείο προπόνησης και εκτέλεσης αγώνα για αθλητές αντοχής. Συνδυάζει προσαρμοζόμενα πλάνα, τροφοδοσία ανά σταθμό, live δεδομένα, υπολογιστές και παρακολούθηση από το crew."
        ],
        [
          "Για ποιους αθλητές είναι σχεδιασμένο;",
          "Είναι σχεδιασμένο για δρομείς, ποδηλάτες, κολυμβητές και τριαθλητές, με ιδιαίτερη έμφαση στους μεγάλους αγώνες όπου ο ρυθμός, η τροφοδοσία και η καθαρή πληροφόρηση είναι κρίσιμα."
        ],
        [
          "Πώς λειτουργεί το πλάνο τροφοδοσίας;",
          "Ορίζεις ωριαίους στόχους για νερό, υδατάνθρακες και νάτριο ή ξεκινάς από μία πρόταση με βάση το προφίλ και τις συνθήκες. Το Oxygon μοιράζει το πλάνο στους σταθμούς, ενώ κάθε στάση παραμένει επεξεργάσιμη."
        ],
        [
          "Χρειάζεται να δημιουργήσω λογαριασμό;",
          "Όχι για τα δωρεάν εργαλεία. Ο λογαριασμός είναι προαιρετικός για λειτουργίες που χρειάζονται συγχρονισμό μεταξύ συσκευών, αποθηκευμένα πλάνα ή live κοινοποίηση."
        ],
        [
          "Τι μπορεί να βλέπει το crew μου;",
          "Ένα κοινόχρηστο live link μπορεί να εμφανίζει τη θέση στη διαδρομή, τον ρυθμό, την πρόοδο στους σταθμούς και τα δεδομένα που επιλέγεις να μοιραστείς. Ανοίγει σε browser, χωρίς εγκατάσταση εφαρμογής ή λογαριασμό."
        ],
        [
          "Ποιους αισθητήρες και ποιες πηγές δεδομένων υποστηρίζει;",
          "Το Oxygon μπορεί να συνδυάζει GPS, συμβατούς Bluetooth αισθητήρες παλμών, συνθήκες και εξουσιοδοτημένα δεδομένα υγείας όπως η γλυκόζη. Οι διαθέσιμες ενδείξεις εξαρτώνται από τις συσκευές και τα δικαιώματα που έχεις ενεργοποιήσει."
        ],
        [
          "Λειτουργεί σε iPhone, iPad και Apple Watch;",
          "Ναι. Το iPhone διαχειρίζεται το live πλάνο, το iPad προσφέρει περισσότερο χώρο για σχεδιασμό και ανασκόπηση, και το Apple Watch κρατά τις σημαντικότερες πληροφορίες του αγώνα άμεσα διαθέσιμες."
        ],
        [
          "Πώς διαχειρίζεται τα δεδομένα μου;",
          "Το Oxygon έχει σχεδιαστεί με προτεραιότητα στην ιδιωτικότητα: χωρίς διαφημιστικά προφίλ και χωρίς κρυφή κοινοποίηση. Εσύ αποφασίζεις πότε θα συγχρονίσεις δεδομένα και τι θα εμφανίζεται σε ένα live crew link."
        ],
        [
          "Είναι δωρεάν το Oxygon;",
          "Οι υπολογιστές και το demo είναι δωρεάν. Το Oxygon Pro ξεκλειδώνει προηγμένο σχεδιασμό και live καθοδήγηση· η τρέχουσα διαθεσιμότητα εμφανίζεται μέσα στην εφαρμογή."
        ]
      ]
    }
  };

  function addStyles() {
    if (!document.head || document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      ".ox-feature-ticker{width:100%;overflow:hidden;border-top:1px solid rgba(84,84,88,.34);border-bottom:1px solid rgba(84,84,88,.34);background:rgba(11,15,25,.68);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}" +
      ".ox-feature-ticker-track{display:flex;width:max-content;animation:oxTicker 58s linear infinite;will-change:transform}" +
      ".ox-feature-ticker:hover .ox-feature-ticker-track,.ox-feature-ticker:focus-within .ox-feature-ticker-track{animation-play-state:paused}" +
      ".ox-feature-ticker-group{display:flex;align-items:center;flex:none;padding:16px 0}" +
      ".ox-feature-ticker-item{display:flex;align-items:center;gap:18px;padding:0 24px;color:rgba(235,235,245,.72);font-size:13px;font-weight:650;letter-spacing:.055em;text-transform:uppercase;white-space:nowrap}" +
      ".ox-feature-ticker-item:before{content:'';width:5px;height:5px;border-radius:50%;background:#0A84FF;box-shadow:0 0 12px rgba(10,132,255,.72);flex:none}" +
      "@keyframes oxTicker{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}" +
      ".ox-faq{max-width:980px;margin:0 auto;padding:110px 40px 100px}" +
      ".ox-faq-header{max-width:690px;margin-bottom:38px}" +
      ".ox-faq-eyebrow{color:#0A84FF;font-size:13px;font-weight:750;letter-spacing:.09em;text-transform:uppercase;margin-bottom:12px}" +
      ".ox-faq h2{margin:0;color:#fff;font-size:46px;line-height:1.08;letter-spacing:-.025em;font-weight:800}" +
      ".ox-faq-intro{margin:16px 0 0;color:rgba(235,235,245,.6);font-size:17px;line-height:1.65}" +
      ".ox-faq-list{display:grid;gap:12px}" +
      ".ox-faq details{background:rgba(33,38,48,.72);border:1px solid rgba(84,84,88,.52);border-radius:16px;overflow:hidden;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:border-color .25s ease,background .25s ease}" +
      ".ox-faq details[open]{border-color:rgba(10,132,255,.58);background:rgba(33,38,48,.86)}" +
      ".ox-faq summary{display:flex;align-items:center;gap:20px;padding:21px 22px;color:#fff;font-size:17px;font-weight:700;line-height:1.35;cursor:pointer;list-style:none}" +
      ".ox-faq summary::-webkit-details-marker{display:none}" +
      ".ox-faq summary:focus-visible{outline:2px solid #0A84FF;outline-offset:-3px;border-radius:14px}" +
      ".ox-faq-icon{position:relative;width:26px;height:26px;margin-left:auto;border:1px solid rgba(255,255,255,.2);border-radius:50%;flex:none;transition:transform .25s ease,border-color .25s ease}" +
      ".ox-faq-icon:before,.ox-faq-icon:after{content:'';position:absolute;left:7px;right:7px;top:12px;height:1.5px;background:#0A84FF;border-radius:2px}" +
      ".ox-faq-icon:after{transform:rotate(90deg)}" +
      ".ox-faq details[open] .ox-faq-icon{transform:rotate(45deg);border-color:rgba(10,132,255,.58)}" +
      ".ox-faq-answer{margin:0;padding:0 68px 23px 22px;color:rgba(235,235,245,.64);font-size:15px;line-height:1.7;max-width:800px}" +
      ".ox-back-to-top{position:fixed;right:24px;bottom:24px;width:48px;height:48px;z-index:90;display:grid;place-items:center;border:1px solid rgba(255,255,255,.18);border-radius:50%;background:rgba(33,38,48,.88);color:#fff;box-shadow:0 14px 38px rgba(0,0,0,.42);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);font:700 23px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;cursor:pointer;opacity:0;visibility:hidden;transform:translateY(12px) scale(.92);transition:opacity .25s ease,visibility .25s ease,transform .25s ease,background .2s ease,border-color .2s ease}" +
      ".ox-back-to-top.is-visible{opacity:1;visibility:visible;transform:translateY(0) scale(1)}" +
      ".ox-back-to-top:hover{background:#0A84FF;border-color:#0A84FF;transform:translateY(-3px) scale(1.04)}" +
      ".ox-back-to-top:active{transform:translateY(0) scale(.96)}" +
      ".ox-back-to-top:focus-visible{outline:2px solid #fff;outline-offset:3px}" +
      ".ox-back-to-top-arrow{display:block;transform:translateY(-1px)}" +
      "@media(max-width:767px){.ox-feature-ticker-group{padding:13px 0}.ox-feature-ticker-item{font-size:11px;padding:0 18px;gap:14px}.ox-faq{padding:82px 22px 78px}.ox-faq h2{font-size:36px}.ox-faq-intro{font-size:15px}.ox-faq-header{margin-bottom:28px}.ox-faq summary{padding:18px;font-size:16px}.ox-faq-answer{padding:0 52px 20px 18px}.ox-back-to-top{right:16px;bottom:calc(16px + env(safe-area-inset-bottom));width:44px;height:44px;font-size:21px}}" +
      "@media(prefers-reduced-motion:reduce){.ox-feature-ticker{overflow-x:auto;-webkit-mask-image:none;mask-image:none}.ox-feature-ticker-track{animation:none;will-change:auto}.ox-feature-ticker-group[aria-hidden=true]{display:none}.ox-faq-icon,.ox-faq details,.ox-back-to-top{transition:none}}";
    document.head.appendChild(style);
  }

  function makeElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function featureGroup(features, duplicate) {
    var group = makeElement("div", "ox-feature-ticker-group");
    group.setAttribute("role", duplicate ? "presentation" : "list");
    if (duplicate) group.setAttribute("aria-hidden", "true");
    features.forEach(function (feature) {
      var item = makeElement("span", "ox-feature-ticker-item", feature);
      if (!duplicate) item.setAttribute("role", "listitem");
      group.appendChild(item);
    });
    return group;
  }

  function createTicker(content) {
    var ticker = makeElement("aside", "ox-feature-ticker");
    ticker.setAttribute("aria-label", content.tickerLabel);
    var track = makeElement("div", "ox-feature-ticker-track");
    track.appendChild(featureGroup(content.features, false));
    track.appendChild(featureGroup(content.features, true));
    ticker.appendChild(track);
    return ticker;
  }

  function createFaq(content) {
    var section = makeElement("section", "ox-faq");
    section.setAttribute("aria-labelledby", "ox-faq-heading");

    var header = makeElement("div", "ox-faq-header");
    header.appendChild(makeElement("div", "ox-faq-eyebrow", content.eyebrow));
    var heading = makeElement("h2", "", content.heading);
    heading.id = "ox-faq-heading";
    header.appendChild(heading);
    header.appendChild(makeElement("p", "ox-faq-intro", content.intro));
    section.appendChild(header);

    var list = makeElement("div", "ox-faq-list");
    content.questions.forEach(function (entry) {
      var details = document.createElement("details");
      var summary = document.createElement("summary");
      summary.appendChild(document.createTextNode(entry[0]));
      var icon = makeElement("span", "ox-faq-icon");
      icon.setAttribute("aria-hidden", "true");
      summary.appendChild(icon);
      details.appendChild(summary);
      details.appendChild(makeElement("p", "ox-faq-answer", entry[1]));
      list.appendChild(details);
    });
    section.appendChild(list);
    return section;
  }

  function createBackToTop(content) {
    var button = makeElement("button", "ox-back-to-top");
    button.type = "button";
    button.setAttribute("aria-label", content.backToTop);
    button.setAttribute("title", content.backToTop);
    var arrow = makeElement("span", "ox-back-to-top-arrow", "↑");
    arrow.setAttribute("aria-hidden", "true");
    button.appendChild(arrow);

    function updateVisibility() {
      var threshold = Math.max(620, window.innerHeight * 0.9);
      button.classList.toggle("is-visible", window.scrollY > threshold);
    }

    button.addEventListener("click", function () {
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.setInterval(updateVisibility, 300);
    updateVisibility();
    return button;
  }

  function mount() {
    var hero = document.getElementById("top");
    var footer = document.querySelector("footer");
    if (!hero || !footer || !footer.parentElement) return false;

    addStyles();
    var greek = /\/el\.html$/.test(window.location.pathname);
    var content = greek ? CONTENT.el : CONTENT.en;

    if (!document.querySelector(".ox-feature-ticker")) {
      hero.insertAdjacentElement("afterend", createTicker(content));
    }
    if (!document.querySelector(".ox-faq")) {
      footer.parentElement.insertBefore(createFaq(content), footer);
    }
    if (!document.querySelector(".ox-back-to-top")) {
      document.body.appendChild(createBackToTop(content));
    }
    return true;
  }

  if (!mount()) {
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (mount() || attempts > 120) window.clearInterval(timer);
    }, 100);
  }
})();
