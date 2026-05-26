const STORAGE_KEY = 'football_coach_teams';

// ── Formations (same as lineup.js) ──
const FORMATIONS = {
  '4-3-3': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:14, y:70 },
    { key:'CB1',  posLabel:'CB',  x:37, y:70 },
    { key:'CB2',  posLabel:'CB',  x:63, y:70 },
    { key:'RB',   posLabel:'RB',  x:86, y:70 },
    { key:'CM1',  posLabel:'CM',  x:25, y:50 },
    { key:'CM2',  posLabel:'CM',  x:50, y:50 },
    { key:'CM3',  posLabel:'CM',  x:75, y:50 },
    { key:'LW',   posLabel:'LW',  x:14, y:20 },
    { key:'ST',   posLabel:'ST',  x:50, y:15 },
    { key:'RW',   posLabel:'RW',  x:86, y:20 },
  ],
  '4-4-2': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:14, y:70 },
    { key:'CB1',  posLabel:'CB',  x:37, y:70 },
    { key:'CB2',  posLabel:'CB',  x:63, y:70 },
    { key:'RB',   posLabel:'RB',  x:86, y:70 },
    { key:'LM',   posLabel:'LM',  x:11, y:48 },
    { key:'CM1',  posLabel:'CM',  x:37, y:48 },
    { key:'CM2',  posLabel:'CM',  x:63, y:48 },
    { key:'RM',   posLabel:'RM',  x:89, y:48 },
    { key:'ST1',  posLabel:'ST',  x:37, y:18 },
    { key:'ST2',  posLabel:'ST',  x:63, y:18 },
  ],
  '4-2-3-1': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:14, y:72 },
    { key:'CB1',  posLabel:'CB',  x:37, y:72 },
    { key:'CB2',  posLabel:'CB',  x:63, y:72 },
    { key:'RB',   posLabel:'RB',  x:86, y:72 },
    { key:'CDM1', posLabel:'CDM', x:37, y:58 },
    { key:'CDM2', posLabel:'CDM', x:63, y:58 },
    { key:'LM',   posLabel:'LM',  x:12, y:39 },
    { key:'CAM',  posLabel:'CAM', x:50, y:37 },
    { key:'RM',   posLabel:'RM',  x:88, y:39 },
    { key:'ST',   posLabel:'ST',  x:50, y:15 },
  ],
  '4-1-4-1': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:14, y:73 },
    { key:'CB1',  posLabel:'CB',  x:37, y:73 },
    { key:'CB2',  posLabel:'CB',  x:63, y:73 },
    { key:'RB',   posLabel:'RB',  x:86, y:73 },
    { key:'CDM',  posLabel:'CDM', x:50, y:59 },
    { key:'LM',   posLabel:'LM',  x:11, y:44 },
    { key:'CM1',  posLabel:'CM',  x:35, y:43 },
    { key:'CM2',  posLabel:'CM',  x:65, y:43 },
    { key:'RM',   posLabel:'RM',  x:89, y:44 },
    { key:'ST',   posLabel:'ST',  x:50, y:15 },
  ],
  '3-5-2': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'CB1',  posLabel:'CB',  x:25, y:70 },
    { key:'CB2',  posLabel:'CB',  x:50, y:70 },
    { key:'CB3',  posLabel:'CB',  x:75, y:70 },
    { key:'LM',   posLabel:'LM',  x:10, y:50 },
    { key:'CM1',  posLabel:'CM',  x:30, y:50 },
    { key:'CM2',  posLabel:'CM',  x:50, y:50 },
    { key:'CM3',  posLabel:'CM',  x:70, y:50 },
    { key:'RM',   posLabel:'RM',  x:90, y:50 },
    { key:'ST1',  posLabel:'ST',  x:37, y:18 },
    { key:'ST2',  posLabel:'ST',  x:63, y:18 },
  ],
  '5-3-2': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:8,  y:70 },
    { key:'CB1',  posLabel:'CB',  x:27, y:70 },
    { key:'CB2',  posLabel:'CB',  x:50, y:70 },
    { key:'CB3',  posLabel:'CB',  x:73, y:70 },
    { key:'RB',   posLabel:'RB',  x:92, y:70 },
    { key:'CM1',  posLabel:'CM',  x:25, y:48 },
    { key:'CM2',  posLabel:'CM',  x:50, y:48 },
    { key:'CM3',  posLabel:'CM',  x:75, y:48 },
    { key:'ST1',  posLabel:'ST',  x:37, y:18 },
    { key:'ST2',  posLabel:'ST',  x:63, y:18 },
  ],
  '4-4-2 DM': [
    { key:'GK',   posLabel:'GK',  x:50, y:88 },
    { key:'LB',   posLabel:'LB',  x:14, y:73 },
    { key:'CB1',  posLabel:'CB',  x:37, y:73 },
    { key:'CB2',  posLabel:'CB',  x:63, y:73 },
    { key:'RB',   posLabel:'RB',  x:86, y:73 },
    { key:'CDM1', posLabel:'CDM', x:37, y:59 },
    { key:'CDM2', posLabel:'CDM', x:63, y:59 },
    { key:'CAM1', posLabel:'CAM', x:25, y:40 },
    { key:'CAM2', posLabel:'CAM', x:50, y:38 },
    { key:'CAM3', posLabel:'CAM', x:75, y:40 },
    { key:'ST',   posLabel:'ST',  x:50, y:15 },
  ],
};

