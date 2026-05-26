const STORAGE_KEY = 'football_coach_teams';
const CW = 700, CH = 467;
const M  = 22;

const cy0 = CH / 2;
const VIEW_RECTS = {
  full:  { srcX: 0, srcY: 0,             srcW: CW,          srcH: CH,          rotated: false },
  half:  { srcX: 0, srcY: 0,             srcW: CW / 2 + M,  srcH: CH,          rotated: false },
  third: { srcX: 0, srcY: 0,             srcW: CW / 3 + M,  srcH: CH,          rotated: true  },
  box:   { srcX: 0, srcY: cy0 - 127 - M, srcW: 2 * M + 104, srcH: 254 + 2 * M, rotated: true  },
};

// ── Storage helpers ──
function loadTeams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveTeams(t) { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); }

function persistDrawing() {
  const all = loadTeams();
  const t   = all.find((x) => x.id === teamId);
  const ex  = t && (t.exercises || []).find((e) => e.id === exerciseId);
  if (!ex) return;
  ex.drawing = elements;
  saveTeams(all);
}

function persistNote(val) {
  const all = loadTeams();
  const t   = all.find((x) => x.id === teamId);
  const ex  = t && (t.exercises || []).find((e) => e.id === exerciseId);
  if (!ex) return;
  ex.notes = val;
  saveTeams(all);
}

function persistView() {
  const all = loadTeams();
  const t   = all.find((x) => x.id === teamId);
  const ex  = t && (t.exercises || []).find((e) => e.id === exerciseId);
  if (!ex) return;
  ex.pitchView = pitchView;
  saveTeams(all);
}

// ── URL params ──
const params     = new URLSearchParams(window.location.search);
const teamId     = params.get('teamId');
const exerciseId = params.get('exerciseId');

// ── Board state (declared before bootstrap so initBoard can reference them) ──
const canvas = document.getElementById('tacticCanvas');
canvas.width  = CW;
canvas.height = CH;
const ctx = canvas.getContext('2d');

let elements   = [];
let activeTool = 'select';
let selected   = null;
let dragState  = null;
let arrowState = null;
let hoverEl    = null;
let pitchView  = 'full';

// ── Bootstrap ──
const team     = loadTeams().find((t) => t.id === teamId);
const exercise = team && (team.exercises || []).find((e) => e.id === exerciseId);

if (!exercise) {
  document.getElementById('pageContent').style.display = 'none';
  document.getElementById('notFound').style.display    = 'flex';
  document.getElementById('notFoundBack').href = team ? 'exercises.html?id=' + teamId : 'index.html';
} else {
  document.title = exercise.name + ' — TactIQ';
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href            = 'exercises.html?id=' + teamId;
  document.getElementById('exerciseName').textContent = exercise.name;
  document.getElementById('exerciseMeta').textContent = team.name;

  elements  = exercise.drawing   ? JSON.parse(JSON.stringify(exercise.drawing)) : [];
  pitchView = exercise.pitchView || 'full';

  initBoard();
  initNotes();
}

// ── View transform ──
// Returns transform params + toScreen(px,py) and fromScreen(cx,cy) helpers.
// Rotated views (third/box) are displayed 90° CCW so the goal is at the bottom.
function getViewTransform() {
  const { srcX, srcY, srcW, srcH, rotated } = VIEW_RECTS[pitchView] || VIEW_RECTS.full;
  const scale = Math.min(700 / srcW, 700 / srcH);
  if (rotated) {
    // 90° CCW: screen_x = (py - srcY)*scale,  screen_y = (srcW + srcX - px)*scale
    const dW = Math.round(srcH * scale);
    const dH = Math.round(srcW * scale);
    return {
      scale, dW, dH,
      a: 0, b: -scale, c: scale, d: 0,
      e: -srcY * scale, f: (srcW + srcX) * scale,
      toScreen:   (px, py) => ({ sx: (py - srcY) * scale,       sy: (srcW + srcX - px) * scale }),
      fromScreen: (cx, cy) => ({ x: srcW + srcX - cy / scale,   y: cx / scale + srcY }),
    };
  }
  const dW = Math.round(srcW * scale);
  const dH = Math.round(srcH * scale);
  return {
    scale, dW, dH,
    a: scale, b: 0, c: 0, d: scale,
    e: -srcX * scale, f: -srcY * scale,
    toScreen:   (px, py) => ({ sx: (px - srcX) * scale,       sy: (py - srcY) * scale }),
    fromScreen: (cx, cy) => ({ x: cx / scale + srcX,          y: cy / scale + srcY }),
  };
}

