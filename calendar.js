const STORAGE_KEY = 'football_coach_teams';

// ── Constants (must be before any code that uses them) ──
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Mo','Tu','We','Th','Fr','Sa','Su'];
const TYPE_META   = {
  training: { label: 'Training', color: '#16a34a' },
  match:    { label: 'Match',    color: '#3b82f6' },
  meeting:  { label: 'Meeting',  color: '#eab308' },
  other:    { label: 'Other',    color: '#64748b' },
};
const TODAY = new Date().toISOString().split('T')[0];
const RECUR_LABELS = { none: 'Does not repeat', weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly' };

// ── State ──
let curYear      = new Date().getFullYear();
let curMonth     = new Date().getMonth();
let canEdit      = false;
let selectedDate = null;
let editingId    = null;
let selectedType = 'training';
let selectedRecur = 'none';
// For recurring delete modal
let _recurDelEvt  = null;
let _recurDelDate = null;

function loadTeams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveTeams(t) { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); }
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Bootstrap ──
const params = new URLSearchParams(window.location.search);
const teamId = params.get('id') || params.get('teamId');
const teams  = loadTeams();
const team   = teams.find(t => t.id === teamId);

if (!team) {
  document.getElementById('notFound').style.display = 'flex';
} else {
  document.title = team.name + ' — Calendar — TactIQ';
  document.getElementById('backTeamName').textContent = team.name;
  document.getElementById('backLink').href = 'team.html?id=' + teamId;
  document.getElementById('calTeamMeta').textContent = team.name;
  document.getElementById('pageContent').style.display = '';
  init();
}

// ── Data helpers ──
function getEvents() {
  const t = loadTeams().find(x => x.id === teamId);
  return (t && t.calendar) || [];
}

function persistEvent(evt) {
  const all = loadTeams();
  const t   = all.find(x => x.id === teamId);
  if (!t) return;
  t.calendar = t.calendar || [];
  const idx = t.calendar.findIndex(e => e.id === evt.id);
  if (idx !== -1) t.calendar[idx] = evt;
  else            t.calendar.push(evt);
  saveTeams(all);
}

function removeEvent(id) {
  const all = loadTeams();
  const t   = all.find(x => x.id === teamId);
  if (!t) return;
  t.calendar = (t.calendar || []).filter(e => e.id !== id);
  saveTeams(all);
}

function addException(eventId, dateStr) {
  const all = loadTeams();
  const t   = all.find(x => x.id === teamId);
  if (!t) return;
  const evt = (t.calendar || []).find(e => e.id === eventId);
  if (!evt) return;
  evt.exceptions = evt.exceptions || [];
  if (!evt.exceptions.includes(dateStr)) evt.exceptions.push(dateStr);
  saveTeams(all);
}

