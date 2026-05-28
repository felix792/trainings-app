const STORAGE_KEY = 'football_coach_teams';

function loadTeams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveTeams(t) { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); }
function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function getTeam() { return loadTeams().find(t => t.id === teamId); }
function updateTeam(t) {
  const all = loadTeams(); const i = all.findIndex(x => x.id === teamId);
  if (i !== -1) { all[i] = t; saveTeams(all); }
}

const params = new URLSearchParams(window.location.search);
const teamId = params.get('id');
const team   = getTeam();

if (!team) {
  document.getElementById('pageContent').style.display = 'none';
  document.getElementById('notFound').style.display    = 'flex';
} else {
  document.title = 'Lineups — ' + team.name;
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href            = 'team.html?id=' + teamId;
  document.getElementById('teamMeta').textContent     = team.name;
  renderLineups();
  initModal();
}

function renderLineups() {
  const lineups = getTeam().lineups || [];
  const list    = document.getElementById('lineupsList');
  const empty   = document.getElementById('lineupsEmpty');
  if (!lineups.length) { empty.style.display = 'block'; list.innerHTML = ''; return; }
  empty.style.display = 'none';
  list.innerHTML = lineups.map(lu => `
    <li class="player-row" data-lu-id="${lu.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(lu.name)}">
      <div class="player-avatar exercise-avatar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 10l3 3 5-5"/></svg>
      </div>
      <div style="flex:1;min-width:0;">
        <span class="player-name">${escapeHtml(lu.name)}</span>
        <span class="player-pos-badge" style="margin-left:8px;font-size:.78rem;color:var(--text-muted);">${lu.formation || ''}</span>
      </div>
      <span class="player-row-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
      <button class="player-delete" data-delete-id="${lu.id}" aria-label="Remove ${escapeHtml(lu.name)}" title="Remove"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg></button>
    </li>
  `).join('');
}

function initModal() {
  const backdrop = document.getElementById('lineupModalBackdrop');
  const open  = () => { backdrop.classList.add('active'); document.getElementById('lineupNameInput').value = ''; document.getElementById('lineupInputError').textContent = ''; setTimeout(() => document.getElementById('lineupNameInput').focus(), 50); };
  const close = () => backdrop.classList.remove('active');

  function submit() {
    const name = document.getElementById('lineupNameInput').value.trim();
    if (!name) { document.getElementById('lineupInputError').textContent = 'Please enter a lineup name.'; return; }
    const t = getTeam();
    if ((t.lineups || []).some(l => l.name.toLowerCase() === name.toLowerCase())) {
      document.getElementById('lineupInputError').textContent = 'A lineup with this name already exists.'; return;
    }
    if (!t.lineups) t.lineups = [];
    const id = crypto.randomUUID();
    t.lineups.push({ id, name, formation: '4-3-3', slots: {} });
    updateTeam(t);
    close();
    window.location.href = 'lineup.html?teamId=' + teamId + '&lineupId=' + id;
  }

  document.getElementById('openAddLineup').addEventListener('click', open);
  document.getElementById('closeLineupModal').addEventListener('click', close);
  document.getElementById('cancelLineupModal').addEventListener('click', close);
  document.getElementById('addLineupBtn').addEventListener('click', submit);
  document.getElementById('lineupNameInput').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') close(); });
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  document.getElementById('lineupsList').addEventListener('click', e => {
    const del = e.target.closest('[data-delete-id]');
    if (del) {
      e.stopPropagation();
      showConfirm('Delete this lineup?', () => {
        const t = getTeam(); t.lineups = (t.lineups || []).filter(l => l.id !== del.dataset.deleteId);
        updateTeam(t); renderLineups();
      });
      return;
    }
    const row = e.target.closest('[data-lu-id]');
    if (row) window.location.href = 'lineup.html?teamId=' + teamId + '&lineupId=' + row.dataset.luId;
  });
  document.getElementById('lineupsList').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const row = e.target.closest('[data-lu-id]');
      if (row) window.location.href = 'lineup.html?teamId=' + teamId + '&lineupId=' + row.dataset.luId;
    }
  });
}
