const STORAGE_KEY = 'football_coach_teams';
const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'];
const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let panelLocked = false;
let modalAttr    = null;

const FIELD_ATTRS = {
  defensiveAbility:  'Defensive Ability',
  shot:              'Shot',
  condition:         'Condition',
  touch:             'Touch',
  awareness:         'Awareness',
  oneVsOneDefensive: '1v1 Defensive',
  oneVsOneOffensive: '1v1 Offensive',
  moral:             'Moral',
  speed:             'Speed',
  physicalAbility:   'Physical Ability',
  dribbling:         'Dribbling',
  passing:           'Passing',
};

const GK_ATTRS = {
  gkPositioning:   'Positioning',
  gkShotStopping:  'Shot-stopping',
  gkComingOffLine: 'Coming off the line',
  gkJumping:       'Jumping & Explosiveness',
  gkReactionSpeed: 'Reaction Speed',
  gkSpaceControl:  'Space Control',
  gkBuildUpPlay:   'Build-up Play',
  gkLeadership:    'Leadership Qualities',
  gkComposure:     'Composure under Pressure',
};

const ATTR_LABELS = {
  ...FIELD_ATTRS,
  ...GK_ATTRS,
  positions:  'Positions',
  strongFoot: 'Strong Foot',
};
function fmtStat(n) {
  return String(Math.min(99, Math.max(1, Math.round(n)))).padStart(2, '0');
}

function scaleRating(val) {
  return Math.max(1, Math.round(((val || 0) / 10) * 99));
}

