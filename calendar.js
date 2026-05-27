const STORAGE_KEY = 'football_coach_teams';

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

// ── Constants ──
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Mo','Tu','We','Th','Fr','Sa','Su'];

const TYPE_META = {
  training: { label: 'Training',  color: '#16a34a' },
  match:    { label: 'Match',     color: '#3b82f6' },
  meeting:  { label: 'Meeting',   color: '#eab308' },
  other:    { label: 'Other',     color: '#64748b' },
};

// ── State ──
let curYear  = new Date().getFullYear();
let curMonth = new Date().getMonth();
let canEdit  = false;      // set by DB_READY
let selectedDate = null;
let editingId    = null;
let selectedType = 'training';

const TODAY = new Date().toISOString().split('T')[0];

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

    const dayEvents = events.filter(e => e.date === dateStr);
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
  const upcoming = events
    .filter(e => e.date >= TODAY)
    .sort((a, b) => (a.date + (a.time||'99:99')).localeCompare(b.date + (b.time||'99:99')))
    .slice(0, 5);

  if (!upcoming.length) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = '<div class="cal-upcoming-title">Upcoming</div>' +
    upcoming.map(e => {
      const meta = TYPE_META[e.type] || TYPE_META.other;
      const dateParts = e.date.split('-').map(Number);
      const dLabel = new Date(dateParts[0], dateParts[1]-1, dateParts[2])
        .toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
      return `
        <div class="cal-upcoming-item" data-date="${escHtml(e.date)}">
          <span class="cal-upcoming-bar" style="background:${meta.color};"></span>
          <div class="cal-upcoming-info">
            <span class="cal-upcoming-name">${escHtml(e.title)}</span>
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
  const events    = getEvents().filter(e => e.date === selectedDate)
    .sort((a, b) => (a.time||'99:99').localeCompare(b.time||'99:99'));
  const list      = document.getElementById('dayEventsList');
  const footer    = document.getElementById('dayPanelFooter');

  if (!events.length) {
    list.innerHTML = '<p style="color:#64748b;font-size:0.88rem;padding:12px 0;">No events on this day.</p>';
  } else {
    list.innerHTML = events.map(ev => {
      const meta = TYPE_META[ev.type] || TYPE_META.other;
      return `
        <div class="cal-event-item" data-id="${escHtml(ev.id)}">
          <span class="cal-event-bar" style="background:${meta.color};"></span>
          <div class="cal-event-info">
            <div class="cal-event-title">${escHtml(ev.title)}</div>
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
          showConfirm('Delete this event?', () => {
            removeEvent(btn.dataset.id);
            renderCalendar();
            renderDayEvents();
          });
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

// ── Event form ──
function openEventForm(evt) {
  editingId    = evt ? evt.id : null;
  selectedType = evt ? evt.type : 'training';

  document.getElementById('eventFormTitle').textContent = evt ? 'Edit Event' : 'Add Event';
  document.getElementById('evtTitle').value = evt ? evt.title : '';
  document.getElementById('evtDate').value  = evt ? evt.date  : (selectedDate || TODAY);
  document.getElementById('evtTime').value  = evt ? (evt.time || '') : '';
  document.getElementById('evtNotes').value = evt ? (evt.notes || '') : '';

  setSelectedType(selectedType);
  document.getElementById('eventFormBackdrop').classList.add('active');
}

function setSelectedType(type) {
  selectedType = type;
  document.querySelectorAll('.cal-type-btn').forEach(btn => {
    const active = btn.dataset.type === type;
    btn.classList.toggle('cal-type-active', active);
    btn.style.background   = active ? (TYPE_META[type]||TYPE_META.other).color : '';
    btn.style.borderColor  = active ? (TYPE_META[type]||TYPE_META.other).color : '';
    btn.style.color        = active ? '#fff' : '';
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

  const evt = {
    id:    editingId || crypto.randomUUID(),
    date:  document.getElementById('evtDate').value || selectedDate || TODAY,
    title,
    type:  selectedType,
    time:  document.getElementById('evtTime').value  || null,
    notes: document.getElementById('evtNotes').value.trim() || null,
  };

  persistEvent(evt);
  document.getElementById('eventFormBackdrop').classList.remove('active');
  renderCalendar();

  // If the day panel is still open for this date, refresh it
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

  // Check role after auth
  window.DB_READY.then(() => {
    canEdit = window.APP_ROLE === 'head-coach' || window.APP_ROLE === 'assistant-coach';
  });
}