const POS_WEIGHTS = {
  GK:  { defensiveAbility:2, physicalAbility:1.5, awareness:1.5, oneVsOneDefensive:1 },
  CB:  { defensiveAbility:2, oneVsOneDefensive:1.5, physicalAbility:1.2, awareness:0.8 },
  LB:  { defensiveAbility:1.5, speed:1.5, physicalAbility:1, passing:0.8 },
  RB:  { defensiveAbility:1.5, speed:1.5, physicalAbility:1, passing:0.8 },
  CDM: { defensiveAbility:1.8, awareness:1.5, passing:1, physicalAbility:0.8 },
  CM:  { passing:1.5, awareness:1.5, touch:1, dribbling:0.8 },
  CAM: { passing:1.2, awareness:1, oneVsOneOffensive:1.5, dribbling:1.5, shot:0.8 },
  LM:  { speed:1.5, dribbling:1.5, passing:1 },
  RM:  { speed:1.5, dribbling:1.5, passing:1 },
  LW:  { speed:2, dribbling:1.5, shot:1, oneVsOneOffensive:0.8 },
  RW:  { speed:2, dribbling:1.5, shot:1, oneVsOneOffensive:0.8 },
  CF:  { shot:1.5, oneVsOneOffensive:1.5, dribbling:1, speed:0.8 },
  ST:  { shot:2, oneVsOneOffensive:1.5, speed:1, physicalAbility:0.5 },
};

function scoreFor(player, posLabel) {
  const a = player.attrs || {};
  const w = POS_WEIGHTS[posLabel] || {};
  let score = 0;
  for (const [attr, wt] of Object.entries(w)) score += (a[attr] || 0) * wt;
  if ((a.positions || []).includes(posLabel)) score *= 1.25;
  return score;
}

function overallRating(player) {
  const a = player.attrs || {};
  const attrs = ['defensiveAbility','shot','condition','touch','awareness','oneVsOneDefensive','oneVsOneOffensive','speed','physicalAbility','dribbling','passing'];
  const vals = attrs.map(k => a[k] || 0).filter(v => v > 0);
  return vals.length ? Math.round(vals.reduce((s,v) => s+v, 0) / vals.length * 10) : 0;
}

// ── Custom formation parser (same as lineup.js) ──
function getLinePosLabels(lineIdx, totalLines, count) {
  const isDefense = lineIdx === 0;
  const isAttack  = lineIdx === totalLines - 1;
  if (isDefense) {
    if (count === 1) return ['CB'];
    if (count === 2) return ['CB', 'CB'];
    if (count === 3) return ['CB', 'CB', 'CB'];
    if (count === 4) return ['LB', 'CB', 'CB', 'RB'];
    if (count === 5) return ['LB', 'CB', 'CB', 'CB', 'RB'];
    return Array(count).fill('CB');
  }
  if (isAttack) {
    if (count === 1) return ['ST'];
    if (count === 2) return ['ST', 'ST'];
    if (count === 3) return ['LW', 'ST', 'RW'];
    return Array(count).fill('ST');
  }
  const midLines = totalLines - 2;
  const midIdx   = lineIdx - 1;
  let base;
  if (midLines === 1) {
    base = 'CM';
  } else {
    const rel = midIdx / (midLines - 1);
    base = rel < 0.34 ? 'CDM' : rel > 0.66 ? 'CAM' : 'CM';
  }
  if (count === 1) return [base];
  if (count === 2) return [base, base];
  if (count === 3) return base === 'CM' ? ['LM', 'CM', 'RM'] : [base, base, base];
  if (count === 4) return ['LM', base, base, 'RM'];
  if (count === 5) return ['LM', base, base, base, 'RM'];
  return Array(count).fill(base);
}

