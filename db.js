(function () {
  const STORAGE_KEY = 'football_coach_teams';
  const isHome = /\/(index\.html)?$/.test(window.location.pathname) ||
                 window.location.pathname.endsWith('/trainings-app/');

  let syncTimer  = null;
  let cloudReady = false;
  let resolveReady;
  window.DB_READY         = new Promise((r) => { resolveReady = r; });
  window.APP_ROLE         = null;   // 'head-coach' | 'assistant-coach' | 'player'
  window.APP_PERMISSIONS  = null;
  window.APP_OWNER_UID    = null;   // head-coach's UID where team data lives
  window.APP_COACH_SYSTEM = 'multi'; // 'multi' | 'simple'
  window.APP_MEMBERSHIPS  = [];

  // Backward-compat alias so pages that still reference APP_COACH_UID work
  Object.defineProperty(window, 'APP_COACH_UID', {
    get() { return window.APP_OWNER_UID; },
    configurable: true
  });

  const origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    origSet(key, value);
    if (key === STORAGE_KEY && cloudReady && window.APP_ROLE !== 'player') {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => syncUp(value), 1500);
    }
  };

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Overlay ──────────────────────────────────────────────────────────────────
  function showOverlay(html) {
    let el = document.getElementById('db-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'db-overlay';
      el.style.cssText = [
        'position:fixed;inset:0;background:#0a0a14;z-index:9999',
        'display:flex;flex-direction:column;align-items:center;justify-content:center',
        'font-family:system-ui,sans-serif;padding:24px;box-sizing:border-box'
      ].join(';');
      document.body.appendChild(el);
    }
    el.innerHTML = html;
  }
  function hideOverlay() {
    const el = document.getElementById('db-overlay');
    if (el) el.remove();
  }

  // ── Firestore helpers ────────────────────────────────────────────────────────
  function userDoc(uid) {
    return firebase.firestore().collection('users').doc(uid);
  }
  function inviteDoc(code) {
    return firebase.firestore().collection('invites').doc(code.toUpperCase());
  }
  async function syncUp(teamsJson) {
    const user = firebase.auth().currentUser;
    if (!user || window.APP_ROLE === 'player') return;
    const ownerUid = window.APP_OWNER_UID || user.uid;
    userDoc(ownerUid).set({ teams: teamsJson, updatedAt: Date.now() }, { merge: true }).catch(() => {});
  }
  async function syncDown(uid) {
    try {
      const snap = await userDoc(uid).get();
      if (snap.exists && snap.data().teams) origSet(STORAGE_KEY, snap.data().teams);
    } catch (_) {}
  }
  async function getProfile(uid) {
    try {
      const snap = await userDoc(uid).get();
      return snap.exists ? snap.data() : null;
    } catch { return null; }
  }
  async function saveProfile(uid, data) {
    return userDoc(uid).set(data, { merge: true });
  }

  // ── Generate 6-char invite code ──────────────────────────────────────────────
  function genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  // ── User / team-switcher button ───────────────────────────────────────────────
  function injectUserBadge(user, role, teamName, memberships) {
    const header = document.querySelector('.header-inner');
    if (!header || document.getElementById('db-user-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'db-user-btn';
    const simple = window.APP_COACH_SYSTEM === 'simple';
    const roleLabel = role === 'player' ? 'Player'
      : role === 'head-coach' ? (simple ? 'Coach' : 'Head Coach')
      : (simple ? 'Coach' : 'Asst. Coach');
    const multiTeam = memberships && memberships.length > 1;
    btn.title = roleLabel + ' — ' + user.email + '\nClick to view profile';
    btn.style.cssText = 'background:transparent;border:1px solid #334155;color:#94a3b8;border-radius:7px;padding:5px 10px;font-size:.75rem;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px';
    btn.textContent = (teamName ? teamName + ' · ' : '') + roleLabel;
    btn.addEventListener('click', () => {
      if (!window.location.pathname.includes('profile.html')) {
        window.location.href = 'profile.html';
      }
    });
    header.appendChild(btn);
  }

  // ── Sign-in screen ───────────────────────────────────────────────────────────
  function showSignIn() {
    showOverlay(`
      <div style="text-align:center;max-width:320px;">
        <div style="font-size:3rem;margin-bottom:12px;">⚽</div>
        <div style="color:#f1f5f9;font-size:1.25rem;font-weight:700;margin-bottom:6px;">TactIQ</div>
        <div style="color:#94a3b8;font-size:.875rem;margin-bottom:28px;line-height:1.5;">
          Sign in with Google to continue.
        </div>
        <button id="db-signin-btn" style="display:inline-flex;align-items:center;gap:10px;background:#16a34a;color:#fff;border:none;padding:13px 28px;border-radius:10px;font-size:1rem;font-weight:600;cursor:pointer;width:100%;justify-content:center;">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#fff" d="M44.5 20H24v8h11.8C34.7 33.9 30 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-7.9 19.7-20 0-1.3-.1-2.7-.3-4z"/></svg>
          Sign in with Google
        </button>
      </div>`);
    document.getElementById('db-signin-btn').addEventListener('click', () => {
      firebase.auth()
        .signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .catch((err) => showToast('Sign-in failed: ' + err.message, 'error'));
    });
  }

  // ── Welcome screen (no memberships) ─────────────────────────────────────────
  function showWelcomeScreen(user) {
    showOverlay(`
      <div style="text-align:center;max-width:380px;width:100%;">
        <div style="font-size:3rem;margin-bottom:12px;">⚽</div>
        <div style="color:#f1f5f9;font-size:1.2rem;font-weight:700;margin-bottom:6px;">Welcome to TactIQ</div>
        <div style="color:#94a3b8;font-size:.875rem;margin-bottom:28px;">Get started by creating a team or joining one.</div>
        <div style="display:flex;gap:16px;">
          <button id="btn-create-team" style="flex:1;background:#0e0e1a;border:2px solid #1c1c2c;color:#f1f5f9;border-radius:12px;padding:24px 16px;cursor:pointer;font-size:.95rem;font-weight:600;">
            <div style="font-size:2rem;margin-bottom:10px;">🎽</div>
            <div style="margin-bottom:6px;">Create Team</div>
            <div style="font-size:.75rem;color:#94a3b8;line-height:1.4;">Start as a head coach and invite players</div>
          </button>
          <button id="btn-join-team" style="flex:1;background:#0e0e1a;border:2px solid #1c1c2c;color:#f1f5f9;border-radius:12px;padding:24px 16px;cursor:pointer;font-size:.95rem;font-weight:600;">
            <div style="font-size:2rem;margin-bottom:10px;">🔗</div>
            <div style="margin-bottom:6px;">Join Team</div>
            <div style="font-size:.75rem;color:#94a3b8;line-height:1.4;">Enter the invite code from your coach</div>
          </button>
        </div>
      </div>`);
    document.getElementById('btn-create-team').addEventListener('click', () => showCreateTeam(user));
    document.getElementById('btn-join-team').addEventListener('click', () => showJoinTeam(user, ''));
  }

  // ── Create team screen ───────────────────────────────────────────────────────
  function showCreateTeam(user) {
    showOverlay(`
      <div style="text-align:center;max-width:340px;width:100%;">
        <div style="font-size:2.5rem;margin-bottom:12px;">🎽</div>
        <div style="color:#f1f5f9;font-size:1.1rem;font-weight:700;margin-bottom:6px;">Create Your Team</div>
        <div style="color:#94a3b8;font-size:.85rem;margin-bottom:24px;">What's your team called?</div>
        <input id="team-name-input" placeholder="Team name (e.g. FC Tigers)"
          style="width:100%;background:#0e0e1a;border:1px solid #334155;color:#f1f5f9;border-radius:8px;padding:12px 14px;font-size:.9rem;outline:none;box-sizing:border-box;margin-bottom:16px;"/>
        <button id="create-team-btn" style="width:100%;background:#16a34a;color:#fff;border:none;border-radius:10px;padding:13px;font-size:1rem;font-weight:600;cursor:pointer;margin-bottom:10px;">Create Team</button>
        <button id="create-back-btn" style="width:100%;background:transparent;color:#94a3b8;border:1px solid #334155;border-radius:10px;padding:10px;font-size:.85rem;cursor:pointer;">← Back</button>
      </div>`);
    const input = document.getElementById('team-name-input');
    input.focus();
    document.getElementById('create-back-btn').addEventListener('click', () => showWelcomeScreen(user));
    const create = async () => {
      const name = input.value.trim();
      if (!name) { input.style.borderColor = '#ef4444'; return; }
      showOverlay('<div style="color:#94a3b8;font-size:.9rem;">Creating team…</div>');
      const teamId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2);
      const membership = { teamId, teamName: name, role: 'head-coach', ownerUid: user.uid, joinedAt: Date.now() };
      const existing = await getProfile(user.uid);
      const existingMems = (existing && existing.memberships) || [];
      await saveProfile(user.uid, {
        memberships: [...existingMems, membership],
        playerPermissions: (existing && existing.playerPermissions) || {
          players: true, exercises: true, plays: true, stats: true, points: true, cards: true, blackbox: true,
          playerSections: { attributes: true, categoryProgression: true, gameStats: true, statProgression: true }
        }
      });
      await activateMembership(user, membership, [...existingMems, membership]);
    };
    document.getElementById('create-team-btn').addEventListener('click', create);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') create(); });
  }

  // ── Join team screen ─────────────────────────────────────────────────────────
  function showJoinTeam(user, errorMsg) {
    showOverlay(`
      <div style="text-align:center;max-width:340px;width:100%;">
        <div style="font-size:2.5rem;margin-bottom:12px;">🔗</div>
        <div style="color:#f1f5f9;font-size:1.1rem;font-weight:700;margin-bottom:6px;">Join a Team</div>
        <div style="color:#94a3b8;font-size:.85rem;margin-bottom:24px;line-height:1.5;">Enter the 6-character invite code from your coach.</div>
        <input id="invite-code-input" placeholder="e.g. ABC123" maxlength="6"
          style="width:100%;background:#0e0e1a;border:1px solid #334155;color:#f1f5f9;border-radius:8px;padding:12px 14px;font-size:1.1rem;text-transform:uppercase;text-align:center;letter-spacing:.2em;outline:none;box-sizing:border-box;margin-bottom:8px;"/>
        <div style="color:#ef4444;font-size:.8rem;min-height:20px;margin-bottom:12px;">${errorMsg}</div>
        <button id="join-btn" style="width:100%;background:#16a34a;color:#fff;border:none;border-radius:10px;padding:13px;font-size:1rem;font-weight:600;cursor:pointer;margin-bottom:10px;">Join Team</button>
        <button id="join-back-btn" style="width:100%;background:transparent;color:#94a3b8;border:1px solid #334155;border-radius:10px;padding:10px;font-size:.85rem;cursor:pointer;">← Back</button>
      </div>`);
    const input = document.getElementById('invite-code-input');
    input.focus();
    input.addEventListener('input', () => { input.value = input.value.toUpperCase(); });
    document.getElementById('join-back-btn').addEventListener('click', () => showWelcomeScreen(user));
    const join = () => attemptJoin(user, input.value.trim());
    document.getElementById('join-btn').addEventListener('click', join);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') join(); });
  }

  async function attemptJoin(user, code) {
    if (!code) { showJoinTeam(user, 'Please enter an invite code.'); return; }
    showOverlay('<div style="color:#94a3b8;font-size:.9rem;">Validating code…</div>');
    try {
      const snap = await inviteDoc(code).get();
      if (!snap.exists) { showJoinTeam(user, 'Code not found. Check with your coach.'); return; }
      const invite = snap.data();
      if (invite.used && invite.usedBy !== user.uid) {
        showJoinTeam(user, 'This code has already been used.');
        return;
      }

      const coachSnap = await userDoc(invite.ownerUid).get();
      if (!coachSnap.exists) { showJoinTeam(user, 'Team not found. Contact your coach.'); return; }
      const coachData = coachSnap.data();
      if (coachData.teams) origSet(STORAGE_KEY, coachData.teams);

      if (!invite.used) {
        await inviteDoc(code).update({
          used: true, usedBy: user.uid,
          usedByName: user.displayName || user.email,
          usedAt: Date.now()
        });
      }

      const membership = {
        teamId: invite.teamId, teamName: invite.teamName,
        role: invite.role, ownerUid: invite.ownerUid, joinedAt: Date.now()
      };
      const existing = await getProfile(user.uid);
      const existingMems = (existing && existing.memberships) || [];
      const alreadyMember = existingMems.some(
        (m) => m.ownerUid === invite.ownerUid && m.teamId === invite.teamId
      );
      const newMems = alreadyMember ? existingMems : [...existingMems, membership];
      if (!alreadyMember) await saveProfile(user.uid, { memberships: newMems });
      await activateMembership(user, alreadyMember ? existingMems.find(m => m.ownerUid === invite.ownerUid && m.teamId === invite.teamId) : membership, newMems);
    } catch {
      showJoinTeam(user, 'Connection error. Please try again.');
    }
  }

  // ── Membership selector ──────────────────────────────────────────────────────
  function showMembershipSelector(user, memberships, canClose) {
    const cards = memberships.map((m, i) => {
      const rl = m.role === 'head-coach' ? 'Head Coach' : m.role === 'assistant-coach' ? 'Assistant Coach' : 'Player';
      return `<button class="mem-card" data-index="${i}" style="width:100%;background:#0e0e1a;border:2px solid #1c1c2c;color:#f1f5f9;border-radius:12px;padding:16px;cursor:pointer;text-align:left;margin-bottom:10px;">
        <div style="font-weight:700;font-size:.95rem;margin-bottom:4px;">${escHtml(m.teamName)}</div>
        <div style="font-size:.8rem;color:#94a3b8;">${rl}</div>
      </button>`;
    }).join('');

    showOverlay(`
      <div style="text-align:center;max-width:380px;width:100%;">
        <div style="font-size:2.5rem;margin-bottom:12px;">⚽</div>
        <div style="color:#f1f5f9;font-size:1.1rem;font-weight:700;margin-bottom:6px;">Select a Team</div>
        <div style="color:#94a3b8;font-size:.85rem;margin-bottom:20px;">Choose which team to open.</div>
        <div id="mem-cards">${cards}</div>
        <button id="mem-join-more" style="width:100%;background:transparent;color:#94a3b8;border:1px solid #334155;border-radius:10px;padding:10px;font-size:.85rem;cursor:pointer;margin-top:4px;">+ Join another team</button>
        ${canClose ? '<button id="mem-cancel" style="width:100%;background:transparent;color:#475569;border:none;padding:8px;font-size:.8rem;cursor:pointer;margin-top:4px;">Cancel</button>' : ''}
        <button id="mem-signout" style="width:100%;background:transparent;color:#475569;border:none;padding:8px;font-size:.8rem;cursor:pointer;margin-top:4px;">Sign out</button>
      </div>`);

    document.querySelectorAll('.mem-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const m = memberships[parseInt(card.dataset.index, 10)];
        if (canClose) {
          // Team switch: store target and navigate to home
          sessionStorage.setItem('tiq_active_mem', JSON.stringify({ teamId: m.teamId, ownerUid: m.ownerUid }));
          window.location.href = 'index.html';
        } else {
          showOverlay('<div style="color:#94a3b8;font-size:.9rem;">Loading…</div>');
          await activateMembership(user, m, memberships);
        }
      });
    });
    document.getElementById('mem-join-more').addEventListener('click', () => showJoinTeam(user, ''));
    if (canClose) document.getElementById('mem-cancel').addEventListener('click', hideOverlay);
    document.getElementById('mem-signout').addEventListener('click', () => {
      showConfirm('Sign out of TactIQ?', () => firebase.auth().signOut(), { confirmLabel: 'Sign Out' });
    });
  }

  // ── Activate membership ──────────────────────────────────────────────────────
  async function activateMembership(user, membership, allMemberships) {
    const { role, ownerUid } = membership;

    if (role === 'head-coach') {
      showOverlay('<div style="color:#94a3b8;font-size:.9rem;">Syncing data…</div>');
      try {
        const snap = await userDoc(user.uid).get();
        const data  = snap.exists ? snap.data() : {};
        if (isHome && data.teams) origSet(STORAGE_KEY, data.teams);
        window.APP_COACH_SYSTEM = data.coachSystem || 'multi';
      } catch (_) { window.APP_COACH_SYSTEM = 'multi'; }
      window.APP_ROLE      = 'head-coach';
      window.APP_OWNER_UID = user.uid;
    } else {
      showOverlay('<div style="color:#94a3b8;font-size:.9rem;">Loading team data…</div>');
      try {
        const snap = await userDoc(ownerUid).get();
        const ownerData = snap.exists ? snap.data() : {};
        if (isHome && ownerData.teams) origSet(STORAGE_KEY, ownerData.teams);
        window.APP_COACH_SYSTEM = ownerData.coachSystem || 'multi';
        if (role === 'player') {
          window.APP_PERMISSIONS = ownerData.playerPermissions ||
            { players: true, exercises: true, plays: true, stats: true, points: true, cards: true };
        }
      } catch (_) { window.APP_COACH_SYSTEM = 'multi'; }
      window.APP_ROLE      = role;
      window.APP_OWNER_UID = ownerUid;
      if (role === 'player') document.body.classList.add('player-mode');
    }

    cloudReady = true;
    window.APP_MEMBERSHIPS = allMemberships || [];
    hideOverlay();
    injectUserBadge(user, role, membership.teamName, allMemberships);
    resolveReady(user);
  }

  // ── Backward-compat migration ────────────────────────────────────────────────
  async function migrateOldProfile(user, profile) {
    showOverlay('<div style="color:#94a3b8;font-size:.9rem;">Updating your account…</div>');
    let membership;
    if (profile.role === 'coach') {
      membership = { teamId: 'legacy', teamName: 'My Team', role: 'head-coach', ownerUid: user.uid, joinedAt: Date.now() };
    } else {
      if (!profile.coachUid) {
        await saveProfile(user.uid, { memberships: [] });
        showWelcomeScreen(user);
        return;
      }
      membership = { teamId: 'legacy', teamName: "Coach's Team", role: 'player', ownerUid: profile.coachUid, joinedAt: Date.now() };
    }
    await saveProfile(user.uid, { memberships: [membership] });
    await activateMembership(user, membership, [membership]);
  }

  // ── Auth state ───────────────────────────────────────────────────────────────
  firebase.initializeApp(window.FIREBASE_CONFIG);

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      if (!isHome) { window.location.replace('index.html'); return; }
      showSignIn();
      return;
    }

    const profile = await getProfile(user.uid);

    // Backward-compat: old single-role system
    if (profile && profile.role && !profile.memberships) {
      await migrateOldProfile(user, profile);
      return;
    }

    const memberships = profile && profile.memberships;
    if (!memberships || memberships.length === 0) {
      showWelcomeScreen(user);
      return;
    }

    // Check if a specific team was requested (from team switcher)
    const storedMem = sessionStorage.getItem('tiq_active_mem');
    if (storedMem) {
      sessionStorage.removeItem('tiq_active_mem');
      try {
        const { teamId, ownerUid } = JSON.parse(storedMem);
        const target = memberships.find((m) => m.teamId === teamId && m.ownerUid === ownerUid);
        if (target) {
          await activateMembership(user, target, memberships);
          return;
        }
      } catch (_) {}
    }

    if (memberships.length === 1) {
      await activateMembership(user, memberships[0], memberships);
    } else {
      showMembershipSelector(user, memberships, false);
    }
  });

  window.signOut = () => firebase.auth().signOut();

  window.loadProfileData = async () => {
    const user = firebase.auth().currentUser;
    if (!user) return null;
    const snap = await userDoc(user.uid).get();
    const data = snap.exists ? snap.data() : {};
    return {
      displayName: data.displayName || user.displayName || '',
      email:       user.email || '',
      photoURL:    data.profilePhoto || null,
    };
  };

  window.saveProfileData = async ({ displayName, photo }) => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const updates = {};
    if (displayName !== undefined) updates.displayName  = displayName;
    if (photo       !== undefined) updates.profilePhoto = photo;
    await userDoc(user.uid).set(updates, { merge: true });
  };

  window.showTeamSelector = () => {
    const user = firebase.auth().currentUser;
    if (user && window.APP_MEMBERSHIPS && window.APP_MEMBERSHIPS.length > 1) {
      showMembershipSelector(user, window.APP_MEMBERSHIPS, true);
    }
  };

  window.savePlayerPermissions = async (permissions) => {
    const user = firebase.auth().currentUser;
    if (!user || window.APP_ROLE === 'player') return;
    await userDoc(user.uid).set({ playerPermissions: permissions }, { merge: true });
  };

  window.getTeamCode = () => window.APP_OWNER_UID;

  window.saveCoachSystem = (system) => {
    const user = firebase.auth().currentUser;
    if (!user || window.APP_ROLE !== 'head-coach') return;
    window.APP_COACH_SYSTEM = system;
    userDoc(user.uid).set({ coachSystem: system }, { merge: true });
  };

  window.createInvite = async ({ ownerUid, teamId, teamName, role, label }) => {
    let code;
    let attempts = 0;
    do {
      code = genCode();
      const existing = await inviteDoc(code).get();
      if (!existing.exists) break;
    } while (++attempts < 10);
    await inviteDoc(code).set({
      ownerUid, teamId, teamName, role, label,
      used: false, usedBy: null, usedByName: null, createdAt: Date.now()
    });
    return code;
  };

  window.getInvites = async (ownerUid) => {
    const snap = await firebase.firestore().collection('invites')
      .where('ownerUid', '==', ownerUid)
      .get();
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  };

  window.deleteInvite = async (code) => {
    await firebase.firestore().collection('invites').doc(code).delete();
  };
})();

