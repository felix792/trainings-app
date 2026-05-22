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

// ── Coach: inject settings icon + slide-in drawer ─────────────────────────
function injectCoachPanel() {
  // Settings button in header
  const header = document.querySelector('.header-inner');
  const settingsBtn = document.createElement('button');
  settingsBtn.id = 'settings-btn';
  settingsBtn.setAttribute('aria-label', 'Player Access Settings');
  settingsBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`;
  header.appendChild(settingsBtn);

  // Drawer backdrop + panel
  const backdrop = document.createElement('div');
  backdrop.id = 'settings-backdrop';
  document.body.appendChild(backdrop);

  const drawer = document.createElement('div');
  drawer.id = 'settings-drawer';
  drawer.innerHTML = `
    <div class="settings-drawer-header">
      <span class="settings-drawer-title">Player Access</span>
      <button id="settings-close" aria-label="Close">&times;</button>
    </div>

    <div class="settings-section-label">Team Code</div>
    <div class="settings-code-row">
      <code id="team-code-display">${window.getTeamCode ? window.getTeamCode() : '—'}</code>
      <button id="copy-code-btn">Copy</button>
    </div>
    <div class="settings-hint">Share this code with your players so they can join.</div>

    <div class="settings-divider"></div>

    <div class="settings-section-label">What players can see</div>
    <div id="perm-toggles"></div>
    <div id="perm-status"></div>`;
  document.body.appendChild(drawer);

  // Open / close
  function openDrawer()  { drawer.classList.add('open'); backdrop.classList.add('open'); }
  function closeDrawer() { drawer.classList.remove('open'); backdrop.classList.remove('open'); }

  settingsBtn.addEventListener('click', openDrawer);
  document.getElementById('settings-close').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  // Copy code
  document.getElementById('copy-code-btn').addEventListener('click', () => {
    const code = window.getTeamCode ? window.getTeamCode() : '';
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copy-code-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });

  // Permission toggles
  const TOP_LABELS = [
    { key: 'players',   label: 'Players' },
    { key: 'exercises', label: 'Exercises' },
    { key: 'plays',     label: 'Plays' },
    { key: 'stats',     label: 'Games' },
    { key: 'points',    label: 'Points' },
    { key: 'cards',     label: 'Your Card' },
  ];

  const SECTION_LABELS = [
    { key: 'attributes',          label: 'Attributes & Profile' },
    { key: 'categoryProgression', label: 'Category Progression' },
    { key: 'gameStats',           label: 'Game Stats' },
    { key: 'statProgression',     label: 'Stat Progression' },
  ];

  const uid = window.APP_COACH_UID;
  firebase.firestore().collection('users').doc(uid).get().then((snap) => {
    const data  = snap.exists ? snap.data() : {};
    const perms = data.playerPermissions ||
      { players: true, exercises: true, plays: true, stats: true, points: true, cards: true };
    const sections = perms.playerSections ||
      { attributes: true, categoryProgression: true, gameStats: true, statProgression: true };
    perms.playerSections = sections;

    const container = document.getElementById('perm-toggles');

    async function persist() {
      const status = document.getElementById('perm-status');
      status.textContent = 'Saving…';
      status.style.color = '#6868a0';
      await window.savePlayerPermissions({ ...perms });
      status.textContent = 'Saved';
      status.style.color = '#16a34a';
      setTimeout(() => { status.textContent = ''; }, 2000);
    }

    function showConfirm(label, newValue, onConfirm) {
      let modal = document.getElementById('perm-confirm-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'perm-confirm-modal';
        document.body.appendChild(modal);
      }
      const action = newValue ? 'show' : 'hide';
      modal.innerHTML = `
        <div class="perm-confirm-box">
          <p class="perm-confirm-msg">Are you sure you want to <strong>${action}</strong> <strong>${label}</strong> for your players?</p>
          <div class="perm-confirm-btns">
            <button id="perm-confirm-yes">Yes, apply</button>
            <button id="perm-confirm-no">Cancel</button>
          </div>
        </div>`;
      modal.classList.add('open');
      modal.querySelector('#perm-confirm-yes').addEventListener('click', () => {
        modal.classList.remove('open');
        onConfirm();
      });
      modal.querySelector('#perm-confirm-no').addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    function makeToggle(key, label, value, onChange, indent) {
      const row = document.createElement('div');
      row.className = 'perm-row' + (indent ? ' perm-row-sub' : '');
      const on = !!value;
      row.innerHTML = `
        <span class="perm-label${indent ? ' perm-label-sub' : ''}">${label}</span>
        <label class="toggle-wrap">
          <span class="perm-state">${on ? 'Visible' : 'Hidden'}</span>
          <div class="toggle-shell">
            <input type="checkbox" ${on ? 'checked' : ''}/>
            <div class="toggle-track" style="background:${on ? '#16a34a' : '#334155'}"></div>
            <div class="toggle-thumb" style="left:${on ? '21px' : '3px'}"></div>
          </div>
        </label>`;
      const cb    = row.querySelector('input');
      const track = row.querySelector('.toggle-track');
      const thumb = row.querySelector('.toggle-thumb');
      const state = row.querySelector('.perm-state');
      cb.addEventListener('change', () => {
        const newValue = cb.checked;
        cb.checked = !newValue; // revert until confirmed
        showConfirm(label, newValue, async () => {
          cb.checked = newValue;
          track.style.background = newValue ? '#16a34a' : '#334155';
          thumb.style.left = newValue ? '21px' : '3px';
          state.textContent = newValue ? 'Visible' : 'Hidden';
          onChange(newValue);
          await persist();
        });
      });
      return row;
    }

    // Build sub-section wrap first so Players onChange can reference it
    const subWrap = document.createElement('div');
    subWrap.id = 'player-sections-wrap';
    subWrap.style.display = perms.players ? 'block' : 'none';
    SECTION_LABELS.forEach(({ key: sk, label: sl }) => {
      subWrap.appendChild(makeToggle(sk, sl, sections[sk], (v) => { sections[sk] = v; }, true));
    });

    TOP_LABELS.forEach(({ key, label }) => {
      if (key === 'players') {
        container.appendChild(makeToggle(key, label, perms[key], (v) => {
          perms[key] = v;
          subWrap.style.display = v ? 'block' : 'none';
        }, false));
        container.appendChild(subWrap);
      } else {
        container.appendChild(makeToggle(key, label, perms[key], (v) => { perms[key] = v; }, false));
      }
    });
  });
}
