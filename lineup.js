const STORAGE_KEY = 'football_coach_teams';

// ── Formations: each slot has key, posLabel, x%, y% on pitch (0,0=top-left attack end) ──
const FORMATIONS = {
  '4-3-3': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:14, y:70 },
    { key:'CB1',  posLabel:'CB',  x:37, y:70 },
    { key:'CB2',  posLabel:'CB',  x:63, y:70 },
    { key:'RB',   posLabel:'RB',  x:86, y:70 },
    { key:'CM1',  posLabel:'CM',  x:25, y:50 },
    { key:'CM2',  posLabel:'CM',  x:50, y:50 },
    { key:'CM3',  posLabel:'CM',  x:75, y:50 },
    { key:'LW',   posLabel:'LW',  x:14, y:20 },
    { key:'ST',   posLabel:'ST',  x:50, y:15 },
    { key:'RW',   posLabel:'RW',  x:86, y:20 },
  ],
  '4-4-2': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:14, y:70 },
    { key:'CB1',  posLabel:'CB',  x:37, y:70 },
    { key:'CB2',  posLabel:'CB',  x:63, y:70 },
    { key:'RB',   posLabel:'RB',  x:86, y:70 },
    { key:'LM',   posLabel:'LM',  x:11, y:48 },
    { key:'CM1',  posLabel:'CM',  x:37, y:48 },
    { key:'CM2',  posLabel:'CM',  x:63, y:48 },
    { key:'RM',   posLabel:'RM',  x:89, y:48 },
    { key:'ST1',  posLabel:'ST',  x:37, y:18 },
    { key:'ST2',  posLabel:'ST',  x:63, y:18 },
  ],
  '4-2-3-1': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:14, y:72 },
    { key:'CB1',  posLabel:'CB',  x:37, y:72 },
    { key:'CB2',  posLabel:'CB',  x:63, y:72 },
    { key:'RB',   posLabel:'RB',  x:86, y:72 },
    { key:'CDM1', posLabel:'CDM', x:37, y:58 },
    { key:'CDM2', posLabel:'CDM', x:63, y:58 },
    { key:'LM',   posLabel:'LM',  x:12, y:39 },
    { key:'CAM',  posLabel:'CAM', x:50, y:37 },
    { key:'RM',   posLabel:'RM',  x:88, y:39 },
    { key:'ST',   posLabel:'ST',  x:50, y:15 },
  ],
  '4-1-4-1': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:14, y:73 },
    { key:'CB1',  posLabel:'CB',  x:37, y:73 },
    { key:'CB2',  posLabel:'CB',  x:63, y:73 },
    { key:'RB',   posLabel:'RB',  x:86, y:73 },
    { key:'CDM',  posLabel:'CDM', x:50, y:59 },
    { key:'LM',   posLabel:'LM',  x:11, y:44 },
    { key:'CM1',  posLabel:'CM',  x:35, y:43 },
    { key:'CM2',  posLabel:'CM',  x:65, y:43 },
    { key:'RM',   posLabel:'RM',  x:89, y:44 },
    { key:'ST',   posLabel:'ST',  x:50, y:15 },
  ],
  '3-5-2': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'CB1',  posLabel:'CB',  x:25, y:70 },
    { key:'CB2',  posLabel:'CB',  x:50, y:70 },
    { key:'CB3',  posLabel:'CB',  x:75, y:70 },
    { key:'LM',   posLabel:'LM',  x:10, y:50 },
    { key:'CM1',  posLabel:'CM',  x:30, y:50 },
    { key:'CM2',  posLabel:'CM',  x:50, y:50 },
    { key:'CM3',  posLabel:'CM',  x:70, y:50 },
    { key:'RM',   posLabel:'RM',  x:90, y:50 },
    { key:'ST1',  posLabel:'ST',  x:37, y:18 },
    { key:'ST2',  posLabel:'ST',  x:63, y:18 },
  ],
  '5-3-2': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:8,  y:70 },
    { key:'CB1',  posLabel:'CB',  x:27, y:70 },
    { key:'CB2',  posLabel:'CB',  x:50, y:70 },
    { key:'CB3',  posLabel:'CB',  x:73, y:70 },
    { key:'RB',   posLabel:'RB',  x:92, y:70 },
    { key:'CM1',  posLabel:'CM',  x:25, y:48 },
    { key:'CM2',  posLabel:'CM',  x:50, y:48 },
    { key:'CM3',  posLabel:'CM',  x:75, y:48 },
    { key:'ST1',  posLabel:'ST',  x:37, y:18 },
    { key:'ST2',  posLabel:'ST',  x:63, y:18 },
  ],
  '4-4-2 DM': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:14, y:73 },
    { key:'CB1',  posLabel:'CB',  x:37, y:73 },
    { key:'CB2',  posLabel:'CB',  x:63, y:73 },
    { key:'RB',   posLabel:'RB',  x:86, y:73 },
    { key:'CDM1', posLabel:'CDM', x:37, y:59 },
    { key:'CDM2', posLabel:'CDM', x:63, y:59 },
    { key:'CAM1', posLabel:'CAM', x:25, y:40 },
    { key:'CAM2', posLabel:'CAM', x:50, y:38 },
    { key:'CAM3', posLabel:'CAM', x:75, y:40 },
    { key:'ST',   posLabel:'ST',  x:50, y:15 },
  ],
};

