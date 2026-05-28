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

// ── Bootstrap ──
const params = new URLSearchParams(window.location.search);
const teamId = params.get('id');
let teamData  = loadTeams().find((t) => t.id === teamId);

if (!teamData) {
  document.getElementById('pageContent').style.display = 'none';
  document.getElementById('notFound').style.display    = 'flex';
  document.getElementById('notFoundBack').href = 'index.html';
} else {
  document.title = 'Points — TactIQ';
  document.getElementById('backTeamName').textContent = teamData.name;
  document.getElementById('backLink').href = 'team.html?id=' + teamId;
  document.getElementById('teamMeta').textContent = teamData.name;
  init();
}

// ── Storage helpers ──
function getTable() { return teamData.pointsTable || null; }

function saveTable(table) {
  const all = loadTeams();
  const t   = all.find((x) => x.id === teamId);
  if (!t) return;
  t.pointsTable = table;
  teamData.pointsTable = table;
  saveTeams(all);
}

// ── Init ──
function init() {
  renderBoard();

  document.getElementById('openSetupBtn').addEventListener('click', openSetup);
  document.getElementById('openSetupEmpty').addEventListener('click', openSetup);
  document.getElementById('closeSetupBtn').addEventListener('click', closeSetup);
  document.getElementById('cancelSetupBtn').addEventListener('click', closeSetup);
  document.getElementById('saveSetupBtn').addEventListener('click', commitSetup);
  document.getElementById('setupBackdrop').addEventListener('click', (e) => {
    if (e.target.id === 'setupBackdrop') closeSetup();
  });

  // Two-click reset: first click arms it, second confirms
  const resetBtn = document.getElementById('resetBtn');
  let armed = false, armTimer;
  resetBtn.addEventListener('click', () => {
    if (!getTable()) return;
    if (armed) {
      clearTimeout(armTimer);
      armed = false;
      resetBtn.textContent = 'Reset';
      resetBtn.classList.remove('btn-armed');
      doReset();
    } else {
      armed = true;
      resetBtn.textContent = 'Confirm?';
      resetBtn.classList.add('btn-armed');
      armTimer = setTimeout(() => {
        armed = false;
        resetBtn.textContent = 'Reset';
        resetBtn.classList.remove('btn-armed');
      }, 3000);
    }
  });
}

function doReset() {
  const table = getTable();
  if (!table) return;
  table.teams.forEach((t) => { t.points = 0; });
  saveTable(table);
  renderBoard();
}

// ── Board ──
function renderBoard() {
  const table   = getTable();
  const board   = document.getElementById('pointsBoard');
  const noSetup = document.getElementById('noSetup');

  if (!table || !table.teams || table.teams.length === 0) {
    board.innerHTML = '';
    noSetup.style.display = 'block';
    return;
  }

  noSetup.style.display = 'none';

  const buttons = (table.buttons || [1, 2, 3]).slice().sort((a, b) => a - b);
  const sorted  = [...table.teams].sort((a, b) => a.name.localeCompare(b.name));

  board.innerHTML = sorted.map((entry, idx) => {
    const rank = idx + 1;
    const rankExtra = rank === 1 ? ' points-rank-gold'
                    : rank === 2 ? ' points-rank-silver'
                    : rank === 3 ? ' points-rank-bronze' : '';
    return `
      <div class="points-row">
        <div class="points-row-top">
          <div class="points-rank${rankExtra}">${rank}</div>
          <div class="points-name">${escapeHtml(entry.name)}</div>
          <div class="points-score">${entry.points}<span class="points-score-unit">pts</span></div>
        </div>
        <div class="points-actions">
          <div class="points-add-btns">
            ${buttons.map((v) => `
              <button class="points-btn points-btn-add" data-id="${entry.id}" data-val="${v}">+${v}</button>
            `).join('')}
          </div>
          <button class="points-btn points-btn-sub" data-id="${entry.id}" data-val="-1">−1</button>
        </div>
      </div>
    `;
  }).join('');

  board.querySelectorAll('.points-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      adjustPoints(btn.dataset.id, parseInt(btn.dataset.val, 10));
    });
  });
}