function buildCard() {
  const container = document.getElementById('playerCard');
  if (!container) return;

  const a = player.attrs || {};
  const pac = scaleRating(a.speed);
  const sho = scaleRating(a.shot);
  const pas = scaleRating(a.passing);
  const dri = scaleRating(a.dribbling);
  const def = scaleRating(a.defensiveAbility);
  const phy = scaleRating(a.physicalAbility);
  const rating = Math.round((pac + sho + pas + dri + def + phy) / 6);
  const position = (a.positions && a.positions[0]) || 'CM';
  const name = player.name.toUpperCase().slice(0, 14);
  const teamShort = (typeof team !== 'undefined' ? team.name : '').toUpperCase().slice(0, 3);

  const CARD_PATH  = 'M32 0 L132 0 Q138 0 144 12 L150 26 L156 12 Q162 0 168 0 L268 0 Q300 0 300 32 L300 388 Q300 420 268 420 L32 420 Q0 420 0 388 L0 32 Q0 0 32 0 Z';
  const INNER_PATH = 'M36 8 L134 8 Q139 8 144 19 L150 32 L156 19 Q161 8 166 8 L264 8 Q292 8 292 36 L292 384 Q292 412 264 412 L36 412 Q8 412 8 384 L8 36 Q8 8 36 8 Z';
  const rays = [[0,0],[70,0],[140,0],[210,0],[280,0],[300,60],[300,160],[300,270],[300,370],[240,420],[180,420],[120,420],[60,420],[0,370],[0,240],[0,110]];

  container.innerHTML = `
    <svg viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;">
      <defs>
        <linearGradient id="fsBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#8800CC"/>
          <stop offset="30%"  stop-color="#CC00AA"/>
          <stop offset="65%"  stop-color="#AA00CC"/>
          <stop offset="100%" stop-color="#5500BB"/>
        </linearGradient>
        <linearGradient id="fsOv" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stop-color="rgba(255,50,220,0.5)"/>
          <stop offset="50%"  stop-color="rgba(180,0,255,0.1)"/>
          <stop offset="100%" stop-color="rgba(100,0,200,0.45)"/>
        </linearGradient>
        <radialGradient id="fsBurst" cx="60%" cy="40%" r="44%">
          <stop offset="0%"   stop-color="rgba(255,255,255,0.26)"/>
          <stop offset="40%"  stop-color="rgba(255,160,255,0.09)"/>
          <stop offset="100%" stop-color="rgba(120,0,200,0)"/>
        </radialGradient>
        <linearGradient id="fsGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#FFE44D"/>
          <stop offset="50%"  stop-color="#FFD700"/>
          <stop offset="100%" stop-color="#C89800"/>
        </linearGradient>
        <clipPath id="fsClip"><path d="${CARD_PATH}"/></clipPath>
      </defs>

      <g clip-path="url(#fsClip)">
        <rect width="300" height="420" fill="url(#fsBg)"/>
        <rect width="300" height="420" fill="url(#fsOv)"/>
        ${rays.map(([x2,y2]) => `<line x1="175" y1="175" x2="${x2}" y2="${y2}" stroke="rgba(255,70,255,0.28)" stroke-width="1"/>`).join('')}
        <ellipse cx="222" cy="78"  rx="58" ry="40" fill="rgba(255,40,200,0.3)"  transform="rotate(-22,222,78)"/>
        <ellipse cx="68"  cy="282" rx="38" ry="62" fill="rgba(160,0,255,0.22)"  transform="rotate(16,68,282)"/>
        <ellipse cx="256" cy="312" rx="32" ry="50" fill="rgba(255,0,180,0.18)"  transform="rotate(-12,256,312)"/>
        <ellipse cx="36"  cy="158" rx="28" ry="44" fill="rgba(200,0,255,0.2)"   transform="rotate(24,36,158)"/>
        <path d="M162 0 Q172 45 157 90 Q147 120 162 150 Q177 180 158 210" fill="none" stroke="rgba(220,80,255,0.4)"  stroke-width="9"/>
        <path d="M192 0 Q202 55 186 95 Q176 128 192 162"                  fill="none" stroke="rgba(255,50,200,0.28)" stroke-width="7"/>
        <rect width="300" height="420" fill="url(#fsBurst)"/>
        <rect x="0" y="265" width="300" height="155" fill="rgba(30,0,50,0.52)"/>
      </g>

      <path d="${CARD_PATH}"  fill="none" stroke="url(#fsGold)"          stroke-width="5"/>
      <path d="${INNER_PATH}" fill="none" stroke="rgba(255,215,0,0.32)"  stroke-width="1.5"/>

      <text x="150" y="22" font-family="'Bebas Neue','Barlow Condensed',sans-serif" font-size="11" font-weight="700" fill="#FFD700" text-anchor="middle" letter-spacing="4">FUTURE STARS</text>

      <text x="38"  y="112" font-family="'Bebas Neue',sans-serif" font-size="76" fill="#FFD700" letter-spacing="-2">${fmtStat(rating)}</text>
      <text x="40"  y="144" font-family="'Barlow Condensed',sans-serif" font-weight="900" font-size="24" fill="#FFD700" letter-spacing="3">${escapeHtml(position)}</text>

      <circle cx="57" cy="215" r="26" fill="rgba(0,0,0,0.62)" stroke="rgba(255,215,0,0.5)" stroke-width="1.5"/>
      <text x="57" y="212" font-family="'Barlow Condensed',sans-serif" font-weight="900" font-size="13" fill="#FFD700" text-anchor="middle">${escapeHtml(teamShort)}</text>
      <text x="57" y="226" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="9"  fill="rgba(255,215,0,0.7)" text-anchor="middle">CLUB</text>

      <text x="150" y="298" font-family="'Bebas Neue',sans-serif" font-size="30" fill="#FFD700" text-anchor="middle" letter-spacing="4">${escapeHtml(name)}</text>
      <line x1="36" y1="308" x2="264" y2="308" stroke="rgba(255,215,0,0.4)" stroke-width="1"/>

      <text x="62"  y="348" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="end">${fmtStat(pac)}</text>
      <text x="67"  y="348" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">PAC</text>
      <text x="62"  y="375" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="end">${fmtStat(sho)}</text>
      <text x="67"  y="375" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">SHO</text>
      <text x="62"  y="402" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="end">${fmtStat(pas)}</text>
      <text x="67"  y="402" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">PAS</text>

      <line x1="150" y1="328" x2="150" y2="412" stroke="rgba(255,215,0,0.4)" stroke-width="1.5"/>

      <text x="173" y="348" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="start">${fmtStat(dri)}</text>
      <text x="207" y="348" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">DRI</text>
      <text x="173" y="375" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="start">${fmtStat(def)}</text>
      <text x="207" y="375" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">DEF</text>
      <text x="173" y="402" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="start">${fmtStat(phy)}</text>
      <text x="207" y="402" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">PHY</text>

      <line x1="36" y1="412" x2="264" y2="412" stroke="rgba(255,215,0,0.3)" stroke-width="1"/>
    </svg>`;
}