function parseFormationString(str) {
  const nums = str.trim().split('-').map(Number);
  if (nums.length < 2 || nums.some(n => isNaN(n) || n < 1 || n > 6)) return null;
  const total = nums.reduce((a, b) => a + b, 0);
  if (total < 2 || total > 10) return null;
  const slots = [{ key: 'GK', posLabel: 'GK', x: 50, y: 88 }];
  const N = nums.length;
  for (let li = 0; li < N; li++) {
    const count  = nums[li];
    const relY   = N === 1 ? 0.5 : li / (N - 1);
    const y      = Math.round(72 - (72 - 16) * relY);
    const labels = getLinePosLabels(li, N, count);
    const xStep  = 80 / (count + 1);
    for (let i = 0; i < count; i++) {
      slots.push({ key: `L${li}_${i}`, posLabel: labels[i], x: Math.round(10 + xStep * (i + 1)), y });
    }
  }
  return slots;
}

function getSlotsForFormation(f) {
  return FORMATIONS[f] || parseFormationString(f) || [];
}

// ── Storage ──
function loadTeams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveTeams(t) { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); }

function persistState() {
  const all = loadTeams();
  const t   = all.find(x => x.id === teamId);
  if (!t) return;
  t.liveGame = liveGame;
  if (game) {
    if (!t.games) t.games = [];
    const gi = t.games.findIndex(g => g.id === game.id);
    if (gi !== -1) t.games[gi] = game;
    else t.games.unshift(game);
  }
  saveTeams(all);
}

// ── Bootstrap ──
const params   = new URLSearchParams(window.location.search);
const teamId   = params.get('teamId') || params.get('id');
let   team     = loadTeams().find(t => t.id === teamId);
let   liveGame = null;
let   game     = null;
let   timerInterval = null;
let   setupSlots    = {};
let   setupFormation = '4-3-3';
let   venueIsHome   = true;
let   activeStatPlayerId = null;
let   subOffSlotKey = null;

if (!team) {
  document.getElementById('notFound').style.display = 'flex';
} else {
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href = 'team.html?id=' + teamId;

  liveGame = team.liveGame || null;

  if (liveGame && liveGame.status !== 'finished') {
    game = (team.games || []).find(g => g.id === liveGame.gameId) || null;
    if (liveGame.status === 'setup') {
      setupFormation = liveGame.formation || '4-3-3';
      setupSlots     = liveGame.slots || {};
      showSetup();
    } else {
      showGame();
      if (liveGame.status === 'first_half' || liveGame.status === 'second_half') {
        startTimer();
      }
    }
  } else {
    liveGame = null;
    showSetup();
  }
}

// ═══════════════════════════════════════════════
// SETUP PHASE
// ═══════════════════════════════════════════════
function showSetup() {
  document.getElementById('setupPhase').style.display = '';
  document.getElementById('gamePhase').style.display  = 'none';
  document.getElementById('setupTeamMeta').textContent = team.name;
  document.getElementById('dateInput').value = new Date().toISOString().slice(0, 10);

  if (liveGame && liveGame.status === 'setup') {
    document.getElementById('opponentInput').value = liveGame.opponent || '';
    if (liveGame.date) document.getElementById('dateInput').value = liveGame.date;
    setVenue(liveGame.isHome ? 'home' : 'away');
  }

  document.getElementById('venueHomeBtn').addEventListener('click', () => setVenue('home'));
  document.getElementById('venueAwayBtn').addEventListener('click', () => setVenue('away'));
  document.getElementById('kickOffBtn').addEventListener('click', kickOff);

  initSetupFormBar();
  renderSetupSlots();
  initSetupPicker();
}

function setVenue(v) {
  venueIsHome = v === 'home';
  document.getElementById('venueHomeBtn').classList.toggle('lg-venue-active', venueIsHome);
  document.getElementById('venueAwayBtn').classList.toggle('lg-venue-active', !venueIsHome);
}

function initSetupFormBar() {
  const bar         = document.getElementById('setupFormBar');
  const customInput = document.getElementById('lgCustomFormInput');
  const applyBtn    = document.getElementById('lgApplyCustomForm');

  bar.innerHTML = Object.keys(FORMATIONS).map(f => `
    <button class="lu-form-btn${setupFormation === f ? ' lu-form-active' : ''}" data-f="${f}">${f}</button>
  `).join('');

  if (!FORMATIONS[setupFormation]) customInput.value = setupFormation;

  bar.addEventListener('click', e => {
    const btn = e.target.closest('[data-f]');
    if (!btn) return;
    setupFormation = btn.dataset.f;
    bar.querySelectorAll('.lu-form-btn').forEach(b => b.classList.toggle('lu-form-active', b.dataset.f === setupFormation));
    customInput.value = '';
    renderSetupSlots();
  });

  applyBtn.addEventListener('click', () => {
    const val = customInput.value.trim();
    if (!val) return;
    if (!parseFormationString(val)) { alert('Invalid formation. Use numbers separated by dashes, e.g. 4-2-4'); return; }
    setupFormation = val;
    bar.querySelectorAll('.lu-form-btn').forEach(b => b.classList.remove('lu-form-active'));
    renderSetupSlots();
  });

  customInput.addEventListener('keydown', e => { if (e.key === 'Enter') applyBtn.click(); });
}

