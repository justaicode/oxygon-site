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
  // iPhone's tile title: lineLimit(1).minimumScaleFactor(0.75). The web's tile-grid titles shrink the same, no further.
  var TITLE_MIN_SCALE = 0.75;

  function clearFit(root) {
    root.querySelectorAll('.measurement-label > .measurement-content, .measurement-number, .measurement-unit').forEach(function (el) {
      if (el.style.fontSize) el.style.fontSize = '';
    });
  }

  // A header or a numeric reading shrinks (down to 0.7) before a pair stacks, so the
  // values in that row stay on one baseline. The icon, the face dots and a context
  // sentence keep their size; a sentence still takes the full width.
  function fitLine(el, room, minScale, writes) {
    if (minScale == null) minScale = MIN_LINE_SCALE;
    // Measure the intrinsic width so a max-width cap (e.g. in the activity-popup
    // tile grid) doesn't make a long label look like it already fits.
    var width = el.scrollWidth;
    // A tile-grid title box is as wide as its tile: its own width is what its icon and words take.
    if (el.closest && el.closest('.tile-grid .measurement-label')) {
      var r = document.createRange(); r.selectNodeContents(el);
      var box = el.getBoundingClientRect(), words = r.getBoundingClientRect();
      if (words.width) width = Math.max(words.right, box.left) - box.left;
    }
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
    var scale = Math.max(minScale, (room - fixed) / flexible);
    if (numbers.length) {
      numbers.forEach(function (n) {
        writes.push({el:n, size:(parseFloat(getComputedStyle(n).fontSize) * scale) + 'px'});
      });
    } else {
      writes.push({el:el, size:(parseFloat(getComputedStyle(el).fontSize) * scale) + 'px'});
    }
  }

  function fitGrid(grid, columns, minScale, labelMinScale) {
    if (labelMinScale == null) labelMinScale = minScale;
    var tiles = Array.from(grid.children).filter(function (t) { return t.classList.contains('measurement-tile'); });
    if (!tiles.length || !(columns > 0)) return;
    var writes = [];
    var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    var narrow = (grid.clientWidth - gap * (columns - 1)) / columns;
    tiles.forEach(function (t) {
      var inset = getComputedStyle(t);
      // One pixel inside the column, so a rounded font-size still clears the edge.
      var room = Math.max(1, narrow - parseFloat(inset.paddingLeft) - parseFloat(inset.paddingRight) - 1);
      var label = t.querySelector('.measurement-label > .measurement-content');
      if (label) {
        // The face dots are centred down the tile's right edge. A tall column (four faces or more) reaches the
        // title's row: there the title ends 2 px before the dots, so nothing overlaps them.
        var labelRoom = room;
        var dots = t.querySelector('.ox-face-dots');
        if (dots && dots.getClientRects().length) {
          var dr = dots.getBoundingClientRect(), lr = label.getBoundingClientRect();
          if (dr.top < lr.bottom && dr.bottom > lr.top) labelRoom = Math.max(1, Math.min(room, dr.left - lr.left - 2));
        }
        // A title that has to shrink first loses its tracking (.025em), so it keeps more of its size.
        label.style.letterSpacing = '';
        var words = document.createRange(); words.selectNodeContents(label);
        var needs = words.getBoundingClientRect().right - label.getBoundingClientRect().left;
        if (needs > labelRoom - 1 + 0.5) label.style.letterSpacing = '0';
        fitLine(label, labelRoom - 1, labelMinScale, writes);
      }
      var readings = t.querySelector('.measurement-readings');
      if (readings) fitLine(readings, room, minScale, writes);
    });
    writes.forEach(function(w){w.el.style.fontSize=w.size;});
  }

  function contentWidth(grid) {
    var pieces = grid.querySelectorAll('.measurement-label > .measurement-content, .measurement-readings, .measurement-empty, .measurement-context > .measurement-content');
    var widest = 0;
    pieces.forEach(function (el) { widest = Math.max(widest, el.getBoundingClientRect().width); });
    return widest;
  }

  function measureRows(rows) {
    rows.forEach(function(r){r.prior=r.el.style.maxWidth;r.el.style.maxWidth=r.room+'px';});
    rows.forEach(function(r){r.slots[r.index]=Math.max(r.slots[r.index],r.el.getBoundingClientRect().height);});
    rows.forEach(function(r){r.el.style.maxWidth=r.prior;});
  }

  function layout(root) {
    var grids = Array.from(root.querySelectorAll('.measurement-grid')).filter(function (g) { return g.clientWidth > 0; });
    var tileGrids = Array.from(root.querySelectorAll('.tile-grid')).filter(function (g) { return g.clientWidth > 0 && g.querySelector('.measurement-tile, .card'); });
    if (!grids.length && !tileGrids.length) return;
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
    // Measure peers together: alternating max-width writes and height reads
    // forces a layout for every tile row. Their widths are independent.
    var rowMeasures = [];
    grids.forEach(function (g) {
      var columns = g._mtColumns;
      var gap = parseFloat(getComputedStyle(g).columnGap) || 0;
      var narrow = (g.clientWidth - gap * (columns - 1)) / columns;
      Array.from(g.children).filter(function (t) { return t.classList.contains('measurement-tile'); }).forEach(function (t) {
        var inset = getComputedStyle(t);
        var room = Math.max(1, narrow - parseFloat(inset.paddingLeft) - parseFloat(inset.paddingRight));
        Array.from(t.children).filter(function(row) { return ["measurement-label","measurement-value","measurement-context"].some(function(c) { return row.classList.contains(c); }); }).forEach(function (row, i) {
          rowMeasures.push({el:row.firstElementChild, room:room, slots:slots, index:i});
        });
      });
    });
    measureRows(rowMeasures);
    grids.forEach(function (g) {
      ['label', 'value', 'context'].forEach(function (name, i) {
        set(g, '--measurement-' + name + '-row', Math.ceil(slots[i]) + 'px');
      });
      delete g._mtColumns;
      delete g._mtExpanded;
    });
    // Activity popups use a fixed 3-column tile grid; shrink long labels/readings to fit without changing the
    // grid layout. Readings never go below 11 px. A title stays one line and shrinks as iPhone's does
    // (minimumScaleFactor .75, ActivityMetricCards), never further. Every tile in the grid shares the same
    // measured label / value / context row heights.
    tileGrids.forEach(function (g) {
      var label = g.querySelector('.measurement-label > .measurement-content');
      var minScale = label ? 11 / parseFloat(getComputedStyle(label).fontSize) : MIN_LINE_SCALE;
      fitGrid(g, 3, Math.max(minScale, MIN_LINE_SCALE), TITLE_MIN_SCALE);
    });
    var tileMeasures = [], tileHeights = [];
    tileGrids.forEach(function (g) {
      var tiles = Array.from(g.children).filter(function (t) { return t.classList.contains('measurement-tile') || t.classList.contains('card'); });
      if (!tiles.length) return;
      var gap = parseFloat(getComputedStyle(g).columnGap) || 0;
      var narrow = (g.clientWidth - gap * 2) / 3;
      var heights = [0, 0, 0];
      tileHeights.push({grid:g, heights:heights});
      tiles.forEach(function (t) {
        var inset = getComputedStyle(t);
        var room = Math.max(1, narrow - parseFloat(inset.paddingLeft) - parseFloat(inset.paddingRight) - 1);
        var isCard = t.classList.contains('card');
        var rows = isCard ? [
          t.querySelector('.lbl'),
          t.querySelector('.big'),
          t.querySelector('.sub')
        ] : [
          t.querySelector('.measurement-label > .measurement-content'),
          t.querySelector('.measurement-value > .measurement-content'),
          t.querySelector('.measurement-context > .measurement-content')
        ];
        rows.forEach(function (el, i) {
          if (!el) return;
          tileMeasures.push({el:el, room:room, slots:heights, index:i});
        });
      });
    });
    measureRows(tileMeasures);
    tileHeights.forEach(function(item){
      var g=item.grid, heights=item.heights;
      set(g, '--measurement-label-row', Math.ceil(heights[0]) + 'px');
      set(g, '--measurement-value-row', Math.ceil(heights[1]) + 'px');
      set(g, '--measurement-context-row', Math.ceil(heights[2]) + 'px');
    });
  }

  // ResizeObserver sends an initial notification for every newly observed
  // node, including the values just fitted by refresh. Do not fit them twice.
  // Read the final boxes/styles together after fitting; genuine size/font/padding
  // changes still schedule the same layout, including a hidden dialog opening.
  function boxKey(el) {
    var r = el.getBoundingClientRect(), c = getComputedStyle(el);
    return [r.width, r.height, c.font, c.lineHeight, c.letterSpacing,
      c.padding, c.borderWidth, c.columnGap, c.whiteSpace].join('|');
  }
  function rememberBoxes(state) {
    state.boxes = new Map();
    [state.root].concat(Array.from(state.root.querySelectorAll('.measurement-content'))).forEach(function (el) {
      state.boxes.set(el, boxKey(el));
    });
  }
  function schedule(state) {
    if (state.frame) return;
    state.frame = requestAnimationFrame(function () {
      state.frame = 0; layout(state.root); rememberBoxes(state);
    });
  }

  function refresh(root) {
    if (!root) return;
    roots.forEach(function (s, r) {
      if (!r.isConnected) { if (s.observer) s.observer.disconnect(); if (s.frame) cancelAnimationFrame(s.frame); roots.delete(r); }
    });
    var state = roots.get(root);
    if (!state) {
      state = { root: root, frame: 0, observer: null, boxes: new Map() };
      if (window.ResizeObserver) state.observer = new ResizeObserver(function (entries) {
        if (entries.some(function (e) { return state.boxes.has(e.target) && state.boxes.get(e.target) !== boxKey(e.target); })) schedule(state);
      });
      roots.set(root, state);
    }
    if (state.frame) { cancelAnimationFrame(state.frame); state.frame = 0; }
    layout(root);
    rememberBoxes(state);
    if (state.observer) {
      state.observer.disconnect();
      state.boxes.forEach(function (_, el) { state.observer.observe(el); });
    } else schedule(state); // Older engines still fit after a hidden dialog opens.
  }

  window.addEventListener('resize', function () { roots.forEach(schedule); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { roots.forEach(schedule); });
  oxygon.measurements = { tile: tile, reading: reading, empty: empty, refresh: refresh };
})();