const CHART_STATS = [
  { key: 'goals',          label: 'Goals' },
  { key: 'assists',        label: 'Assists' },
  { key: 'minutesPlayed',  label: 'Minutes' },
  { key: 'yellowCards',    label: 'YC' },
  { key: 'redCards',       label: 'RC' },
  { key: 'duelsWon',       label: 'D. Won' },
  { key: 'duelsLost',      label: 'D. Lost' },
  { key: 'chancesCreated', label: 'Chances' },
  { key: 'mistakes',       label: 'Mistakes' },
];

function loadTeams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function saveTeams(teams) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function initials(name) {
  return name.trim().split(/\s+/).map((w) => w[0].toUpperCase()).slice(0, 2).join('');
}

// ── Bootstrap ──
const params  = new URLSearchParams(window.location.search);
const teamId   = params.get('teamId');
const playerId = params.get('playerId');

const teams = loadTeams();
const team  = teams.find((t) => t.id === teamId);
const player = team && (team.players || []).find((p) => p.id === playerId);

if (!player) {
  document.getElementById('pageContent').style.display = 'none';
  document.getElementById('notFound').style.display = 'flex';
  const nb = document.getElementById('notFoundBack');
  nb.href = team ? 'players.html?id=' + teamId : 'index.html';
} else {
  document.title = player.name + ' — TactIQ';
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href = 'players.html?id=' + teamId;
  document.getElementById('playerAvatar').textContent = initials(player.name);
  document.getElementById('playerName').textContent = player.name;
  document.getElementById('playerMeta').textContent = team.name;

  if (!player.attrs) player.attrs = {};

  buildPositions();
  rebuildAttrs();
  buildStrongFoot();
  buildNotes();
  buildAttrHistory();
  buildStats();

  window.DB_READY.then(() => {
    if (window.APP_ROLE === 'player') {
      applyPlayerSections(window.APP_PERMISSIONS);
      document.body.classList.add('role-player');
    }
  });

  document.getElementById('modalCancel').addEventListener('click', closeAttrModal);
  document.getElementById('modalSave').addEventListener('click', () => {
    const dateStr = document.getElementById('modalDate').value;
    const val     = parseInt(document.getElementById('modalValue').value, 10);
    if (!dateStr || isNaN(val) || val < 0 || val > 10) return;
    addManualEntry(modalAttr, dateStr, val);
    closeAttrModal();
  });
  document.getElementById('attrEntryModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAttrModal();
  });
}

// ── Persist helper ──
function saveAttr(key, value) {
  const all = loadTeams();
  const t   = all.find((x) => x.id === teamId);
  const p   = t && (t.players || []).find((x) => x.id === playerId);
  if (!p) return;
  if (!p.attrs) p.attrs = {};
  if (!p.attrHistory) p.attrHistory = [];

  if (key !== 'notes') {
    const old = p.attrs[key] !== undefined ? p.attrs[key] : null;
    const isArr = Array.isArray(old) || Array.isArray(value);
    const changed = isArr
      ? JSON.stringify([...(old || [])].sort()) !== JSON.stringify([...(value || [])].sort())
      : old !== value;
    if (changed) {
      p.attrHistory.push({ date: new Date().toISOString(), attr: key, from: old, to: value });
    }
  }

  p.attrs[key] = value;
  saveTeams(all);
  Object.assign(player.attrs, { [key]: value });
  player.attrHistory = p.attrHistory;
  refreshAttrHistory();
  const openPanel = document.getElementById('attr-chart-' + key);
  if (openPanel && openPanel.classList.contains('attr-chart-visible')) {
    renderAttrChart(openPanel, key);
  }
}

// ── Strong foot ──
function buildStrongFoot() {
  const btns = document.querySelectorAll('.foot-btn');
  const current = player.attrs.strongFoot || null;

  btns.forEach((btn) => {
    if (btn.dataset.value === current) btn.classList.add('foot-btn-active');
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('foot-btn-active'));
      btn.classList.add('foot-btn-active');
      saveAttr('strongFoot', btn.dataset.value);
    });
  });
}

// ── Dynamic attribute cards (field player or GK) ──
function isGK() {
  return (player.attrs.positions || []).includes('GK');
}