function renderSetupSlots() {
  const pitch   = document.getElementById('setupPitch');
  const slots   = getSlotsForFormation(setupFormation);
  const players = team.players || [];

  pitch.querySelectorAll('.lu-slot').forEach(el => el.remove());

  slots.forEach(slot => {
    const playerId  = setupSlots[slot.key];
    const player    = playerId ? players.find(p => p.id === playerId) : null;
    const hasPlayer = !!player;

    const div = document.createElement('div');
    div.className = 'lu-slot' + (hasPlayer ? ' lu-slot-filled' : '');
    div.style.left = slot.x + '%';
    div.style.top  = slot.y + '%';
    div.innerHTML = `
      <div class="lu-slot-circle">${hasPlayer
        ? `<span class="lu-slot-initials">${nameInitials(player.name)}</span>`
        : `<span class="lu-slot-pos">${slot.posLabel}</span>`}</div>
      <div class="lu-slot-label">${hasPlayer ? shortName(player.name) : slot.posLabel}</div>
    `;
    div.addEventListener('click', () => openSetupPicker(slot));
    pitch.appendChild(div);
  });
}

// ── Kick Off ──
function kickOff() {
  const opponent = document.getElementById('opponentInput').value.trim();
  if (!opponent) {
    alert('Please enter the opponent name.');
    document.getElementById('opponentInput').focus();
    return;
  }

  const date   = document.getElementById('dateInput').value;
  const gameId = crypto.randomUUID();

  game = {
    id: gameId,
    name: 'vs ' + opponent,
    date,
    scoreUs:   0,
    scoreOpp:  0,
    playerStats: [],
  };

  liveGame = {
    gameId,
    opponent,
    date,
    isHome:             venueIsHome,
    formation:          setupFormation,
    activeSquad:        { ...setupSlots },
    status:             'first_half',
    half1StartTs:       Date.now(),
    half2StartTs:       null,
    scoreUs:            0,
    scoreOpp:           0,
    playerEntryMinute:  {},
    minutesAccrued:     {},
    substitutions:      [],
  };

  for (const playerId of Object.values(liveGame.activeSquad)) {
    if (playerId) liveGame.playerEntryMinute[playerId] = 0;
  }

  persistState();
  showGame();
  startTimer();
}

// ═══════════════════════════════════════════════
// GAME PHASE
// ═══════════════════════════════════════════════
function showGame() {
  document.getElementById('setupPhase').style.display = 'none';
  document.getElementById('gamePhase').style.display  = '';

  const home = liveGame.isHome !== false;
  document.getElementById('lgUsName').textContent  = home ? team.name  : liveGame.opponent;
  document.getElementById('lgOppName').textContent = home ? liveGame.opponent : team.name;

  updateScoreboard();
  updateTimerDisplay();
  updateHalfBtn();
  renderGamePitch();
  initGameActions();
  initStatModal();
  initSubModals();
}

// ── Scoreboard ──
function updateScoreboard() {
  const home = liveGame.isHome !== false;
  document.getElementById('lgUsScore').textContent  = home ? (liveGame.scoreUs  || 0) : (liveGame.scoreOpp || 0);
  document.getElementById('lgOppScore').textContent = home ? (liveGame.scoreOpp || 0) : (liveGame.scoreUs  || 0);
}

// ── Timer ──
function getCurrentMinute() {
  if (!liveGame) return 0;
  const { status, half1StartTs, half2StartTs } = liveGame;
  if (status === 'first_half')   return Math.min(45, (Date.now() - half1StartTs) / 60000);
  if (status === 'half_time')    return 45;
  if (status === 'second_half')  return Math.min(90, 45 + (Date.now() - half2StartTs) / 60000);
  if (status === 'finished')     return 90;
  return 0;
}

