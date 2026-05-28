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

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTeam() {
  return loadTeams().find((t) => t.id === teamId);
}

function updateTeam(updated) {
  const all = loadTeams();
  const idx = all.findIndex((t) => t.id === teamId);
  if (idx !== -1) { all[idx] = updated; saveTeams(all); }
}

// ── Bootstrap ──
const params = new URLSearchParams(window.location.search);
const teamId = params.get('id');
const team   = getTeam();

if (!team) {
  document.getElementById('pageContent').style.display = 'none';
  document.getElementById('notFound').style.display    = 'flex';
} else {
  document.title = 'Stats — ' + team.name;
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href            = 'team.html?id=' + teamId;
  document.getElementById('teamMeta').textContent     = team.name;
  renderGames();
  initModal();
}

// ── Render ──
function renderGames() {
  const games = getTeam().games || [];
  const list  = document.getElementById('gamesList');
  const empty = document.getElementById('gamesEmpty');

  if (games.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = games.map((game) => `
    <li class="player-row" data-game-id="${game.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(game.name)}">
      <div class="player-avatar exercise-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
      <div class="stat-game-info">
        <span class="player-name">${escapeHtml(game.name)}</span>
        ${game.date ? `<span class="stat-game-date">${formatDate(game.date)}</span>` : ''}
      </div>
      <span class="player-row-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
      <button class="player-delete" data-delete-id="${game.id}" aria-label="Remove ${escapeHtml(game.name)}" title="Remove game"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg></button>
    </li>
  `).join('');
}

// ── Modal ──
function initModal() {
  const backdrop = document.getElementById('gameModalBackdrop');

  function openModal() {
    backdrop.classList.add('active');
    document.getElementById('gameNameInput').value  = '';
    document.getElementById('gameDateInput').value  = new Date().toISOString().slice(0, 10);
    document.getElementById('gameInputError').textContent = '';
    setTimeout(() => document.getElementById('gameNameInput').focus(), 50);
  }

  function closeModal() {
    backdrop.classList.remove('active');
  }

  function submit() {
    const nameInput = document.getElementById('gameNameInput');
    const name = nameInput.value.trim();
    if (!name) {
      document.getElementById('gameInputError').textContent = 'Please enter a game name.';
      nameInput.focus();
      return;
    }
    const date = document.getElementById('gameDateInput').value;
    const t = getTeam();
    if (!t.games) t.games = [];
    t.games.unshift({ id: crypto.randomUUID(), name, date, playerStats: [] });
    updateTeam(t);
    renderGames();
    closeModal();
  }

  document.getElementById('openAddGame').addEventListener('click', openModal);
  document.getElementById('closeGameModal').addEventListener('click', closeModal);
  document.getElementById('cancelGameModal').addEventListener('click', closeModal);
  document.getElementById('addGameBtn').addEventListener('click', submit);

  document.getElementById('gameNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') closeModal();
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.getElementById('gamesList').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('[data-delete-id]');
    if (deleteBtn) {
      e.stopPropagation();
      showConfirm('Delete this game and all its stats?', () => {
        const t = getTeam();
        t.games = (t.games || []).filter((g) => g.id !== deleteBtn.dataset.deleteId);
        updateTeam(t);
        renderGames();
      });
      return;
    }
    const row = e.target.closest('[data-game-id]');
    if (row) window.location.href = 'stat.html?teamId=' + teamId + '&gameId=' + row.dataset.gameId;
  });

  document.getElementById('gamesList').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const row = e.target.closest('[data-game-id]');
      if (row) window.location.href = 'stat.html?teamId=' + teamId + '&gameId=' + row.dataset.gameId;
    }
  });
}
