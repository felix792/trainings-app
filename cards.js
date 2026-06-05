const STORAGE_KEY = 'football_coach_teams';

function loadTeams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const params = new URLSearchParams(window.location.search);
const teamId = params.get('id');
const team = loadTeams().find((t) => t.id === teamId);

if (!team) {
  document.getElementById('pageContent').style.display = 'none';
  document.getElementById('notFound').style.display = 'flex';
} else {
  document.title = 'Your Card — ' + team.name;
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href = 'team.html?id=' + teamId;
  document.getElementById('teamMeta').textContent = team.name;
  renderCards();
}

function fmtStat(n) {
  return String(Math.min(99, Math.max(1, Math.round(n)))).padStart(2, '0');
}

function scaleRating(val) {
  return Math.max(1, Math.round(((val || 0) / 10) * 99));
}

function buildCardSVG(player, teamName) {
  const a = player.attrs || {};
  const pac = scaleRating(a.speed);
  const sho = scaleRating(a.shot);
  const pas = scaleRating(a.passing);
  const dri = scaleRating(a.dribbling);
  const def = scaleRating(a.defensiveAbility);
  const phy = scaleRating(a.physicalAbility);
  const rating = Math.round((pac + sho + pas + dri + def + phy) / 6);
  const position = (a.positions && a.positions[0]) || 'CM';
  const name = player.name.toUpperCase().slice(0, 14);
  const teamShort = teamName.toUpperCase().slice(0, 3);

  const id = player.id.replace(/-/g, '');
  const CARD_PATH  = 'M32 0 L132 0 Q138 0 144 12 L150 26 L156 12 Q162 0 168 0 L268 0 Q300 0 300 32 L300 388 Q300 420 268 420 L32 420 Q0 420 0 388 L0 32 Q0 0 32 0 Z';
  const INNER_PATH = 'M36 8 L134 8 Q139 8 144 19 L150 32 L156 19 Q161 8 166 8 L264 8 Q292 8 292 36 L292 384 Q292 412 264 412 L36 412 Q8 412 8 384 L8 36 Q8 8 36 8 Z';
  const rays = [[0,0],[70,0],[140,0],[210,0],[280,0],[300,60],[300,160],[300,270],[300,370],[240,420],[180,420],[120,420],[60,420],[0,370],[0,240],[0,110]];

  return `
    <svg viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;">
      <defs>
        <linearGradient id="fsBg${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#8800CC"/>
          <stop offset="30%"  stop-color="#CC00AA"/>
          <stop offset="65%"  stop-color="#AA00CC"/>
          <stop offset="100%" stop-color="#5500BB"/>
        </linearGradient>
        <linearGradient id="fsOv${id}" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stop-color="rgba(255,50,220,0.5)"/>
          <stop offset="50%"  stop-color="rgba(180,0,255,0.1)"/>
          <stop offset="100%" stop-color="rgba(100,0,200,0.45)"/>
        </linearGradient>
        <radialGradient id="fsBurst${id}" cx="60%" cy="40%" r="44%">
          <stop offset="0%"   stop-color="rgba(255,255,255,0.26)"/>
          <stop offset="40%"  stop-color="rgba(255,160,255,0.09)"/>
          <stop offset="100%" stop-color="rgba(120,0,200,0)"/>
        </radialGradient>
        <linearGradient id="fsGold${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#FFE44D"/>
          <stop offset="50%"  stop-color="#FFD700"/>
          <stop offset="100%" stop-color="#C89800"/>
        </linearGradient>
        <clipPath id="fsClip${id}"><path d="${CARD_PATH}"/></clipPath>
      </defs>

      <g clip-path="url(#fsClip${id})">
        <rect width="300" height="420" fill="url(#fsBg${id})"/>
        <rect width="300" height="420" fill="url(#fsOv${id})"/>
        ${rays.map(([x2, y2]) => `<line x1="175" y1="175" x2="${x2}" y2="${y2}" stroke="rgba(255,70,255,0.28)" stroke-width="1"/>`).join('')}
        <ellipse cx="222" cy="78"  rx="58" ry="40" fill="rgba(255,40,200,0.3)"  transform="rotate(-22,222,78)"/>
        <ellipse cx="68"  cy="282" rx="38" ry="62" fill="rgba(160,0,255,0.22)"  transform="rotate(16,68,282)"/>
        <ellipse cx="256" cy="312" rx="32" ry="50" fill="rgba(255,0,180,0.18)"  transform="rotate(-12,256,312)"/>
        <ellipse cx="36"  cy="158" rx="28" ry="44" fill="rgba(200,0,255,0.2)"   transform="rotate(24,36,158)"/>
        <path d="M162 0 Q172 45 157 90 Q147 120 162 150 Q177 180 158 210" fill="none" stroke="rgba(220,80,255,0.4)"  stroke-width="9"/>
        <path d="M192 0 Q202 55 186 95 Q176 128 192 162"                  fill="none" stroke="rgba(255,50,200,0.28)" stroke-width="7"/>
        <rect width="300" height="420" fill="url(#fsBurst${id})"/>
        <rect x="0" y="265" width="300" height="155" fill="rgba(30,0,50,0.52)"/>
      </g>

      <path d="${CARD_PATH}"  fill="none" stroke="url(#fsGold${id})"      stroke-width="5"/>
      <path d="${INNER_PATH}" fill="none" stroke="rgba(255,215,0,0.32)"   stroke-width="1.5"/>

      <text x="150" y="22" font-family="'Bebas Neue','Barlow Condensed',sans-serif" font-size="11" font-weight="700" fill="#FFD700" text-anchor="middle" letter-spacing="4">FUTURE STARS</text>

      <text x="38"  y="112" font-family="'Bebas Neue',sans-serif" font-size="76" fill="#FFD700" letter-spacing="-2">${fmtStat(rating)}</text>
      <text x="40"  y="144" font-family="'Barlow Condensed',sans-serif" font-weight="900" font-size="24" fill="#FFD700" letter-spacing="3">${escapeHtml(position)}</text>

      <circle cx="57" cy="215" r="26" fill="rgba(0,0,0,0.62)" stroke="rgba(255,215,0,0.5)" stroke-width="1.5"/>
      <text x="57" y="212" font-family="'Barlow Condensed',sans-serif" font-weight="900" font-size="13" fill="#FFD700" text-anchor="middle">${escapeHtml(teamShort)}</text>
      <text x="57" y="226" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="9"  fill="rgba(255,215,0,0.7)" text-anchor="middle">CLUB</text>

      <text x="150" y="298" font-family="'Bebas Neue',sans-serif" font-size="30" fill="#FFD700" text-anchor="middle" letter-spacing="4">${escapeHtml(name)}</text>
      <line x1="36" y1="308" x2="264" y2="308" stroke="rgba(255,215,0,0.4)" stroke-width="1"/>

      <text x="62"  y="348" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="end">${fmtStat(pac)}</text>
      <text x="67"  y="348" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">PAC</text>
      <text x="62"  y="375" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="end">${fmtStat(sho)}</text>
      <text x="67"  y="375" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">SHO</text>
      <text x="62"  y="402" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="end">${fmtStat(pas)}</text>
      <text x="67"  y="402" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">PAS</text>

      <line x1="150" y1="328" x2="150" y2="412" stroke="rgba(255,215,0,0.4)" stroke-width="1.5"/>

      <text x="173" y="348" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="start">${fmtStat(dri)}</text>
      <text x="207" y="348" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">DRI</text>
      <text x="173" y="375" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="start">${fmtStat(def)}</text>
      <text x="207" y="375" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">DEF</text>
      <text x="173" y="402" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#FFD700" text-anchor="start">${fmtStat(phy)}</text>
      <text x="207" y="402" font-family="'Barlow Condensed',sans-serif" font-weight="700" font-size="18" fill="#E8C0FF" letter-spacing="1">PHY</text>

      <line x1="36" y1="412" x2="264" y2="412" stroke="rgba(255,215,0,0.3)" stroke-width="1"/>
    </svg>`;
}

function renderCards() {
  const players = team.players || [];
  const grid = document.getElementById('cardsGrid');
  const empty = document.getElementById('cardsEmpty');

  if (players.length === 0) {
    empty.style.display = 'block';
    return;
  }

  grid.innerHTML = players.map((p) => `
    <div class="player-card-item" data-player-id="${p.id}" title="Open ${escapeHtml(p.name)}">
      ${buildCardSVG(p, team.name)}
    </div>
  `).join('');

  grid.querySelectorAll('.player-card-item').forEach((el) => {
    el.addEventListener('click', () => {
      window.location.href = 'player.html?teamId=' + teamId + '&playerId=' + el.dataset.playerId;
    });
  });
}

window.DB_READY.then(() => {
  if (window.APP_ROLE !== 'player') return;
  const uid = firebase.auth().currentUser?.uid;
  const me  = uid && (team?.players || []).find(p => p.uid === uid);
  if (!me) return;
  document.querySelectorAll('.player-card-item').forEach(el => {
    if (el.dataset.playerId !== me.id) el.remove();
  });
});