function formatTimer(mins) {
  const m = Math.floor(mins);
  const s = Math.floor((mins - m) * 60);
  return m + ':' + String(s).padStart(2, '0');
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(onTimerTick, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function onTimerTick() {
  const min = getCurrentMinute();
  updateTimerDisplay();
  if (liveGame.status === 'first_half' && min >= 45) {
    liveGame.status = 'half_time';
    stopTimer();
    persistState();
    updateHalfBtn();
  } else if (liveGame.status === 'second_half' && min >= 90) {
    endGame();
  }
}

function updateTimerDisplay() {
  document.getElementById('lgTimer').textContent = formatTimer(getCurrentMinute());
  const badge = document.getElementById('lgHalfBadge');
  const s = liveGame.status;
  badge.textContent = s === 'first_half' ? '1st' : s === 'half_time' ? 'HT' : s === 'second_half' ? '2nd' : 'FT';
  badge.className = 'lg-half-badge' + (s === 'half_time' || s === 'finished' ? ' lg-badge-pause' : '');
}

function updateHalfBtn() {
  const btn = document.getElementById('lgHalfBtn');
  const s   = liveGame.status;
  if (s === 'first_half')  { btn.textContent = 'Half Time';      btn.className = 'btn-secondary'; btn.disabled = false; }
  if (s === 'half_time')   { btn.textContent = 'Start 2nd Half'; btn.className = 'btn-primary';   btn.disabled = false; }
  if (s === 'second_half') { btn.textContent = 'End Game';       btn.className = 'btn-primary';   btn.disabled = false; }
  if (s === 'finished')    { btn.textContent = 'Game Over';      btn.className = 'btn-secondary'; btn.disabled = true;  }
}

// ── Game actions ──
function initGameActions() {
  document.getElementById('lgUsPlus').addEventListener('click',  () => adjustScore('us',  1));
  document.getElementById('lgUsMinus').addEventListener('click', () => adjustScore('us', -1));
  document.getElementById('lgOppPlus').addEventListener('click',  () => adjustScore('opp',  1));
  document.getElementById('lgOppMinus').addEventListener('click', () => adjustScore('opp', -1));
  document.getElementById('lgHalfBtn').addEventListener('click', onHalfBtnClick);
  document.getElementById('lgSubBtn').addEventListener('click', openSubPickOff);
  document.getElementById('lgAbandonBtn').addEventListener('click', abandonGame);
}

function adjustScore(side, delta) {
  if (side === 'us') {
    liveGame.scoreUs = Math.max(0, (liveGame.scoreUs || 0) + delta);
    if (game) game.scoreUs = liveGame.scoreUs;
  } else {
    liveGame.scoreOpp = Math.max(0, (liveGame.scoreOpp || 0) + delta);
    if (game) game.scoreOpp = liveGame.scoreOpp;
  }
  updateScoreboard();
  persistState();
}

function onHalfBtnClick() {
  const s = liveGame.status;
  if (s === 'first_half') {
    liveGame.status = 'half_time';
    stopTimer();
    persistState();
    updateHalfBtn();
    updateTimerDisplay();
  } else if (s === 'half_time') {
    liveGame.status     = 'second_half';
    liveGame.half2StartTs = Date.now();
    persistState();
    startTimer();
    updateHalfBtn();
    updateTimerDisplay();
  } else if (s === 'second_half') {
    endGame();
  }
}

function endGame() {
  stopTimer();
  const finalMin = getCurrentMinute();

  liveGame.minutesAccrued = liveGame.minutesAccrued || {};
  for (const playerId of Object.values(liveGame.activeSquad)) {
    if (!playerId) continue;
    const entryMin = liveGame.playerEntryMinute[playerId] || 0;
    const played   = Math.round(Math.max(0, finalMin - entryMin));
    liveGame.minutesAccrued[playerId] = (liveGame.minutesAccrued[playerId] || 0) + played;
  }

  liveGame.status = 'finished';

  if (game) {
    game.playerStats = game.playerStats || [];
    for (const [playerId, minutes] of Object.entries(liveGame.minutesAccrued)) {
      let ps = game.playerStats.find(x => x.playerId === playerId);
      if (!ps) {
        ps = { playerId, goals:0, assists:0, minutesPlayed:0, yellowCards:0, redCards:0, duelsWon:0, duelsLost:0, chancesCreated:0, mistakes:0 };
        game.playerStats.push(ps);
      }
      ps.minutesPlayed = minutes;
    }
  }

  persistState();
  updateHalfBtn();
  updateTimerDisplay();

  setTimeout(() => {
    if (game && confirm('Game finished! Open the stats page?')) {
      window.location.href = 'stat.html?teamId=' + teamId + '&gameId=' + game.id;
    }
  }, 200);
}

function abandonGame() {
  if (!confirm('Abandon this game? The game will be removed from stats.')) return;
  stopTimer();

  const all = loadTeams();
  const t   = all.find(x => x.id === teamId);
  if (t) {
    t.liveGame = null;
    if (game) t.games = (t.games || []).filter(g => g.id !== game.id);
    saveTeams(all);
  }
  window.location.href = 'team.html?id=' + teamId;
}

// ── Game pitch ──
function renderGamePitch() {
  const pitch   = document.getElementById('gamePitch');
  const slots   = getSlotsForFormation(liveGame.formation);
  const players = team.players || [];

  pitch.querySelectorAll('.lu-slot').forEach(el => el.remove());

  slots.forEach(slot => {
    const playerId  = (liveGame.activeSquad || {})[slot.key];
    const player    = playerId ? players.find(p => p.id === playerId) : null;
    const hasPlayer = !!player;

    const ps = hasPlayer && game ? (game.playerStats || []).find(x => x.playerId === playerId) : null;

    let indicators = '';
    if (ps) {
      if ((ps.goals || 0) > 0)         indicators += `<span class="lg-ind-goal">${ps.goals > 1 ? ps.goals : ''}⚽</span>`;
      if ((ps.yellowCards || 0) === 1)  indicators += '<span class="lg-ind-yellow"></span>';
      if ((ps.yellowCards || 0) >= 2)   indicators += '<span class="lg-ind-yellow"></span><span class="lg-ind-yellow"></span>';
      if ((ps.redCards    || 0) > 0)    indicators += '<span class="lg-ind-red"></span>';
    }

    const div = document.createElement('div');
    div.className = 'lu-slot' + (hasPlayer ? ' lu-slot-filled' : '');
    div.style.left = slot.x + '%';
    div.style.top  = slot.y + '%';
    div.innerHTML = `
      <div class="lu-slot-circle">${hasPlayer
        ? `<span class="lu-slot-initials">${nameInitials(player.name)}</span>`
        : `<span class="lu-slot-pos">${slot.posLabel}</span>`}
      </div>
      <div class="lu-slot-label">${hasPlayer ? shortName(player.name) : slot.posLabel}</div>
      ${indicators ? `<div class="lg-indicators">${indicators}</div>` : ''}
    `;

    if (hasPlayer) {
      div.addEventListener('click', () => openStatModal(slot.key, playerId));
    }
    pitch.appendChild(div);
  });
}

// ═══════════════════════════════════════════════
// STAT MODAL
// ═══════════════════════════════════════════════
function initStatModal() {
  document.getElementById('closeStatPanel').addEventListener('click', closeStatModal);
  document.getElementById('statBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('statBackdrop')) closeStatModal();
  });
}

function openStatModal(slotKey, playerId) {
  activeStatPlayerId = playerId;
  const player = (team.players || []).find(p => p.id === playerId);
  if (!player) return;

  document.getElementById('statPlayerName').textContent = player.name;

  const mins = Math.round(getPlayerMinutes(playerId));
  document.getElementById('statMinutes').textContent = mins + ' min played';

  if (!game) return;
  game.playerStats = game.playerStats || [];
  let ps = game.playerStats.find(x => x.playerId === playerId);
  if (!ps) {
    ps = { playerId, goals:0, assists:0, minutesPlayed:0, yellowCards:0, redCards:0, duelsWon:0, duelsLost:0, chancesCreated:0, mistakes:0 };
    game.playerStats.push(ps);
  }

  const body = document.getElementById('statBody');
  body.innerHTML = `
    <div class="lg-stat-rows">
      ${statRow('Goals',        ps.goals        || 0, 'goals',       99)}
      ${statRow('Assists',      ps.assists       || 0, 'assists',     99)}
      ${statRow('Yellow Cards', ps.yellowCards   || 0, 'yellowCards',  2)}
      ${statRow('Red Card',     ps.redCards      || 0, 'redCards',     1)}
    </div>
    <button class="btn-secondary lg-sub-from-stat" id="subFromStatBtn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4-4 4"/><path d="M21 7H3"/><path d="M7 21l-4-4 4-4"/><path d="M3 17h18"/></svg>
      Substitution
    </button>
  `;

  body.querySelectorAll('.lg-stat-adj').forEach(btn => {
    btn.addEventListener('click', () => {
      const stat  = btn.dataset.stat;
      const delta = parseInt(btn.dataset.delta, 10);
      const max   = parseInt(btn.dataset.max,   10);
      const ps2   = game.playerStats.find(x => x.playerId === activeStatPlayerId);
      if (!ps2) return;
      ps2[stat] = Math.max(0, Math.min(max, (ps2[stat] || 0) + delta));
      btn.closest('.lg-stat-row').querySelector('.lg-stat-val').textContent = ps2[stat];
      persistState();
      renderGamePitch();
    });
  });

  document.getElementById('subFromStatBtn').addEventListener('click', () => {
    closeStatModal();
    const entry = Object.entries(liveGame.activeSquad).find(([, v]) => v === playerId);
    if (entry) openSubPickOn(entry[0]);
  });

  document.getElementById('statBackdrop').classList.add('active');
}

function statRow(label, value, stat, max) {
  return `
    <div class="lg-stat-row">
      <span class="lg-stat-label">${label}</span>
      <div class="lg-stat-controls">
        <button class="lg-stat-adj" data-stat="${stat}" data-delta="-1" data-max="${max}">−</button>
        <span class="lg-stat-val">${value}</span>
        <button class="lg-stat-adj" data-stat="${stat}" data-delta="1" data-max="${max}">+</button>
      </div>
    </div>`;
}

function closeStatModal() {
  document.getElementById('statBackdrop').classList.remove('active');
  activeStatPlayerId = null;
}

function getPlayerMinutes(playerId) {
  const accrued = (liveGame.minutesAccrued || {})[playerId] || 0;
  const inSquad = Object.values(liveGame.activeSquad).includes(playerId);
  if (inSquad) {
    const entryMin = liveGame.playerEntryMinute[playerId] || 0;
    return accrued + Math.max(0, getCurrentMinute() - entryMin);
  }
  return accrued;
}

// ═══════════════════════════════════════════════
// SUBSTITUTION MODALS
// ═══════════════════════════════════════════════
function initSubModals() {
  document.getElementById('closeSubOff').addEventListener('click', () => document.getElementById('subOffBackdrop').classList.remove('active'));
  document.getElementById('subOffBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('subOffBackdrop')) document.getElementById('subOffBackdrop').classList.remove('active');
  });
  document.getElementById('closeSubOn').addEventListener('click', () => document.getElementById('subOnBackdrop').classList.remove('active'));
  document.getElementById('subOnBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('subOnBackdrop')) document.getElementById('subOnBackdrop').classList.remove('active');
  });
}

