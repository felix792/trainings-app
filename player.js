const STORAGE_KEY = 'football_coach_teams';
const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'];
const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const ATTR_LABELS = {
  defensiveAbility: 'Defensive Ability',
  shot:             'Shot',
  condition:        'Condition',
  touch:            'Touch',
  awareness:        'Awareness',
  oneVsOneDefensive:'1v1 Defensive',
  oneVsOneOffensive:'1v1 Offensive',
  moral:            'Moral',
  speed:            'Speed',
  physicalAbility:  'Physical Ability',
  positions:        'Positions',
  strongFoot:       'Strong Foot',
};
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

  buildRatings();
  buildPositions();
  buildStrongFoot();
  buildNotes();
  buildAttrHistory();
  buildStats();
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

// ── Numeric ratings ──
function buildRatings() {
  document.querySelectorAll('.rating-row').forEach((row) => {
    const attr = row.dataset.attr;
    const current = player.attrs[attr] || 0;
    const card = row.closest('.attr-card');

    RATINGS.forEach((n) => {
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
      chartPanel.classList.remove('attr-chart-visible');
    });
  });
}

function renderAttrChart(panel, attr) {
  const history = (player.attrHistory || []).filter((e) => e.attr === attr);
  panel.innerHTML = '';

  if (history.length === 0) {
    panel.innerHTML = '<p class="attr-chart-empty">No changes recorded yet.</p>';
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
    row.innerHTML = `
      <span class="ah-date">${formatDateTime(entry.date)}</span>
      <div class="ah-change">
        <span class="ah-from">${entry.from || '—'}</span>
        <span class="ah-arrow ${cls}">${arrow}</span>
        <span class="ah-to ${cls}">${entry.to || '—'}</span>
      </div>`;
    list.appendChild(row);
  });
  panel.appendChild(list);
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
  const grid = document.getElementById('positionsGrid');
  const selected = new Set(player.attrs.positions || []);

  POSITIONS.forEach((pos) => {
    const btn = document.createElement('button');
    btn.className = 'pos-btn' + (selected.has(pos) ? ' pos-btn-active' : '');
    btn.textContent = pos;
    btn.addEventListener('click', () => {
      if (selected.has(pos)) { selected.delete(pos); btn.classList.remove('pos-btn-active'); }
      else                   { selected.add(pos);    btn.classList.add('pos-btn-active'); }
      saveAttr('positions', [...selected]);
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