// ── Attribute weights per position for scoring ──
const POS_WEIGHTS = {
  GK:  { defensiveAbility:2, physicalAbility:1.5, awareness:1.5, oneVsOneDefensive:1 },
  CB:  { defensiveAbility:2, oneVsOneDefensive:1.5, physicalAbility:1.2, awareness:0.8 },
  LB:  { defensiveAbility:1.5, speed:1.5, physicalAbility:1, passing:0.8 },
  RB:  { defensiveAbility:1.5, speed:1.5, physicalAbility:1, passing:0.8 },
  CDM: { defensiveAbility:1.8, awareness:1.5, passing:1, physicalAbility:0.8 },
  CM:  { passing:1.5, awareness:1.5, touch:1, dribbling:0.8 },
  CAM: { passing:1.2, awareness:1, oneVsOneOffensive:1.5, dribbling:1.5, shot:0.8 },
  LM:  { speed:1.5, dribbling:1.5, passing:1 },
  RM:  { speed:1.5, dribbling:1.5, passing:1 },
  LW:  { speed:2, dribbling:1.5, shot:1, oneVsOneOffensive:0.8 },
  RW:  { speed:2, dribbling:1.5, shot:1, oneVsOneOffensive:0.8 },
  CF:  { shot:1.5, oneVsOneOffensive:1.5, dribbling:1, speed:0.8 },
  ST:  { shot:2, oneVsOneOffensive:1.5, speed:1, physicalAbility:0.5 },
};

function scoreFor(player, posLabel) {
  const a = player.attrs || {};
  const w = POS_WEIGHTS[posLabel] || {};
  let score = 0;
  for (const [attr, wt] of Object.entries(w)) score += (a[attr] || 0) * wt;
  if ((a.positions || []).includes(posLabel)) score *= 1.25;
  return score;
}

function overallRating(player) {
  const a = player.attrs || {};
  const attrs = ['defensiveAbility','shot','condition','touch','awareness','oneVsOneDefensive','oneVsOneOffensive','speed','physicalAbility','dribbling','passing'];
  const vals = attrs.map(k => a[k] || 0).filter(v => v > 0);
  return vals.length ? Math.round(vals.reduce((s,v) => s+v, 0) / vals.length * 10) : 0;
}

// ── Storage ──
function loadTeams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveTeams(t) { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); }
function getTeam()    { return loadTeams().find(t => t.id === teamId); }
function getLineup()  { return (getTeam()?.lineups || []).find(l => l.id === lineupId); }

function persistLineup() {
  const all = loadTeams();
  const t   = all.find(x => x.id === teamId);
  if (!t) return;
  const idx = (t.lineups || []).findIndex(l => l.id === lineupId);
  if (idx !== -1) { t.lineups[idx] = lineup; saveTeams(all); }
}

// ── Bootstrap ──
const params   = new URLSearchParams(window.location.search);
const teamId   = params.get('teamId');
const lineupId = params.get('lineupId');
const team     = getTeam();
let lineup     = getLineup();

if (!lineup) {
  document.getElementById('pageContent').style.display = 'none';
  document.getElementById('notFound').style.display    = 'flex';
  document.getElementById('notFoundBack').href = team ? 'lineups.html?id=' + teamId : 'index.html';
} else {
  document.title = lineup.name + ' — TactIQ';
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href            = 'lineups.html?id=' + teamId;
  document.getElementById('lineupName').textContent   = lineup.name;
  document.getElementById('lineupMeta').textContent   = team.name;

  initFormationBar();
  renderSlots();
  initActions();
  initPicker();
}

