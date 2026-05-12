// ─── DawaTrack Core JS ───────────────────────────────────────────────────────

const DB = {
  get: (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

// ─── SEED DEMO DATA ───────────────────────────────────────────────────────────
function seedDemoData() {
  if (DB.get('dt_seeded')) return;
  const logs = [
    // p_self — the logged-in patient (shows on Patient Dashboard)
    { id: 1,  patientId: 'p_self', patientName: 'You (Demo Patient)', medicine: 'Metformin 500mg',  date: '2026-05-05', taken: true,  notes: 'Taken after breakfast',  doctorComment: 'Great consistency, keep it up!',           time: '08:15' },
    { id: 2,  patientId: 'p_self', patientName: 'You (Demo Patient)', medicine: 'Metformin 500mg',  date: '2026-05-06', taken: true,  notes: '',                       doctorComment: '',                                         time: '08:30' },
    { id: 3,  patientId: 'p_self', patientName: 'You (Demo Patient)', medicine: 'Metformin 500mg',  date: '2026-05-07', taken: false, notes: 'Forgot — was travelling',doctorComment: 'Please set a phone alarm for 8am daily.',  time: null   },
    { id: 4,  patientId: 'p_self', patientName: 'You (Demo Patient)', medicine: 'Metformin 500mg',  date: '2026-05-08', taken: true,  notes: 'Slight nausea',          doctorComment: 'Normal side effect, try with more water.', time: '08:45' },
    { id: 5,  patientId: 'p_self', patientName: 'You (Demo Patient)', medicine: 'Metformin 500mg',  date: '2026-05-09', taken: true,  notes: '',                       doctorComment: '',                                         time: '08:10' },
    { id: 6,  patientId: 'p_self', patientName: 'You (Demo Patient)', medicine: 'Metformin 500mg',  date: '2026-05-10', taken: true,  notes: '',                       doctorComment: 'Well done! 5/6 this week.',                time: '08:05' },
    { id: 7,  patientId: 'p_self', patientName: 'You (Demo Patient)', medicine: 'Vitamin D 1000IU', date: '2026-05-07', taken: true,  notes: 'With lunch',             doctorComment: '',                                         time: '13:00' },
    { id: 8,  patientId: 'p_self', patientName: 'You (Demo Patient)', medicine: 'Vitamin D 1000IU', date: '2026-05-08', taken: true,  notes: '',                       doctorComment: '',                                         time: '13:15' },
    { id: 9,  patientId: 'p_self', patientName: 'You (Demo Patient)', medicine: 'Vitamin D 1000IU', date: '2026-05-09', taken: false, notes: 'Ran out of supply',      doctorComment: 'Please refill prescription this week.',     time: null   },
    { id: 10, patientId: 'p_self', patientName: 'You (Demo Patient)', medicine: 'Vitamin D 1000IU', date: '2026-05-10', taken: true,  notes: 'Refilled',               doctorComment: '',                                         time: '13:00' },
    // p1 — Alice Kamau
    { id: 11, patientId: 'p1', patientName: 'Alice Kamau',  medicine: 'Metformin 500mg', date: '2026-05-05', taken: true,  notes: '',               doctorComment: 'Great consistency!',                     time: '08:00' },
    { id: 12, patientId: 'p1', patientName: 'Alice Kamau',  medicine: 'Metformin 500mg', date: '2026-05-06', taken: true,  notes: '',               doctorComment: '',                                       time: '08:10' },
    { id: 13, patientId: 'p1', patientName: 'Alice Kamau',  medicine: 'Metformin 500mg', date: '2026-05-07', taken: true,  notes: 'Felt fine',      doctorComment: '',                                       time: '08:05' },
    { id: 14, patientId: 'p1', patientName: 'Alice Kamau',  medicine: 'Metformin 500mg', date: '2026-05-08', taken: true,  notes: '',               doctorComment: '',                                       time: '07:55' },
    { id: 15, patientId: 'p1', patientName: 'Alice Kamau',  medicine: 'Metformin 500mg', date: '2026-05-09', taken: true,  notes: '',               doctorComment: 'Keep it up.',                            time: '08:20' },
    { id: 16, patientId: 'p1', patientName: 'Alice Kamau',  medicine: 'Metformin 500mg', date: '2026-05-10', taken: true,  notes: '',               doctorComment: '',                                       time: '08:00' },
    { id: 17, patientId: 'p1', patientName: 'Alice Kamau',  medicine: 'Metformin 500mg', date: '2026-05-11', taken: false, notes: 'Public holiday', doctorComment: '',                                       time: null   },
    // p2 — James Otieno
    { id: 18, patientId: 'p2', patientName: 'James Otieno', medicine: 'Amlodipine 10mg', date: '2026-05-05', taken: false, notes: 'Forgot',        doctorComment: 'Please set a phone reminder.',           time: null   },
    { id: 19, patientId: 'p2', patientName: 'James Otieno', medicine: 'Amlodipine 10mg', date: '2026-05-06', taken: true,  notes: '',              doctorComment: '',                                        time: '07:45' },
    { id: 20, patientId: 'p2', patientName: 'James Otieno', medicine: 'Amlodipine 10mg', date: '2026-05-07', taken: false, notes: 'Was traveling', doctorComment: '',                                        time: null   },
    { id: 21, patientId: 'p2', patientName: 'James Otieno', medicine: 'Amlodipine 10mg', date: '2026-05-08', taken: true,  notes: '',              doctorComment: '',                                        time: '07:55' },
    { id: 22, patientId: 'p2', patientName: 'James Otieno', medicine: 'Amlodipine 10mg', date: '2026-05-09', taken: true,  notes: '',              doctorComment: '',                                        time: '08:00' },
    { id: 23, patientId: 'p2', patientName: 'James Otieno', medicine: 'Amlodipine 10mg', date: '2026-05-10', taken: false, notes: 'Busy day',      doctorComment: 'Adherence dropping — please follow up.', time: null   },
    { id: 24, patientId: 'p2', patientName: 'James Otieno', medicine: 'Amlodipine 10mg', date: '2026-05-11', taken: true,  notes: '',              doctorComment: '',                                        time: '07:50' },
    // p3 — Fatuma Njeri
    { id: 25, patientId: 'p3', patientName: 'Fatuma Njeri', medicine: 'Lisinopril 20mg', date: '2026-05-05', taken: false, notes: '',              doctorComment: 'Urgent: 2 missed doses. Call clinic.',   time: null   },
    { id: 26, patientId: 'p3', patientName: 'Fatuma Njeri', medicine: 'Lisinopril 20mg', date: '2026-05-06', taken: false, notes: 'Feeling unwell',doctorComment: '',                                        time: null   },
    { id: 27, patientId: 'p3', patientName: 'Fatuma Njeri', medicine: 'Lisinopril 20mg', date: '2026-05-07', taken: true,  notes: 'Back on track', doctorComment: 'Good. Continue as prescribed.',          time: '10:20' },
    { id: 28, patientId: 'p3', patientName: 'Fatuma Njeri', medicine: 'Lisinopril 20mg', date: '2026-05-08', taken: false, notes: '',              doctorComment: '',                                        time: null   },
    { id: 29, patientId: 'p3', patientName: 'Fatuma Njeri', medicine: 'Lisinopril 20mg', date: '2026-05-09', taken: false, notes: 'Still unwell',  doctorComment: 'Please visit clinic immediately.',       time: null   },
    { id: 30, patientId: 'p3', patientName: 'Fatuma Njeri', medicine: 'Lisinopril 20mg', date: '2026-05-10', taken: true,  notes: '',              doctorComment: '',                                        time: '09:00' },
    { id: 31, patientId: 'p3', patientName: 'Fatuma Njeri', medicine: 'Lisinopril 20mg', date: '2026-05-11', taken: false, notes: '',              doctorComment: '',                                        time: null   },
  ];
  DB.set('dt_logs', logs);
  DB.set('dt_next_id', 32);
  DB.set('dt_seeded', true);
}

function getLogs()        { return DB.get('dt_logs') || []; }
function saveLogs(logs)   { DB.set('dt_logs', logs); }
function nextId()         { const id = DB.get('dt_next_id') || 1; DB.set('dt_next_id', id + 1); return id; }

function adherenceRate(logs) {
  if (!logs.length) return 0;
  return Math.round((logs.filter(l => l.taken).length / logs.length) * 100);
}
function adherenceBadge(rate) {
  if (rate >= 80) return `<span class="badge badge-green">✓ ${rate}%</span>`;
  if (rate >= 50) return `<span class="badge badge-amber">⚠ ${rate}%</span>`;
  return `<span class="badge badge-red">✗ ${rate}%</span>`;
}
function riskLabel(rate) {
  if (rate >= 80) return '<span class="badge badge-green">Low Risk</span>';
  if (rate >= 50) return '<span class="badge badge-amber">Medium Risk</span>';
  return '<span class="badge badge-red">High Risk</span>';
}
function formatDate(str) {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(message, type = 'success') {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast-item ${type}`;
  const clr = type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--blue)';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  t.innerHTML = `<span style="color:${clr};font-weight:700;font-size:1.1rem;">${icon}</span><span style="font-size:0.875rem;color:var(--text2);">${message}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.cssText += 'opacity:0;transform:translateX(20px);transition:all 0.3s ease;'; setTimeout(() => t.remove(), 300); }, 3500);
}

function validateForm() {
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  if (!name || !email) { showToast('Please fill in all required fields.', 'error'); return false; }
  showToast("Inquiry submitted! We'll be in touch shortly.");
  return false;
}

// ─── PATIENT DASHBOARD ────────────────────────────────────────────────────────
function initPatientDashboard() {
  seedDemoData();
  renderPatientLogs();
  updatePatientKPIs();
  syncSidebarAdherence();
  // Chart needs Chart.js loaded first
  setTimeout(renderPatientWeeklyChart, 150);

  const form = document.getElementById('medicationForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const medicine = document.getElementById('medicine').value.trim();
      const date     = document.getElementById('date').value;
      const taken    = document.getElementById('taken').checked;
      const notes    = document.getElementById('notes').value.trim();
      const time     = document.getElementById('medTime')?.value || null;
      if (!medicine || !date) { showToast('Please fill in required fields.', 'error'); return; }
      const logs = getLogs();
      logs.push({ id: nextId(), patientId: 'p_self', patientName: 'You (Demo Patient)', medicine, date, taken, notes, doctorComment: '', time: time || null, loggedAt: new Date().toISOString() });
      saveLogs(logs);
      renderPatientLogs();
      updatePatientKPIs();
      syncSidebarAdherence();
      form.reset();
      document.getElementById('date').valueAsDate = new Date();
      toggleStatus(null);
      showToast('Medication logged successfully!');
    });
  }
}