// ── In-app UI utilities (replaces alert / confirm / prompt) ──────────────────

window.showToast = function (msg, type) {
  const existing = document.getElementById('tiq-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'tiq-toast';
  el.className = 'tiq-toast tiq-toast-' + (type || 'error');
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('tiq-toast-show'));
  setTimeout(() => {
    el.classList.remove('tiq-toast-show');
    setTimeout(() => el.remove(), 300);
  }, 3200);
};

window.showConfirm = function (msg, onConfirm, opts) {
  opts = opts || {};
  const label  = opts.confirmLabel || 'Confirm';
  const danger = opts.danger !== false;
  const existing = document.getElementById('tiq-confirm-backdrop');
  if (existing) existing.remove();
  const backdrop = document.createElement('div');
  backdrop.id = 'tiq-confirm-backdrop';
  backdrop.className = 'modal-backdrop active';
  backdrop.innerHTML =
    '<div class="modal">' +
      '<div class="modal-body" style="padding:20px 20px 8px">' +
        '<p style="color:var(--text-muted);font-size:0.97rem;margin:0">' + msg + '</p>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn-secondary" id="tiqConfirmCancel">Cancel</button>' +
        '<button class="btn-primary' + (danger ? ' btn-danger' : '') + '" id="tiqConfirmOk">' + label + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(backdrop);
  document.getElementById('tiqConfirmCancel').addEventListener('click', () => backdrop.remove());
  document.getElementById('tiqConfirmOk').addEventListener('click', () => { backdrop.remove(); onConfirm(); });
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
};
