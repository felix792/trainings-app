const STORAGE_KEY = 'football_coach_teams';

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
let tlHidden = false;
let tlActiveFilters = new Set(['goal', 'card', 'sub']);

function renderTimeline(players) {
  const events = game.events || [];
  if (!events.length) return;

  document.getElementById('timelineSection').style.display = '';

  const pname = (id) => {
    if (!id || id === 'own_goal') return 'Own Goal';
    const p = players.find(x => x.id === id);
    return p ? p.name : 'Unknown';
  };

  const track = document.getElementById('tlTrack');

  function drawTrack() {
    if (tlHidden) { track.style.display = 'none'; return; }
    track.style.display = '';
    track.innerHTML = '';

    const filterType = (e) => (e.type === 'yellow_card' || e.type === 'red_card') ? 'card' : e.type;
    const sorted = [...events]
      .filter(e => tlActiveFilters.has(filterType(e)))
      .sort((a, b) => a.minute - b.minute);

    if (!sorted.length) {
      track.innerHTML = '<p class="players-empty" style="margin:12px 0 4px;">No events match the selected filters.</p>';
      return;
    }

    sorted.forEach(evt => {
      const item = document.createElement('div');
      item.className = 'tl-item tl-type-' + evt.type;

      if (evt.type === 'goal') {
        const ownGoal = evt.scorer === 'own_goal';
        const scorerName = pname(evt.scorer);
        const assistText = evt.assist ? pname(evt.assist) : 'No assist';
        item.innerHTML = `
          <div class="tl-row">
            <span class="tl-min">${evt.minute}'</span>
            <span class="tl-icon">⚽${ownGoal ? '<span class="tl-og-badge">OG</span>' : ''}</span>
            <span class="tl-goal-summary">
              <span class="tl-goal-scorer">${escapeHtml(scorerName)}</span>
              ${evt.assist ? `<span class="tl-goal-assist">▸ ${escapeHtml(assistText)}</span>` : ''}
            </span>
          </div>`;
      } else if (evt.type === 'yellow_card') {
        item.innerHTML = `
          <div class="tl-row">
            <span class="tl-min">${evt.minute}'</span>
            <span class="tl-icon">🟨</span>
            <span class="tl-text">${escapeHtml(pname(evt.playerId))}</span>
          </div>`;
      } else if (evt.type === 'red_card') {
        item.innerHTML = `
          <div class="tl-row">
            <span class="tl-min">${evt.minute}'</span>
            <span class="tl-icon">🟥</span>
            <span class="tl-text">${escapeHtml(pname(evt.playerId))}</span>
          </div>`;
      } else if (evt.type === 'sub') {
        item.innerHTML = `
          <div class="tl-row">
            <span class="tl-min">${evt.minute}'</span>
            <span class="tl-icon tl-sub-icon">↕</span>
            <span class="tl-text"><span class="tl-sub-off">${escapeHtml(pname(evt.off))}</span> → <span class="tl-sub-on">${escapeHtml(pname(evt.on))}</span></span>
          </div>`;
      }

      track.appendChild(item);
    });
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
