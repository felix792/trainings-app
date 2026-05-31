document.getElementById('backBtn').addEventListener('click', () => {
  if (history.length > 1) history.back();
  else location.replace('index.html');
});

window.DB_READY.then(async () => {
  const data = await window.loadProfileData();
  if (!data) return;

  document.getElementById('profEmail').value = data.email || '';
  document.getElementById('profName').value  = data.displayName || '';

  function setAvatar(url, name) {
    const img  = document.getElementById('profAvatarImg');
    const init = document.getElementById('profAvatarInitial');
    if (url) {
      img.src = url;
      img.style.display = '';
      init.style.display = 'none';
    } else {
      init.textContent   = (name || data.email || 'U')[0].toUpperCase();
      init.style.display = '';
      img.style.display  = 'none';
    }
  }
  setAvatar(data.photoURL, data.displayName);

  // Photo upload — resize to 128×128 via canvas
  let pendingPhoto = null;
  document.getElementById('profUploadBtn').addEventListener('click', () => {
    document.getElementById('profFileInput').click();
  });
  document.getElementById('profFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = 128;
        canvas.height = 128;
        const ctx  = canvas.getContext('2d');
        const size = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 128, 128);
        pendingPhoto = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(pendingPhoto, document.getElementById('profName').value);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Save
  document.getElementById('profSaveBtn').addEventListener('click', async () => {
    const name   = document.getElementById('profName').value.trim();
    const btn    = document.getElementById('profSaveBtn');
    const status = document.getElementById('profStatus');
    btn.disabled    = true;
    btn.textContent = 'Saving…';
    await window.saveProfileData({ displayName: name, ...(pendingPhoto ? { photo: pendingPhoto } : {}) });
    pendingPhoto    = null;
    btn.disabled    = false;
    btn.textContent = 'Save Changes';
    status.textContent  = 'Saved!';
    status.style.color  = '#16a34a';
    setTimeout(() => { status.textContent = ''; }, 2000);
  });

  // Team switching (only shown when user belongs to multiple teams)
  if ((window.APP_MEMBERSHIPS || []).length > 1) {
    const switchBtn = document.getElementById('switchTeamBtn');
    switchBtn.style.display = '';
    switchBtn.addEventListener('click', () => window.showTeamSelector());
  }

  // Sign out
  const signOutModal = document.getElementById('signOutModal');
  document.getElementById('signOutBtn').addEventListener('click', () => signOutModal.classList.add('active'));
  document.getElementById('signOutModalClose').addEventListener('click', () => signOutModal.classList.remove('active'));
  document.getElementById('signOutCancel').addEventListener('click', () => signOutModal.classList.remove('active'));
  document.getElementById('signOutConfirm').addEventListener('click', () => firebase.auth().signOut());
  signOutModal.addEventListener('click', e => { if (e.target === signOutModal) signOutModal.classList.remove('active'); });
});

// ── Theme picker ─────────────────────────────────────────────────────────────
// Runs immediately (no auth needed) — just reads localStorage and renders UI.

const THEMES = [
  { id: 'blue',   name: 'Night Blue',  primary: '#1d4ed8', dark: '#1e40af', light: '#0c1a3a', secondary: '#000000' },
  { id: 'green',  name: 'Forest',      primary: '#16a34a', dark: '#15803d', light: '#052e16', secondary: '#00110a' },
  { id: 'orange', name: 'Sunset',      primary: '#ea580c', dark: '#c2410c', light: '#431407', secondary: '#130600' },
  { id: 'purple', name: 'Storm',       primary: '#7c3aed', dark: '#6d28d9', light: '#2e1065', secondary: '#08000f' },
];

// Compute a darker shade of a hex colour for the hover state.
function darkenHex(hex, factor) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const d = (v) => Math.max(0, Math.round(v * factor)).toString(16).padStart(2,'0');
  return '#' + d(r) + d(g) + d(b);
}

function escHtmlProf(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

(function initThemePicker() {
  const grid = document.getElementById('themePresets');
  if (!grid) return;

  const saved = window.TIQ_THEME_GET?.() || {};

  // Build preset buttons + the Custom button
  grid.innerHTML = THEMES.map(t => `
    <button class="prof-theme-preset${saved.id === t.id ? ' prof-theme-preset-active' : ''}" data-tid="${t.id}">
      <div class="prof-theme-swatches">
        <span class="prof-theme-swatch" style="background:${t.primary};"></span>
        <span class="prof-theme-swatch" style="background:${t.secondary};"></span>
      </div>
      <span class="prof-theme-name">${escHtmlProf(t.name)}</span>
    </button>
  `).join('') + `
    <button class="prof-theme-preset${saved.id === 'custom' ? ' prof-theme-preset-active' : ''}" data-tid="custom">
      <div class="prof-theme-swatches">
        <span class="prof-theme-swatch-custom">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="13" r="2.5"/><circle cx="5" cy="13" r="2.5"/><circle cx="10.5" cy="19.5" r="2.5"/><line x1="11.1" y1="8.6" x2="7" y2="11.4"/><line x1="15.9" y1="8.6" x2="17.4" y2="10.5"/><line x1="7" y1="15" x2="9" y2="17.5"/><line x1="16.5" y1="15" x2="12" y2="17.5"/></svg>
        </span>
      </div>
      <span class="prof-theme-name">Custom</span>
    </button>
  `;

  // Pre-fill custom pickers with whatever was last saved
  if (saved.id === 'custom') {
    document.getElementById('customPrimary').value   = saved.primary   || '#1d4ed8';
    document.getElementById('customSecondary').value = saved.secondary || '#7c3aed';
    document.getElementById('themeCustomWrap').style.display = '';
  }

  // Handle clicks on any preset/custom button
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tid]');
    if (!btn) return;

    grid.querySelectorAll('.prof-theme-preset').forEach(b => b.classList.remove('prof-theme-preset-active'));
    btn.classList.add('prof-theme-preset-active');

    const id = btn.dataset.tid;
    const customWrap = document.getElementById('themeCustomWrap');

    if (id === 'custom') {
      // Show the colour pickers — don't apply until the user clicks Apply
      customWrap.style.display = '';
    } else {
      customWrap.style.display = 'none';
      const t = THEMES.find(x => x.id === id);
      if (t) window.TIQ_THEME_SAVE(t.primary, t.dark, t.light, t.secondary, t.id);
    }
  });

  // Apply custom theme button
  document.getElementById('applyCustomTheme').addEventListener('click', () => {
    const primary   = document.getElementById('customPrimary').value;
    const secondary = document.getElementById('customSecondary').value;
    // Derive --green-dark (80 % brightness) and --green-light (12 % brightness)
    // so hover states and faint backgrounds still make sense for any chosen colour.
    const dark  = darkenHex(primary, 0.80);
    const light = darkenHex(primary, 0.12);
    window.TIQ_THEME_SAVE(primary, dark, light, secondary, 'custom');
  });

  // Live-preview primary while the colour picker is open (mouseup fires after pick)
  document.getElementById('customPrimary').addEventListener('input', (e) => {
    const r = document.documentElement.style;
    r.setProperty('--green', e.target.value);
  });
  document.getElementById('customSecondary').addEventListener('input', (e) => {
    const bg = e.target.value;
    const r  = document.documentElement.style;
    r.setProperty('--bg',      bg);
    r.setProperty('--surface', _tiqLighten(bg, 14));
    r.setProperty('--border',  _tiqLighten(bg, 28));
  });
})();
