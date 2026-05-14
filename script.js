/* ═══════════════════════════════════════════════════════════════════
   DAWATRACK · script.js
   Role-based auth · Medication tracking · Live Care Feed
═══════════════════════════════════════════════════════════════════ */

/* ── Storage helpers ─────────────────────────────────────────── */
const DB = {
  get : (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set : (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del : (k)    => localStorage.removeItem(k),
};

/* ── Session ─────────────────────────────────────────────────── */
function getSession()      { return DB.get('dt_session'); }
function setSession(s)     { DB.set('dt_session', s); }
function clearSession()    { DB.del('dt_session'); }
function requireRole(role) {
  const s = getSession();
  if (!s || s.role !== role) { window.location.href = 'portal.html'; }
}

/* ── Seed demo data ──────────────────────────────────────────── */
function seedDemoData() {
  if (DB.get('dt_seeded')) return;

  // Users
  DB.set('dt_users', [
    { id: 'p_self', role: 'patient', name: 'Alice Kamau',  email: 'patient@demo.com', password: 'demo123' },
    { id: 'p2',     role: 'patient', name: 'James Otieno', email: 'james@demo.com',   password: 'demo123' },
    { id: 'p3',     role: 'patient', name: 'Fatuma Njeri', email: 'fatuma@demo.com',  password: 'demo123' },
    { id: 'doc1',   role: 'doctor',  name: 'Dr. David Mwangi', email: 'doctor@demo.com', password: 'demo123' },
  ]);

  // Medication logs
  DB.set('dt_logs', [
    // Alice (p_self)
    { id:1,  patientId:'p_self', medicine:'Metformin 500mg',  date:'2026-05-05', taken:true,  notes:'After breakfast', time:'08:15', loggedAt:'2026-05-05T08:15:00' },
    { id:2,  patientId:'p_self', medicine:'Metformin 500mg',  date:'2026-05-06', taken:true,  notes:'',               time:'08:30', loggedAt:'2026-05-06T08:30:00' },
    { id:3,  patientId:'p_self', medicine:'Metformin 500mg',  date:'2026-05-07', taken:false, notes:'Forgot',         time:null,    loggedAt:'2026-05-07T09:00:00' },
    { id:4,  patientId:'p_self', medicine:'Metformin 500mg',  date:'2026-05-08', taken:true,  notes:'Slight nausea',  time:'08:45', loggedAt:'2026-05-08T08:45:00' },
    { id:5,  patientId:'p_self', medicine:'Metformin 500mg',  date:'2026-05-09', taken:true,  notes:'',               time:'08:10', loggedAt:'2026-05-09T08:10:00' },
    { id:6,  patientId:'p_self', medicine:'Metformin 500mg',  date:'2026-05-10', taken:true,  notes:'',               time:'08:05', loggedAt:'2026-05-10T08:05:00' },
    { id:7,  patientId:'p_self', medicine:'Vitamin D 1000IU', date:'2026-05-07', taken:true,  notes:'With lunch',     time:'13:00', loggedAt:'2026-05-07T13:00:00' },
    { id:8,  patientId:'p_self', medicine:'Vitamin D 1000IU', date:'2026-05-08', taken:true,  notes:'',               time:'13:15', loggedAt:'2026-05-08T13:15:00' },
    { id:9,  patientId:'p_self', medicine:'Vitamin D 1000IU', date:'2026-05-09', taken:false, notes:'Ran out',        time:null,    loggedAt:'2026-05-09T13:00:00' },
    { id:10, patientId:'p_self', medicine:'Vitamin D 1000IU', date:'2026-05-10', taken:true,  notes:'Refilled',       time:'13:00', loggedAt:'2026-05-10T13:00:00' },
    // James (p2)
    { id:11, patientId:'p2', medicine:'Amlodipine 10mg', date:'2026-05-05', taken:false, notes:'Forgot',       time:null,    loggedAt:'2026-05-05T09:00:00' },
    { id:12, patientId:'p2', medicine:'Amlodipine 10mg', date:'2026-05-06', taken:true,  notes:'',             time:'07:45', loggedAt:'2026-05-06T07:45:00' },
    { id:13, patientId:'p2', medicine:'Amlodipine 10mg', date:'2026-05-07', taken:false, notes:'Travelling',   time:null,    loggedAt:'2026-05-07T09:00:00' },
    { id:14, patientId:'p2', medicine:'Amlodipine 10mg', date:'2026-05-08', taken:true,  notes:'',             time:'07:55', loggedAt:'2026-05-08T07:55:00' },
    { id:15, patientId:'p2', medicine:'Amlodipine 10mg', date:'2026-05-09', taken:true,  notes:'',             time:'08:00', loggedAt:'2026-05-09T08:00:00' },
    { id:16, patientId:'p2', medicine:'Amlodipine 10mg', date:'2026-05-10', taken:false, notes:'Busy day',     time:null,    loggedAt:'2026-05-10T09:00:00' },
    { id:17, patientId:'p2', medicine:'Amlodipine 10mg', date:'2026-05-11', taken:true,  notes:'',             time:'07:50', loggedAt:'2026-05-11T07:50:00' },
    // Fatuma (p3)
    { id:18, patientId:'p3', medicine:'Lisinopril 20mg', date:'2026-05-05', taken:false, notes:'',             time:null,    loggedAt:'2026-05-05T09:00:00' },
    { id:19, patientId:'p3', medicine:'Lisinopril 20mg', date:'2026-05-06', taken:false, notes:'Unwell',       time:null,    loggedAt:'2026-05-06T09:00:00' },
    { id:20, patientId:'p3', medicine:'Lisinopril 20mg', date:'2026-05-07', taken:true,  notes:'Back on track',time:'10:20', loggedAt:'2026-05-07T10:20:00' },
    { id:21, patientId:'p3', medicine:'Lisinopril 20mg', date:'2026-05-08', taken:false, notes:'',             time:null,    loggedAt:'2026-05-08T09:00:00' },
    { id:22, patientId:'p3', medicine:'Lisinopril 20mg', date:'2026-05-09', taken:false, notes:'Still unwell', time:null,    loggedAt:'2026-05-09T09:00:00' },
    { id:23, patientId:'p3', medicine:'Lisinopril 20mg', date:'2026-05-10', taken:true,  notes:'',             time:'09:00', loggedAt:'2026-05-10T09:00:00' },
    { id:24, patientId:'p3', medicine:'Lisinopril 20mg', date:'2026-05-11', taken:false, notes:'',             time:null,    loggedAt:'2026-05-11T09:00:00' },
  ]);

  // Doctor notes (care feed) — doctor writes these, patients read them
  DB.set('dt_notes', [
    { id:1, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p_self', logId:3,  message:'You missed your dose on the 7th. Please set a daily alarm at 8am to help you stay consistent.', type:'reminder',  createdAt:'2026-05-07T14:00:00', read:false },
    { id:2, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p_self', logId:4,  message:'The nausea you mentioned is a known side effect of Metformin. Try taking it with a full meal and a large glass of water — this should help significantly.', type:'advice', createdAt:'2026-05-08T16:30:00', read:false },
    { id:3, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p_self', logId:6,  message:'Excellent work this week! 5 out of 6 doses taken. Your blood sugar management is improving — keep it up!', type:'praise', createdAt:'2026-05-10T09:00:00', read:false },
    { id:4, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p_self', logId:9,  message:'You are running low on Vitamin D. Please refill your prescription before the end of the week. I have sent a repeat prescription to Nairobi Pharmacy.', type:'urgent', createdAt:'2026-05-09T17:00:00', read:false },
    { id:5, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p2',    logId:11, message:'James, you missed your Amlodipine on the 5th. Missing blood pressure medication can be risky — please prioritise this daily.', type:'reminder', createdAt:'2026-05-05T18:00:00', read:false },
    { id:6, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p3',    logId:18, message:'Fatuma, 2 missed doses is a concern. Your blood pressure may be affected. Please call the clinic at your earliest convenience.', type:'urgent',   createdAt:'2026-05-06T10:00:00', read:false },
  ]);

  DB.set('dt_next_log_id',  25);
  DB.set('dt_next_note_id', 7);
  DB.set('dt_seeded', true);
}

/* ── Helpers ─────────────────────────────────────────────────── */
function getLogs()  { return DB.get('dt_logs')  || []; }
function getNotes() { return DB.get('dt_notes') || []; }
function getUsers() { return DB.get('dt_users') || []; }

function nextLogId()  { const id = DB.get('dt_next_log_id')  || 1; DB.set('dt_next_log_id',  id+1); return id; }
function nextNoteId() { const id = DB.get('dt_next_note_id') || 1; DB.set('dt_next_note_id', id+1); return id; }

function adherenceRate(logs) {
  if (!logs.length) return 0;
  return Math.round(logs.filter(l => l.taken).length / logs.length * 100);
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' });
}

function fmtTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const h = d.getHours(), m = d.getMinutes().toString().padStart(2,'0');
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

function timeAgo(isoStr) {
  const diff = (Date.now() - new Date(isoStr)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function showToast(msg, type='success') {
  let c = document.querySelector('.toast-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = `toast-item ${type}`;
  const icon = type==='success' ? '✓' : type==='error' ? '✗' : 'ℹ';
  const clr  = type==='success' ? '#2DAF83' : type==='error' ? '#D94F4F' : '#3A8DC4';
  t.innerHTML = `<span style="color:${clr};font-weight:800;font-size:1.05rem;">${icon}</span><span style="font-size:0.875rem;color:#3A5563;">${msg}</span>`;
  c.appendChild(t);

  // UX: cap toast count to prevent spam stacking
  const maxToasts = 3;
  const items = c.querySelectorAll('.toast-item');
  if (items.length > maxToasts) {
    // remove oldest extra toasts
    for (let i = 0; i < items.length - maxToasts; i++) {
      items[i].remove();
    }
  }

  // clearer timeout management + avoid leaving stale timers on navigation
  const fadeMs = 300;
  const ttlMs = 3500;
  setTimeout(() => {
    t.style.cssText += ';opacity:0;transform:translateX(16px);transition:all 0.3s ease;';
    setTimeout(() => t.remove(), fadeMs);
  }, ttlMs);
}

function badgeAdherence(rate) {
  if (rate >= 80) return `<span class="badge badge-green">✓ ${rate}%</span>`;
  if (rate >= 50) return `<span class="badge badge-amber">⚠ ${rate}%</span>`;
  return `<span class="badge badge-red">✗ ${rate}%</span>`;
}

function riskBadge(rate) {
  if (rate >= 80) return '<span class="badge badge-green">Low Risk</span>';
  if (rate >= 50) return '<span class="badge badge-amber">Medium Risk</span>';
  return '<span class="badge badge-red">High Risk</span>';
}

function noteTypeStyle(type) {
  switch(type) {
    case 'praise':   return { icon:'🌟', bg:'#EDF5F2', border:'#9DD1C2', accentBg:'#5DAC96', label:'Great news', labelColor:'#2E7A65' };
    case 'reminder': return { icon:'🔔', bg:'#FBF5E6', border:'#F0CC88', accentBg:'#D98A2A', label:'Reminder',   labelColor:'#A0620A' };
    case 'urgent':   return { icon:'⚠️', bg:'#FAF0F0', border:'#F0AAAA', accentBg:'#D94F4F', label:'Urgent',     labelColor:'#B03030' };
    case 'advice':   return { icon:'💊', bg:'#EAF3FA', border:'#9DD0F0', accentBg:'#3A8DC4', label:'Advice',     labelColor:'#1A6496' };
    default:         return { icon:'📋', bg:'#F4F8F7', border:'#D1E4DE', accentBg:'#1B5271', label:'Note',       labelColor:'#1B5271' };
  }
}

/* ════════════════════════════════════════════════════════════════
   PORTAL — LOGIN
════════════════════════════════════════════════════════════════ */
function initPortal() {
  seedDemoData();
  const s = getSession();
  if (s) {
    window.location.href = s.role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
    return;
  }

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const tgt = document.getElementById(btn.dataset.tab);
      if (tgt) tgt.classList.add('active');
    });
  });

  // Role selector
  document.querySelectorAll('.role-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
    });
  });

  window.handleLogin = function() {
    const email    = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPass')?.value.trim();
    if (!email || !password) { showToast('Please enter your credentials.','error'); return; }
    const users = getUsers();
    const user  = users.find(u => u.email === email && u.password === password);
    if (!user) { showToast('Invalid email or password.','error'); return; }
    setSession({ id: user.id, role: user.role, name: user.name, email: user.email });
    showToast(`Welcome back, ${user.name.split(' ')[0]}!`);
    setTimeout(() => { window.location.href = user.role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html'; }, 800);
  };

  window.handleRegister = function() {
    const name  = document.getElementById('regName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    const pass  = document.getElementById('regPass')?.value.trim();
    const code  = document.getElementById('regCode')?.value.trim();
    if (!name || !email || !pass) { showToast('Please fill all required fields.','error'); return; }
    const users = getUsers();
    if (users.find(u => u.email === email)) { showToast('Email already registered.','error'); return; }
    const id   = 'p_' + Date.now();
    const role = code === 'DOC2026' ? 'doctor' : 'patient';
    users.push({ id, role, name, email, password: pass });
    DB.set('dt_users', users);
    setSession({ id, role, name, email });
    showToast('Account created! Redirecting…');
    setTimeout(() => { window.location.href = role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html'; }, 900);
  };

  window.demoLogin = function(role) {
    const email = role === 'doctor' ? 'doctor@demo.com' : 'patient@demo.com';
    const users = getUsers();
    const user  = users.find(u => u.email === email);
    if (!user) return;
    setSession({ id: user.id, role: user.role, name: user.name, email: user.email });
    setTimeout(() => { window.location.href = role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html'; }, 400);
  };

  window.handleLogout = function() {
    clearSession(); window.location.href = 'portal.html';
  };
}




/* ════════════════════════════════════════════════════════════════
   PATIENT DASHBOARD
════════════════════════════════════════════════════════════════ */
let careFeedInterval = null;

function initPatientDashboard() {
  seedDemoData();
  requireRole('patient');

  const s = getSession();
  const nameEl = document.getElementById('patientName');
  if (nameEl) nameEl.textContent = s.name;

  // default date
  const dateEl = document.getElementById('medDate');
  if (dateEl) dateEl.valueAsDate = new Date();

  renderPatientKPIs();
  renderPatientLogs();
  renderCareFeed();
  updateSidebarRate();
  setTimeout(renderPatientChart, 200);

  // Poll care feed every 5s for live updates
  careFeedInterval = setInterval(() => {
    renderCareFeed();
    updateUnreadBadge();
  }, 5000);

  // Log form
  const form = document.getElementById('medForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const med   = document.getElementById('medName').value.trim();
      const date  = document.getElementById('medDate').value;
      const taken = document.getElementById('medTaken').checked;
      const notes = document.getElementById('medNotes').value.trim();
      const time  = document.getElementById('medTime').value || null;
      if (!med || !date) { showToast('Please fill required fields.','error'); return; }
      const logs = getLogs();
      logs.push({ id: nextLogId(), patientId: s.id, medicine: med, date, taken, notes, time, loggedAt: new Date().toISOString() });
      DB.set('dt_logs', logs);
      renderPatientLogs();
      renderPatientKPIs();
      updateSidebarRate();
      setTimeout(renderPatientChart, 100);
      form.reset();
      dateEl.valueAsDate = new Date();
      setStatusUI(null);
      showToast('Medication logged!');
    });
  }

  // Status toggle
  window.setStatusUI = function(val) {
    const takenCb = document.getElementById('medTaken');
    if (takenCb) takenCb.checked = val === 'taken';
    ['taken','missed'].forEach(v => {
      const lbl = document.getElementById('lbl-'+v);
      if (!lbl) return;
      const active = val === v;
      lbl.style.borderColor  = active ? (v==='taken' ? '#5DAC96' : '#D94F4F') : '#D1E4DE';
      lbl.style.background   = active ? (v==='taken' ? '#EDF5F2' : '#FAE8E8') : '#FFFFFF';
    });
  };

  // Mark note as read
  window.markNoteRead = function(noteId) {
    const notes = getNotes();
    const idx   = notes.findIndex(n => n.id === noteId);
    if (idx !== -1) { notes[idx].read = true; DB.set('dt_notes', notes); renderCareFeed(); updateUnreadBadge(); }
  };

  updateUnreadBadge();
}

function renderPatientKPIs() {
  const s    = getSession();
  const logs = getLogs().filter(l => l.patientId === s.id);
  const rate = adherenceRate(logs);
  const set  = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  set('kpi-total',  logs.length);
  set('kpi-taken',  logs.filter(l=>l.taken).length);
  set('kpi-missed', logs.filter(l=>!l.taken).length);
  set('kpi-rate',   rate+'%');
  const bar = document.getElementById('kpi-bar');
  if (bar) { bar.style.width=rate+'%'; bar.className='adherence-fill'+(rate>=80?'':rate>=50?' warning':' danger'); }
}

function updateSidebarRate() {
  const s    = getSession();
  const logs = getLogs().filter(l => l.patientId === s.id);
  const rate = adherenceRate(logs);
  const el   = document.getElementById('sidebar-rate');
  const bar  = document.getElementById('sidebar-bar');
  if (el)  el.textContent = logs.length ? rate+'%' : '—';
  if (bar) { bar.style.width=(logs.length?rate:0)+'%'; bar.className='adherence-fill'+(rate>=80?'':rate>=50?' warning':' danger'); }
}

function renderPatientLogs() {
  const s   = getSession();
  const container = document.getElementById('patientLogs');
  if (!container) return;
  const logs = getLogs().filter(l => l.patientId === s.id).slice().reverse();

  if (!logs.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:56px 20px;background:#FFFFFF;border:1px solid #D1E4DE;border-radius:16px;">
        <div style="font-size:3rem;margin-bottom:14px;">💊</div>
        <div style="font-weight:700;color:#1B5271;font-size:1rem;margin-bottom:6px;">No medications logged yet</div>
        <p style="font-size:0.85rem;color:#7A9CA8;">Use the form on the left to log your first dose.</p>
      </div>`;
    return;
  }

  container.innerHTML = logs.map(log => {
    const notes = getNotes().filter(n => n.patientId === s.id && n.logId === log.id);
    return `
    <div style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:16px;overflow:hidden;transition:box-shadow 0.2s ease;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:14px;padding:18px 20px;flex-wrap:wrap;">
        <div style="width:46px;height:46px;border-radius:12px;background:${log.taken?'#D5F3EB':'#FAE0E0'};border:1px solid ${log.taken?'#A8E4D0':'#F0AAAA'};display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">${log.taken?'✅':'❌'}</div>
        <div style="flex:1;min-width:120px;">
          <div style="font-weight:700;font-size:0.95rem;color:#1B5271;">${log.medicine}</div>
          <div style="font-size:0.76rem;color:#7A9CA8;margin-top:3px;">📅 ${fmtDate(log.date)}${log.time ? ' · ⏰ '+log.time : ''}</div>
        </div>
        ${log.taken ? '<span class="badge badge-green">✓ Taken</span>' : '<span class="badge badge-red">✗ Missed</span>'}
      </div>
      ${log.notes ? `<div style="padding:0 20px 14px;display:flex;gap:8px;"><span style="color:#7A9CA8;font-size:0.9rem;">📝</span><p style="font-size:0.85rem;color:#3A5563;margin:0;line-height:1.6;">${log.notes}</p></div>` : ''}
      ${notes.map(n => {
        const st = noteTypeStyle(n.type);
        return `<div style="margin:0 16px 14px;background:${st.bg};border:1px solid ${st.border};border-left:3px solid ${st.accentBg};border-radius:10px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;">
          <span style="font-size:1.1rem;flex-shrink:0;">${st.icon}</span>
          <div>
            <div style="font-size:0.65rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${st.labelColor};margin-bottom:4px;">Dr. Note · ${st.label}</div>
            <p style="font-size:0.85rem;color:#3A5563;margin:0;line-height:1.6;">${n.message}</p>
            <div style="font-size:0.7rem;color:#7A9CA8;margin-top:6px;">${fmtTime(n.createdAt)} · ${n.doctorName}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

function renderCareFeed() {
  const s         = getSession();
  const container = document.getElementById('careFeed');
  if (!container) return;

  const notes = getNotes()
    .filter(n => n.patientId === s.id)
    .slice()
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!notes.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 16px;">
        <div style="font-size:2.5rem;margin-bottom:12px;">🩺</div>
        <div style="font-weight:600;color:#1B5271;font-size:0.9rem;margin-bottom:4px;">No messages yet</div>
        <p style="font-size:0.8rem;color:#7A9CA8;">Your doctor's notes will appear here.</p>
      </div>`;
    return;
  }

  container.innerHTML = notes.map(n => {
    const st = noteTypeStyle(n.type);
    return `
    <div style="background:${n.read?'#FFFFFF':st.bg};border:1px solid ${n.read?'#D1E4DE':st.border};border-radius:14px;padding:16px;margin-bottom:12px;cursor:pointer;transition:all 0.2s ease;position:relative;"
         onclick="markNoteRead(${n.id})" onmouseenter="this.style.boxShadow='0 4px 16px rgba(27,82,113,0.12)'" onmouseleave="this.style.boxShadow='none'">
      ${!n.read ? `<div style="position:absolute;top:12px;right:12px;width:8px;height:8px;border-radius:50%;background:${st.accentBg};"></div>` : ''}
      <div style="display:flex;gap:10px;align-items:flex-start;">
        <div style="width:36px;height:36px;border-radius:10px;background:${st.accentBg};display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">${st.icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
            <span style="font-size:0.7rem;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${st.labelColor};">${st.label}</span>
            <span style="font-size:0.68rem;color:#7A9CA8;white-space:nowrap;">${timeAgo(n.createdAt)}</span>
          </div>
          <p style="font-size:0.84rem;color:#3A5563;margin:0;line-height:1.6;">${n.message}</p>
          <div style="font-size:0.72rem;color:#7A9CA8;margin-top:8px;font-weight:500;">— ${n.doctorName}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function updateUnreadBadge() {
  const s     = getSession();
  if (!s) return;
  const count = getNotes().filter(n => n.patientId === s.id && !n.read).length;
  const badge = document.getElementById('unreadBadge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function renderPatientChart() {
  const canvas = document.getElementById('patientChart');
  if (!canvas || !window.Chart) return;
  const ex = Chart.getChart(canvas); if (ex) ex.destroy();

  const s    = getSession();
  const logs = getLogs().filter(l => l.patientId === s.id);
  const days = [];
  for (let i=6;i>=0;i--) { const d=new Date('2026-05-11'); d.setDate(d.getDate()-i); days.push(d.toISOString().split('T')[0]); }
  const taken  = days.map(d => logs.filter(l=>l.date===d&&l.taken).length);
  const missed = days.map(d => logs.filter(l=>l.date===d&&!l.taken).length);
  const labels = days.map(d => parseInt(d.split('-')[2])+' May');

  new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label:'Taken',  data:taken,  backgroundColor:'rgba(93,172,150,0.75)', borderColor:'#5DAC96', borderWidth:1, borderRadius:6 },
        { label:'Missed', data:missed, backgroundColor:'rgba(217,79,79,0.45)',  borderColor:'#D94F4F', borderWidth:1, borderRadius:6 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: { legend:{ labels:{ color:'#7A9CA8', font:{family:'Outfit',size:11}, boxWidth:12 } }, tooltip:{ backgroundColor:'#1B5271', titleColor:'#FFFFFF', bodyColor:'#9DD1C2', padding:12 } },
      scales: {
        x: { grid:{color:'rgba(209,228,222,0.5)'}, ticks:{color:'#7A9CA8',font:{family:'Outfit',size:11}} },
        y: { beginAtZero:true, grid:{color:'rgba(209,228,222,0.5)'}, ticks:{color:'#7A9CA8',stepSize:1,font:{family:'Outfit',size:11}} }
      }
    }
  });
}

/* ════════════════════════════════════════════════════════════════
   DOCTOR DASHBOARD
════════════════════════════════════════════════════════════════ */
function initDoctorDashboard() {
  seedDemoData();
  requireRole('doctor');

  const s    = getSession();
  const nEl  = document.getElementById('doctorName');
  if (nEl) nEl.textContent = s.name;

  renderDoctorKPIs();
  renderPatientList('all');
  setTimeout(() => { renderTrendChart(); renderDonutChart(); }, 200);

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderPatientList(btn.dataset.filter || 'all');
    });
  });
}

function getDoctorPatients() {
  const allLogs = getLogs();
  const pids    = [...new Set(allLogs.map(l=>l.patientId))];
  return pids.map(pid => {
    const pLogs = allLogs.filter(l=>l.patientId===pid);
    const user  = getUsers().find(u=>u.id===pid);
    return { pid, name: user?.name || pid, logs: pLogs, rate: adherenceRate(pLogs), medicine: pLogs[0]?.medicine || '—' };
  });
}

function renderDoctorKPIs() {
  const patients = getDoctorPatients();
  const allLogs  = patients.flatMap(p=>p.logs);
  const atRisk   = patients.filter(p=>p.rate<60).length;
  const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  set('dr-patients', patients.length);
  set('dr-rate',     adherenceRate(allLogs)+'%');
  set('dr-atrisk',   atRisk);
  set('dr-logs',     allLogs.length);
  const sb = document.getElementById('sidebar-atrisk');
  if (sb) sb.textContent = atRisk;
}

function renderPatientList(filter) {
  const container = document.getElementById('patientList') || document.getElementById('doctorPatientList');
  if (!container) return;
  let patients = getDoctorPatients();
  if (filter==='atrisk') patients = patients.filter(p=>p.rate<60);
  else if (filter==='good') patients = patients.filter(p=>p.rate>=80);
  patients.sort((a,b)=>a.rate-b.rate);

  if (!patients.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;background:#FFFFFF;border:1px solid #D1E4DE;border-radius:16px;color:#7A9CA8;font-size:0.875rem;">No patients match this filter.</div>`;
    return;
  }

  container.innerHTML = patients.map(p => {
    const initials = p.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
    const avatarBg = p.rate>=80 ? 'linear-gradient(135deg,#5DAC96,#9DD1C2)' : p.rate>=50 ? 'linear-gradient(135deg,#D98A2A,#F0C070)' : 'linear-gradient(135deg,#D94F4F,#F09090)';
    const recent   = p.logs.slice(-7);
    const sparks   = recent.map(l=>`<div class="spark-bar" style="height:${l.taken?Math.floor(Math.random()*35+55):16}%;background:${l.taken?'#5DAC96':'#D94F4F'};opacity:${l.taken?'0.8':'0.45'};"></div>`).join('');
    const rows     = p.logs.slice().reverse().map(log => {
      const existingNote = getNotes().find(n=>n.patientId===p.pid && n.logId===log.id);
      return `<tr>
        <td style="white-space:nowrap;">${fmtDate(log.date)}</td>
        <td style="color:#1B5271;font-weight:600;">${log.medicine}</td>
        <td>${log.taken?'<span class="badge badge-green">✓ Taken</span>':'<span class="badge badge-red">✗ Missed</span>'}</td>
        <td style="color:#7A9CA8;">${log.time||'—'}</td>
        <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#3A5563;">${log.notes||'—'}</td>
        <td>
          <select id="ntype-${log.id}" onclick="event.stopPropagation()" style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:7px;color:#1B5271;font-size:0.75rem;padding:5px 8px;font-family:'Outfit',sans-serif;cursor:pointer;margin-bottom:6px;width:100%;">
            <option value="advice"   ${existingNote?.type==='advice'  ?'selected':''}>💊 Advice</option>
            <option value="reminder" ${existingNote?.type==='reminder'?'selected':''}>🔔 Reminder</option>
            <option value="praise"   ${existingNote?.type==='praise'  ?'selected':''}>🌟 Praise</option>
            <option value="urgent"   ${existingNote?.type==='urgent'  ?'selected':''}>⚠️ Urgent</option>
          </select>
          <input type="text" placeholder="Write note to patient…" value="${existingNote?.message||''}" id="note-${log.id}"
            onclick="event.stopPropagation()"
            style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:7px;color:#0E1C28;font-size:0.78rem;padding:6px 10px;width:200px;font-family:'Outfit',sans-serif;">
        </td>
        <td><button class="btn-secondary" onclick="saveNote('${p.pid}',${log.id},event)" style="font-size:0.75rem;padding:5px 12px;white-space:nowrap;">Send →</button></td>
      </tr>`;
    }).join('');

    return `
    <div class="patient-card mb-3" style="margin-bottom:14px;">
      <div class="patient-card-header" onclick="toggleDetail('${p.pid}')">
        <div class="patient-avatar" style="background:${avatarBg};">${initials}</div>
        <div style="flex:1;min-width:120px;">
          <div style="font-weight:700;font-size:0.95rem;color:#1B5271;">${p.name}</div>
          <div style="font-size:0.75rem;color:#7A9CA8;margin-top:2px;">${p.medicine} · ${p.logs.length} logs</div>
        </div>
        <div style="min-width:90px;">
          ${badgeAdherence(p.rate)}
          <div class="adherence-bar" style="margin-top:6px;width:90px;">
            <div class="adherence-fill${p.rate>=80?'':p.rate>=50?' warning':' danger'}" style="width:${p.rate}%;"></div>
          </div>
        </div>
        <div class="sparkline" style="width:68px;">${sparks}</div>
        <div>${riskBadge(p.rate)}</div>
        <div style="color:#7A9CA8;font-size:0.75rem;margin-left:auto;user-select:none;" id="arr-${p.pid}">▼ expand</div>
      </div>
      <div class="patient-card-detail" id="det-${p.pid}">
        <div style="font-weight:700;font-size:0.875rem;color:#1B5271;margin-bottom:14px;">📋 Medication Log — send a note to patient via the last column</div>
        <div style="overflow-x:auto;">
          <table class="dt-table" style="min-width:700px;">
            <thead><tr><th>Date</th><th>Medication</th><th>Status</th><th>Time</th><th>Patient Notes</th><th>Your Note</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  }).join('');
}

window.toggleDetail = function(pid) {
  const el  = document.getElementById('det-'+pid);
  const arr = document.getElementById('arr-'+pid);
  if (!el) return;
  const open = el.style.display === 'block';
  el.style.display = open ? 'none' : 'block';
  if (arr) arr.textContent = open ? '▼ expand' : '▲ collapse';
};

window.saveNote = function(patientId, logId, e) {
  e.stopPropagation();

  const input   = document.getElementById('note-'+logId);
  const typeEl  = document.getElementById('ntype-'+logId);
  const message = input?.value.trim();
  const type    = typeEl?.value || 'advice';
  if (!message) { showToast('Please write a note first.','error'); return; }

  const s     = getSession();
  const notes = getNotes();

  // Remove old note for same log if exists
  const filtered = notes.filter(n => !(n.patientId===patientId && n.logId===logId));
  filtered.push({
    id: nextNoteId(),
    doctorId: s.id,
    doctorName: s.name,
    patientId,
    logId,
    message,
    type,
    createdAt: new Date().toISOString(),
    read: false,
  });
  DB.set('dt_notes', filtered);

  showToast('Note sent to patient!');

  // Re-render the patient list so the note field reflects the saved note.
  // Keep current filter selection if present.
  const activeBtn = document.querySelector('.filter-btn.active');
  const filter = activeBtn?.dataset?.filter || 'all';
  renderPatientList(filter);

  // Optional: refresh the charts/KPIs if they exist on the page.
  // (Low cost for this demo and keeps dashboard consistent.)
  renderDoctorKPIs();
  setTimeout(() => { renderTrendChart(); renderDonutChart(); }, 0);
};

function renderTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas || !window.Chart) return;
  const ex = Chart.getChart(canvas); if (ex) ex.destroy();
  const allLogs = getLogs();
  const days = [];
  for (let i=6;i>=0;i--) { const d=new Date('2026-05-11'); d.setDate(d.getDate()-i); days.push(d.toISOString().split('T')[0]); }
  const rates  = days.map(d => { const dl=allLogs.filter(l=>l.date===d); return dl.length?adherenceRate(dl):null; });
  const labels = days.map(d => parseInt(d.split('-')[2])+' May');
  new Chart(canvas.getContext('2d'), {
    type:'line',
    data:{ labels, datasets:[{ label:'Adherence %', data:rates, borderColor:'#5DAC96', backgroundColor:'rgba(93,172,150,0.10)', borderWidth:2.5, pointBackgroundColor:'#5DAC96', pointBorderColor:'#FFFFFF', pointBorderWidth:2, pointRadius:5, pointHoverRadius:7, tension:0.4, fill:true, spanGaps:true }] },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{backgroundColor:'#1B5271',titleColor:'#FFFFFF',bodyColor:'#9DD1C2',padding:12} },
      scales:{
        x:{ grid:{color:'rgba(209,228,222,0.5)'}, ticks:{color:'#7A9CA8',font:{family:'Outfit',size:11}} },
        y:{ min:0, max:100, grid:{color:'rgba(209,228,222,0.5)'}, ticks:{color:'#7A9CA8',font:{family:'Outfit',size:11},callback:v=>v+'%'} }
      }
    }
  });
}

function renderDonutChart() {
  const canvas = document.getElementById('donutChart');
  if (!canvas || !window.Chart) return;
  const ex = Chart.getChart(canvas); if (ex) ex.destroy();
  const patients = getDoctorPatients();
  const good = patients.filter(p=>p.rate>=80).length;
  const fair = patients.filter(p=>p.rate>=60&&p.rate<80).length;
  const risk = patients.filter(p=>p.rate<60).length;
  new Chart(canvas.getContext('2d'), {
    type:'doughnut',
    data:{ labels:['Good ≥80%','Fair 60–79%','At Risk <60%'], datasets:[{ data:[good,fair,risk], backgroundColor:['rgba(93,172,150,0.85)','rgba(217,138,42,0.85)','rgba(217,79,79,0.85)'], borderColor:'#FFFFFF', borderWidth:3, hoverOffset:8 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%', plugins:{ legend:{display:false}, tooltip:{backgroundColor:'#1B5271',titleColor:'#FFFFFF',bodyColor:'#9DD1C2'} } }
  });
}

/* ════════════════════════════════════════════════════════════════
   GLOBAL INIT
════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if      (path.includes('portal'))            initPortal();
  else if (path.includes('patient-dashboard')) initPatientDashboard();
  else if (path.includes('doctor-dashboard'))  initDoctorDashboard();
  else                                          seedDemoData();

  // Nav active highlight
  document.querySelectorAll('.nav-link').forEach(l => {
    const href = l.getAttribute('href');
    if (href && window.location.pathname.endsWith(href)) l.classList.add('active-link');
  });

  // Logout button
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', () => { clearSession(); window.location.href='portal.html'; });
  });
});

// Validate contact form
function validateForm() {
  const name  = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  if (!name||!email) { showToast('Please fill required fields.','error'); return false; }
  showToast("Inquiry submitted! We'll respond within 24 hours.");
  return false;
}
