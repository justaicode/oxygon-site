(function () {
  "use strict";

  // The one "this tile has more faces" indicator (Roberto, 24 Oct 2026, docs/approvals.md): a column of dots
  // inside the tile at its right edge, vertically centred, the current face in the accent. Every web tile that
  // cycles faces draws it through here; check-face-dots-uniform fails on any other dot markup.
  var oxygon = window.Oxygon = window.Oxygon || {};

  // One face has nothing to page to: no dots (shared ActivityMetricGroups.showsDots).
  function showsDots(count) {
    var engine = globalThis["oxygon-engine"];
    var groups = engine && engine.app.oxygon.shared.js.ActivityMetricGroupsJs;
    return groups ? groups.showsDots(count) : count > 1;
  }

  function faceDotsHTML(count, index) {
    count = Math.max(0, Math.floor(Number(count) || 0));
    if (!showsDots(count)) return "";
    var html = '<span class="ox-face-dots' + (count > 5 ? " many" : "") + '" aria-hidden="true">';
    for (var i = 0; i < count; i++) html += "<i" + (i === index ? ' class="on"' : "") + "></i>";
    return html + "</span>";
  }

  // Moves the accent dot inside `root` after a tap, without redrawing the tile.
  function selectFaceDot(root, index) {
    Array.prototype.forEach.call(root.querySelectorAll(".ox-face-dots > i"), function (dot, i) {
      dot.classList.toggle("on", i === index);
    });
  }

  oxygon.faceDotsHTML = faceDotsHTML;
  oxygon.selectFaceDot = selectFaceDot;
})();
