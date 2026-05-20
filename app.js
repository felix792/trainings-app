const STORAGE_KEY = 'football_coach_teams';

function loadTeams() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTeams(teams) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function render() {
  const teams = loadTeams();
  const emptyState = document.getElementById('emptyState');
  const teamsSection = document.getElementById('teamsSection');
  const grid = document.getElementById('teamsGrid');

  if (teams.length === 0) {
    emptyState.style.display = 'flex';
    teamsSection.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  teamsSection.style.display = 'block';

  grid.innerHTML = teams.map((team) => `
    <div class="team-card" data-id="${team.id}" tabindex="0" role="button" aria-label="Open ${team.name}">
      <button class="team-card-delete" data-delete="${team.id}" aria-label="Delete ${team.name}" title="Delete team"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg></button>
      <div class="team-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4V12c0 5-4 8.5-8 10C8 20.5 4 17 4 12V6z"/></svg></div>
      <div class="team-card-name">${escapeHtml(team.name)}</div>
      <div class="team-card-meta">Created ${formatDate(team.createdAt)}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function openModal() {
  document.getElementById('modalBackdrop').classList.add('active');
  document.getElementById('teamNameInput').value = '';
  document.getElementById('inputError').textContent = '';
  setTimeout(() => document.getElementById('teamNameInput').focus(), 50);
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('active');
}

function createTeam() {
  const input = document.getElementById('teamNameInput');
  const name = input.value.trim();

  if (!name) {
    document.getElementById('inputError').textContent = 'Please enter a team name.';
    input.focus();
    return;
  }

  const teams = loadTeams();
  const duplicate = teams.some((t) => t.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    document.getElementById('inputError').textContent = 'A team with this name already exists.';
    input.focus();
    return;
  }

  teams.unshift({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString() });
  saveTeams(teams);
  closeModal();
  render();
}

function deleteTeam(id) {
  const teams = loadTeams().filter((t) => t.id !== id);
  saveTeams(teams);
  render();
}

// ── Event listeners ──
document.getElementById('openModal').addEventListener('click', openModal);
document.getElementById('openModalHero').addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);
document.getElementById('createTeam').addEventListener('click', createTeam);

document.getElementById('teamNameInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') createTeam();
  if (e.key === 'Escape') closeModal();
});

document.getElementById('modalBackdrop').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById('teamsGrid').addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('[data-delete]');
  if (deleteBtn) {
    e.stopPropagation();
    deleteTeam(deleteBtn.dataset.delete);
    return;
  }
  const card = e.target.closest('.team-card');
  if (card) {
    window.location.href = 'team.html?id=' + card.dataset.id;
  }
});

// Keyboard accessibility for cards
document.getElementById('teamsGrid').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const card = e.target.closest('.team-card');
    if (card) card.click();
  }
});

render();