// ── Tool bar & view selector ──
function initBoard() {
  // Reflect saved view on the buttons
  document.querySelectorAll('.pitch-view-btn').forEach((b) => {
    b.classList.toggle('pitch-view-active', b.dataset.view === pitchView);
  });

  document.getElementById('pitchViewSelector').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    pitchView = btn.dataset.view;
    document.querySelectorAll('.pitch-view-btn').forEach((b) => b.classList.remove('pitch-view-active'));
    btn.classList.add('pitch-view-active');
    persistView();
    render();
  });

  document.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTool = btn.dataset.tool;
      selected   = null;
      arrowState = null;
      document.querySelectorAll('.tool-btn').forEach((b) => b.classList.remove('tool-btn-active'));
      btn.classList.add('tool-btn-active');
      canvas.style.cursor = cursorFor(activeTool);
      render();
    });
  });

  document.getElementById('clearBoard').addEventListener('click', () => {
    if (elements.length === 0) return;
    if (!confirm('Clear the entire board?')) return;
    elements = [];
    selected = null;
    persistDrawing();
    render();
  });

  document.getElementById('downloadBoard').addEventListener('click', () => {
    const prevSelected = selected;
    selected = null;
    render();
    const link = document.createElement('a');
    link.download = (exercise.name || 'exercise').replace(/[^a-z0-9]/gi, '_') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    selected = prevSelected;
    render();
  });

  canvas.addEventListener('mousedown',  onPointerDown);
  canvas.addEventListener('mousemove',  onPointerMove);
  canvas.addEventListener('mouseup',    onPointerUp);
  canvas.addEventListener('mouseleave', onPointerLeave);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onPointerDown(e.touches[0]); },       { passive: false });
  canvas.addEventListener('touchmove',  (e) => { e.preventDefault(); onPointerMove(e.touches[0]); },       { passive: false });
  canvas.addEventListener('touchend',   (e) => { e.preventDefault(); onPointerUp(e.changedTouches[0]); });

  canvas.style.cursor = cursorFor(activeTool);
  render();
}

function cursorFor(tool) {
  if (tool === 'select') return 'default';
  if (tool === 'delete') return 'not-allowed';
  if (tool === 'pass' || tool === 'run') return 'crosshair';
  return 'copy';
}

// ── Canvas coordinate mapping ──
// Returns pitch-space coords (elements are stored in pitch space)
function canvasPos(e) {
  const r  = canvas.getBoundingClientRect();
  const cx = (e.clientX - r.left) * (canvas.width  / r.width);
  const cy = (e.clientY - r.top)  * (canvas.height / r.height);
  return getViewTransform().fromScreen(cx, cy);
}

// ── Hit testing (screen space so click radius matches visual radius) ──
function hitTest(px, py) {
  const vt = getViewTransform();
  const { sx, sy } = vt.toScreen(px, py);
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.type === 'player' || el.type === 'ball' || el.type === 'cone') {
      const r = el.type === 'ball' ? 12 : el.type === 'cone' ? 14 : 18;
      const { sx: esx, sy: esy } = vt.toScreen(el.x, el.y);
      if (Math.hypot(sx - esx, sy - esy) <= r) return el;
    } else if (el.type === 'arrow') {
      const { sx: sx1, sy: sy1 } = vt.toScreen(el.x1, el.y1);
      const { sx: sx2, sy: sy2 } = vt.toScreen(el.x2, el.y2);
      if (distToSegment(sx, sy, sx1, sy1, sx2, sy2) < 10) return el;
    }
  }
  return null;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// ── Pointer events ──
function onPointerDown(e) {
  const { x, y } = canvasPos(e);

  if (activeTool === 'select') {
    const hit = hitTest(x, y);
    selected  = hit ? hit.id : null;
    if (hit) {
      if (hit.type === 'arrow') {
        dragState = { id: hit.id, midX: x, midY: y, ox1: hit.x1, oy1: hit.y1, ox2: hit.x2, oy2: hit.y2 };
      } else {
        dragState = { id: hit.id, ox: x - hit.x, oy: y - hit.y };
      }
    }
    render();
    return;
  }

  if (activeTool === 'delete') {
    const hit = hitTest(x, y);
    if (hit) {
      elements = elements.filter((el) => el.id !== hit.id);
      selected = null;
      persistDrawing();
      render();
    }
    return;
  }

  if (activeTool === 'pass' || activeTool === 'run') {
    arrowState = { x1: x, y1: y, cx: x, cy: y };
    return;
  }

  placeElement(activeTool, x, y);
}

