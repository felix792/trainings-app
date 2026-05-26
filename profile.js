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