function openSubPickOff() {
  const players = team.players || [];
  const list    = document.getElementById('subOffList');
  list.innerHTML = '';

  const activeEntries = Object.entries(liveGame.activeSquad).filter(([, v]) => v);
  if (!activeEntries.length) {
    list.innerHTML = '<div class="lu-picker-empty">No players on the pitch.</div>';
  } else {
    activeEntries.forEach(([slotKey, playerId]) => {
      const player = players.find(p => p.id === playerId);
      if (!player) return;
      const mins = Math.round(getPlayerMinutes(playerId));
      const item = document.createElement('div');
      item.className = 'lu-picker-item';
      item.innerHTML = `
        <div class="lu-picker-avatar">${nameInitials(player.name)}</div>
        <div class="lu-picker-info">
          <span class="lu-picker-name">${escHtml(player.name)}</span>
          <span class="lu-picker-positions">${(player.attrs?.positions || []).join(' · ') || '—'}</span>
        </div>
        <div class="lu-picker-meta"><span class="lu-picker-ovr">${mins}'</span></div>
      `;
      item.addEventListener('click', () => {
        document.getElementById('subOffBackdrop').classList.remove('active');
        subOffSlotKey = slotKey;
        openSubPickOn(slotKey);
      });
      list.appendChild(item);
    });
  }
  document.getElementById('subOffBackdrop').classList.add('active');
}