function onPointerMove(e) {
  const { x, y } = canvasPos(e);

  if (dragState) {
    const el = elements.find((el) => el.id === dragState.id);
    if (el) {
      if (el.type === 'arrow') {
        const dx = x - dragState.midX, dy = y - dragState.midY;
        el.x1 = clamp(dragState.ox1 + dx, 0, CW);
        el.y1 = clamp(dragState.oy1 + dy, 0, CH);
        el.x2 = clamp(dragState.ox2 + dx, 0, CW);
        el.y2 = clamp(dragState.oy2 + dy, 0, CH);
      } else {
        el.x = clamp(x - dragState.ox, 0, CW);
        el.y = clamp(y - dragState.oy, 0, CH);
      }
    }
    render();
    return;
  }

  if (arrowState) {
    arrowState.cx = x;
    arrowState.cy = y;
    render();
    return;
  }

  if (activeTool === 'select') {
    const hit = hitTest(x, y);
    hoverEl = hit ? hit.id : null;
    canvas.style.cursor = hit ? 'grab' : 'default';
    render();
  }
}

function onPointerUp(e) {
  if (dragState) {
    persistDrawing();
    dragState = null;
    return;
  }
  if (arrowState) {
    const { x, y } = canvasPos(e);
    const dx = x - arrowState.x1, dy = y - arrowState.y1;
    if (Math.hypot(dx, dy) > 15) {
      elements.push({
        id: crypto.randomUUID(),
        type: 'arrow',
        style: activeTool,
        x1: arrowState.x1, y1: arrowState.y1,
        x2: x, y2: y,
      });
      persistDrawing();
    }
    arrowState = null;
    render();
  }
}

