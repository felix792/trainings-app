(function () {
  const STORAGE_KEY = 'football_coach_teams';
  const isHome = /\/(index\.html)?$/.test(window.location.pathname) ||
                 window.location.pathname.endsWith('/trainings-app/');

  let syncTimer  = null;
  let cloudReady = false;
  let resolveReady;
  window.DB_READY      = new Promise((r) => { resolveReady = r; });
  window.APP_ROLE        = null;   // 'coach' | 'player'
  window.APP_PERMISSIONS = null;   // { players, exercises, plays, stats, points, cards }
  window.APP_COACH_UID   = null;

  const origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    origSet(key, value);
    if (key === STORAGE_KEY && cloudReady && window.APP_ROLE === 'coach') {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => syncUp(value), 1500);
    }
  };

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
  async function syncUp(teamsJson) {
    const user = firebase.auth().currentUser;
    if (!user || window.APP_ROLE !== 'coach') return;
    userDoc(user.uid).set({ teams: teamsJson, updatedAt: Date.now() }, { merge: true }).catch(() => {});
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

  // ── User badge ───────────────────────────────────────────────────────────────
  function injectUserBadge(user, role) {
    const header = document.querySelector('.header-inner');
    if (!header || document.getElementById('db-user-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'db-user-btn';
    btn.title = (role === 'coach' ? 'Coach' : 'Player') + ' — ' + user.email + '\nClick to sign out';
    btn.style.cssText = 'background:transparent;border:1px solid #334155;color:#94a3b8;border-radius:7px;padding:5px 10px;font-size:.75rem;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
    btn.textContent = (role === 'coach' ? 'Coach · ' : 'Player · ') +
      (user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0]);
    btn.addEventListener('click', () => {
      if (confirm('Sign out of TactIQ?')) firebase.auth().signOut();
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
        .catch((err) => alert('Sign-in failed: ' + err.message));
    });
  }

  // ── Role selection screen ────────────────────────────────────────────────────
  function showRoleSelection(user) {
    showOverlay(`
      <div style="text-align:center;max-width:380px;width:100%;">
        <div style="font-size:3rem;margin-bottom:12px;">⚽</div>
        <div style="color:#f1f5f9;font-size:1.2rem;font-weight:700;margin-bottom:6px;">Welcome to TactIQ</div>
        <div style="color:#94a3b8;font-size:.875rem;margin-bottom:28px;">How do you want to use the app?</div>
        <div style="display:flex;gap:16px;">
          <button id="role-coach" style="flex:1;background:#0e0e1a;border:2px solid #1c1c2c;color:#f1f5f9;border-radius:12px;padding:24px 16px;cursor:pointer;font-size:.95rem;font-weight:600;">
            <div style="font-size:2rem;margin-bottom:10px;">🎽</div>
            <div style="margin-bottom:6px;">Coach</div>
            <div style="font-size:.75rem;color:#94a3b8;line-height:1.4;">Manage teams and control what players can see</div>
          </button>
          <button id="role-player" style="flex:1;background:#0e0e1a;border:2px solid #1c1c2c;color:#f1f5f9;border-radius:12px;padding:24px 16px;cursor:pointer;font-size:.95rem;font-weight:600;">
            <div style="font-size:2rem;margin-bottom:10px;">⚽</div>
            <div style="margin-bottom:6px;">Player</div>
            <div style="font-size:.75rem;color:#94a3b8;line-height:1.4;">Join your coach's team with a team code</div>
          </button>
        </div>
      </div>`);
    document.getElementById('role-coach').addEventListener('click', async () => {
      showOverlay('<div style="color:#94a3b8;">Setting up coach account…</div>');
      await saveProfile(user.uid, {
        role: 'coach',
        playerPermissions: {
          players: true, exercises: true, plays: true, stats: true, points: true, cards: true, blackbox: true,
          playerSections: { attributes: true, categoryProgression: true, gameStats: true, statProgression: true }
        }
      });
      continueAsCoach(user);
    });
    document.getElementById('role-player').addEventListener('click', () => showPlayerJoin(user, ''));
  }

  // ── Player join screen ───────────────────────────────────────────────────────
  function showPlayerJoin(user, errorMsg) {
    showOverlay(`
      <div style="text-align:center;max-width:340px;width:100%;">
        <div style="font-size:2.5rem;margin-bottom:12px;">⚽</div>
        <div style="color:#f1f5f9;font-size:1.1rem;font-weight:700;margin-bottom:6px;">Join Your Coach</div>
        <div style="color:#94a3b8;font-size:.85rem;margin-bottom:24px;line-height:1.5;">Enter the team code your coach shared with you.</div>
        <input id="coach-code-input" placeholder="Paste team code here"
          style="width:100%;background:#0e0e1a;border:1px solid #334155;color:#f1f5f9;border-radius:8px;padding:12px 14px;font-size:.9rem;outline:none;box-sizing:border-box;margin-bottom:8px;"/>
        <div style="color:#ef4444;font-size:.8rem;min-height:20px;margin-bottom:12px;">${errorMsg}</div>
        <button id="code-join-btn" style="width:100%;background:#16a34a;color:#fff;border:none;border-radius:10px;padding:13px;font-size:1rem;font-weight:600;cursor:pointer;margin-bottom:10px;">Join Team</button>
        <button id="code-back-btn" style="width:100%;background:transparent;color:#94a3b8;border:1px solid #334155;border-radius:10px;padding:10px;font-size:.85rem;cursor:pointer;">← Back</button>
      </div>`);
    const input = document.getElementById('coach-code-input');
    input.focus();
    document.getElementById('code-back-btn').addEventListener('click', () => showRoleSelection(user));
    const join = () => attemptJoin(user, input.value.trim());
    document.getElementById('code-join-btn').addEventListener('click', join);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') join(); });
  }

  async function attemptJoin(user, code) {
    if (!code) { showPlayerJoin(user, 'Please enter a team code.'); return; }
    showOverlay('<div style="color:#94a3b8;">Connecting to team…</div>');
    try {
      const snap = await userDoc(code).get();
      if (!snap.exists || snap.data().role !== 'coach') {
        showPlayerJoin(user, 'Team code not found. Check with your coach.'); return;
      }
      const coachData = snap.data();
      if (coachData.teams) origSet(STORAGE_KEY, coachData.teams);
      await saveProfile(user.uid, { role: 'player', coachUid: code });
      continueAsPlayer(user, code, coachData);
    } catch {
      showPlayerJoin(user, 'Connection error. Please try again.');
    }
  }

  // ── Continue as coach ────────────────────────────────────────────────────────
  async function continueAsCoach(user) {
    if (isHome) {
      showOverlay('<div style="color:#94a3b8;font-size:.9rem;">Syncing data…</div>');
      await syncDown(user.uid);
    }
    window.APP_ROLE      = 'coach';
    window.APP_COACH_UID = user.uid;
    cloudReady = true;
    hideOverlay();
    injectUserBadge(user, 'coach');
    resolveReady(user);
  }

  // ── Continue as player ───────────────────────────────────────────────────────
  async function continueAsPlayer(user, coachUid, coachData) {
    if (isHome) {
      showOverlay('<div style="color:#94a3b8;font-size:.9rem;">Loading team data…</div>');
      try {
        const snap = await userDoc(coachUid).get();
        if (snap.exists && snap.data().teams) origSet(STORAGE_KEY, snap.data().teams);
        coachData = snap.data();
      } catch (_) {}
    }
    const permissions = (coachData && coachData.playerPermissions) ||
      { players: true, exercises: true, plays: true, stats: true, points: true, cards: true };
    window.APP_ROLE        = 'player';
    window.APP_PERMISSIONS = permissions;
    window.APP_COACH_UID   = coachUid;
    document.body.classList.add('player-mode');
    cloudReady = true;
    hideOverlay();
    injectUserBadge(user, 'player');
    resolveReady(user);
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
    if (!profile || !profile.role) { showRoleSelection(user); return; }

    if (profile.role === 'coach') {
      await continueAsCoach(user);
    } else {
      if (!profile.coachUid) { showPlayerJoin(user, ''); return; }
      const coachSnap = await userDoc(profile.coachUid).get();
      if (!coachSnap.exists) {
        showPlayerJoin(user, 'Your coach\'s team was not found. Enter a new code.');
        await saveProfile(user.uid, { coachUid: null });
        return;
      }
      await continueAsPlayer(user, profile.coachUid, coachSnap.data());
    }
  });

  window.signOut = () => firebase.auth().signOut();

  // Called by team.js to update coach permissions
  window.savePlayerPermissions = async (permissions) => {
    const user = firebase.auth().currentUser;
    if (!user || window.APP_ROLE !== 'coach') return;
    await userDoc(user.uid).set({ playerPermissions: permissions }, { merge: true });
  };

  window.getTeamCode = () => window.APP_COACH_UID;
})();
