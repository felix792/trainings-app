const STORAGE_KEY = 'football_coach_teams';
const params = new URLSearchParams(window.location.search);
const teamId = params.get('id');

function loadTeams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.DB_READY.then(() => {
  if (window.APP_ROLE !== 'head-coach') {
    window.location.replace('team.html' + (teamId ? '?id=' + teamId : ''));
    return;
  }

  const teams = loadTeams();
  const team  = teams.find((t) => t.id === teamId);

  document.getElementById('backLink').href = 'team.html?id=' + teamId;
  document.getElementById('backTeamName').textContent = team ? team.name : 'Team';
  document.title = 'Settings — ' + (team ? team.name : 'TactIQ');

  // ── Nav switching ──────────────────────────────────────────────────────────
  document.querySelectorAll('.sp-nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sp-nav-item').forEach((n) => n.classList.remove('sp-nav-active'));
      document.querySelectorAll('.sp-section').forEach((s) => { s.style.display = 'none'; });
      item.classList.add('sp-nav-active');
      document.getElementById('section-' + item.dataset.section).style.display = '';
    });
  });

  // ── Role selector ──────────────────────────────────────────────────────────
  let selectedRole = 'player';
  document.querySelectorAll('.sp-role-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sp-role-btn').forEach((b) => b.classList.remove('sp-role-active'));
      btn.classList.add('sp-role-active');
      selectedRole = btn.dataset.role;
    });
  });

  // ── Generate invite code ───────────────────────────────────────────────────
  document.getElementById('generate-btn').addEventListener('click', async () => {
    const label    = document.getElementById('invite-label').value.trim();
    const btn      = document.getElementById('generate-btn');
    const ownerUid = window.APP_OWNER_UID;
    const t        = loadTeams().find((x) => x.id === teamId);

    btn.disabled = true;
    btn.textContent = 'Generating…';
    try {
      const code = await window.createInvite({
        ownerUid,
        teamId:   teamId || 'legacy',
        teamName: t ? t.name : 'My Team',
        role:     selectedRole,
        label
      });
      document.getElementById('invite-code-result').style.display = '';
      document.getElementById('invite-code-value').textContent = code;
      document.getElementById('invite-label').value = '';
      loadInvites();
    } catch {
      showToast('Failed to generate code. Please try again.', 'error');
    }
    btn.disabled = false;
    btn.textContent = 'Generate Invite Code';
  });

  // Copy generated code
  document.getElementById('invite-code-copy').addEventListener('click', () => {
    const code = document.getElementById('invite-code-value').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('invite-code-copy');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });

  // Hide assistant-coach invite option when simple system is active
  function applyCoachSystemToInviteForm() {
    const simple = window.APP_COACH_SYSTEM === 'simple';
    document.querySelectorAll('.sp-role-btn[data-role="assistant-coach"]').forEach((btn) => {
      btn.style.display = simple ? 'none' : '';
    });
    if (simple && selectedRole === 'assistant-coach') {
      selectedRole = 'player';
      document.querySelectorAll('.sp-role-btn').forEach((b) => b.classList.remove('sp-role-active'));
      const playerBtn = document.querySelector('.sp-role-btn[data-role="player"]');
      if (playerBtn) playerBtn.classList.add('sp-role-active');
    }
  }
  applyCoachSystemToInviteForm();

  // Initial data load
  loadInvites();
  loadPermissions();
  loadCoachSystem();
});

// ── Coach System ─────────────────────────────────────────────────────────────
function loadCoachSystem() {
  const current = window.APP_COACH_SYSTEM || 'multi';
  document.querySelectorAll('.sp-system-card').forEach((card) => {
    card.classList.toggle('sp-system-card-active', card.dataset.system === current);
    card.addEventListener('click', async () => {
      const chosen = card.dataset.system;
      if (chosen === (window.APP_COACH_SYSTEM || 'multi')) return;
      document.querySelectorAll('.sp-system-card').forEach((c) => c.classList.remove('sp-system-card-active'));
      card.classList.add('sp-system-card-active');
      const status = document.getElementById('coach-system-status');
      window.APP_COACH_SYSTEM = chosen;
      status.textContent = 'Saved — reload to see updated role labels';
      status.style.color = '#16a34a';
      window.saveCoachSystem(chosen);
    });
  });
}

// ── Invites ──────────────────────────────────────────────────────────────────
function loadInvites() {
  const uid = window.APP_OWNER_UID;
  if (!uid || !window.getInvites) return;
  window.getInvites(uid).then((invites) => {
    renderActiveInvites(invites.filter((i) => !i.used));
    renderMembers(invites.filter((i) => i.used));
  }).catch(() => {
    const el = document.getElementById('active-invites-list');
    if (el) el.innerHTML = '<span class="sp-empty">Could not load invite data.</span>';
  });
}

