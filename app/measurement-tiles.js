(function () {
  "use strict";

  // Shared presentation only. Callers retain ownership of values, source
  // selection, statistics and missing-state wording.
  var oxygon = window.Oxygon = window.Oxygon || {};
  var roots = new Map();
  var esc = function (v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  }); };

  function tile(labelHTML, valueHTML, context) {
    return '<div class="tile measurement-tile">' +
      '<div class="measurement-label"><span class="measurement-content">' + labelHTML + '</span></div>' +
      '<div class="measurement-value"><div class="measurement-content measurement-readings">' + valueHTML + '</div></div>' +
      '<div class="measurement-context"><span class="measurement-content">' + esc(context) + '</span></div></div>';
  }

  function reading(value, unit, tint, accessibleLabel) {
    return '<span class="measurement-reading"' + (accessibleLabel ? ' aria-label="' + esc(accessibleLabel) + '"' : '') + '>' +
      '<b class="measurement-number"' + (tint ? ' style="color:' + esc(tint) + '"' : '') + '>' + esc(value) + '</b>' +
      (unit ? '<span class="measurement-unit">' + esc(unit) + '</span>' : '') + '</span>';
  }

  function empty(reason) { return '<span class="measurement-empty">' + esc(reason) + '</span>'; }

  function set(grid, name, value) {
    if (grid.style.getPropertyValue(name) !== value) grid.style.setProperty(name, value);
  }

  var MIN_LINE_SCALE = 0.7;

  function clearFit(root) {
    root.querySelectorAll('.measurement-label > .measurement-content, .measurement-number, .measurement-unit').forEach(function (el) {
      if (el.style.fontSize) el.style.fontSize = '';
    });
  }

  // A header or a numeric reading shrinks (down to 0.7) before a pair stacks, so the
  // values in that row stay on one baseline. The icon, the face dots and a context
  // sentence keep their size; a sentence still takes the full width.
  function fitLine(el, room) {
    var width = el.getBoundingClientRect().width;
    if (!(room > 0) || width <= room + 0.5) return;
    var numbers = el.querySelectorAll('.measurement-number, .measurement-unit');
    var fixed = 0;
    if (numbers.length) {
      numbers.forEach(function (n) { fixed += n.getBoundingClientRect().width; });
      fixed = width - fixed;
    } else {
      var icon = el.querySelector('.icon');
      fixed = icon ? icon.getBoundingClientRect().width + (parseFloat(getComputedStyle(el).gap) || 0) : 0;
    }
    var flexible = width - fixed;
    if (!(flexible > 1)) return;
    var scale = Math.max(MIN_LINE_SCALE, (room - fixed) / flexible);
    if (numbers.length) {
      numbers.forEach(function (n) {
        n.style.fontSize = (parseFloat(getComputedStyle(n).fontSize) * scale) + 'px';
      });
    } else {
      el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * scale) + 'px';
    }
  }

  function fitGrid(grid, columns) {
    var tiles = Array.from(grid.children).filter(function (t) { return t.classList.contains('measurement-tile'); });
    if (!tiles.length || !(columns > 0)) return;
    var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    var narrow = (grid.clientWidth - gap * (columns - 1)) / columns;
    tiles.forEach(function (t) {
      var inset = getComputedStyle(t);
      // One pixel inside the column, so a rounded font-size still clears the edge.
      var room = Math.max(1, narrow - parseFloat(inset.paddingLeft) - parseFloat(inset.paddingRight) - 1);
      var label = t.querySelector('.measurement-label > .measurement-content');
      if (label) fitLine(label, room);
      var readings = t.querySelector('.measurement-readings');
      if (readings) fitLine(readings, room);
    });
  }

  function contentWidth(grid) {
    var pieces = grid.querySelectorAll('.measurement-label > .measurement-content, .measurement-readings, .measurement-empty, .measurement-context > .measurement-content');
    var widest = 0;
    pieces.forEach(function (el) { widest = Math.max(widest, el.getBoundingClientRect().width); });
    return widest;
  }

  function layout(root) {
    var grids = Array.from(root.querySelectorAll('.measurement-grid')).filter(function (g) { return g.clientWidth > 0; });
    if (!grids.length) return;
    clearFit(root);
    var scale = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var slots = [scale, scale * 26 / 16, scale];
    // Each grid decides its own column count from its own content. Live/sensor
    // grids that must stay in lock-step set data-fixed-columns explicitly.
    // Titles and readings are fitted to two columns first: a wide figure
    // ("10.20 / 10.20 km", "AVERAGE SPEED") must not drop its partner onto the
    // next row. A context sentence that still does not fit does.
    grids.forEach(function (g) {
      g.removeAttribute('data-expanded-text');
      var tiles = Array.from(g.children).filter(function (t) { return t.classList.contains('measurement-tile'); });
      var fixed = Number(g.dataset.fixedColumns);
      var columns = fixed || 2;
      var expanded = false;
      if (tiles.length) {
        var inset = getComputedStyle(tiles[0]);
        var padding = parseFloat(inset.paddingLeft) + parseFloat(inset.paddingRight);
        var gap = parseFloat(getComputedStyle(g).columnGap) || 0;
        if (!fixed && tiles.length >= 2) fitGrid(g, 2);
        var needed = contentWidth(g) + padding;
        // A fitted line can land a pixel over the half column; that is still one row.
        if (!fixed && (tiles.length < 2 || needed * 2 + gap > g.clientWidth + 2)) {
          columns = 1;
          clearFit(g);
          fitGrid(g, 1);
          needed = contentWidth(g) + padding;
        } else if (!fixed) {
          columns = 2;
        } else {
          fitGrid(g, columns);
          needed = contentWidth(g) + padding;
        }
        if (fixed && needed > (g.clientWidth - gap * (fixed - 1)) / fixed) expanded = true;
        if (needed > g.clientWidth) expanded = true;
      }
      g._mtColumns = columns;
      g._mtExpanded = expanded;
    });
    grids.forEach(function (g) {
      set(g, '--measurement-columns', String(g._mtColumns));
      // A context sentence may wrap once the columns are chosen. Titles stay one
      // line, and a reading has already shrunk, so the value row does not move.
      if (g._mtExpanded) g.setAttribute('data-expanded-text', '');
    });
    grids.forEach(function (g) {
      var columns = g._mtColumns;
      var gap = parseFloat(getComputedStyle(g).columnGap) || 0;
      var narrow = (g.clientWidth - gap * (columns - 1)) / columns;
      Array.from(g.children).filter(function (t) { return t.classList.contains('measurement-tile'); }).forEach(function (t) {
        Array.from(t.children).filter(function(row) { return ["measurement-label","measurement-value","measurement-context"].some(function(c) { return row.classList.contains(c); }); }).forEach(function (row, i) {
          var content = row.firstElementChild, prior = content.style.maxWidth;
          var inset = getComputedStyle(t);
          // Measure every row at the width it will actually occupy, so a wrapped
          // reason gets the taller row it needs and peers stay the same height.
          content.style.maxWidth = Math.max(1, narrow - parseFloat(inset.paddingLeft) - parseFloat(inset.paddingRight)) + 'px';
          slots[i] = Math.max(slots[i], content.getBoundingClientRect().height);
          content.style.maxWidth = prior;
        });
      });
    });
    grids.forEach(function (g) {
      ['label', 'value', 'context'].forEach(function (name, i) {
        set(g, '--measurement-' + name + '-row', Math.ceil(slots[i]) + 'px');
      });
      delete g._mtColumns;
      delete g._mtExpanded;
    });
  }

  function schedule(state) {
    if (state.frame) return;
    state.frame = requestAnimationFrame(function () { state.frame = 0; layout(state.root); });
  }

  function refresh(root) {
    if (!root) return;
    roots.forEach(function (s, r) {
      if (!r.isConnected) { if (s.observer) s.observer.disconnect(); if (s.frame) cancelAnimationFrame(s.frame); roots.delete(r); }
    });
    var state = roots.get(root);
    if (!state) {
      state = { root: root, frame: 0, observer: null };
      if (window.ResizeObserver) state.observer = new ResizeObserver(function () { schedule(state); });
      roots.set(root, state);
    }
    layout(root);
    if (state.observer) {
      state.observer.disconnect();
      state.observer.observe(root);
      root.querySelectorAll('.measurement-content').forEach(function (c) { state.observer.observe(c); });
    }
    schedule(state); // A dialog may become visible immediately after its render.
  }

  window.addEventListener('resize', function () { roots.forEach(schedule); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { roots.forEach(schedule); });
  oxygon.measurements = { tile: tile, reading: reading, empty: empty, refresh: refresh };
})();