function rebuildAttrs() {
  const grid    = document.getElementById('playerAttrsGrid');
  const posCard = grid.querySelector('.attr-card-wide');

  // Remove all previously injected dynamic cards
  grid.querySelectorAll('.attr-card-dynamic').forEach(c => c.remove());

  const attrsObj = isGK() ? GK_ATTRS : FIELD_ATTRS;

  Object.entries(attrsObj).forEach(([attr, label]) => {
    const card = document.createElement('div');
    card.className = 'attr-card attr-card-dynamic';
    card.innerHTML = `
      <div class="attr-label">${label}</div>
      <div class="rating-row" data-attr="${attr}"></div>
      <div class="rating-value" id="val-${attr}">—</div>`;

    const row     = card.querySelector('.rating-row');
    const current = player.attrs[attr] || 0;

    RATINGS.forEach(n => {
      const btn = document.createElement('button');
      btn.className = 'rating-btn' + (n <= current ? ' rating-btn-active' : '');
      btn.textContent = n;
      btn.addEventListener('click', () => {
        const val = n === player.attrs[attr] ? 0 : n;
        saveAttr(attr, val);
        refreshRatingRow(row, attr);
      });
      row.appendChild(btn);
    });

    refreshRatingRow(row, attr);

    const chartPanel = document.createElement('div');
    chartPanel.className = 'attr-chart-panel';
    chartPanel.id = 'attr-chart-' + attr;
    card.appendChild(chartPanel);

    card.addEventListener('mouseenter', () => {
      renderAttrChart(chartPanel, attr);
      chartPanel.classList.add('attr-chart-visible');
    });
    card.addEventListener('mouseleave', () => {
      if (!panelLocked) chartPanel.classList.remove('attr-chart-visible');
    });

    grid.insertBefore(card, posCard);
  });
}

function renderAttrChart(panel, attr) {
  const history = (player.attrHistory || [])
    .filter((e) => e.attr === attr)
    .sort((a, b) => a.date.localeCompare(b.date));
  panel.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'attr-chart-header';
  const addBtn = document.createElement('button');
  addBtn.className = 'attr-chart-add-btn';
  addBtn.textContent = '+ Add entry';
  addBtn.addEventListener('click', (e) => { e.stopPropagation(); openAddEntryModal(attr); });
  header.appendChild(addBtn);
  panel.appendChild(header);

  if (history.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'attr-chart-empty';
    empty.textContent = 'No changes recorded yet.';
    panel.appendChild(empty);
    return;
  }

  const points = [];
  if (history[0].from !== null && history[0].from !== undefined) {
    points.push({ label: 'Start', date: null, value: history[0].from || 0 });
  }
  history.forEach((e) => points.push({ label: null, date: e.date, value: e.to || 0 }));

  const canvas = document.createElement('canvas');
  panel.appendChild(canvas);
  drawAttrChart(canvas, points);

  const list = document.createElement('div');
  list.className = 'attr-chart-list';
  [...history].reverse().forEach((entry) => {
    const diff  = (entry.to || 0) - (entry.from || 0);
    const cls   = diff > 0 ? 'ah-up' : diff < 0 ? 'ah-down' : '';
    const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '→';
    const row = document.createElement('div');
    row.className = 'ah-entry';
    const label = entry.manual ? `<span class="ah-manual">manual</span>` : '';
    row.innerHTML = `
      <span class="ah-date">${formatDateTime(entry.date)} ${label}</span>
      <div class="ah-change">
        <span class="ah-from">${entry.from !== null && entry.from !== undefined ? entry.from : '—'}</span>
        <span class="ah-arrow ${cls}">${arrow}</span>
        <span class="ah-to ${cls}">${entry.to || '—'}</span>
      </div>`;
    const delBtn = document.createElement('button');
    delBtn.className = 'attr-chart-del-btn';
    delBtn.textContent = 'x';
    delBtn.addEventListener('click', () => showConfirm('Delete this history entry?', () => deleteAttrEntry(attr, entry.date)));
    row.appendChild(delBtn);
    list.appendChild(row);
  });
  panel.appendChild(list);
}