function renderActiveInvites(active) {
  const el = document.getElementById('active-invites-list');
  if (!el) return;
  if (active.length === 0) {
    el.innerHTML = '<span class="sp-empty">No active invite codes.</span>';
    return;
  }
  const BASE = 'https://felix792.github.io/trainings-app/';
  el.innerHTML = `<div class="sp-invite-list">${active.map((inv) => {
    const isPlayer = inv.role === 'player';
    const link = BASE + '?invite=' + inv.id;
    const roleLabel = inv.role === 'assistant-coach' ? (window.APP_COACH_SYSTEM === 'simple' ? 'Coach' : 'Asst. Coach') : 'Player';
    return `
    <div class="sp-invite-row" style="flex-direction:column;align-items:stretch;gap:8px;">
      <div class="sp-invite-row-left">
        <span class="sp-invite-code">${escapeHtml(inv.id)}</span>
        ${inv.label ? `<span class="sp-tag sp-tag-muted">${escapeHtml(inv.label)}</span>` : ''}
        <span class="sp-tag">${escapeHtml(roleLabel)}</span>
      </div>
      ${isPlayer ? `<div style="background:#0e0e1a;border:1px solid #1e293b;border-radius:7px;padding:8px 10px;font-size:.75rem;color:#94a3b8;word-break:break-all;font-family:monospace;">${escapeHtml(link)}</div>` : ''}
      <div style="display:flex;gap:6px;justify-content:flex-end;">
        ${isPlayer ? `<button class="sp-copy-link-btn btn-secondary" style="font-size:.8rem;padding:5px 12px;" data-link="${escapeHtml(link)}">Copy Link</button>` : ''}
        <button class="sp-revoke-btn" data-code="${escapeHtml(inv.id)}">Revoke</button>
      </div>
    </div>`;
  }).join('')}</div>`;
  el.querySelectorAll('.sp-copy-link-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.link)
        .catch(() => {
          const ta = document.createElement('textarea');
          ta.value = btn.dataset.link;
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        })
        .finally(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
        });
    });
  });
  el.querySelectorAll('.sp-revoke-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      showConfirm('Revoke this invite code?', async () => {
        btn.disabled = true;
        await window.deleteInvite(btn.dataset.code);
        loadInvites();
      });
    });
  });
}

function renderMembers(members) {
  const el = document.getElementById('members-list');
  if (!el) return;
  if (members.length === 0) {
    el.innerHTML = '<span class="sp-empty">No members yet — generate an invite code to add people.</span>';
    return;
  }
  el.innerHTML = `<div class="sp-member-list">${members.map((inv) => {
    const initial  = (inv.usedByName || 'U')[0].toUpperCase();
    const simple   = window.APP_COACH_SYSTEM === 'simple';
    const roleLabel = inv.role === 'assistant-coach' ? (simple ? 'Coach' : 'Assistant Coach') : 'Player';
    const tagCls   = inv.role === 'assistant-coach' ? 'sp-tag sp-tag-coach' : 'sp-tag';
    return `
      <div class="sp-member-row">
        <div class="sp-member-avatar">${escapeHtml(initial)}</div>
        <div class="sp-member-info">
          <div class="sp-member-name">${escapeHtml(inv.usedByName || 'Unknown')}</div>
          ${inv.label ? `<div class="sp-member-label">${escapeHtml(inv.label)}</div>` : ''}
        </div>
        <span class="${tagCls}">${roleLabel}</span>
      </div>`;
  }).join('')}</div>`;
}

// ── Player Permissions ────────────────────────────────────────────────────────
const TOP_LABELS = [
  { key: 'players',   label: 'Players' },
  { key: 'exercises', label: 'Exercises' },
  { key: 'plays',     label: 'Plays' },
  { key: 'stats',     label: 'Games' },
  { key: 'points',    label: 'Points' },
  { key: 'cards',     label: 'Your Card' },
  { key: 'blackbox',  label: 'BlackBox' },
];

const SECTION_LABELS = [
  { key: 'attributes',          label: 'Attributes & Profile' },
  { key: 'categoryProgression', label: 'Category Progression' },
  { key: 'gameStats',           label: 'Game Stats' },
  { key: 'statProgression',     label: 'Stat Progression' },
];

function loadPermissions() {
  const uid = window.APP_OWNER_UID;
  if (!uid) return;

  firebase.firestore().collection('users').doc(uid).get().then((snap) => {
    const data     = snap.exists ? snap.data() : {};
    const perms    = data.playerPermissions ||
      { players: true, exercises: true, plays: true, stats: true, points: true, cards: true };
    const sections = perms.playerSections ||
      { attributes: true, categoryProgression: true, gameStats: true, statProgression: true };
    perms.playerSections = sections;

    const container = document.getElementById('perm-toggles-page');
    if (!container) return;

    async function persist() {
      const status = document.getElementById('perm-status-page');
      status.textContent = 'Saving…';
      status.style.color = '#6868a0';
      await window.savePlayerPermissions({ ...perms });
      status.textContent = 'Saved';
      status.style.color = '#16a34a';
      setTimeout(() => { status.textContent = ''; }, 2000);
    }

    function showConfirm(label, newValue, onConfirm) {
      const modal = document.getElementById('perm-confirm-modal');
      const action = newValue ? 'show' : 'hide';
      modal.innerHTML = `
        <div class="perm-confirm-box">
          <p class="perm-confirm-msg">Are you sure you want to <strong>${action}</strong> <strong>${escapeHtml(label)}</strong> for your players?</p>
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
        <span class="perm-label${indent ? ' perm-label-sub' : ''}">${escapeHtml(label)}</span>
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
        const newVal = cb.checked;
        cb.checked = !newVal;
        showConfirm(label, newVal, async () => {
          cb.checked = newVal;
          track.style.background = newVal ? '#16a34a' : '#334155';
          thumb.style.left = newVal ? '21px' : '3px';
          state.textContent = newVal ? 'Visible' : 'Hidden';
          onChange(newVal);
          await persist();
        });
      });
      return row;
    }

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
