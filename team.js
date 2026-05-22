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
  document.title = team.name + ' — TactIQ';
  document.getElementById('teamName').textContent = team.name;
  document.getElementById('teamMeta').textContent = 'Created ' + formatDate(team.createdAt);

  const playerCount = (team.players || []).length;
  document.getElementById('playerCount').textContent = playerCount === 1 ? '1 player' : playerCount + ' players';

  const exerciseCount = (team.exercises || []).length;
  document.getElementById('exerciseCount').textContent = exerciseCount === 1 ? '1 exercise' : exerciseCount + ' exercises';

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

  navigate('goToPlayers',   'players.html?id='   + teamId);
  navigate('goToExercises', 'exercises.html?id=' + teamId);
  navigate('goToPlays',     'plays.html?id='     + teamId);
  navigate('goToStats',     'stats.html?id='     + teamId);
  navigate('goToPoints',    'points.html?id='    + teamId);
  document.getElementById('goToCards').href = 'cards.html?id=' + teamId;

  // ── Apply role-based UI after DB is ready ─────────────────────────────────
  window.DB_READY.then(() => {
    if (window.APP_ROLE === 'player') {
      applyPlayerPermissions(window.APP_PERMISSIONS || {});
    } else if (window.APP_ROLE === 'coach') {
      injectCoachPanel();
    }
  });
}

// ── Player: hide categories they can't access ──────────────────────────────
const PERM_MAP = {
  players:   'goToPlayers',
  exercises: 'goToExercises',
  plays:     'goToPlays',
  stats:     'goToStats',
  points:    'goToPoints',
  cards:     'goToCards',
};

function applyPlayerPermissions(permissions) {
  // Show player banner
  const content = document.getElementById('teamContent');
  const banner = document.createElement('div');
  banner.style.cssText = 'background:#1e1b4b;border:1px solid #3730a3;border-radius:10px;padding:12px 16px;margin-bottom:24px;font-size:.85rem;color:#a5b4fc;';
  banner.textContent = 'Player view — your coach controls which categories are visible.';
  content.insertBefore(banner, content.querySelector('h2'));

  Object.entries(PERM_MAP).forEach(([perm, elId]) => {
    if (!permissions[perm]) {
      const el = document.getElementById(elId);
      if (el) el.style.display = 'none';
    }
  });
}

// ── Coach: inject permissions panel + team code ────────────────────────────
function injectCoachPanel() {
  const content = document.getElementById('teamContent');

  const section = document.createElement('div');
  section.innerHTML = `
    <h2 class="section-title" style="margin-top:40px;">Player Access</h2>
    <div style="background:#0e0e1a;border:1px solid #1c1c2c;border-radius:12px;padding:20px 24px;">

      <div style="margin-bottom:20px;">
        <div style="font-size:.8rem;color:#6868a0;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Team Code</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <code id="team-code-display" style="background:#070712;border:1px solid #1c1c2c;border-radius:8px;padding:8px 14px;font-size:.8rem;color:#a5b4fc;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;">${window.getTeamCode ? window.getTeamCode() : '—'}</code>
          <button id="copy-code-btn" style="background:#1d4ed8;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:.8rem;font-weight:600;cursor:pointer;white-space:nowrap;">Copy</button>
        </div>
        <div style="font-size:.75rem;color:#6868a0;margin-top:6px;">Share this code with your players so they can join.</div>
      </div>

      <div style="height:1px;background:#1c1c2c;margin-bottom:20px;"></div>

      <div style="font-size:.8rem;color:#6868a0;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px;">What players can see</div>
      <div id="perm-toggles" style="display:flex;flex-direction:column;gap:12px;"></div>
      <div id="perm-status" style="font-size:.8rem;color:#16a34a;margin-top:14px;min-height:18px;"></div>
    </div>`;
  content.appendChild(section);

  // Copy button
  document.getElementById('copy-code-btn').addEventListener('click', () => {
    const code = window.getTeamCode ? window.getTeamCode() : '';
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copy-code-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });

  // Permission toggles — fetch current permissions from Firestore snapshot
  // We read them from the user profile via DB_READY which already resolved
  const LABELS = {
    players:   'Players',
    exercises: 'Exercises',
    plays:     'Plays',
    stats:     'Stats',
    points:    'Points',
    cards:     'Your Card',
  };

  // Load current permissions from Firestore
  const uid = window.APP_COACH_UID;
  firebase.firestore().collection('users').doc(uid).get().then((snap) => {
    const perms = (snap.exists && snap.data().playerPermissions) ||
      { players: true, exercises: true, plays: true, stats: true, points: true, cards: true };

    const container = document.getElementById('perm-toggles');
    Object.entries(LABELS).forEach(([key, label]) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
      row.innerHTML = `
        <span style="font-size:.9rem;color:#e2e4f0;">${label}</span>
        <label style="display:flex;align-items:center;cursor:pointer;gap:8px;">
          <span class="perm-state-label" style="font-size:.75rem;color:#6868a0;">${perms[key] ? 'Visible' : 'Hidden'}</span>
          <div style="position:relative;width:40px;height:22px;">
            <input type="checkbox" data-perm="${key}" ${perms[key] ? 'checked' : ''}
              style="opacity:0;width:0;height:0;position:absolute;" />
            <div class="toggle-track" style="position:absolute;inset:0;border-radius:11px;background:${perms[key] ? '#16a34a' : '#334155'};transition:background .2s;"></div>
            <div class="toggle-thumb" style="position:absolute;top:3px;left:${perms[key] ? '21px' : '3px'};width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s;"></div>
          </div>
        </label>`;
      container.appendChild(row);

      const checkbox = row.querySelector('input[type=checkbox]');
      const track    = row.querySelector('.toggle-track');
      const thumb    = row.querySelector('.toggle-thumb');
      const stateLabel = row.querySelector('.perm-state-label');

      checkbox.addEventListener('change', async () => {
        const checked = checkbox.checked;
        track.style.background = checked ? '#16a34a' : '#334155';
        thumb.style.left = checked ? '21px' : '3px';
        stateLabel.textContent = checked ? 'Visible' : 'Hidden';
        perms[key] = checked;
        const status = document.getElementById('perm-status');
        status.textContent = 'Saving…';
        await window.savePlayerPermissions({ ...perms });
        status.textContent = 'Saved';
        setTimeout(() => { status.textContent = ''; }, 2000);
      });
    });
  });
}