function openSubPickOn(slotKey) {
  subOffSlotKey = slotKey;
  const players   = team.players || [];
  const activeIds = new Set(Object.values(liveGame.activeSquad).filter(Boolean));
  const bench     = players.filter(p => !activeIds.has(p.id));

  const slots     = getSlotsForFormation(liveGame.formation);
  const targetSlot = slots.find(s => s.key === slotKey);

  document.getElementById('subOnTitle').textContent = 'Sub On' + (targetSlot ? ' — ' + targetSlot.posLabel : '');

  const list = document.getElementById('subOnList');
  list.innerHTML = '';

  if (!bench.length) {
    list.innerHTML = '<div class="lu-picker-empty">No bench players available.</div>';
  } else {
    const sorted = bench
      .map(p => ({ p, hasPos: (p.attrs?.positions || []).includes(targetSlot?.posLabel) }))
      .sort((a, b) => b.hasPos - a.hasPos);

    sorted.forEach(({ p, hasPos }) => {
      const item = document.createElement('div');
      item.className = 'lu-picker-item';
      item.innerHTML = `
        <div class="lu-picker-avatar">${nameInitials(p.name)}</div>
        <div class="lu-picker-info">
          <span class="lu-picker-name">${escHtml(p.name)}</span>
          <span class="lu-picker-positions">${(p.attrs?.positions || []).join(' · ') || '—'}</span>
        </div>
        <div class="lu-picker-meta">
          ${hasPos ? `<span class="lu-pos-match">✓ ${targetSlot?.posLabel || ''}</span>` : ''}
        </div>
      `;
      item.addEventListener('click', () => {
        document.getElementById('subOnBackdrop').classList.remove('active');
        performSub(slotKey, p.id);
      });
      list.appendChild(item);
    });
  }
  document.getElementById('subOnBackdrop').classList.add('active');
}