function renderPatientLogs() {
  const container = document.getElementById('patientLogsList');
  if (!container) return;
  const logs = getLogs().filter(l => l.patientId === 'p_self').slice().reverse();
  if (!logs.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);">
        <div style="font-size:3rem;margin-bottom:16px;">💊</div>
        <div style="font-weight:600;color:var(--text);margin-bottom:8px;">No medications logged yet</div>
        <p style="font-size:0.875rem;color:var(--text3);">Use the form above to record your first dose.</p>
      </div>`;
    return;
  }
  container.innerHTML = logs.map(log => `
    <div class="card mb-3">
      <div class="card-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:48px;height:48px;border-radius:14px;background:${log.taken?'rgba(52,211,153,0.12)':'rgba(248,113,113,0.12)'};border:1px solid ${log.taken?'rgba(52,211,153,0.3)':'rgba(248,113,113,0.3)'};display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">${log.taken?'✅':'❌'}</div>
            <div>
              <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;color:var(--text);">${log.medicine}</div>
              <div style="font-size:0.78rem;color:var(--text3);margin-top:4px;">📅 ${formatDate(log.date)}${log.time?' &nbsp;⏰ '+log.time:''}</div>
            </div>
          </div>
          <div>${log.taken?'<span class="badge badge-green">✓ Taken</span>':'<span class="badge badge-red">✗ Missed</span>'}</div>
        </div>
        ${log.notes?`<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;gap:8px;"><span style="color:var(--text3);">📝</span><p style="font-size:0.875rem;color:var(--text2);margin:0;line-height:1.6;">${log.notes}</p></div>`:''}
        ${log.doctorComment?`
          <div style="background:rgba(74,158,255,0.07);border:1px solid rgba(74,158,255,0.18);border-radius:10px;padding:12px 16px;margin-top:12px;display:flex;gap:10px;align-items:flex-start;">
            <span style="font-size:1.1rem;flex-shrink:0;">🩺</span>
            <div>
              <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--blue);margin-bottom:5px;">Doctor's Note</div>
              <p style="font-size:0.875rem;color:var(--text2);margin:0;line-height:1.6;">${log.doctorComment}</p>
            </div>
          </div>`:''}
      </div>
    </div>`).join('');
}

function updatePatientKPIs() {
  const logs  = getLogs().filter(l => l.patientId === 'p_self');
  const rate  = adherenceRate(logs);
  const taken = logs.filter(l => l.taken).length;
  const missed= logs.filter(l => !l.taken).length;
  const set   = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  set('kpi-total', logs.length);
  set('kpi-taken', taken);
  set('kpi-missed', missed);
  set('kpi-rate', rate+'%');
  const bar = document.getElementById('adherence-bar-fill');
  if (bar) { bar.style.width=rate+'%'; bar.className='adherence-fill'+(rate>=80?'':rate>=50?' warning':' danger'); }
}

function syncSidebarAdherence() {
  const logs = getLogs().filter(l => l.patientId === 'p_self');
  const rate = adherenceRate(logs);
  const el  = document.getElementById('sidebar-rate');
  const bar = document.getElementById('sidebar-bar');
  if (el)  el.textContent = logs.length ? rate+'%' : '—';
  if (bar) { bar.style.width=(logs.length?rate:0)+'%'; bar.className='adherence-fill'+(rate>=80?'':rate>=50?' warning':' danger'); }
}

function renderPatientWeeklyChart() {
  const canvas = document.getElementById('patientWeeklyChart');
  if (!canvas || !window.Chart) return;
  // destroy existing if any
  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();

  const allLogs = getLogs().filter(l => l.patientId === 'p_self');
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date('2026-05-11'); d.setDate(d.getDate()-i); days.push(d.toISOString().split('T')[0]); }
  const taken  = days.map(day => allLogs.filter(l => l.date===day && l.taken).length);
  const missed = days.map(day => allLogs.filter(l => l.date===day && !l.taken).length);
  const labels = days.map(d => parseInt(d.split('-')[2])+' May');

  new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Taken',  data: taken,  backgroundColor: 'rgba(52,211,153,0.75)', borderColor: '#34d399', borderWidth:1, borderRadius:6 },
        { label: 'Missed', data: missed, backgroundColor: 'rgba(248,113,113,0.5)', borderColor: '#f87171', borderWidth:1, borderRadius:6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display:true, labels:{ color:'#8899b4', font:{family:'DM Sans',size:11}, boxWidth:12, padding:16 } },
        tooltip: { backgroundColor:'#0d1b2e', borderColor:'rgba(99,222,210,0.2)', borderWidth:1, titleColor:'#e8edf5', bodyColor:'#8899b4', padding:12 }
      },
      scales: {
        x: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#5a6a82',font:{family:'DM Sans',size:11}} },
        y: { beginAtZero:true, grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#5a6a82',stepSize:1,font:{family:'DM Sans',size:11}} }
      }
    }
  });
}

// ─── DOCTOR DASHBOARD ─────────────────────────────────────────────────────────
function initDoctorDashboard() {
  seedDemoData();
  renderDoctorOverview();
  renderDoctorPatientList('all');
  // Charts need Chart.js — defer slightly
  setTimeout(() => { renderAdherenceChart(); renderDonutChart(); updateSidebarAtRisk(); }, 150);
}

function renderDoctorOverview() {
  const logs = getLogs().filter(l => l.patientId !== 'p_self');
  const pids = [...new Set(logs.map(l => l.patientId))];
  const set  = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  set('dr-patients', pids.length);
  set('dr-rate',     adherenceRate(logs)+'%');
  set('dr-atrisk',   pids.filter(pid => adherenceRate(logs.filter(l=>l.patientId===pid)) < 60).length);
  set('dr-logs',     logs.length);
}

function updateSidebarAtRisk() {
  const logs = getLogs().filter(l => l.patientId !== 'p_self');
  const pids = [...new Set(logs.map(l => l.patientId))];
  const n    = pids.filter(pid => adherenceRate(logs.filter(l=>l.patientId===pid)) < 60).length;
  const el   = document.getElementById('sidebar-atrisk');
  if (el) el.textContent = n;
}

function renderDoctorPatientList(filter) {
  const container = document.getElementById('doctorPatientList');
  if (!container) return;
  const allLogs = getLogs().filter(l => l.patientId !== 'p_self');
  const pids    = [...new Set(allLogs.map(l => l.patientId))];
  let patients  = pids.map(pid => {
    const pLogs = allLogs.filter(l => l.patientId === pid);
    return { pid, name: pLogs[0]?.patientName || pid, logs: pLogs, rate: adherenceRate(pLogs) };
  });
  if (filter === 'atrisk') patients = patients.filter(p => p.rate < 60);
  else if (filter === 'good') patients = patients.filter(p => p.rate >= 80);
  patients.sort((a,b) => a.rate - b.rate);

  if (!patients.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text3);">No patients match this filter.</div>`;
    return;
  }

  container.innerHTML = patients.map(p => {
    const initials = p.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
    const avatarBg = p.rate>=80 ? 'linear-gradient(135deg,#2ec4b6,#4a9eff)' : p.rate>=50 ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'linear-gradient(135deg,#f87171,#e11d48)';
    const recent   = p.logs.slice(-7);
    const sparks   = recent.map(l => `<div class="spark-bar" style="height:${l.taken?Math.floor(Math.random()*30+60):18}%;background:${l.taken?'linear-gradient(to top,#2ec4b6,#4a9eff)':'#f87171'};opacity:${l.taken?'0.85':'0.35'};"></div>`).join('');
    const rows     = p.logs.slice().reverse().map(log => `
      <tr>
        <td style="white-space:nowrap;">${formatDate(log.date)}</td>
        <td style="color:var(--text);font-weight:500;">${log.medicine}</td>
        <td>${log.taken?'<span class="badge badge-green">✓ Taken</span>':'<span class="badge badge-red">✗ Missed</span>'}</td>
        <td style="color:var(--text3);">${log.time||'—'}</td>
        <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2);">${log.notes||'—'}</td>
        <td>
          <input type="text" placeholder="Add note…" value="${log.doctorComment||''}" id="dc-${log.id}"
            onclick="event.stopPropagation()"
            style="background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:0.78rem;padding:5px 10px;width:160px;font-family:'DM Sans',sans-serif;">
        </td>
        <td><button class="btn-secondary" onclick="saveDoctorComment(${log.id},event)" style="font-size:0.75rem;padding:5px 12px;">Save</button></td>
      </tr>`).join('');

    return `
      <div class="card mb-3" style="cursor:pointer;" onclick="togglePatientDetail('${p.pid}')">
        <div class="card-body">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <div class="patient-avatar" style="background:${avatarBg};width:48px;height:48px;font-size:1rem;flex-shrink:0;">${initials}</div>
            <div style="flex:1;min-width:120px;">
              <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:0.95rem;color:var(--text);">${p.name}</div>
              <div style="font-size:0.75rem;color:var(--text3);margin-top:2px;">${p.logs[0]?.medicine||'—'} &nbsp;·&nbsp; ${p.logs.length} entries</div>
            </div>
            <div style="min-width:90px;">
              ${adherenceBadge(p.rate)}
              <div class="adherence-bar" style="margin-top:6px;width:90px;">
                <div class="adherence-fill${p.rate>=80?'':p.rate>=50?' warning':' danger'}" style="width:${p.rate}%;"></div>
              </div>
            </div>
            <div class="sparkline" style="width:72px;height:36px;">${sparks}</div>
            <div>${riskLabel(p.rate)}</div>
            <div style="color:var(--text3);font-size:0.75rem;margin-left:auto;user-select:none;" id="arrow-${p.pid}">▼ expand</div>
          </div>
          <div id="detail-${p.pid}" style="display:none;margin-top:20px;padding-top:20px;border-top:1px solid var(--border);">
            <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:0.9rem;color:var(--text);margin-bottom:14px;">📋 Full Medication Log</div>
            <div style="overflow-x:auto;">
              <table class="dt-table" style="min-width:700px;">
                <thead><tr><th>Date</th><th>Medication</th><th>Status</th><th>Time</th><th>Patient Notes</th><th>Doctor Comment</th><th></th></tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

function togglePatientDetail(pid) {
  const el    = document.getElementById(`detail-${pid}`);
  const arrow = document.getElementById(`arrow-${pid}`);
  if (!el) return;
  const open = el.style.display === 'block';
  el.style.display = open ? 'none' : 'block';
  if (arrow) arrow.textContent = open ? '▼ expand' : '▲ collapse';
}

function saveDoctorComment(logId, e) {
  e.stopPropagation();
  const input = document.getElementById(`dc-${logId}`);
  if (!input) return;
  const logs = getLogs();
  const idx  = logs.findIndex(l => l.id === logId);
  if (idx !== -1) { logs[idx].doctorComment = input.value.trim(); saveLogs(logs); showToast('Comment saved!'); }
}

function renderAdherenceChart() {
  const canvas = document.getElementById('adherenceChart');
  if (!canvas || !window.Chart) return;
  const ex = Chart.getChart(canvas); if (ex) ex.destroy();
  const logs = getLogs().filter(l => l.patientId !== 'p_self');
  const days = [];
  for (let i=6;i>=0;i--) { const d=new Date('2026-05-11'); d.setDate(d.getDate()-i); days.push(d.toISOString().split('T')[0]); }
  const rates  = days.map(day => { const dl=logs.filter(l=>l.date===day); return dl.length?adherenceRate(dl):null; });
  const labels = days.map(d => parseInt(d.split('-')[2])+' May');
  new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: { labels, datasets: [{ label:'Adherence %', data:rates, borderColor:'#63ded2', backgroundColor:'rgba(99,222,210,0.07)', borderWidth:2.5, pointBackgroundColor:'#63ded2', pointBorderColor:'#0d1b2e', pointBorderWidth:2, pointRadius:5, pointHoverRadius:8, tension:0.4, fill:true, spanGaps:true }] },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: { legend:{display:false}, tooltip:{backgroundColor:'#0d1b2e',borderColor:'rgba(99,222,210,0.25)',borderWidth:1,titleColor:'#e8edf5',bodyColor:'#8899b4',padding:12} },
      scales: {
        x: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#5a6a82',font:{family:'DM Sans',size:11}} },
        y: { min:0,max:100, grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#5a6a82',font:{family:'DM Sans',size:11},callback:v=>v+'%'} }
      }
    }
  });
}

function renderDonutChart() {
  const canvas = document.getElementById('donutChart');
  if (!canvas || !window.Chart) return;
  const ex = Chart.getChart(canvas); if (ex) ex.destroy();
  const logs = getLogs().filter(l => l.patientId !== 'p_self');
  const pids = [...new Set(logs.map(l=>l.patientId))];
  const good = pids.filter(pid => adherenceRate(logs.filter(l=>l.patientId===pid)) >= 80).length;
  const fair = pids.filter(pid => { const r=adherenceRate(logs.filter(l=>l.patientId===pid)); return r>=60&&r<80; }).length;
  const risk = pids.filter(pid => adherenceRate(logs.filter(l=>l.patientId===pid)) < 60).length;
  new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: { labels:['Good ≥80%','Fair 60–79%','At Risk <60%'], datasets:[{ data:[good||0,fair||0,risk||0], backgroundColor:['rgba(52,211,153,0.8)','rgba(251,191,36,0.8)','rgba(248,113,113,0.8)'], borderColor:'#080f1f', borderWidth:3, hoverOffset:10 }] },
    options: {
      responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins: { legend:{display:false}, tooltip:{backgroundColor:'#0d1b2e',borderColor:'rgba(99,222,210,0.2)',borderWidth:1,titleColor:'#e8edf5',bodyColor:'#8899b4'} }
    }
  });
}

function filterPatients(filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-filter="${filter}"]`);
  if (btn) btn.classList.add('active');
  renderDoctorPatientList(filter);
}

// ─── GLOBAL INIT ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if      (path.includes('patient-dashboard')) initPatientDashboard();
  else if (path.includes('doctor-dashboard'))  initDoctorDashboard();
  else seedDemoData();

  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && window.location.pathname.endsWith(href)) link.classList.add('active-link');
  });
});