// ── Manual entry modal ──
function openAddEntryModal(attr) {
  modalAttr    = attr;
  panelLocked  = true;
  const today  = new Date().toISOString().split('T')[0];
  document.getElementById('modalDate').value  = today;
  document.getElementById('modalValue').value = player.attrs[attr] || '';
  document.getElementById('modalAttrName').textContent = ATTR_LABELS[attr] || attr;
  document.getElementById('attrEntryModal').classList.add('modal-open');
}

function closeAttrModal() {
  document.getElementById('attrEntryModal').classList.remove('modal-open');
  panelLocked = false;
  modalAttr   = null;
}

function addManualEntry(attr, dateStr, value) {
  const all = loadTeams();
  const t   = all.find((x) => x.id === teamId);
  const p   = t && (t.players || []).find((x) => x.id === playerId);
  if (!p) return;
  if (!p.attrHistory) p.attrHistory = [];

  const isoDate = new Date(dateStr + 'T12:00:00').toISOString();
  const sorted  = p.attrHistory.filter((e) => e.attr === attr).sort((a, b) => a.date.localeCompare(b.date));
  let fromValue = p.attrs[attr] || 0;
  for (const e of sorted) {
    if (e.date <= isoDate) fromValue = e.to;
  }

  p.attrHistory.push({ date: isoDate, attr, from: fromValue, to: value, manual: true });
  saveTeams(all);
  player.attrHistory = p.attrHistory;

  const panel = document.getElementById('attr-chart-' + attr);
  if (panel) renderAttrChart(panel, attr);
  refreshAttrHistory();
}

function deleteAttrEntry(attr, isoDate) {
  panelLocked = true;

  const all = loadTeams();
  const t   = all.find((x) => x.id === teamId);
  const p   = t && (t.players || []).find((x) => x.id === playerId);
  if (!p || !p.attrHistory) { panelLocked = false; return; }

  const idx = p.attrHistory.findIndex((e) => e.attr === attr && e.date === isoDate);
  if (idx === -1) { panelLocked = false; return; }
  p.attrHistory.splice(idx, 1);
  saveTeams(all);
  player.attrHistory = p.attrHistory;

  const panel = document.getElementById('attr-chart-' + attr);
  if (panel) {
    renderAttrChart(panel, attr);
    panel.classList.add('attr-chart-visible');
  }
  refreshAttrHistory();
  setTimeout(() => { panelLocked = false; }, 100);
}

function drawAttrChart(canvas, points) {
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.parentElement.clientWidth || 300;
  const H   = 160;

  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  canvas.width  = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad = { top: 20, right: 16, bottom: 44, left: 32 };
  const cW  = W - pad.left - pad.right;
  const cH  = H - pad.top  - pad.bottom;

  ctx.fillStyle = '#070712';
  ctx.fillRect(0, 0, W, H);

  const maxVal = 10;
  for (let i = 0; i <= 5; i++) {
    const y   = pad.top + cH - (i / 5) * cH;
    const val = Math.round((i / 5) * maxVal);
    ctx.strokeStyle = '#1c1c2c';
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
    ctx.fillStyle  = '#6868a0';
    ctx.font       = '10px system-ui, sans-serif';
    ctx.textAlign  = 'right';
    ctx.fillText(val, pad.left - 5, y + 4);
  }

  const xOf = (i) => points.length === 1
    ? pad.left + cW / 2
    : pad.left + (i / (points.length - 1)) * cW;
  const yOf = (v) => pad.top + cH - (v / maxVal) * cH;

  if (points.length > 1) {
    ctx.beginPath();
    points.forEach((pt, i) => { i === 0 ? ctx.moveTo(xOf(i), yOf(pt.value)) : ctx.lineTo(xOf(i), yOf(pt.value)); });
    ctx.lineTo(xOf(points.length - 1), pad.top + cH);
    ctx.lineTo(xOf(0), pad.top + cH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, 'rgba(29,78,216,0.3)');
    grad.addColorStop(1, 'rgba(29,78,216,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    points.forEach((pt, i) => { i === 0 ? ctx.moveTo(xOf(i), yOf(pt.value)) : ctx.lineTo(xOf(i), yOf(pt.value)); });
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    ctx.stroke();
  }

  points.forEach((pt, i) => {
    const x = xOf(i), y = yOf(pt.value);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1d4ed8'; ctx.fill();
    ctx.strokeStyle = '#000010'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.fillStyle = '#e2e4f0';
    ctx.font      = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pt.value, x, y - 9);

    const xLabel = pt.label || (pt.date ? formatDate(pt.date.split('T')[0]) : '');
    ctx.save();
    ctx.translate(x, pad.top + cH + 10);
    ctx.rotate(-Math.PI / 5);
    ctx.fillStyle = '#6868a0';
    ctx.font      = '9px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(xLabel, 0, 0);
    ctx.restore();
  });
}