function onPointerLeave() {
  if (arrowState) { arrowState = null; render(); }
  if (dragState)  { persistDrawing(); dragState = null; }
  hoverEl = null;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ── Place element ──
function placeElement(tool, x, y) {
  if (tool === 'blue' || tool === 'red') {
    const num = elements.filter((el) => el.type === 'player' && el.team === tool).length + 1;
    elements.push({ id: crypto.randomUUID(), type: 'player', team: tool, number: num, x, y });
  } else if (tool === 'ball') {
    elements = elements.filter((el) => el.type !== 'ball');
    elements.push({ id: crypto.randomUUID(), type: 'ball', x, y });
  } else if (tool === 'cone') {
    elements.push({ id: crypto.randomUUID(), type: 'cone', x, y });
  }
  persistDrawing();
  render();
}

// ── Render ──
function render() {
  const vt = getViewTransform();
  if (canvas.width !== vt.dW || canvas.height !== vt.dH) {
    canvas.width  = vt.dW;
    canvas.height = vt.dH;
  }
  ctx.clearRect(0, 0, vt.dW, vt.dH);
  drawPitch(vt);
  elements.forEach((el) => drawElement(el, vt));
  if (arrowState) drawArrowPreview(vt);
}

// ── Pitch ──
// The pitch is drawn in pitch-space coordinates then scaled via ctx.setTransform.
// Lines and rects stretch correctly; circles become slightly oval in sub-views (acceptable).
function drawPitch(vt) {
  ctx.save();
  ctx.setTransform(vt.a, vt.b, vt.c, vt.d, vt.e, vt.f);

  ctx.fillStyle = '#2d7a3a';
  ctx.fillRect(0, 0, CW, CH);

  const stripeW = (CW - 2 * M) / 10;
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(M + i * stripeW, M, stripeW, CH - 2 * M);
    }
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth   = 1.5;

  const cx = CW / 2, cy = CH / 2;

  ctx.strokeRect(M, M, CW - 2 * M, CH - 2 * M);
  line(cx, M, cx, CH - M);
  circle(cx, cy, 58);
  dot(cx, cy, 3);

  const pad = 104, pah = 254;
  ctx.strokeRect(M,           cy - pah / 2, pad, pah);
  ctx.strokeRect(CW - M - pad, cy - pah / 2, pad, pah);

  const gad = 35, gah = 115;
  ctx.strokeRect(M,           cy - gah / 2, gad, gah);
  ctx.strokeRect(CW - M - gad, cy - gah / 2, gad, gah);

  const gw = 46, gd = 14;
  ctx.strokeRect(M - gd,  cy - gw / 2, gd, gw);
  ctx.strokeRect(CW - M,  cy - gw / 2, gd, gw);

  const pspot = 69;
  dot(M + pspot,       cy, 3);
  dot(CW - M - pspot,  cy, 3);

  ctx.save();
  ctx.beginPath(); ctx.rect(M + pad, 0, CW, CH); ctx.clip();
  ctx.beginPath(); ctx.arc(M + pspot, cy, 58, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, CW - M - pad, CH); ctx.clip();
  ctx.beginPath(); ctx.arc(CW - M - pspot, cy, 58, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  cornerArc(M,      M,      0,             Math.PI / 2);
  cornerArc(CW - M, M,      Math.PI / 2,   Math.PI);
  cornerArc(CW - M, CH - M, Math.PI,       Math.PI * 1.5);
  cornerArc(M,      CH - M, Math.PI * 1.5, Math.PI * 2);

  ctx.restore();
}

function line(x1, y1, x2, y2) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
function circle(x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
}
function dot(x, y, r) {
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function cornerArc(x, y, start, end) {
  ctx.beginPath(); ctx.arc(x, y, 8, start, end); ctx.stroke();
}

// ── Draw elements ──
// Elements are drawn in SCREEN space so circles stay round regardless of view scale.
function drawElement(el, vt) {
  const isSel   = el.id === selected;
  const isHover = el.id === hoverEl && activeTool === 'select';
  ctx.save();

  if (el.type === 'player' || el.type === 'ball' || el.type === 'cone') {
    const { sx, sy } = vt.toScreen(el.x, el.y);
    if (sx < -30 || sx > canvas.width + 30 || sy < -30 || sy > canvas.height + 30) { ctx.restore(); return; }

    if (el.type === 'player') {
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
      ctx.fillStyle = el.team === 'blue' ? '#3b82f6' : '#ef4444';
      ctx.beginPath(); ctx.arc(sx, sy, 16, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = 'transparent';
      if (isSel || isHover) { ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5; ctx.stroke(); }
      ctx.fillStyle = 'white'; ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.number, sx, sy + 0.5);

    } else if (el.type === 'ball') {
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#444'; ctx.lineWidth = 1.5; ctx.stroke();
      if (isSel || isHover) { ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5; ctx.stroke(); }

    } else {
      drawCone(sx, sy, isSel || isHover);
    }

  } else if (el.type === 'arrow') {
    const { sx: sx1, sy: sy1 } = vt.toScreen(el.x1, el.y1);
    const { sx: sx2, sy: sy2 } = vt.toScreen(el.x2, el.y2);
    drawArrowLine(sx1, sy1, sx2, sy2, el.style, isSel || isHover);
  }

  ctx.restore();
}

function drawCone(x, y, highlight) {
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
  ctx.fillStyle   = '#f97316';
  ctx.strokeStyle = highlight ? '#facc15' : '#c2500a';
  ctx.lineWidth   = highlight ? 2.5 : 1.5;
  ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + 10, y + 8); ctx.lineTo(x - 10, y + 8); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#c2500a';
  ctx.beginPath(); ctx.ellipse(x, y + 8, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
}

function drawArrowLine(x1, y1, x2, y2, style, highlight) {
  const dx = x2 - x1, dy = y2 - y1;
  if (Math.hypot(dx, dy) < 5) return;
  const angle   = Math.atan2(dy, dx);
  const headLen = 13;
  const color   = highlight ? '#facc15' : (style === 'pass' ? 'white' : '#fbbf24');

  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth   = highlight ? 2.5 : 2;
  ctx.setLineDash(style === 'run' ? [8, 5] : []);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - headLen * Math.cos(angle), y2 - headLen * Math.sin(angle));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - 0.42), y2 - headLen * Math.sin(angle - 0.42));
  ctx.lineTo(x2 - headLen * Math.cos(angle + 0.42), y2 - headLen * Math.sin(angle + 0.42));
  ctx.closePath(); ctx.fill();
}

function drawArrowPreview(vt) {
  ctx.save();
  ctx.globalAlpha = 0.7;
  const { sx: sx1, sy: sy1 } = vt.toScreen(arrowState.x1, arrowState.y1);
  const { sx: sx2, sy: sy2 } = vt.toScreen(arrowState.cx, arrowState.cy);
  drawArrowLine(sx1, sy1, sx2, sy2, activeTool, false);
  ctx.restore();
}

// ── Notes ──
function initNotes() {
  const textarea = document.getElementById('exerciseNotes');
  const status   = document.getElementById('notesStatus');
  textarea.value = exercise.notes || '';
  let debounce;
  textarea.addEventListener('input', () => {
    clearTimeout(debounce);
    status.textContent = '';
    debounce = setTimeout(() => {
      persistNote(textarea.value);
      status.textContent = 'Saved';
      setTimeout(() => { status.textContent = ''; }, 1500);
    }, 600);
  });
}
