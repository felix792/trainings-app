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
  document.title = 'Plays — ' + team.name;
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href            = 'team.html?id=' + teamId;
  document.getElementById('teamMeta').textContent     = team.name;
  renderPlays();
  initModal();
}

// ── Render ──
function renderPlays() {
  const plays = getTeam().plays || [];
  const list  = document.getElementById('playsList');
  const empty = document.getElementById('playsEmpty');

  if (plays.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = plays.map((play) => `
    <li class="player-row" data-play-id="${play.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(play.name)}">
      <div class="player-avatar exercise-avatar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></div>
      <span class="player-name">${escapeHtml(play.name)}</span>
      <span class="player-row-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
      <button class="player-delete" data-delete-id="${play.id}" aria-label="Remove ${escapeHtml(play.name)}" title="Remove play"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg></button>
    </li>
  `).join('');
}

// ── Modal ──
function initModal() {
  const backdrop = document.getElementById('playModalBackdrop');

  function openModal() {
    backdrop.classList.add('active');
    document.getElementById('playNameInput').value = '';
    document.getElementById('playInputError').textContent = '';
    setTimeout(() => document.getElementById('playNameInput').focus(), 50);
  }

  function closeModal() {
    backdrop.classList.remove('active');
  }

  function submit() {
    const input = document.getElementById('playNameInput');
    const name  = input.value.trim();
    if (!name) {
      document.getElementById('playInputError').textContent = 'Please enter a play name.';
      input.focus();
      return;
    }
    const t = getTeam();
    const duplicate = (t.plays || []).some((p) => p.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      document.getElementById('playInputError').textContent = 'A play with this name already exists.';
      input.focus();
      return;
    }
    if (!t.plays) t.plays = [];
    t.plays.push({ id: crypto.randomUUID(), name });
    updateTeam(t);
    renderPlays();
    closeModal();
  }

  document.getElementById('openAddPlay').addEventListener('click', openModal);
  document.getElementById('closePlayModal').addEventListener('click', closeModal);
  document.getElementById('cancelPlayModal').addEventListener('click', closeModal);
  document.getElementById('addPlayBtn').addEventListener('click', submit);

  document.getElementById('playNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') closeModal();
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.getElementById('playsList').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('[data-delete-id]');
    if (deleteBtn) {
      e.stopPropagation();
      showConfirm('Delete this play?', () => {
        const t = getTeam();
        t.plays = t.plays.filter((p) => p.id !== deleteBtn.dataset.deleteId);
        updateTeam(t);
        renderPlays();
      });
      return;
    }
    const row = e.target.closest('[data-play-id]');
    if (row) window.location.href = 'play.html?teamId=' + teamId + '&playId=' + row.dataset.playId;
  });

  document.getElementById('playsList').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const row = e.target.closest('[data-play-id]');
      if (row) window.location.href = 'play.html?teamId=' + teamId + '&playId=' + row.dataset.playId;
    }
  });
}
