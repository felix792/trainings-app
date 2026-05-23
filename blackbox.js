const params = new URLSearchParams(window.location.search);
const teamId = params.get('id');

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDateTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

window.DB_READY.then(() => {
  const coachUid = window.APP_COACH_UID;
  const role = window.APP_ROLE;

  document.getElementById('backTeamName').textContent = 'Team';
  document.getElementById('backLink').href = 'team.html?id=' + teamId;
  document.getElementById('teamMeta').textContent = role !== 'player'
    ? 'Anonymous notes from your players'
    : 'Send an anonymous note to your coach';

  if (role !== 'player') {
    renderCoachView(coachUid);
  } else {
    renderPlayerView(coachUid);
  }
});

function notesRef(coachUid) {
  return firebase.firestore().collection('blackbox').doc(coachUid).collection('notes');
}

// ── Coach view ───────────────────────────────────────────────────────────────
function renderCoachView(coachUid) {
  const content = document.getElementById('blackboxContent');
  content.innerHTML = '<p class="players-empty" style="padding-top:16px;">Loading…</p>';

  notesRef(coachUid).orderBy('createdAt', 'desc').onSnapshot((snap) => {
    if (snap.empty) {
      content.innerHTML = `
        <div class="bb-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="color:#334155"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <p>No anonymous notes yet.</p>
          <span>Notes from your players will appear here.</span>
        </div>`;
      return;
    }

    content.innerHTML = '';
    snap.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement('div');
      card.className = 'bb-note-card';
      card.innerHTML = `
        <div class="bb-note-header">
          <span class="bb-anon-badge">Anonymous</span>
          <span class="bb-note-time">${formatDateTime(data.createdAt)}</span>
        </div>
        <p class="bb-note-text">${escapeHtml(data.text)}</p>
        <button class="bb-delete-btn" data-id="${doc.id}" aria-label="Delete note">Delete</button>`;
      content.appendChild(card);
    });

    content.querySelectorAll('.bb-delete-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this note permanently?')) return;
        btn.disabled = true;
        await notesRef(coachUid).doc(btn.dataset.id).delete();
      });
    });
  }, () => {
    content.innerHTML = '<p class="players-empty">Could not load notes.</p>';
  });
}

// ── Player view ──────────────────────────────────────────────────────────────
function renderPlayerView(coachUid) {
  const content = document.getElementById('blackboxContent');
  content.innerHTML = `
    <div class="bb-submit-wrap">
      <div class="bb-anon-notice">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Your note is completely anonymous. The coach cannot see who sent it.
      </div>
      <textarea id="bb-textarea" class="bb-textarea" placeholder="Write your note here…" maxlength="1000"></textarea>
      <div class="bb-char-count"><span id="bb-chars">0</span> / 1000</div>
      <button class="btn-primary bb-submit-btn" id="bb-submit">Send Anonymously</button>
      <div id="bb-status"></div>
    </div>`;

  const textarea = document.getElementById('bb-textarea');
  const charsEl  = document.getElementById('bb-chars');
  const submitBtn = document.getElementById('bb-submit');
  const status   = document.getElementById('bb-status');

  textarea.addEventListener('input', () => {
    charsEl.textContent = textarea.value.length;
  });

  submitBtn.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text) {
      status.textContent = 'Please write something before sending.';
      status.className = 'bb-status-error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    status.textContent = '';

    try {
      await notesRef(coachUid).add({
        text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      textarea.value = '';
      charsEl.textContent = '0';
      status.textContent = 'Note sent anonymously.';
      status.className = 'bb-status-ok';
      submitBtn.textContent = 'Send Anonymously';
      submitBtn.disabled = false;
      setTimeout(() => { status.textContent = ''; }, 4000);
    } catch {
      status.textContent = 'Failed to send. Please try again.';
      status.className = 'bb-status-error';
      submitBtn.textContent = 'Send Anonymously';
      submitBtn.disabled = false;
    }
  });
}
