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

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function initials(name) {
  return name.trim().split(/\s+/).map((w) => w[0].toUpperCase()).slice(0, 2).join('');
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
let currentSort = 'name';
let activePosition = null;
const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'];

if (!team) {
  document.getElementById('pageContent').style.display = 'none';
  document.getElementById('notFound').style.display = 'flex';
} else {
  document.title = 'Players — ' + team.name;
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href = 'team.html?id=' + teamId;
  document.getElementById('teamMeta').textContent = team.name;
  renderPlayers();
  initModal();
  initSortBar();
}

// ── Sort ──
function sortedPlayers(players) {
  let copy = [...players];

  if (currentSort === 'position' && activePosition) {
    const hasPos = (p) => (p.attrs && p.attrs.positions || []).includes(activePosition);
    copy.sort((a, b) => {
      const ad = hasPos(a) ? 0 : 1;
      const bd = hasPos(b) ? 0 : 1;
      return ad - bd || a.name.localeCompare(b.name);
    });
    return copy;
  }

  if (currentSort === 'name' || currentSort === 'position') {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (currentSort === 'strongFoot') {
    const order = { Left: 0, Right: 1, Both: 2 };
    return copy.sort((a, b) => {
      const av = (a.attrs && a.attrs.strongFoot) || '';
      const bv = (b.attrs && b.attrs.strongFoot) || '';
      return (order[av] ?? 99) - (order[bv] ?? 99) || a.name.localeCompare(b.name);
    });
  }
  return copy.sort((a, b) => {
    const av = (a.attrs && a.attrs[currentSort]) || 0;
    const bv = (b.attrs && b.attrs[currentSort]) || 0;
    return bv - av || a.name.localeCompare(b.name);
  });
}

function attrBadge(player) {
  if (!player.attrs) return '';
  if (currentSort === 'name') return '';
  if (currentSort === 'position') {
    const positions = player.attrs.positions || [];
    if (!positions.length) return '';
    const tags = positions.map((pos) =>
      `<span class="sort-badge${activePosition === pos ? ' sort-badge-highlight' : ''}">${escapeHtml(pos)}</span>`
    ).join('');
    return `<span class="sort-badge-group">${tags}</span>`;
  }
  if (currentSort === 'strongFoot') {
    const v = player.attrs.strongFoot;
    return v ? `<span class="sort-badge">${escapeHtml(v)}</span>` : '';
  }
  const v = player.attrs[currentSort];
  return v ? `<span class="sort-badge">${v}<span class="sort-badge-max">/10</span></span>` : '';
}

function initSortBar() {
  document.getElementById('sortBar').addEventListener('click', (e) => {
    const btn = e.target.closest('.sort-btn');
    if (!btn) return;
    currentSort = btn.dataset.sort;
    document.querySelectorAll('.sort-btn').forEach((b) => b.classList.toggle('sort-btn-active', b === btn));

    const filterBar = document.getElementById('positionFilterBar');
    if (currentSort === 'position') {
      activePosition = null;
      buildPositionFilterBar();
      filterBar.style.display = 'flex';
    } else {
      activePosition = null;
      filterBar.style.display = 'none';
    }
    renderPlayers();
  });
}

function buildPositionFilterBar() {
  const bar = document.getElementById('positionFilterBar');
  const label = bar.querySelector('.sort-label');
  bar.innerHTML = '';
  bar.appendChild(label);

  POSITIONS.forEach((pos) => {
    const btn = document.createElement('button');
    btn.className = 'sort-btn pos-filter-btn';
    btn.textContent = pos;
    btn.addEventListener('click', () => {
      if (activePosition === pos) {
        activePosition = null;
        btn.classList.remove('sort-btn-active');
      } else {
        activePosition = pos;
        bar.querySelectorAll('.pos-filter-btn').forEach((b) => b.classList.remove('sort-btn-active'));
        btn.classList.add('sort-btn-active');
      }
      renderPlayers();
    });
    bar.appendChild(btn);
  });
}

// ── Render ──
function renderPlayers() {
  const players = sortedPlayers(getTeam().players || []);
  const list = document.getElementById('playersList');
  const empty = document.getElementById('playersEmpty');

  if (players.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = players.map((p) => `
    <li class="player-row" data-player-id="${p.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(p.name)}">
      <div class="player-avatar">${escapeHtml(initials(p.name))}</div>
      <span class="player-name">${escapeHtml(p.name)}</span>
      ${attrBadge(p)}
      <span class="player-row-arrow">&#8250;</span>
      <button class="player-delete" data-delete-id="${p.id}" aria-label="Remove ${escapeHtml(p.name)}" title="Remove player">&#x2715;</button>
    </li>
  `).join('');
}

// ── Modal ──
function initModal() {
  const backdrop = document.getElementById('playerModalBackdrop');

  function openModal() {
    backdrop.classList.add('active');
    document.getElementById('playerNameInput').value = '';
    document.getElementById('playerInputError').textContent = '';
    setTimeout(() => document.getElementById('playerNameInput').focus(), 50);
  }

  function closeModal() {
    backdrop.classList.remove('active');
  }

  function submit() {
    const input = document.getElementById('playerNameInput');
    const name = input.value.trim();
    if (!name) {
      document.getElementById('playerInputError').textContent = 'Please enter a player name.';
      input.focus();
      return;
    }
    const t = getTeam();
    const duplicate = (t.players || []).some((p) => p.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      document.getElementById('playerInputError').textContent = 'This player is already on the team.';
      input.focus();
      return;
    }
    if (!t.players) t.players = [];
    t.players.push({ id: crypto.randomUUID(), name });
    updateTeam(t);
    renderPlayers();
    closeModal();
  }

  document.getElementById('openAddPlayer').addEventListener('click', openModal);
  document.getElementById('closePlayerModal').addEventListener('click', closeModal);
  document.getElementById('cancelPlayerModal').addEventListener('click', closeModal);
  document.getElementById('addPlayerBtn').addEventListener('click', submit);

  document.getElementById('playerNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') closeModal();
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.getElementById('playersList').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('[data-delete-id]');
    if (deleteBtn) {
      e.stopPropagation();
      showConfirm('Remove this player from the team?', () => {
        const t = getTeam();
        t.players = t.players.filter((p) => p.id !== deleteBtn.dataset.deleteId);
        updateTeam(t);
        renderPlayers();
      });
      return;
    }
    const row = e.target.closest('[data-player-id]');
    if (row) window.location.href = 'player.html?teamId=' + teamId + '&playerId=' + row.dataset.playerId;
  });

  document.getElementById('playersList').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const row = e.target.closest('[data-player-id]');
      if (row) window.location.href = 'player.html?teamId=' + teamId + '&playerId=' + row.dataset.playerId;
    }
  });
}