function refreshRatingRow(row, attr) {
  const current = player.attrs[attr] || 0;
  row.querySelectorAll('.rating-btn').forEach((btn, i) => {
    btn.classList.toggle('rating-btn-active', i + 1 <= current);
  });
  const label = document.getElementById('val-' + attr);
  if (label) label.textContent = current > 0 ? current + ' / 10' : '—';
}

// ── Notes ──
function buildNotes() {
  const textarea = document.getElementById('playerNotes');
  const status   = document.getElementById('notesStatus');
  textarea.value = player.attrs.notes || '';

  let debounce;
  textarea.addEventListener('input', () => {
    clearTimeout(debounce);
    status.textContent = '';
    debounce = setTimeout(() => {
      saveAttr('notes', textarea.value);
      status.textContent = 'Saved';
      setTimeout(() => { status.textContent = ''; }, 1500);
    }, 600);
  });
}

// ── Attribute History ──
function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function buildAttrHistory() {
  if (!player.attrHistory) player.attrHistory = [];
  refreshAttrHistory();
}

function refreshAttrHistory() {
  const container = document.getElementById('attrHistoryList');
  const history = player.attrHistory || [];

  if (history.length === 0) {
    container.innerHTML = '<p class="players-empty">No changes recorded yet.</p>';
    return;
  }

  const sorted = [...history].reverse();
  container.innerHTML = sorted.map((entry) => {
    const label = ATTR_LABELS[entry.attr] || entry.attr;
    const dateStr = formatDateTime(entry.date);
    let changeHtml;

    if (Array.isArray(entry.from) || Array.isArray(entry.to)) {
      const from = (entry.from || []).join(', ') || '—';
      const to   = (entry.to   || []).join(', ') || '—';
      changeHtml = `<span class="ah-from">${escapeHtml(from)}</span><span class="ah-arrow">→</span><span class="ah-to">${escapeHtml(to)}</span>`;
    } else if (typeof entry.to === 'number' || typeof entry.from === 'number') {
      const from = entry.from || 0;
      const to   = entry.to   || 0;
      const diff = to - from;
      const cls  = diff > 0 ? 'ah-up' : diff < 0 ? 'ah-down' : '';
      const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '→';
      changeHtml = `<span class="ah-from">${from > 0 ? from : '—'}</span><span class="ah-arrow ${cls}">${arrow}</span><span class="ah-to ${cls}">${to > 0 ? to : '—'}</span>`;
    } else {
      const from = entry.from !== null && entry.from !== undefined ? entry.from : '—';
      const to   = entry.to   !== null && entry.to   !== undefined ? entry.to   : '—';
      changeHtml = `<span class="ah-from">${escapeHtml(String(from))}</span><span class="ah-arrow">→</span><span class="ah-to">${escapeHtml(String(to))}</span>`;
    }

    return `
      <div class="ah-entry">
        <div class="ah-meta">
          <span class="ah-label">${escapeHtml(label)}</span>
          <span class="ah-date">${dateStr}</span>
        </div>
        <div class="ah-change">${changeHtml}</div>
      </div>`;
  }).join('');
}