function performSub(slotKey, newPlayerId) {
  const minute      = Math.round(getCurrentMinute());
  const oldPlayerId = liveGame.activeSquad[slotKey];

  if (oldPlayerId) {
    const entryMin = liveGame.playerEntryMinute[oldPlayerId] || 0;
    const played   = Math.max(0, minute - entryMin);
    liveGame.minutesAccrued = liveGame.minutesAccrued || {};
    liveGame.minutesAccrued[oldPlayerId] = (liveGame.minutesAccrued[oldPlayerId] || 0) + played;
    delete liveGame.playerEntryMinute[oldPlayerId];

    if (game) {
      game.playerStats = game.playerStats || [];
      let ps = game.playerStats.find(x => x.playerId === oldPlayerId);
      if (!ps) {
        ps = { playerId: oldPlayerId, goals:0, assists:0, minutesPlayed:0, yellowCards:0, redCards:0, duelsWon:0, duelsLost:0, chancesCreated:0, mistakes:0 };
        game.playerStats.push(ps);
      }
      ps.minutesPlayed = liveGame.minutesAccrued[oldPlayerId];
    }
  }

  liveGame.activeSquad[slotKey]           = newPlayerId;
  liveGame.playerEntryMinute[newPlayerId] = minute;
  liveGame.substitutions = liveGame.substitutions || [];
  liveGame.substitutions.push({ minute, off: oldPlayerId, on: newPlayerId, slotKey });

  persistState();
  renderGamePitch();
}

// ═══════════════════════════════════════════════
// SETUP PLAYER PICKER
// ═══════════════════════════════════════════════
let activeSetupSlot = null;

function initSetupPicker() {
  document.getElementById('closeSetupPicker').addEventListener('click', closeSetupPicker);
  document.getElementById('setupPickerBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('setupPickerBackdrop')) closeSetupPicker();
  });
}

function openSetupPicker(slot) {
  activeSetupSlot = slot;
  const players  = team.players || [];
  const assigned = new Set(Object.values(setupSlots).filter(Boolean));
  const current  = setupSlots[slot.key];

  document.getElementById('setupPickerTitle').textContent = slot.posLabel + ' — Choose Player';

  const sorted = [...players]
    .map(p => ({
      p,
      hasPos:     (p.attrs?.positions || []).includes(slot.posLabel),
      isAssigned: assigned.has(p.id) && p.id !== current,
    }))
    .sort((a, b) => {
      if (a.hasPos !== b.hasPos) return b.hasPos - a.hasPos;
      return scoreFor(b.p, slot.posLabel) - scoreFor(a.p, slot.posLabel);
    });

  const list = document.getElementById('setupPickerList');
  list.innerHTML = '';

  if (current) {
    const clear = document.createElement('div');
    clear.className = 'lu-picker-item lu-picker-clear';
    clear.innerHTML = '<span>— Remove player —</span>';
    clear.addEventListener('click', () => {
      delete setupSlots[slot.key];
      renderSetupSlots();
      closeSetupPicker();
    });
    list.appendChild(clear);
  }

  sorted.forEach(({ p, hasPos, isAssigned }) => {
    const overall = overallRating(p);
    const item = document.createElement('div');
    item.className = 'lu-picker-item' + (isAssigned ? ' lu-picker-used' : '') + (p.id === current ? ' lu-picker-current' : '');
    item.innerHTML = `
      <div class="lu-picker-avatar">${nameInitials(p.name)}</div>
      <div class="lu-picker-info">
        <span class="lu-picker-name">${escHtml(p.name)}</span>
        <span class="lu-picker-positions">${(p.attrs?.positions || []).join(' · ') || '—'}</span>
      </div>
      <div class="lu-picker-meta">
        ${hasPos ? `<span class="lu-pos-match">✓ ${slot.posLabel}</span>` : ''}
        <span class="lu-picker-ovr">${overall > 0 ? overall : '—'}</span>
      </div>
    `;
    item.addEventListener('click', () => {
      for (const [k, v] of Object.entries(setupSlots)) {
        if (v === p.id && k !== slot.key) delete setupSlots[k];
      }
      setupSlots[slot.key] = p.id;
      renderSetupSlots();
      closeSetupPicker();
    });
    list.appendChild(item);
  });

  if (!sorted.length) {
    list.innerHTML = '<div class="lu-picker-empty">No players in your team yet.</div>';
  }

  document.getElementById('setupPickerBackdrop').classList.add('active');
}

function closeSetupPicker() {
  document.getElementById('setupPickerBackdrop').classList.remove('active');
  activeSetupSlot = null;
}

// ── Helpers ──
function nameInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function shortName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 10);
  return parts[0][0] + '. ' + parts[parts.length - 1].slice(0, 9);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
