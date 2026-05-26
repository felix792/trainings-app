const STORAGE_KEY = 'football_coach_teams';

function loadTeams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

const params = new URLSearchParams(window.location.search);
const teamId = params.get('id');
const team = loadTeams().find((t) => t.id === teamId);

if (!team) {
  document.getElementById('teamContent').style.display = 'none';
  document.getElementById('notFound').style.display = 'flex';
} else {
  document.title = team.name + ' â€” TactIQ';
  document.getElementById('teamName').textContent = team.name;
  document.getElementById('teamMeta').textContent = 'Created ' + formatDate(team.createdAt);

  const playerCount = (team.players || []).length;
  document.getElementById('playerCount').textContent = playerCount === 1 ? '1 player' : playerCount + ' players';

  const exerciseCount = (team.exercises || []).length;
  document.getElementById('exerciseCount').textContent = exerciseCount === 1 ? '1 exercise' : exerciseCount + ' exercises';

  const lineupCount = (team.lineups || []).length;
  document.getElementById('lineupCount').textContent = lineupCount === 1 ? '1 lineup' : lineupCount + ' lineups';

  const playCount = (team.plays || []).length;
  document.getElementById('playCount').textContent = playCount === 1 ? '1 play' : playCount + ' plays';

  const gameCount = (team.games || []).length;
  document.getElementById('gameCount').textContent = gameCount === 1 ? '1 game' : gameCount + ' games';

  const pointsTeams = (team.pointsTable && team.pointsTable.teams) ? team.pointsTable.teams : null;
  document.getElementById('pointsTeamCount').textContent = pointsTeams
    ? pointsTeams.length + (pointsTeams.length === 1 ? ' team' : ' teams')
    : 'not set up';

  function navigate(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => { window.location.href = url; });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') window.location.href = url;
    });
  }

  navigate('goToLineups',   'lineups.html?id='   + teamId);
  navigate('goToPlayers',   'players.html?id='   + teamId);
  navigate('goToExercises', 'exercises.html?id=' + teamId);
  navigate('goToPlays',     'plays.html?id='     + teamId);
  navigate('goToStats',     'stats.html?id='     + teamId);
  navigate('goToPoints',    'points.html?id='    + teamId);
  document.getElementById('goToCards').href     = 'cards.html?id='     + teamId;
  document.getElementById('goToBlackbox').href  = 'blackbox.html?id='  + teamId;

  // â”€â”€ Apply role-based UI after DB is ready â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  window.DB_READY.then(() => {
    if (window.APP_ROLE === 'player') {
      applyPlayerPermissions(window.APP_PERMISSIONS || {});
    } else {
      loadBlackboxCount();
      if (window.APP_ROLE === 'head-coach') injectCoachPanel();
    }
  });

  function loadBlackboxCount() {
    const uid = window.APP_OWNER_UID;
    if (!uid) return;
    firebase.firestore()
      .collection('blackbox').doc(uid).collection('notes')
      .get()
      .then((snap) => {
        const meta = document.getElementById('blackboxMeta');
        if (!meta) return;
        const n = snap.size;
        meta.textContent = n === 0 ? 'no notes yet' : n === 1 ? '1 note' : n + ' notes';
      })
      .catch(() => {});
  }
}

// â”€â”€ Player: hide categories they can't access â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PERM_MAP = {
  players:   'goToPlayers',
  exercises: 'goToExercises',
  lineups:   'goToLineups',
  plays:     'goToPlays',
  stats:     'goToStats',
  points:    'goToPoints',
  cards:     'goToCards',
  blackbox:  'goToBlackbox',
};

function applyPlayerPermissions(permissions) {
  // Show player banner
  const content = document.getElementById('teamContent');
  const banner = document.createElement('div');
  banner.style.cssText = 'background:#1e1b4b;border:1px solid #3730a3;border-radius:10px;padding:12px 16px;margin-bottom:24px;font-size:.85rem;color:#a5b4fc;';
  banner.textContent = 'Player view â€” your coach controls which categories are visible.';
  content.insertBefore(banner, content.querySelector('h2'));

  Object.entries(PERM_MAP).forEach(([perm, elId]) => {
    if (!permissions[perm]) {
      const el = document.getElementById(elId);
      if (el) el.style.display = 'none';
    }
  });
}

// â”€â”€ Coach: inject settings icon that links to settings page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function injectCoachPanel() {
  const header = document.querySelector('.header-inner');
  const settingsBtn = document.createElement('button');
  settingsBtn.id = 'settings-btn';
  settingsBtn.setAttribute('aria-label', 'Team Settings');
  settingsBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`;
  settingsBtn.addEventListener('click', () => {
    window.location.href = 'settings.html?id=' + teamId;
  });
  header.appendChild(settingsBtn);
}
