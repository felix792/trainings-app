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
