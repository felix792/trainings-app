const STORAGE_KEY = 'football_coach_teams';

// ── Timeline state (must be declared before renderTimeline is called) ──
let tlHidden = false;
let tlActiveFilters = new Set(['goal', 'card', 'sub']);

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

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function maxFor(stat) {
  if (stat === 'minutesPlayed') return 120;
  if (stat === 'redCards')      return 1;
  if (stat === 'yellowCards')   return 2;
  return 99;
}

// ── URL params ──
const params = new URLSearchParams(window.location.search);
const teamId = params.get('teamId');
const gameId = params.get('gameId');

const team = loadTeams().find((t) => t.id === teamId);
// Keep a mutable local copy of the game so saves are cheap
const game = team && (team.games || []).find((g) => g.id === gameId);

if (!game) {
  document.getElementById('pageContent').style.display = 'none';
  document.getElementById('notFound').style.display    = 'flex';
  document.getElementById('notFoundBack').href = team ? 'stats.html?id=' + teamId : 'index.html';
} else {
  document.title = game.name + ' — TactIQ';
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href            = 'stats.html?id=' + teamId;
  document.getElementById('gameName').textContent     = game.name;
  document.getElementById('gameMeta').textContent     =
    (game.date ? formatDate(game.date) + ' · ' : '') + team.name;

  const players = team.players || [];

  if (players.length === 0) {
    document.getElementById('noPlayers').style.display    = 'block';
    document.getElementById('statTableWrap').style.display = 'none';
  } else {
    renderStatRows(players);
  }

  renderTimeline(players);
}

// ── Persist ──
let saveDebounce;

function scheduleSave() {
  clearTimeout(saveDebounce);
  saveDebounce = setTimeout(() => {
    const all = loadTeams();
    const t   = all.find((x) => x.id === teamId);
    if (!t) return;
    const idx = (t.games || []).findIndex((g) => g.id === gameId);
    if (idx === -1) return;
    t.games[idx] = game;
    saveTeams(all);
    const status = document.getElementById('saveStatus');
    status.textContent = 'Saved';
    setTimeout(() => { status.textContent = ''; }, 1500);
  }, 500);
}

// ── Timeline ──

function renderTimeline(players) {
  const events = game.events || [];

  const section = document.getElementById('timelineSection');
  section.style.display = 'block';

  const pname = (id) => {
    if (!id || id === 'own_goal') return 'Own Goal';
    const p = players.find(x => x.id === id);
    return p ? p.name : 'Unknown';
  };

  const track = document.getElementById('tlTrack');

  function drawTrack() {
    if (tlHidden) { track.style.display = 'none'; return; }
    track.style.display = 'block';

    if (!events.length) {
      track.innerHTML = '<p style="color:#94a3b8;font-size:0.88rem;padding:12px 0;margin:0;">No events yet — goals, cards and subs are tracked during a Live Game.</p>';
      return;
    }

    const filterKey = (e) => {
      if (e.type === 'yellow_card' || e.type === 'red_card') return 'card';
      return e.type;
    };
    const sorted = [...events]
      .filter(e => tlActiveFilters.has(filterKey(e)))
      .sort((a, b) => (a.minute || 0) - (b.minute || 0));

    if (!sorted.length) {
      track.innerHTML = '<p style="color:#94a3b8;font-size:0.88rem;padding:12px 0;margin:0;">No events match the selected filters.</p>';
      return;
    }

    let html = '';
    sorted.forEach(evt => {
      const min = (evt.minute || 0) + "'";
      const ROW_STYLE = 'display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);';
      const MIN_STYLE = 'min-width:30px;font-size:0.78rem;font-weight:700;color:#94a3b8;text-align:right;flex-shrink:0;';
      const ICON_STYLE = 'width:22px;text-align:center;font-size:1rem;flex-shrink:0;';
      const TEXT_STYLE = 'font-size:0.9rem;color:#f1f5f9;';

      if (evt.type === 'goal') {
        const scorer     = evt.scorer || evt.playerId || null;
        const ownGoal    = scorer === 'own_goal';
        const scorerName = scorer ? pname(scorer) : '–';
        const assistName = evt.assist ? pname(evt.assist) : null;
        const ogBadge    = ownGoal ? ' <span style="font-size:0.6rem;font-weight:700;background:#dc2626;color:#fff;border-radius:3px;padding:0 3px;vertical-align:super;">OG</span>' : '';
        html += `<div style="${ROW_STYLE}">
          <span style="${MIN_STYLE}">${min}</span>
          <span style="${ICON_STYLE}">⚽${ogBadge}</span>
          <span style="display:flex;flex-direction:column;gap:2px;">
            <span style="font-size:0.9rem;font-weight:600;color:#f1f5f9;">${escapeHtml(scorerName)}</span>
            ${assistName ? `<span style="font-size:0.78rem;color:#94a3b8;">▸ ${escapeHtml(assistName)}</span>` : ''}
          </span>
        </div>`;
      } else if (evt.type === 'yellow_card') {
        html += `<div style="${ROW_STYLE}">
          <span style="${MIN_STYLE}">${min}</span>
          <span style="${ICON_STYLE}">🟨</span>
          <span style="${TEXT_STYLE}">${escapeHtml(pname(evt.playerId))}</span>
        </div>`;
      } else if (evt.type === 'red_card') {
        html += `<div style="${ROW_STYLE}">
          <span style="${MIN_STYLE}">${min}</span>
          <span style="${ICON_STYLE}">🟥</span>
          <span style="${TEXT_STYLE}">${escapeHtml(pname(evt.playerId))}</span>
        </div>`;
      } else if (evt.type === 'sub') {
        html += `<div style="${ROW_STYLE}">
          <span style="${MIN_STYLE}">${min}</span>
          <span style="${ICON_STYLE};color:#a78bfa;">↕</span>
          <span style="${TEXT_STYLE}">
            <span style="color:#f87171;font-weight:600;">${escapeHtml(pname(evt.off))}</span>
            → <span style="color:#4ade80;font-weight:600;">${escapeHtml(pname(evt.on))}</span>
          </span>
        </div>`;
      }
    });
    track.innerHTML = html;
  }

  drawTrack();

  document.getElementById('tlToggleBtn').addEventListener('click', () => {
    tlHidden = !tlHidden;
    document.getElementById('tlToggleBtn').textContent = tlHidden ? 'Show' : 'Hide';
    drawTrack();
  });

  document.getElementById('tlFilters').querySelectorAll('.tl-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      if (tlActiveFilters.has(type)) { tlActiveFilters.delete(type); btn.classList.remove('tl-filter-active'); }
      else                           { tlActiveFilters.add(type);    btn.classList.add('tl-filter-active'); }
      drawTrack();
    });
  });
}