// ── Formation bar ──
function initFormationBar() {
  const bar = document.getElementById('formationBar');
  bar.innerHTML = Object.keys(FORMATIONS).map(f => `
    <button class="lu-form-btn${lineup.formation === f ? ' lu-form-active' : ''}" data-f="${f}">${f}</button>
  `).join('');
  bar.addEventListener('click', e => {
    const btn = e.target.closest('[data-f]');
    if (!btn) return;
    lineup.formation = btn.dataset.f;
    persistLineup();
    bar.querySelectorAll('.lu-form-btn').forEach(b => b.classList.toggle('lu-form-active', b.dataset.f === lineup.formation));
    renderSlots();
  });
}

// ── Render slots on pitch ──
function renderSlots() {
  const pitch  = document.getElementById('luPitch');
  const slots  = FORMATIONS[lineup.formation] || [];
  const players = team.players || [];

  // Remove old slots
  pitch.querySelectorAll('.lu-slot').forEach(el => el.remove());

  slots.forEach(slot => {
    const playerId = (lineup.slots || {})[slot.key];
    const player   = playerId ? players.find(p => p.id === playerId) : null;
    const initials = player ? nameInitials(player.name) : '';
    const hasPlayer = !!player;

    const div = document.createElement('div');
    div.className = 'lu-slot' + (hasPlayer ? ' lu-slot-filled' : '');
    div.dataset.slotKey = slot.key;
    div.style.left = slot.x + '%';
    div.style.top  = slot.y + '%';
    div.innerHTML = `
      <div class="lu-slot-circle">${hasPlayer ? `<span class="lu-slot-initials">${initials}</span>` : `<span class="lu-slot-pos">${slot.posLabel}</span>`}</div>
      <div class="lu-slot-label">${hasPlayer ? shortName(player.name) : slot.posLabel}</div>
    `;
    div.addEventListener('click', () => openPicker(slot));
    pitch.appendChild(div);
  });
}

function nameInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function shortName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 10);
  return parts[0][0] + '. ' + parts[parts.length - 1].slice(0, 9);
}

// ── Actions: auto-generate + download ──
function initActions() {
  document.getElementById('autoGenBtn').addEventListener('click', autoGenerate);
  document.getElementById('downloadLineupBtn').addEventListener('click', downloadLineup);
}

function autoGenerate() {
  const players = (team.players || []).filter(p => p.name);
  if (!players.length) { alert('No players in your team yet.'); return; }

  const slots    = FORMATIONS[lineup.formation] || [];
  const assigned = new Set();
  const newSlots = {};

  // Priority order — fill most constrained positions first
  const priority = ['GK','LB','RB','CDM','LW','RW','CB','CM','LM','RM','CAM','CF','ST'];
  const sorted   = [...slots].sort((a, b) => priority.indexOf(a.posLabel) - priority.indexOf(b.posLabel));

  for (const slot of sorted) {
    const ranked = players
      .filter(p => !assigned.has(p.id))
      .map(p => ({ p, score: scoreFor(p, slot.posLabel) }))
      .sort((a, b) => b.score - a.score);
    if (ranked.length) {
      newSlots[slot.key] = ranked[0].p.id;
      assigned.add(ranked[0].p.id);
    }
  }

  lineup.slots = newSlots;
  persistLineup();
  renderSlots();
}

