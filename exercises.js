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
const team = getTeam();

if (!team) {
  document.getElementById('pageContent').style.display = 'none';
  document.getElementById('notFound').style.display = 'flex';
} else {
  document.title = 'Exercises — ' + team.name;
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href = 'team.html?id=' + teamId;
  document.getElementById('teamMeta').textContent = team.name;
  renderExercises();
  initModal();
}

// ── Render ──
function renderExercises() {
  const exercises = getTeam().exercises || [];
  const list  = document.getElementById('exercisesList');
  const empty = document.getElementById('exercisesEmpty');

  if (exercises.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = exercises.map((ex) => `
    <li class="player-row" data-exercise-id="${ex.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(ex.name)}">
      <div class="player-avatar exercise-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
      <span class="player-name">${escapeHtml(ex.name)}</span>
      <span class="player-row-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
      <button class="player-delete" data-delete-id="${ex.id}" aria-label="Remove ${escapeHtml(ex.name)}" title="Remove exercise"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg></button>
    </li>
  `).join('');
}

// ── Modal ──
function initModal() {
  const backdrop = document.getElementById('exerciseModalBackdrop');

  function openModal() {
    backdrop.classList.add('active');
    document.getElementById('exerciseNameInput').value = '';
    document.getElementById('exerciseInputError').textContent = '';
    setTimeout(() => document.getElementById('exerciseNameInput').focus(), 50);
  }

  function closeModal() {
    backdrop.classList.remove('active');
  }

  function submit() {
    const input = document.getElementById('exerciseNameInput');
    const name  = input.value.trim();
    if (!name) {
      document.getElementById('exerciseInputError').textContent = 'Please enter an exercise name.';
      input.focus();
      return;
    }
    const t = getTeam();
    const duplicate = (t.exercises || []).some((ex) => ex.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      document.getElementById('exerciseInputError').textContent = 'An exercise with this name already exists.';
      input.focus();
      return;
    }
    if (!t.exercises) t.exercises = [];
    t.exercises.push({ id: crypto.randomUUID(), name });
    updateTeam(t);
    renderExercises();
    closeModal();
  }

  document.getElementById('openAddExercise').addEventListener('click', openModal);
  document.getElementById('closeExerciseModal').addEventListener('click', closeModal);
  document.getElementById('cancelExerciseModal').addEventListener('click', closeModal);
  document.getElementById('addExerciseBtn').addEventListener('click', submit);

  document.getElementById('exerciseNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') closeModal();
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.getElementById('exercisesList').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('[data-delete-id]');
    if (deleteBtn) {
      e.stopPropagation();
      showConfirm('Delete this exercise?', () => {
        const t = getTeam();
        t.exercises = t.exercises.filter((ex) => ex.id !== deleteBtn.dataset.deleteId);
        updateTeam(t);
        renderExercises();
      });
      return;
    }
    const row = e.target.closest('[data-exercise-id]');
    if (row) window.location.href = 'exercise.html?teamId=' + teamId + '&exerciseId=' + row.dataset.exerciseId;
  });

  document.getElementById('exercisesList').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const row = e.target.closest('[data-exercise-id]');
      if (row) window.location.href = 'exercise.html?teamId=' + teamId + '&exerciseId=' + row.dataset.exerciseId;
    }
  });
}
