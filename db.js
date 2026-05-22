(function () {
  const STORAGE_KEY = 'football_coach_teams';
  const isHome = /\/(index\.html)?$/.test(window.location.pathname) ||
                 window.location.pathname.endsWith('/trainings-app/');

  let syncTimer  = null;
  let cloudReady = false;
  let resolveReady;
  window.DB_READY = new Promise((r) => { resolveReady = r; });

  // ── Patch localStorage so every save auto-syncs to Firestore ──────────────
  const origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    origSet(key, value);
    if (key === STORAGE_KEY && cloudReady) {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => syncUp(value), 1500);
    }
  };

  // ── Overlay helpers ───────────────────────────────────────────────────────
  function showOverlay(html) {
    let el = document.getElementById('db-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'db-overlay';
      el.style.cssText = [
        'position:fixed;inset:0;background:#0f172a;z-index:9999',
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

  // ── Firestore sync ────────────────────────────────────────────────────────
  function userDoc(uid) {
    return firebase.firestore().collection('users').doc(uid);
  }

  async function syncUp(teamsJson) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    userDoc(user.uid).set({ teams: teamsJson, updatedAt: Date.now() }).catch(() => {});
  }

  async function syncDown(uid) {
    try {
      const snap = await userDoc(uid).get();
      if (snap.exists && snap.data().teams) {
        origSet(STORAGE_KEY, snap.data().teams);
      }
    } catch (_) {}
  }

  // ── User badge injected into header after sign-in ─────────────────────────
  function injectUserBadge(user) {
    const header = document.querySelector('.header-inner');
    if (!header || document.getElementById('db-user-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'db-user-btn';
    btn.title = 'Signed in as ' + user.email + '\nClick to sign out';
    btn.style.cssText = [
      'background:transparent;border:1px solid #334155;color:#94a3b8',
      'border-radius:7px;padding:5px 10px;font-size:.75rem;cursor:pointer',
      'white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis'
    ].join(';');
    btn.textContent = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
    btn.addEventListener('click', () => {
      if (confirm('Sign out of TactIQ?')) firebase.auth().signOut();
    });
    header.appendChild(btn);
  }

  // ── Auth flow ─────────────────────────────────────────────────────────────
  firebase.initializeApp(window.FIREBASE_CONFIG);

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      if (!isHome) {
        window.location.replace('index.html');
        return;
      }
      showOverlay(`
        <div style="text-align:center;max-width:320px;">
          <div style="font-size:3rem;margin-bottom:12px;">⚽</div>
          <div style="color:#f1f5f9;font-size:1.25rem;font-weight:700;margin-bottom:6px;">TactIQ</div>
          <div style="color:#94a3b8;font-size:.875rem;margin-bottom:28px;line-height:1.5;">
            Sign in with Google to sync your teams and players across all your devices.
          </div>
          <button id="db-signin-btn" style="
            display:inline-flex;align-items:center;gap:10px;
            background:#16a34a;color:#fff;border:none;
            padding:13px 28px;border-radius:10px;
            font-size:1rem;font-weight:600;cursor:pointer;width:100%;justify-content:center;">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#fff" d="M44.5 20H24v8h11.8C34.7 33.9 30 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-7.9 19.7-20 0-1.3-.1-2.7-.3-4z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      `);
      document.getElementById('db-signin-btn').addEventListener('click', () => {
        firebase.auth()
          .signInWithPopup(new firebase.auth.GoogleAuthProvider())
          .catch((err) => alert('Sign-in failed: ' + err.message));
      });
      return;
    }

    // User is signed in
    if (isHome) {
      showOverlay('<div style="color:#94a3b8;font-size:.9rem;">Syncing data…</div>');
      await syncDown(user.uid);
    }

    cloudReady = true;
    hideOverlay();
    injectUserBadge(user);
    resolveReady(user);
  });

  window.signOut = () => firebase.auth().signOut();
})();