// ── Recurrence helpers ──
function daysBetween(dateA, dateB) {
  const a = new Date(dateA + 'T00:00:00');
  const b = new Date(dateB + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

function matchesDate(evt, dateStr) {
  if (evt.date === dateStr) return true;
  if (!evt.recurrence || evt.recurrence === 'none') return false;
  const exceptions = evt.exceptions || [];
  if (exceptions.includes(dateStr)) return false;
  if (dateStr < evt.date) return false;

  const diff = daysBetween(evt.date, dateStr);
  if (evt.recurrence === 'weekly')   return diff % 7  === 0;
  if (evt.recurrence === 'biweekly') return diff % 14 === 0;
  if (evt.recurrence === 'monthly') {
    const [oy, om, od] = evt.date.split('-').map(Number);
    const [dy, dm, dd] = dateStr.split('-').map(Number);
    return od === dd && (dy > oy || (dy === oy && dm > om));
  }
  return false;
}

function getEventsForDate(allEvents, dateStr) {
  return allEvents.filter(e => matchesDate(e, dateStr));
}

// Generate occurrences of a recurring event in the next N days from a start date
function futureOccurrences(evt, fromDate, days) {
  const results = [];
  if (!evt.recurrence || evt.recurrence === 'none') return results;
  for (let i = 1; i <= days; i++) {
    const d = new Date(fromDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split('T')[0];
    if (matchesDate(evt, ds)) results.push(ds);
  }
  return results;
}

// ── Calendar render ──
function renderCalendar() {
  const events = getEvents();

  document.getElementById('calMonthTitle').textContent =
    MONTH_NAMES[curMonth] + ' ' + curYear;

  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  // Day-of-week headers
  DAY_NAMES.forEach(d => {
    const h = document.createElement('div');
    h.className = 'cal-day-header';
    h.textContent = d;
    grid.appendChild(h);
  });

  // Start offset: Monday = 0
  const firstDayOfWeek = (new Date(curYear, curMonth, 1).getDay() + 6) % 7;
  const daysInMonth    = new Date(curYear, curMonth + 1, 0).getDate();
  const daysInPrev     = new Date(curYear, curMonth, 0).getDate();

  for (let i = 0; i < 42; i++) {
    let dayNum, dateStr, other;

    if (i < firstDayOfWeek) {
      dayNum  = daysInPrev - firstDayOfWeek + i + 1;
      const pm = curMonth === 0 ? 11 : curMonth - 1;
      const py = curMonth === 0 ? curYear - 1 : curYear;
      dateStr = `${py}-${String(pm+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
      other   = true;
    } else if (i - firstDayOfWeek < daysInMonth) {
      dayNum  = i - firstDayOfWeek + 1;
      dateStr = `${curYear}-${String(curMonth+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
      other   = false;
    } else {
      dayNum  = i - firstDayOfWeek - daysInMonth + 1;
      const nm = curMonth === 11 ? 0 : curMonth + 1;
      const ny = curMonth === 11 ? curYear + 1 : curYear;
      dateStr = `${ny}-${String(nm+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
      other   = true;
    }

    const dayEvents = getEventsForDate(events, dateStr);
    const cell = document.createElement('div');
    cell.className = 'cal-day' +
      (other ? ' cal-day-other' : '') +
      (dateStr === TODAY ? ' cal-day-today' : '') +
      (dayEvents.length ? ' cal-day-has-events' : '');
    cell.dataset.date = dateStr;

    const numEl = document.createElement('div');
    numEl.className = 'cal-day-num';
    numEl.textContent = dayNum;
    cell.appendChild(numEl);

    if (dayEvents.length) {
      const dots = document.createElement('div');
      dots.className = 'cal-dots';
      dayEvents.slice(0, 3).forEach(ev => {
        const dot = document.createElement('span');
        dot.className = 'cal-dot';
        dot.style.background = (TYPE_META[ev.type] || TYPE_META.other).color;
        dots.appendChild(dot);
      });
      if (dayEvents.length > 3) {
        const more = document.createElement('span');
        more.className = 'cal-dot-more';
        more.textContent = '+' + (dayEvents.length - 3);
        dots.appendChild(more);
      }
      cell.appendChild(dots);
    }

    cell.addEventListener('click', () => openDayPanel(dateStr));
    grid.appendChild(cell);
  }

  renderUpcoming(events);
}

function renderUpcoming(events) {
  const wrap = document.getElementById('calUpcoming');

  // Build a flat list of upcoming occurrences (next 60 days)
  const seen = new Set();
  const upcoming = [];

  // First pass: one-time events
  events.forEach(e => {
    if (e.date >= TODAY && (!e.recurrence || e.recurrence === 'none')) {
      const exceptions = e.exceptions || [];
      if (!exceptions.includes(e.date)) {
        upcoming.push({ date: e.date, evt: e });
        seen.add(e.id + '|' + e.date);
      }
    }
  });

  // Second pass: recurring occurrences in next 60 days
  events.forEach(e => {
    if (!e.recurrence || e.recurrence === 'none') return;
    // Also include the master date itself if it's upcoming
    if (e.date >= TODAY && matchesDate(e, e.date) && !seen.has(e.id + '|' + e.date)) {
      upcoming.push({ date: e.date, evt: e });
      seen.add(e.id + '|' + e.date);
    }
    const occs = futureOccurrences(e, TODAY, 60);
    occs.forEach(ds => {
      const key = e.id + '|' + ds;
      if (!seen.has(key)) {
        upcoming.push({ date: ds, evt: e });
        seen.add(key);
      }
    });
  });

  upcoming.sort((a, b) => {
    const at = a.date + (a.evt.time || '99:99');
    const bt = b.date + (b.evt.time || '99:99');
    return at.localeCompare(bt);
  });

  const show = upcoming.slice(0, 5);
  if (!show.length) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = '<div class="cal-upcoming-title">Upcoming</div>' +
    show.map(({ date, evt: e }) => {
      const meta = TYPE_META[e.type] || TYPE_META.other;
      const dateParts = date.split('-').map(Number);
      const dLabel = new Date(dateParts[0], dateParts[1]-1, dateParts[2])
        .toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
      const recurIcon = (e.recurrence && e.recurrence !== 'none') ? ' ↺' : '';
      return `
        <div class="cal-upcoming-item" data-date="${escHtml(date)}">
          <span class="cal-upcoming-bar" style="background:${meta.color};"></span>
          <div class="cal-upcoming-info">
            <span class="cal-upcoming-name">${escHtml(e.title)}${recurIcon}</span>
            <span class="cal-upcoming-meta">${dLabel}${e.time ? ' · ' + e.time : ''} · ${meta.label}</span>
          </div>
        </div>`;
    }).join('');

  wrap.querySelectorAll('.cal-upcoming-item').forEach(el => {
    el.addEventListener('click', () => openDayPanel(el.dataset.date));
  });
}

// ── Day panel ──
function openDayPanel(dateStr) {
  selectedDate = dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const label = new Date(y, m-1, d).toLocaleDateString(undefined, { weekday:'long', day:'numeric', month:'long' });
  document.getElementById('dayPanelTitle').textContent = label;
  renderDayEvents();
  document.getElementById('dayBackdrop').classList.add('active');
}

function closeDayPanel() {
  document.getElementById('dayBackdrop').classList.remove('active');
  selectedDate = null;
}

function renderDayEvents() {
  const events    = getEventsForDate(getEvents(), selectedDate)
    .sort((a, b) => (a.time||'99:99').localeCompare(b.time||'99:99'));
  const list      = document.getElementById('dayEventsList');
  const footer    = document.getElementById('dayPanelFooter');

  if (!events.length) {
    list.innerHTML = '<p style="color:#64748b;font-size:0.88rem;padding:12px 0;">No events on this day.</p>';
  } else {
    list.innerHTML = events.map(ev => {
      const meta = TYPE_META[ev.type] || TYPE_META.other;
      const isRecurring = ev.recurrence && ev.recurrence !== 'none';
      return `
        <div class="cal-event-item" data-id="${escHtml(ev.id)}">
          <span class="cal-event-bar" style="background:${meta.color};"></span>
          <div class="cal-event-info">
            <div class="cal-event-title">${escHtml(ev.title)}${isRecurring ? ' <span style="font-size:.75rem;color:var(--text-muted);">↺ ' + escHtml(RECUR_LABELS[ev.recurrence] || '') + '</span>' : ''}</div>
            <div class="cal-event-meta">
              ${ev.time ? ev.time + ' · ' : ''}${meta.label}
              ${ev.notes ? '<br><span style="color:#64748b;font-size:0.78rem;">' + escHtml(ev.notes) + '</span>' : ''}
            </div>
          </div>
          ${canEdit ? `
          <div class="cal-event-actions">
            <button class="cal-evt-edit-btn" data-id="${escHtml(ev.id)}" aria-label="Edit">✏</button>
            <button class="cal-evt-del-btn"  data-id="${escHtml(ev.id)}" aria-label="Delete">✕</button>
          </div>` : ''}
        </div>`;
    }).join('');

    if (canEdit) {
      list.querySelectorAll('.cal-evt-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const ev = getEvents().find(e => e.id === btn.dataset.id);
          if (ev) openEventForm(ev);
        });
      });
      list.querySelectorAll('.cal-evt-del-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const ev = getEvents().find(e => e.id === btn.dataset.id);
          if (!ev) return;
          if (ev.recurrence && ev.recurrence !== 'none') {
            openRecurDeleteModal(ev, selectedDate);
          } else {
            showConfirm('Delete this event?', () => {
              removeEvent(btn.dataset.id);
              renderCalendar();
              renderDayEvents();
            });
          }
        });
      });
    }
  }

  footer.innerHTML = canEdit
    ? '<button class="btn-primary" id="addEventBtn" style="width:100%;">+ Add Event</button>'
    : '';

  if (canEdit) {
    document.getElementById('addEventBtn').addEventListener('click', () => openEventForm(null));
  }
}

// ── Recurring delete modal ──
function openRecurDeleteModal(evt, dateStr) {
  _recurDelEvt  = evt;
  _recurDelDate = dateStr;
  document.getElementById('recurDeleteBackdrop').classList.add('active');
}

function closeRecurDeleteModal() {
  document.getElementById('recurDeleteBackdrop').classList.remove('active');
  _recurDelEvt  = null;
  _recurDelDate = null;
}

// ── Event form ──
function openEventForm(evt) {
  editingId     = evt ? evt.id : null;
  selectedType  = evt ? evt.type : 'training';
  selectedRecur = (evt && evt.recurrence) ? evt.recurrence : 'none';

  document.getElementById('eventFormTitle').textContent = evt ? 'Edit Event' : 'Add Event';
  document.getElementById('evtTitle').value = evt ? evt.title : '';
  document.getElementById('evtDate').value  = evt ? evt.date  : (selectedDate || TODAY);
  document.getElementById('evtTime').value  = evt ? (evt.time || '') : '';
  document.getElementById('evtNotes').value = evt ? (evt.notes || '') : '';

  setSelectedType(selectedType);
  setSelectedRecur(selectedRecur);
  document.getElementById('eventFormBackdrop').classList.add('active');
}

function setSelectedType(type) {
  selectedType = type;
  document.querySelectorAll('.cal-type-btn').forEach(btn => {
    const active = btn.dataset.type === type;
    btn.classList.toggle('cal-type-active', active);
    btn.style.background  = active ? (TYPE_META[type]||TYPE_META.other).color : '';
    btn.style.borderColor = active ? (TYPE_META[type]||TYPE_META.other).color : '';
    btn.style.color       = active ? '#fff' : '';
  });
}

function setSelectedRecur(recur) {
  selectedRecur = recur;
  document.querySelectorAll('.cal-recur-btn').forEach(btn => {
    const active = btn.dataset.recur === recur;
    btn.classList.toggle('cal-recur-active', active);
  });
}

function saveEvent() {
  const title = document.getElementById('evtTitle').value.trim();
  if (!title) {
    document.getElementById('evtTitle').classList.add('tiq-input-error');
    document.getElementById('evtTitle').addEventListener('input', () =>
      document.getElementById('evtTitle').classList.remove('tiq-input-error'), { once: true });
    showToast('Please enter a title.', 'error');
    return;
  }

  const existing = editingId ? getEvents().find(e => e.id === editingId) : null;
  const evt = {
    id:         editingId || crypto.randomUUID(),
    date:       document.getElementById('evtDate').value || selectedDate || TODAY,
    title,
    type:       selectedType,
    time:       document.getElementById('evtTime').value  || null,
    notes:      document.getElementById('evtNotes').value.trim() || null,
    recurrence: selectedRecur === 'none' ? null : selectedRecur,
    exceptions: (existing && existing.exceptions) ? existing.exceptions : [],
  };

  persistEvent(evt);
  document.getElementById('eventFormBackdrop').classList.remove('active');
  renderCalendar();

  // Refresh or open the day panel for the saved event's date
  if (selectedDate === evt.date) renderDayEvents();
  else { selectedDate = evt.date; renderDayEvents(); }

  document.getElementById('dayBackdrop').classList.add('active');
  document.getElementById('dayPanelTitle').textContent = (() => {
    const [y, m, d] = evt.date.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString(undefined, { weekday:'long', day:'numeric', month:'long' });
  })();
}

// ── Init ──
function init() {
  renderCalendar();

  document.getElementById('calPrev').addEventListener('click', () => {
    if (curMonth === 0) { curMonth = 11; curYear--; }
    else curMonth--;
    renderCalendar();
  });

  document.getElementById('calNext').addEventListener('click', () => {
    if (curMonth === 11) { curMonth = 0; curYear++; }
    else curMonth++;
    renderCalendar();
  });

  document.getElementById('closeDayPanel').addEventListener('click', closeDayPanel);
  document.getElementById('dayBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('dayBackdrop')) closeDayPanel();
  });

  document.getElementById('closeEventForm').addEventListener('click', () =>
    document.getElementById('eventFormBackdrop').classList.remove('active'));
  document.getElementById('eventFormBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('eventFormBackdrop'))
      document.getElementById('eventFormBackdrop').classList.remove('active');
  });

  document.getElementById('saveEventBtn').addEventListener('click', saveEvent);

  document.querySelectorAll('.cal-type-btn').forEach(btn => {
    btn.addEventListener('click', () => setSelectedType(btn.dataset.type));
  });

  document.querySelectorAll('.cal-recur-btn').forEach(btn => {
    btn.addEventListener('click', () => setSelectedRecur(btn.dataset.recur));
  });

  // Recurring delete modal
  document.getElementById('closeRecurDelete').addEventListener('click', closeRecurDeleteModal);
  document.getElementById('recurDeleteBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('recurDeleteBackdrop')) closeRecurDeleteModal();
  });
  document.getElementById('recurDelThisBtn').addEventListener('click', () => {
    if (!_recurDelEvt || !_recurDelDate) return;
    addException(_recurDelEvt.id, _recurDelDate);
    closeRecurDeleteModal();
    renderCalendar();
    renderDayEvents();
  });
  document.getElementById('recurDelAllBtn').addEventListener('click', () => {
    if (!_recurDelEvt) return;
    showConfirm('Delete all occurrences of this event?', () => {
      removeEvent(_recurDelEvt.id);
      closeRecurDeleteModal();
      renderCalendar();
      renderDayEvents();
    });
  });

  // Check role after auth
  window.DB_READY.then(() => {
    canEdit = window.APP_ROLE === 'head-coach' || window.APP_ROLE === 'assistant-coach';
  });
}