// ── Render ──
function renderStatRows(players) {
  const container = document.getElementById('statRows');

  players.forEach((player) => {
    // Read existing stats without creating an entry yet
    const ps = (game.playerStats || []).find((x) => x.playerId === player.id);
    const vals = ps || { goals: 0, assists: 0, minutesPlayed: 0, yellowCards: 0, redCards: 0 };

    const row = document.createElement('div');
    row.className = 'stat-player-row';
    row.innerHTML = `
      <div class="stat-player-info">
        <div class="player-avatar">${initials(player.name)}</div>
        <span class="stat-player-name">${escapeHtml(player.name)}</span>
      </div>
      ${['goals', 'assists', 'minutesPlayed', 'yellowCards', 'redCards', 'duelsWon', 'duelsLost', 'chancesCreated', 'mistakes'].map((stat) => `
        <input
          class="stat-input"
          type="number"
          min="0"
          max="${maxFor(stat)}"
          value="${vals[stat] || 0}"
          data-player-id="${player.id}"
          data-stat="${stat}"
          inputmode="numeric"
        />
      `).join('')}
    `;
    container.appendChild(row);
  });

  // Single delegated listener — entries created lazily on first edit
  container.addEventListener('input', (e) => {
    if (window.APP_ROLE === 'player') return;
    const input = e.target.closest('.stat-input');
    if (!input) return;

    const pid  = input.dataset.playerId;
    const stat = input.dataset.stat;
    const val  = Math.max(0, Math.min(maxFor(stat), parseInt(input.value, 10) || 0));
    input.value = val;

    if (!game.playerStats) game.playerStats = [];
    let ps = game.playerStats.find((x) => x.playerId === pid);
    if (!ps) {
      ps = { playerId: pid, goals: 0, assists: 0, minutesPlayed: 0, yellowCards: 0, redCards: 0, duelsWon: 0, duelsLost: 0, chancesCreated: 0, mistakes: 0 };
      game.playerStats.push(ps);
    }
    ps[stat] = val;
    scheduleSave();
  });
}

window.DB_READY.then(() => {
  if (window.APP_ROLE !== 'player') return;
  document.body.classList.add('role-player');
  document.querySelectorAll('.stat-input').forEach(inp => { inp.disabled = true; });
  // Hide every stat row that doesn't belong to the current player
  const uid = firebase.auth().currentUser?.uid;
  const t   = loadTeams().find(x => x.id === teamId);
  const me  = uid && (t?.players || []).find(p => p.uid === uid);
  if (me) {
    document.querySelectorAll('.stat-player-row').forEach(row => {
      const inp = row.querySelector('[data-player-id]');
      if (inp && inp.dataset.playerId !== me.id) row.remove();
    });
  }
});