// ── Game Stats ──
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildStats() {
  const games = team.games || [];
  const entries = [];

  games.forEach((game) => {
    const ps = (game.playerStats || []).find((s) => s.playerId === playerId);
    if (ps) entries.push({ game, ps });
  });

  const section = document.getElementById('statsSection');
  if (entries.length === 0) return;

  buildChart(entries);

  const totals = entries.reduce((acc, { ps }) => ({
    apps:     acc.apps     + 1,
    goals:    acc.goals    + (ps.goals           || 0),
    assists:  acc.assists  + (ps.assists          || 0),
    minutes:  acc.minutes  + (ps.minutesPlayed    || 0),
    yellow:   acc.yellow   + (ps.yellowCards      || 0),
    red:      acc.red      + (ps.redCards         || 0),
    duelsWon: acc.duelsWon + (ps.duelsWon         || 0),
    duelsLost:acc.duelsLost+ (ps.duelsLost        || 0),
    chances:  acc.chances  + (ps.chancesCreated   || 0),
    mistakes: acc.mistakes + (ps.mistakes         || 0),
  }), { apps: 0, goals: 0, assists: 0, minutes: 0, yellow: 0, red: 0, duelsWon: 0, duelsLost: 0, chances: 0, mistakes: 0 });

  section.innerHTML = `
    <div class="stats-summary">
      <div class="stats-summary-cell">
        <div class="stats-summary-value">${totals.apps}</div>
        <div class="stats-summary-label">Apps</div>
      </div>
      <div class="stats-summary-cell">
        <div class="stats-summary-value">${totals.goals}</div>
        <div class="stats-summary-label">Goals</div>
      </div>
      <div class="stats-summary-cell">
        <div class="stats-summary-value">${totals.assists}</div>
        <div class="stats-summary-label">Assists</div>
      </div>
      <div class="stats-summary-cell">
        <div class="stats-summary-value">${totals.minutes}</div>
        <div class="stats-summary-label">Minutes</div>
      </div>
      <div class="stats-summary-cell">
        <div class="stats-summary-value">${totals.yellow}<span style="opacity:.45;font-size:.9rem"> / </span>${totals.red}</div>
        <div class="stats-summary-label">YC / RC</div>
      </div>
      <div class="stats-summary-cell">
        <div class="stats-summary-value">${totals.duelsWon}</div>
        <div class="stats-summary-label">D. Won</div>
      </div>
      <div class="stats-summary-cell">
        <div class="stats-summary-value">${totals.duelsLost}</div>
        <div class="stats-summary-label">D. Lost</div>
      </div>
      <div class="stats-summary-cell">
        <div class="stats-summary-value">${totals.chances}</div>
        <div class="stats-summary-label">Chances</div>
      </div>
      <div class="stats-summary-cell">
        <div class="stats-summary-value">${totals.mistakes}</div>
        <div class="stats-summary-label">Mistakes</div>
      </div>
    </div>
    <div class="game-log-wrap">
      <table class="game-log-table">
        <thead>
          <tr>
            <th>Game</th>
            <th>G</th>
            <th>A</th>
            <th>Min</th>
            <th>YC</th>
            <th>RC</th>
            <th title="Duels Won">DW</th>
            <th title="Duels Lost">DL</th>
            <th title="Chances Created">CC</th>
            <th title="Mistakes">Mis</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(({ game, ps }) => `
            <tr>
              <td>
                <div class="game-log-game-name">${escapeHtml(game.name)}</div>
                ${game.date ? `<div class="game-log-date">${formatDate(game.date)}</div>` : ''}
              </td>
              <td>${ps.goals           || 0}</td>
              <td>${ps.assists         || 0}</td>
              <td>${ps.minutesPlayed   || 0}</td>
              <td>${ps.yellowCards     || 0}</td>
              <td>${ps.redCards        || 0}</td>
              <td>${ps.duelsWon        || 0}</td>
              <td>${ps.duelsLost       || 0}</td>
              <td>${ps.chancesCreated  || 0}</td>
              <td>${ps.mistakes        || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Positions ──
function buildPositions() {
  const grid     = document.getElementById('positionsGrid');
  const selected = new Set(player.attrs.positions || []);

  POSITIONS.forEach((pos) => {
    const btn = document.createElement('button');
    btn.className = 'pos-btn' + (selected.has(pos) ? ' pos-btn-active' : '');
    btn.textContent = pos;
    btn.addEventListener('click', () => {
      if (selected.has(pos)) {
        selected.delete(pos);
        btn.classList.remove('pos-btn-active');
      } else {
        if (pos === 'GK') {
          // GK is exclusive — clear all other positions
          selected.clear();
          grid.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('pos-btn-active'));
        } else if (selected.has('GK')) {
          // Adding a field position — remove GK
          selected.delete('GK');
          grid.querySelectorAll('.pos-btn').forEach(b => {
            if (b.textContent === 'GK') b.classList.remove('pos-btn-active');
          });
        }
        selected.add(pos);
        btn.classList.add('pos-btn-active');
      }
      saveAttr('positions', [...selected]);
      rebuildAttrs();
    });
    grid.appendChild(btn);
  });
}

// ── Stat Progression Chart ──
function buildChart(entries) {
  const section = document.getElementById('progressionSection');
  section.style.display = '';

  const sorted = [...entries].sort((a, b) => {
    if (!a.game.date && !b.game.date) return 0;
    if (!a.game.date) return 1;
    if (!b.game.date) return -1;
    return a.game.date.localeCompare(b.game.date);
  });

  let activeKey = 'goals';
  const tabsEl  = document.getElementById('chartStatTabs');
  const canvas  = document.getElementById('statChart');

  CHART_STATS.forEach(({ key, label }) => {
    const btn = document.createElement('button');
    btn.className = 'chart-stat-tab' + (key === activeKey ? ' chart-stat-tab-active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      activeKey = key;
      tabsEl.querySelectorAll('.chart-stat-tab').forEach((b) => b.classList.remove('chart-stat-tab-active'));
      btn.classList.add('chart-stat-tab-active');
      drawChart(canvas, sorted, activeKey);
    });
    tabsEl.appendChild(btn);
  });

  drawChart(canvas, sorted, activeKey);
  window.addEventListener('resize', () => drawChart(canvas, sorted, activeKey));
}