function downloadLineup() {
  const wrap  = document.getElementById('pitchWrap');
  const pitch = document.getElementById('luPitch');

  // Use html2canvas if available, else fall back to SVG export
  // Simple fallback: capture pitch as image via canvas
  const canvas  = document.createElement('canvas');
  const rect    = pitch.getBoundingClientRect();
  const scale   = 2;
  canvas.width  = rect.width  * scale;
  canvas.height = rect.height * scale;
  const ctx     = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Draw pitch background using SVG
  const svgEl  = pitch.querySelector('.lu-pitch-svg');
  const svgStr = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl  = URL.createObjectURL(svgBlob);
  const img     = new Image();

  img.onload = () => {
    ctx.drawImage(img, 0, 0, rect.width, rect.height);
    URL.revokeObjectURL(svgUrl);

    // Draw slots on canvas
    const pitchRect = pitch.getBoundingClientRect();
    pitch.querySelectorAll('.lu-slot').forEach(slot => {
      const sr    = slot.getBoundingClientRect();
      const cx    = sr.left - pitchRect.left + sr.width  / 2;
      const cy    = sr.top  - pitchRect.top  + sr.height / 2;
      const r     = 22;
      const filled = slot.classList.contains('lu-slot-filled');

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = filled ? '#1d4ed8' : 'rgba(255,255,255,0.25)';
      ctx.fill();
      ctx.strokeStyle = filled ? '#93c5fd' : 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const circle = slot.querySelector('.lu-slot-circle');
      const label  = slot.querySelector('.lu-slot-label');
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${filled ? 10 : 9}px Segoe UI, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((circle?.textContent || '').trim(), cx, cy);

      ctx.font = '8px Segoe UI, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText((label?.textContent || '').trim().slice(0, 10), cx, cy + r + 7);
    });

    // Title
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, rect.width, 26);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(lineup.name + '  ·  ' + lineup.formation, 10, 13);

    const link = document.createElement('a');
    link.download = (lineup.name || 'lineup').replace(/[^a-z0-9]/gi, '_') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  img.src = svgUrl;
}

// ── Player picker ──
let activeSlot = null;

function initPicker() {
  document.getElementById('closePicker').addEventListener('click', closePicker);
  document.getElementById('pickerBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('pickerBackdrop')) closePicker();
  });
}

function openPicker(slot) {
  activeSlot = slot;
  const players  = team.players || [];
  const assigned = new Set(Object.values(lineup.slots || {}));
  const current  = (lineup.slots || {})[slot.key];

  document.getElementById('pickerTitle').textContent = slot.posLabel + ' — Choose Player';

  // Sort: position match first, then by score
  const sorted = [...players]
    .map(p => ({
      p,
      score:    scoreFor(p, slot.posLabel),
      hasPos:   (p.attrs?.positions || []).includes(slot.posLabel),
      isAssigned: assigned.has(p.id) && p.id !== current,
    }))
    .sort((a, b) => {
      if (a.hasPos !== b.hasPos) return b.hasPos - a.hasPos;
      return b.score - a.score;
    });

  const list = document.getElementById('pickerList');
  list.innerHTML = '';

  // Clear option
  if (current) {
    const clear = document.createElement('div');
    clear.className = 'lu-picker-item lu-picker-clear';
    clear.innerHTML = '<span>— Remove player —</span>';
    clear.addEventListener('click', () => { assignPlayer(slot.key, null); closePicker(); });
    list.appendChild(clear);
  }

  sorted.forEach(({ p, score, hasPos, isAssigned }) => {
    const overall = overallRating(p);
    const item = document.createElement('div');
    item.className = 'lu-picker-item' + (isAssigned ? ' lu-picker-used' : '') + (p.id === current ? ' lu-picker-current' : '');
    item.innerHTML = `
      <div class="lu-picker-avatar">${nameInitials(p.name)}</div>
      <div class="lu-picker-info">
        <span class="lu-picker-name">${escHtml(p.name)}</span>
        <span class="lu-picker-positions">${(p.attrs?.positions || []).join(' · ') || '—'}</span>
      </div>
      <div class="lu-picker-meta">
        ${hasPos ? '<span class="lu-pos-match">✓ ' + slot.posLabel + '</span>' : ''}
        <span class="lu-picker-ovr">${overall > 0 ? overall : '—'}</span>
      </div>
    `;
    item.addEventListener('click', () => { assignPlayer(slot.key, p.id); closePicker(); });
    list.appendChild(item);
  });

  if (!sorted.length) {
    list.innerHTML = '<div class="lu-picker-empty">No players in your team yet.</div>';
  }

  document.getElementById('pickerBackdrop').classList.add('active');
}

function closePicker() {
  document.getElementById('pickerBackdrop').classList.remove('active');
  activeSlot = null;
}

function assignPlayer(slotKey, playerId) {
  if (!lineup.slots) lineup.slots = {};
  if (playerId === null) {
    delete lineup.slots[slotKey];
  } else {
    // If this player is already in another slot, remove them from there
    for (const [k, v] of Object.entries(lineup.slots)) {
      if (v === playerId && k !== slotKey) delete lineup.slots[k];
    }
    lineup.slots[slotKey] = playerId;
  }
  persistLineup();
  renderSlots();
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