function adjustPoints(id, delta) {
  const table = getTable();
  if (!table) return;
  const entry = table.teams.find((t) => t.id === id);
  if (!entry) return;
  entry.points = Math.max(0, entry.points + delta);
  saveTable(table);
  renderBoard();
}

// ── Setup Modal ──
let draftCount = 4;

function openSetup() {
  const table = getTable();
  draftCount  = table ? table.teams.length : 4;
  buildSetupBody();
  document.getElementById('setupBackdrop').style.display = 'flex';
}

function closeSetup() {
  document.getElementById('setupBackdrop').style.display = 'none';
}

function buildSetupBody() {
  const table         = getTable();
  const activeButtons = table ? (table.buttons || [1, 2, 3]) : [1, 2, 3];
  const existingTeams = table ? table.teams : [];

  document.getElementById('setupBody').innerHTML = `
    <div class="setup-section">
      <div class="attr-label">Number of Teams</div>
      <div class="stepper">
        <button class="stepper-btn" id="stepDown">−</button>
        <span class="stepper-val" id="stepVal">${draftCount}</span>
        <button class="stepper-btn" id="stepUp">+</button>
      </div>
    </div>
    <div class="setup-section">
      <div class="attr-label">Team Names</div>
      <div id="teamNameInputs" class="team-name-inputs"></div>
    </div>
    <div class="setup-section">
      <div class="attr-label">Point Buttons</div>
      <div class="setup-btn-toggles" id="btnToggles">
        ${[1, 2, 3, 4, 5].map((v) => `
          <button class="setup-btn-toggle${activeButtons.includes(v) ? ' setup-btn-toggle-active' : ''}" data-val="${v}">+${v}</button>
        `).join('')}
      </div>
    </div>
  `;

  rebuildNameInputs(existingTeams, []);

  document.getElementById('stepDown').addEventListener('click', () => {
    if (draftCount <= 2) return;
    draftCount--;
    document.getElementById('stepVal').textContent = draftCount;
    rebuildNameInputs(existingTeams, currentNameValues());
  });

  document.getElementById('stepUp').addEventListener('click', () => {
    if (draftCount >= 20) return;
    draftCount++;
    document.getElementById('stepVal').textContent = draftCount;
    rebuildNameInputs(existingTeams, currentNameValues());
  });

  document.getElementById('btnToggles').addEventListener('click', (e) => {
    const btn = e.target.closest('.setup-btn-toggle');
    if (!btn) return;
    const isActive   = btn.classList.contains('setup-btn-toggle-active');
    const activeCount = document.querySelectorAll('#btnToggles .setup-btn-toggle-active').length;
    if (isActive && activeCount <= 1) return;
    btn.classList.toggle('setup-btn-toggle-active');
  });
}

function currentNameValues() {
  return [...document.querySelectorAll('.setup-name-input')].map((i) => i.value);
}

function rebuildNameInputs(existingTeams, currentValues) {
  document.getElementById('teamNameInputs').innerHTML = Array.from({ length: draftCount }, (_, i) => {
    const val = currentValues[i] !== undefined ? currentValues[i]
              : existingTeams[i] ? existingTeams[i].name : '';
    return `<input class="setup-name-input" type="text" maxlength="30" placeholder="Team ${i + 1}" value="${escapeHtml(val)}" />`;
  }).join('');
}

function commitSetup() {
  const table = getTable() || { teams: [], buttons: [1, 2, 3] };

  const names = [...document.querySelectorAll('.setup-name-input')]
    .map((inp, i) => inp.value.trim() || `Team ${i + 1}`);

  const buttons = [...document.querySelectorAll('#btnToggles .setup-btn-toggle-active')]
    .map((b) => parseInt(b.dataset.val, 10))
    .sort((a, b) => a - b);

  const newTeams = names.map((name, i) => ({
    id:     table.teams[i] ? table.teams[i].id : crypto.randomUUID(),
    name,
    points: table.teams[i] ? table.teams[i].points : 0,
  }));

  saveTable({ teams: newTeams, buttons: buttons.length ? buttons : [1, 2, 3] });
  closeSetup();
  renderBoard();
}

window.DB_READY.then(() => {
  if (window.APP_ROLE === 'player') document.body.classList.add('role-player');
});