function drawChart(canvas, entries, statKey) {
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.parentElement.clientWidth || 340;
  const H   = 220;

  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  canvas.width  = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad = { top: 24, right: 20, bottom: 54, left: 38 };
  const cW  = W - pad.left - pad.right;
  const cH  = H - pad.top  - pad.bottom;

  ctx.fillStyle = '#0e0e1a';
  ctx.fillRect(0, 0, W, H);

  const values = entries.map(({ ps }) => ps[statKey] || 0);
  const maxVal = Math.max(...values, 1);

  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const y   = pad.top + cH - (i / gridLines) * cH;
    const val = Math.round((i / gridLines) * maxVal);
    ctx.strokeStyle = '#1c1c2c';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + cW, y);
    ctx.stroke();
    ctx.fillStyle  = '#6868a0';
    ctx.font       = '11px system-ui, sans-serif';
    ctx.textAlign  = 'right';
    ctx.fillText(val, pad.left - 6, y + 4);
  }

  const xOf = (i) => entries.length === 1
    ? pad.left + cW / 2
    : pad.left + (i / (entries.length - 1)) * cW;
  const yOf = (val) => pad.top + cH - (val / maxVal) * cH;

  if (entries.length > 1) {
    // Gradient fill
    ctx.beginPath();
    entries.forEach(({ ps }, i) => {
      const x = xOf(i), y = yOf(ps[statKey] || 0);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(xOf(entries.length - 1), pad.top + cH);
    ctx.lineTo(xOf(0), pad.top + cH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, 'rgba(29,78,216,0.3)');
    grad.addColorStop(1, 'rgba(29,78,216,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    entries.forEach(({ ps }, i) => {
      const x = xOf(i), y = yOf(ps[statKey] || 0);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    ctx.stroke();
  }

  // Dots, value labels, x-axis labels
  entries.forEach(({ game, ps }, i) => {
    const val = ps[statKey] || 0;
    const x   = xOf(i);
    const y   = yOf(val);

    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle   = '#1d4ed8';
    ctx.fill();
    ctx.strokeStyle = '#000010';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#e2e4f0';
    ctx.font      = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(val, x, y - 11);

    const label = game.name.length > 10 ? game.name.slice(0, 9) + '…' : game.name;
    ctx.save();
    ctx.translate(x, pad.top + cH + 12);
    ctx.rotate(-Math.PI / 5);
    ctx.fillStyle = '#6868a0';
    ctx.font      = '10px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });
}

// ── Player section visibility ──
function applyPlayerSections(permissions) {
  const s = (permissions && permissions.playerSections) || {};
  const hide = (id) => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };

  if (s.attributes === false) {
    hide('playerAttrsGrid');
    hide('playerNotesSection');
  }
  if (s.categoryProgression === false) hide('categoryProgressionSection');
  if (s.gameStats === false)            hide('gameStatsSection');
  if (s.statProgression === false)      hide('progressionSection');
}
