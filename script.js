/* ═══════════════════════════════════════════════════════════════════
   DAWATRACK · script.js  v4
   Auth · Forgot Password · Doctor Selection by Patient ·
   Medication Scheduling (interval/hrs) · SMS Simulation ·
   Caregivers (incl. Me) · Care Feed · Pharmacy Bridge
═══════════════════════════════════════════════════════════════════ */

/* ── Storage ─────────────────────────────────────────────────── */
const DB = {
  get : k     => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set : (k,v) => localStorage.setItem(k, JSON.stringify(v)),
  del : k     => localStorage.removeItem(k),
};

/* ── Session ─────────────────────────────────────────────────── */
function getSession()      { return DB.get('dt_session'); }
function setSession(s)     { DB.set('dt_session', s); }
function clearSession()    { DB.del('dt_session'); }
function requireRole(role) {
  const s = getSession();
  if (!s || s.role !== role) { window.location.href = 'portal.html'; }
}

/* ── Seed ────────────────────────────────────────────────────── */
/* Date relative to today (n days ago; negative = future) → 'YYYY-MM-DD' */
function daysAgoISO(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* Ordered list of the last 7 day-strings (oldest → today), anchored to now */
function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(daysAgoISO(i));
  return days;
}

function seedDemoData() {
  if (DB.get('dt_seeded_v5')) return;

  /* Live dates: latest demo day = today, going back 6 days */
  const D11 = daysAgoISO(0);   // most recent
  const D10 = daysAgoISO(1);
  const D9  = daysAgoISO(2);
  const D8  = daysAgoISO(3);
  const D7  = daysAgoISO(4);
  const D6  = daysAgoISO(5);
  const D5  = daysAgoISO(6);   // oldest in the 7-day window

  DB.set('dt_users', [
    { id:'p_self', role:'patient', name:'Alice Kamau',       email:'patient@demo.com',   password:'demo123', phone:'+254711000001', doctorId:'doc1' },
    { id:'p2',     role:'patient', name:'James Otieno',      email:'james@demo.com',     password:'demo123', phone:'+254711000002', doctorId:'doc1' },
    { id:'p3',     role:'patient', name:'Fatuma Njeri',      email:'fatuma@demo.com',    password:'demo123', phone:'+254711000003', doctorId:'doc1' },
    { id:'doc1',   role:'doctor',  name:'Dr. David Mwangi',  email:'doctor@demo.com',    password:'demo123', phone:'+254700000001', specialty:'General Medicine',  hospital:'HAMAT Hospital' },
    { id:'doc2',   role:'doctor',  name:'Dr. Sarah Ouma',    email:'sarah@demo.com',     password:'demo123', phone:'+254700000002', specialty:'Internal Medicine', hospital:'HAMAT Hospital' },
    { id:'doc3',   role:'doctor',  name:'Dr. Peter Njagi',   email:'peter@demo.com',     password:'demo123', phone:'+254700000003', specialty:'Cardiology',        hospital:'HAMAT Hospital' },
  ]);

  DB.set('dt_logs', [
    { id:1,  patientId:'p_self', medicine:'Metformin 500mg',  dosage:'500mg',  date:D5,  taken:true,  notes:'After breakfast', time:'08:15', loggedAt:`${D5}T08:15:00`, scheduleId:null },
    { id:2,  patientId:'p_self', medicine:'Metformin 500mg',  dosage:'500mg',  date:D6,  taken:true,  notes:'',               time:'08:30', loggedAt:`${D6}T08:30:00`, scheduleId:null },
    { id:3,  patientId:'p_self', medicine:'Metformin 500mg',  dosage:'500mg',  date:D7,  taken:false, notes:'Forgot',         time:null,    loggedAt:`${D7}T09:00:00`, scheduleId:null },
    { id:4,  patientId:'p_self', medicine:'Metformin 500mg',  dosage:'500mg',  date:D8,  taken:true,  notes:'Slight nausea',  time:'08:45', loggedAt:`${D8}T08:45:00`, scheduleId:null },
    { id:5,  patientId:'p_self', medicine:'Metformin 500mg',  dosage:'500mg',  date:D9,  taken:true,  notes:'',               time:'08:10', loggedAt:`${D9}T08:10:00`, scheduleId:null },
    { id:6,  patientId:'p_self', medicine:'Metformin 500mg',  dosage:'500mg',  date:D10, taken:true,  notes:'',               time:'08:05', loggedAt:`${D10}T08:05:00`, scheduleId:null },
    { id:7,  patientId:'p_self', medicine:'Vitamin D 1000IU', dosage:'1000IU', date:D7,  taken:true,  notes:'With lunch',     time:'13:00', loggedAt:`${D7}T13:00:00`, scheduleId:null },
    { id:8,  patientId:'p_self', medicine:'Vitamin D 1000IU', dosage:'1000IU', date:D8,  taken:true,  notes:'',               time:'13:15', loggedAt:`${D8}T13:15:00`, scheduleId:null },
    { id:9,  patientId:'p_self', medicine:'Vitamin D 1000IU', dosage:'1000IU', date:D9,  taken:false, notes:'Ran out',        time:null,    loggedAt:`${D9}T13:00:00`, scheduleId:null },
    { id:10, patientId:'p_self', medicine:'Vitamin D 1000IU', dosage:'1000IU', date:D10, taken:true,  notes:'Refilled',       time:'13:00', loggedAt:`${D10}T13:00:00`, scheduleId:null },
    { id:11, patientId:'p2', medicine:'Amlodipine 10mg', dosage:'10mg', date:D5,  taken:false, notes:'Forgot',       time:null,    loggedAt:`${D5}T09:00:00`,  scheduleId:null },
    { id:12, patientId:'p2', medicine:'Amlodipine 10mg', dosage:'10mg', date:D6,  taken:true,  notes:'',             time:'07:45', loggedAt:`${D6}T07:45:00`,  scheduleId:null },
    { id:13, patientId:'p2', medicine:'Amlodipine 10mg', dosage:'10mg', date:D7,  taken:false, notes:'Travelling',   time:null,    loggedAt:`${D7}T09:00:00`,  scheduleId:null },
    { id:14, patientId:'p2', medicine:'Amlodipine 10mg', dosage:'10mg', date:D8,  taken:true,  notes:'',             time:'07:55', loggedAt:`${D8}T07:55:00`,  scheduleId:null },
    { id:15, patientId:'p2', medicine:'Amlodipine 10mg', dosage:'10mg', date:D9,  taken:true,  notes:'',             time:'08:00', loggedAt:`${D9}T08:00:00`,  scheduleId:null },
    { id:16, patientId:'p2', medicine:'Amlodipine 10mg', dosage:'10mg', date:D10, taken:false, notes:'Busy day',     time:null,    loggedAt:`${D10}T09:00:00`, scheduleId:null },
    { id:17, patientId:'p2', medicine:'Amlodipine 10mg', dosage:'10mg', date:D11, taken:true,  notes:'',             time:'07:50', loggedAt:`${D11}T07:50:00`, scheduleId:null },
    { id:18, patientId:'p3', medicine:'Lisinopril 20mg', dosage:'20mg', date:D5,  taken:false, notes:'',             time:null,    loggedAt:`${D5}T09:00:00`,  scheduleId:null },
    { id:19, patientId:'p3', medicine:'Lisinopril 20mg', dosage:'20mg', date:D6,  taken:false, notes:'Unwell',       time:null,    loggedAt:`${D6}T09:00:00`,  scheduleId:null },
    { id:20, patientId:'p3', medicine:'Lisinopril 20mg', dosage:'20mg', date:D7,  taken:true,  notes:'Back on track',time:'10:20', loggedAt:`${D7}T10:20:00`,  scheduleId:null },
    { id:21, patientId:'p3', medicine:'Lisinopril 20mg', dosage:'20mg', date:D8,  taken:false, notes:'',             time:null,    loggedAt:`${D8}T09:00:00`,  scheduleId:null },
    { id:22, patientId:'p3', medicine:'Lisinopril 20mg', dosage:'20mg', date:D9,  taken:false, notes:'Still unwell', time:null,    loggedAt:`${D9}T09:00:00`,  scheduleId:null },
    { id:23, patientId:'p3', medicine:'Lisinopril 20mg', dosage:'20mg', date:D10, taken:true,  notes:'',             time:'09:00', loggedAt:`${D10}T09:00:00`, scheduleId:null },
    { id:24, patientId:'p3', medicine:'Lisinopril 20mg', dosage:'20mg', date:D11, taken:false, notes:'',             time:null,    loggedAt:`${D11}T09:00:00`, scheduleId:null },
  ]);

  DB.set('dt_notes', [
    { id:1, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p_self', logId:3,  message:'You missed your dose on the 7th. Please set a daily alarm at 8am to stay consistent.', type:'reminder', createdAt:`${D7}T14:00:00`, read:false },
    { id:2, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p_self', logId:4,  message:'The nausea with Metformin is normal. Try taking it with a full meal and a large glass of water.', type:'advice', createdAt:`${D8}T16:30:00`, read:false },
    { id:3, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p_self', logId:6,  message:'Excellent work this week! 5 out of 6 doses taken. Your blood sugar management is improving.', type:'praise', createdAt:`${D10}T09:00:00`, read:false },
    { id:4, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p_self', logId:9,  message:'You are running low on Vitamin D. Please refill before the end of the week.', type:'urgent', createdAt:`${D9}T17:00:00`, read:false },
    { id:5, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p2',     logId:11, message:'James, missing blood pressure medication can be risky — please prioritise this daily.', type:'reminder', createdAt:`${D5}T18:00:00`, read:false },
    { id:6, doctorId:'doc1', doctorName:'Dr. David Mwangi', patientId:'p3',     logId:18, message:'Fatuma, 2 missed doses is a concern. Please call the clinic at your earliest convenience.', type:'urgent', createdAt:`${D6}T10:00:00`, read:false },
  ]);

  DB.set('dt_caregivers', [
    { id:'cg1', patientId:'p_self', name:'John Kamau',  phone:'+254722000001', relationship:'spouse',   reminders:true, isMe:false },
    { id:'cg2', patientId:'p_self', name:'Grace Kamau', phone:'+254733000002', relationship:'daughter', reminders:true, isMe:false },
  ]);

  DB.set('dt_schedules', [
    { id:'sch1', patientId:'p_self', medicine:'Metformin 500mg', dosage:'500mg', startDate:daysAgoISO(10), endDate:daysAgoISO(-20), intervalHrs:8, firstDoseTime:'08:00', notes:'After meals', active:true, createdAt:`${daysAgoISO(10)}T07:00:00` },
  ]);

  DB.set('dt_med_requests', [
    { id:'req1', patientId:'p_self', patientName:'Alice Kamau', medicine:'Vitamin D 1000IU', dosage:'1000IU', message:'Ran out — please advise how to get a refill.', status:'pending', createdAt:`${D9}T13:05:00` },
  ]);

  DB.set('dt_disp_log',  []);
  DB.set('dt_ph_notes',  []);
  DB.set('dt_sms_log',   []);

  DB.set('dt_next_log_id',  25);
  DB.set('dt_next_note_id',  7);
  DB.set('dt_next_req_id',   2);
  DB.set('dt_next_cg_id',    3);
  DB.set('dt_next_sch_id',   2);
  DB.del('dt_seeded');
  DB.set('dt_seeded_v5', true);
}

/* ── Getters ─────────────────────────────────────────────────── */
function getLogs()       { return DB.get('dt_logs')        || []; }
function getNotes()      { return DB.get('dt_notes')       || []; }
function getUsers()      { return DB.get('dt_users')       || []; }
function getCaregivers() { return DB.get('dt_caregivers')  || []; }
function getMedRequests(){ return DB.get('dt_med_requests')|| []; }
function getDispLog()    { return DB.get('dt_disp_log')    || []; }
function getPhNotes()    { return DB.get('dt_ph_notes')    || []; }
function getSchedules()  { return DB.get('dt_schedules')   || []; }
function getSMSLog()     { return DB.get('dt_sms_log')     || []; }

/* ── Doctor helpers ─────────────────────────────────────────── */
/* Get all registered doctors */
function getDoctors() {
  return getUsers().filter(u => u.role === 'doctor');
}

/* Get the doctor assigned to a patient */
function getPatientDoctor(patientId) {
  const user = getUsers().find(u => u.id === patientId);
  if (!user || !user.doctorId) return null;
  return getUsers().find(u => u.id === user.doctorId) || null;
}

/* Assign a doctor to a patient */
function assignDoctor(patientId, doctorId) {
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === patientId);
  if (idx === -1) return;
  users[idx].doctorId = doctorId || null;
  DB.set('dt_users', users);
}

/* Get all patients assigned to a doctor */
function getDoctorPatientIds(doctorId) {
  return getUsers()
    .filter(u => u.role === 'patient' && u.doctorId === doctorId)
    .map(u => u.id);
}

/* ── Next-ID helpers ─────────────────────────────────────────── */
function nextLogId()  { const n=DB.get('dt_next_log_id') ||1; DB.set('dt_next_log_id', n+1); return n; }
function nextNoteId() { const n=DB.get('dt_next_note_id')||1; DB.set('dt_next_note_id',n+1); return n; }
function nextReqId()  { const n=DB.get('dt_next_req_id') ||1; DB.set('dt_next_req_id', n+1); return 'req'+n; }
function nextCgId()   { const n=DB.get('dt_next_cg_id')  ||1; DB.set('dt_next_cg_id',  n+1); return 'cg'+n; }
function nextSchId()  { const n=DB.get('dt_next_sch_id') ||1; DB.set('dt_next_sch_id', n+1); return 'sch'+n; }

/* ── Utility ─────────────────────────────────────────────────── */
function adherenceRate(logs) {
  if (!logs.length) return 0;
  return Math.round(logs.filter(l=>l.taken).length/logs.length*100);
}
function fmtDate(str) {
  if (!str) return '—';
  return new Date(str+'T00:00:00').toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'});
}
function fmtTime(isoStr) {
  if (!isoStr) return '';
  const d=new Date(isoStr), h=d.getHours(), m=d.getMinutes().toString().padStart(2,'0');
  return `${h%12||12}:${m} ${h>=12?'pm':'am'}`;
}
function timeAgo(iso) {
  const d=(Date.now()-new Date(iso))/1000;
  if(d<60)    return 'just now';
  if(d<3600)  return Math.floor(d/60)+'m ago';
  if(d<86400) return Math.floor(d/3600)+'h ago';
  return Math.floor(d/86400)+'d ago';
}
function dosesPerDay(hrs) { return Math.round(24/hrs); }

/* ── Toast ───────────────────────────────────────────────────── */
function showToast(msg, type='success') {
  let c=document.querySelector('.toast-container');
  if(!c){ c=document.createElement('div'); c.className='toast-container'; document.body.appendChild(c); }
  const t=document.createElement('div'); t.className=`toast-item ${type}`;
  const icon=type==='success'?'✓':type==='error'?'✗':'ℹ';
  const clr=type==='success'?'#2DAF83':type==='error'?'#D94F4F':'#3A8DC4';
  t.innerHTML=`<span style="color:${clr};font-weight:800;font-size:1.05rem;">${icon}</span><span style="font-size:0.875rem;color:#3A5563;">${msg}</span>`;
  c.appendChild(t);
  setTimeout(()=>{ t.style.cssText+='opacity:0;transform:translateX(16px);transition:all 0.3s;'; setTimeout(()=>t.remove(),300); },3800);
}

/* ── Badge helpers ───────────────────────────────────────────── */
function badgeAdherence(rate) {
  if(rate>=80) return `<span class="badge badge-green">✓ ${rate}%</span>`;
  if(rate>=50) return `<span class="badge badge-amber">⚠ ${rate}%</span>`;
  return `<span class="badge badge-red">✗ ${rate}%</span>`;
}
function riskBadge(rate) {
  if(rate>=80) return '<span class="badge badge-green">Low Risk</span>';
  if(rate>=50) return '<span class="badge badge-amber">Medium Risk</span>';
  return '<span class="badge badge-red">High Risk</span>';
}
function noteTypeStyle(type) {
  switch(type){
    case 'praise':   return {icon:'🌟',bg:'#EDF5F2',border:'#9DD1C2',accentBg:'#5DAC96',label:'Great news',labelColor:'#2E7A65'};
    case 'reminder': return {icon:'🔔',bg:'#FBF5E6',border:'#F0CC88',accentBg:'#D98A2A',label:'Reminder',  labelColor:'#A0620A'};
    case 'urgent':   return {icon:'⚠️',bg:'#FAF0F0',border:'#F0AAAA',accentBg:'#D94F4F',label:'Urgent',    labelColor:'#B03030'};
    case 'advice':   return {icon:'💊',bg:'#EAF3FA',border:'#9DD0F0',accentBg:'#3A8DC4',label:'Advice',    labelColor:'#1A6496'};
    case 'pharmacy': return {icon:'🏪',bg:'#EDF5F2',border:'#9DD1C2',accentBg:'#5DAC96',label:'Pharmacy',  labelColor:'#2E7A65'};
    default:         return {icon:'📋',bg:'#F4F8F7',border:'#D1E4DE',accentBg:'#1B5271',label:'Note',      labelColor:'#1B5271'};
  }
}
function relLabel(r) {
  const m={me:'Me (self)',spouse:'Spouse',partner:'Partner',parent:'Parent',sibling:'Sibling',child:'Child',relative:'Relative',caregiver:'Caregiver',friend:'Friend'};
  return m[r]||r;
}

/* ════════════════════════════════════════════════════════════════
   FORGOT PASSWORD — works on portal.html + pharmacy-dashboard
════════════════════════════════════════════════════════════════ */
window.openForgotModal = function() {
  const m=document.getElementById('forgotModal');
  if(m){ m.classList.add('open'); document.body.style.overflow='hidden'; }
  const inp=document.getElementById('forgotInput'); if(inp) inp.value='';
  const res=document.getElementById('forgotResult'); if(res) res.style.display='none';
};
window.closeForgotModal = function() {
  const m=document.getElementById('forgotModal');
  if(m){ m.classList.remove('open'); document.body.style.overflow=''; }
};
window.handleForgotPassword = function() {
  const raw=(document.getElementById('forgotInput')?.value||'').trim().toLowerCase();
  const result=document.getElementById('forgotResult');
  if(!raw){ showToast('Please enter your email or phone number.','error'); return; }

  const dtUsers=getUsers();
  let phUsers=[]; try{ phUsers=JSON.parse(localStorage.getItem('ph_users'))||[]; }catch{}
  const allUsers=[...dtUsers,...phUsers];

  const user=allUsers.find(u=>
    (u.email&&u.email.toLowerCase()===raw)||
    (u.phone&&u.phone.replace(/\s/g,'')===raw.replace(/\s/g,''))
  );
  if(!result) return;
  if(!user){
    result.style.display='block'; result.style.background='#FAE8E8'; result.style.border='1px solid #F0AAAA'; result.style.borderRadius='10px'; result.style.padding='13px 15px'; result.style.color='#B03030';
    result.innerHTML=`<div style="font-size:0.875rem;"><strong>No account found</strong><br>No account is registered with that email or phone number.</div>`;
    return;
  }
  const contact=user.phone||user.email;
  const masked=contact.length>6?contact.slice(0,3)+'****'+contact.slice(-3):'****';
  result.style.display='block'; result.style.background='#D5F3EB'; result.style.border='1px solid #A8E4D0'; result.style.borderRadius='10px'; result.style.padding='13px 15px'; result.style.color='#1E8A65';
  result.innerHTML=`<div style="font-size:0.875rem;line-height:1.7;"><strong>✓ Password reminder sent!</strong><br>A reminder was sent to <strong>${masked}</strong>.<br><br><span style="font-size:0.78rem;color:#7A9CA8;">(Demo mode — backend not yet connected. Your password is: <strong style="color:#1B5271;">${user.password}</strong>)</span></div>`;
};

/* ════════════════════════════════════════════════════════════════
   PORTAL — LOGIN / REGISTER
════════════════════════════════════════════════════════════════ */
function initPortal() {
  seedDemoData();
  const s=getSession();
  if(s){ window.location.href=s.role==='doctor'?'doctor-dashboard.html':'patient-dashboard.html'; return; }

  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    });
  });
  document.querySelectorAll('.role-option').forEach(opt=>{
    opt.addEventListener('click',()=>{
      document.querySelectorAll('.role-option').forEach(o=>o.classList.remove('selected'));
      opt.classList.add('selected'); opt.querySelector('input').checked=true;
    });
  });

  window.handleLogin=function(){
    const email=document.getElementById('loginEmail')?.value.trim();
    const pass=document.getElementById('loginPass')?.value.trim();
    if(!email||!pass){ showToast('Please enter your credentials.','error'); return; }
    const user=getUsers().find(u=>u.email===email&&u.password===pass);
    if(!user){ showToast('Invalid email or password.','error'); return; }
    setSession({id:user.id,role:user.role,name:user.name,email:user.email,phone:user.phone||''});
    showToast(`Welcome back, ${user.name.split(' ')[0]}!`);
    setTimeout(()=>{ window.location.href=user.role==='doctor'?'doctor-dashboard.html':'patient-dashboard.html'; },800);
  };

  window.handleRegister=function(){
    const name=document.getElementById('regName')?.value.trim();
    const email=document.getElementById('regEmail')?.value.trim();
    const phone=document.getElementById('regPhone')?.value.trim();
    const pass=document.getElementById('regPass')?.value.trim();
    const code=document.getElementById('regCode')?.value.trim();
    if(!name||!email||!pass){ showToast('Please fill all required fields.','error'); return; }
    const users=getUsers();
    if(users.find(u=>u.email===email)){ showToast('Email already registered.','error'); return; }
    const id='p_'+Date.now();
    const role=code==='DOC2026'?'doctor':'patient';
    /* New patients start with no doctor assigned */
    users.push({id,role,name,email,password:pass,phone:phone||'',doctorId:null});
    DB.set('dt_users',users);
    setSession({id,role,name,email,phone:phone||''});
    showToast('Account created!');
    setTimeout(()=>{ window.location.href=role==='doctor'?'doctor-dashboard.html':'patient-dashboard.html'; },900);
  };
  window.handleLogout=function(){ clearSession(); window.location.href='portal.html'; };
}

/* ════════════════════════════════════════════════════════════════
   DOCTOR SELECTION — patient side
════════════════════════════════════════════════════════════════ */

/* Render doctor picker in patient dashboard */
function renderDoctorPicker() {
  const container=document.getElementById('doctorPickerSection');
  if(!container) return;
  const s=getSession();
  const users=getUsers();
  const patient=users.find(u=>u.id===s.id);
  const doctors=getDoctors();
  const myDoc=patient?.doctorId ? users.find(u=>u.id===patient.doctorId) : null;

  let assignedHTML='';
  if(myDoc){
    const initials=myDoc.name.split(' ').filter(n=>n!=='Dr.').map(n=>n[0]).join('').slice(0,2).toUpperCase();
    assignedHTML=`
      <div style="background:#EDF5F2;border:1px solid #9DD1C2;border-radius:12px;padding:14px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
        <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#1B5271,#3A8DC4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;color:#FFFFFF;flex-shrink:0;">${initials}</div>
        <div style="flex:1;">
          <div style="font-weight:700;color:#1B5271;font-size:0.92rem;">${myDoc.name}</div>
          <div style="font-size:0.76rem;color:#5DAC96;font-weight:600;margin-top:1px;">✓ Your assigned doctor</div>
          <div style="font-size:0.74rem;color:#7A9CA8;margin-top:2px;">${myDoc.specialty||'General Medicine'} · ${myDoc.hospital||'HAMAT Hospital'}</div>
        </div>
        <button onclick="assignDoctor('${s.id}',null);renderDoctorPicker();"
          style="background:#FAE8E8;border:1px solid #F0AAAA;border-radius:8px;padding:5px 12px;font-size:0.72rem;font-weight:700;color:#D94F4F;cursor:pointer;font-family:'Outfit',sans-serif;white-space:nowrap;">
          Change Doctor
        </button>
      </div>`;
  } else {
    assignedHTML=`
      <div style="background:#FBF0DC;border:1px solid #F0CC88;border-radius:10px;padding:11px 14px;margin-bottom:14px;display:flex;gap:9px;align-items:flex-start;">
        <span style="font-size:1rem;flex-shrink:0;">⚠️</span>
        <p style="font-size:0.83rem;color:#A0620A;margin:0;line-height:1.6;">You haven't selected a doctor yet. Your medication logs won't be visible to any doctor until you do.</p>
      </div>`;
  }

  const doctorCards=doctors.map(doc=>{
    const isSelected=patient?.doctorId===doc.id;
    const initials=doc.name.split(' ').filter(n=>n!=='Dr.').map(n=>n[0]).join('').slice(0,2).toUpperCase();
    const patCount=getUsers().filter(u=>u.role==='patient'&&u.doctorId===doc.id).length;
    return `
      <div style="background:#FFFFFF;border:1.5px solid ${isSelected?'#5DAC96':'#D1E4DE'};border-radius:13px;padding:14px 16px;
                  display:flex;align-items:center;gap:12px;cursor:pointer;transition:all 0.2s;
                  ${isSelected?'box-shadow:0 4px 18px rgba(93,172,150,0.18);':''}"
           onmouseenter="this.style.borderColor='#9DD1C2';this.style.boxShadow='0 4px 16px rgba(27,82,113,0.10)'"
           onmouseleave="this.style.borderColor='${isSelected?'#5DAC96':'#D1E4DE'}';this.style.boxShadow='${isSelected?'0 4px 18px rgba(93,172,150,0.18)':'none'}'"
           onclick="selectDoctor('${s.id}','${doc.id}')">
        <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#1B5271,#3A8DC4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;color:#FFFFFF;flex-shrink:0;">${initials}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;color:#1B5271;font-size:0.9rem;">${doc.name}</div>
          <div style="font-size:0.74rem;color:#7A9CA8;margin-top:2px;">${doc.specialty||'General Medicine'} · ${doc.hospital||'HAMAT Hospital'}</div>
          <div style="font-size:0.71rem;color:#7A9CA8;margin-top:1px;">${patCount} patient${patCount!==1?'s':''} assigned</div>
        </div>
        <div style="flex-shrink:0;">
          ${isSelected
            ? '<span style="font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#2E7A65;background:#D5F3EB;padding:4px 11px;border-radius:100px;">✓ Selected</span>'
            : '<span style="font-size:0.68rem;font-weight:600;color:#7A9CA8;">Select →</span>'}
        </div>
      </div>`;
  }).join('<div style="height:8px;"></div>');

  container.innerHTML=assignedHTML+`
    <div style="font-size:0.72rem;font-weight:700;color:#7A9CA8;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">
      Available Doctors at HAMAT Hospital
    </div>
    ${doctorCards}`;
}

window.selectDoctor=function(patientId, doctorId){
  assignDoctor(patientId, doctorId);
  const doc=getUsers().find(u=>u.id===doctorId);
  showToast(`✓ ${doc?.name||'Doctor'} is now your assigned doctor. They can see your medication logs.`);
  renderDoctorPicker();
};

/* ════════════════════════════════════════════════════════════════
   SMS SIMULATION ENGINE
════════════════════════════════════════════════════════════════ */
function buildPatientSMS(patientName, medicine, link) {
  return `Please take your medicine (${medicine}), track on Meza Dawa ${link}. Get well soon — ${patientName}`;
}
function buildCaregiverSMS(caregiverName, patientName, medicine, link) {
  return `Dear ${caregiverName}, Remind ${patientName} to take his/her medication (${medicine}). Track on Meza Dawa ${link}. — Meza Dawa`;
}
function simulateSMSForSchedule(schedule, patientName, patientPhone) {
  const s=getSession(); const link='https://mezadawa.com/patient-dashboard';
  const cgs=getCaregivers().filter(c=>c.patientId===s.id&&c.reminders);
  const log=getSMSLog(); const now=new Date().toISOString();
  const patMsg=buildPatientSMS(patientName,schedule.medicine,link);
  log.push({id:'sms'+Date.now()+'p',to:patientPhone||s.phone||'+254711000001',name:patientName,type:'patient',message:patMsg,medicine:schedule.medicine,sentAt:now});
  showToast(`📱 SMS → You (${patientPhone||s.phone||'your number'}): "${patMsg.slice(0,55)}…"`,'success');
  cgs.forEach((cg,i)=>{
    setTimeout(()=>{
      const cgMsg=buildCaregiverSMS(cg.name,patientName,schedule.medicine,link);
      log.push({id:'sms'+Date.now()+i,to:cg.phone,name:cg.name,type:'caregiver',relationship:cg.relationship,message:cgMsg,medicine:schedule.medicine,sentAt:now});
      showToast(`📱 SMS → ${cg.name} (${cg.phone}): "${cgMsg.slice(0,55)}…"`,'success');
    },(i+1)*1200);
  });
  DB.set('dt_sms_log',log);
}
function getUpcomingDoses(schedule,count){
  const doses=[]; const start=new Date(schedule.startDate+'T'+(schedule.firstDoseTime||'08:00')+':00');
  const end=new Date(schedule.endDate+'T23:59:59'); const hrsMs=schedule.intervalHrs*3600000;
  let cur=new Date(start);
  while(cur<=end&&doses.length<count){ doses.push(new Date(cur)); cur=new Date(cur.getTime()+hrsMs); }
  return doses;
}
function updateIntervalPreview(){
  const hrsEl=document.getElementById('medIntervalHrs'); const prev=document.getElementById('intervalPreview');
  if(!prev) return;
  const hrs=parseInt(hrsEl?.value)||0;
  if(!hrs||hrs<1){ prev.style.display='none'; return; }
  const dpd=dosesPerDay(hrs);
  prev.style.display='block';
  prev.innerHTML=`<span style="color:#9DD1C2;font-weight:700;">1×${dpd}</span> — take 1 dose every <strong style="color:#FFFFFF;">${hrs} hours</strong> (${dpd} time${dpd!==1?'s':''}/day) &nbsp;·&nbsp; SMS reminder fires at each dose time`;
}
function checkScheduleReminders(){
  const s=getSession(); if(!s) return;
  const schedules=getSchedules().filter(sc=>sc.patientId===s.id&&sc.active);
  const now=new Date(); const todayStr=now.toISOString().split('T')[0]; const nowMins=now.getHours()*60+now.getMinutes();
  schedules.forEach(sc=>{
    if(todayStr<sc.startDate||todayStr>sc.endDate) return;
    const firstH=parseInt((sc.firstDoseTime||'08:00').split(':')[0]);
    const firstM=parseInt((sc.firstDoseTime||'08:00').split(':')[1]);
    const firstMins=firstH*60+firstM; const hrsGap=sc.intervalHrs*60;
    let t=firstMins;
    while(t<1440){
      if(Math.abs(nowMins-t)<=1){
        const hStr=String(Math.floor(t/60)).padStart(2,'0'); const mStr=String(t%60).padStart(2,'0');
        const logs=getLogs();
        const already=logs.find(l=>l.patientId===s.id&&l.medicine===sc.medicine&&l.date===todayStr&&l.time===`${hStr}:${mStr}`);
        if(!already){ simulateSMSForSchedule(sc,s.name,s.phone||''); showToast(`⏰ Dose reminder: time to take ${sc.medicine}`,'info'); }
      }
      t+=hrsGap;
    }
  });
}

/* ════════════════════════════════════════════════════════════════
   PATIENT DASHBOARD
════════════════════════════════════════════════════════════════ */
function initPatientDashboard() {
  seedDemoData(); requireRole('patient');
  const s=getSession();
  const nameEl=document.getElementById('patientName'); if(nameEl) nameEl.textContent=s.name;
  ['medDate','medStartDate'].forEach(id=>{ const el=document.getElementById(id); if(el) el.valueAsDate=new Date(); });
  const endEl=document.getElementById('medEndDate'); if(endEl){ const d=new Date(); d.setDate(d.getDate()+30); endEl.valueAsDate=d; }

  renderPatientKPIs(); renderPatientLogs(); renderCareFeed(); renderPharmacyMessages();
  updateSidebarRate(); renderCaregivers(); renderMedRequests(); renderSchedules(); renderDoctorPicker();
  setTimeout(renderPatientChart,200);

  setInterval(()=>{ renderCareFeed(); renderPharmacyMessages(); updateUnreadBadge(); },5000);
  setInterval(()=>{ checkScheduleReminders(); },60000);

  const hrsEl=document.getElementById('medIntervalHrs');
  if(hrsEl) hrsEl.addEventListener('input',updateIntervalPreview);

  const form=document.getElementById('medForm');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const med=document.getElementById('medName').value.trim();
      const dosage=document.getElementById('medDosage')?.value.trim()||'';
      const date=document.getElementById('medDate').value;
      const taken=document.getElementById('medTaken').checked;
      const notes=document.getElementById('medNotes').value.trim();
      const time=document.getElementById('medTime').value||null;
      const startDate=document.getElementById('medStartDate')?.value||date;
      const endDate=document.getElementById('medEndDate')?.value||'';
      const intervalHrs=parseInt(document.getElementById('medIntervalHrs')?.value)||0;
      const firstTime=document.getElementById('medFirstTime')?.value||'08:00';
      if(!med||!date){ showToast('Please fill required fields.','error'); return; }
      const logs=getLogs(); let schId=null;
      if(startDate&&endDate&&intervalHrs>0){
        const schedules=getSchedules(); schId=nextSchId();
        schedules.push({id:schId,patientId:s.id,medicine:med,dosage,startDate,endDate,intervalHrs,firstDoseTime:firstTime,notes,active:true,createdAt:new Date().toISOString()});
        DB.set('dt_schedules',schedules);
        showToast(`Schedule: ${med} every ${intervalHrs}hrs (${dosesPerDay(intervalHrs)}×/day) — SMS reminders enabled`,'info');
      }
      logs.push({id:nextLogId(),patientId:s.id,medicine:med,dosage,date,taken,notes,time,loggedAt:new Date().toISOString(),scheduleId:schId});
      DB.set('dt_logs',logs);
      renderPatientLogs(); renderPatientKPIs(); updateSidebarRate(); renderSchedules();
      setTimeout(renderPatientChart,100);
      form.reset();
      document.getElementById('medDate').valueAsDate=new Date();
      document.getElementById('medStartDate').valueAsDate=new Date();
      const ed2=document.getElementById('medEndDate'); if(ed2){const d=new Date();d.setDate(d.getDate()+30);ed2.valueAsDate=d;}
      setStatusUI(null); updateIntervalPreview();
      if(!taken&&notes.toLowerCase().includes('ran out')) flagMedicineOut(med,dosage,notes);
      showToast('Medication logged!');
    });
  }

  window.setStatusUI=function(val){
    const cb=document.getElementById('medTaken'); if(cb) cb.checked=val==='taken';
    ['taken','missed'].forEach(v=>{
      const lbl=document.getElementById('lbl-'+v); if(!lbl) return;
      lbl.style.borderColor=val===v?(v==='taken'?'#5DAC96':'#D94F4F'):'#D1E4DE';
      lbl.style.background=val===v?(v==='taken'?'#EDF5F2':'#FAE8E8'):'#FFFFFF';
    });
  };
  window.markNoteRead=function(noteId){
    const notes=getNotes(); const idx=notes.findIndex(n=>n.id===noteId);
    if(idx!==-1){ notes[idx].read=true; DB.set('dt_notes',notes); renderCareFeed(); updateUnreadBadge(); }
  };
  updateUnreadBadge(); updateIntervalPreview();
}

/* ── Medicine-out flag ─────────────────────────────────────── */
function flagMedicineOut(medicine,dosage,notes){
  const s=getSession(); const reqs=getMedRequests();
  if(reqs.find(r=>r.patientId===s.id&&r.medicine===medicine&&r.status==='pending')) return;
  reqs.push({id:nextReqId(),patientId:s.id,patientName:s.name,medicine,dosage,message:notes||'Medicine out — requesting refill.',status:'pending',createdAt:new Date().toISOString()});
  DB.set('dt_med_requests',reqs); showToast('Pharmacy notified that you need '+medicine,'info');
}
window.openMedOutModal=function(){ const m=document.getElementById('medOutModal'); if(m){m.classList.add('open');document.body.style.overflow='hidden';} };
window.closeMedOutModal=function(){ const m=document.getElementById('medOutModal'); if(m){m.classList.remove('open');document.body.style.overflow='';} };
window.submitMedRequest=function(){
  const med=document.getElementById('req-medicine')?.value.trim();
  const dosage=document.getElementById('req-dosage')?.value.trim()||'';
  const msg=document.getElementById('req-message')?.value.trim()||'';
  if(!med){showToast('Please enter medicine name.','error');return;}
  flagMedicineOut(med,dosage,msg||'Requesting refill.'); renderMedRequests(); closeMedOutModal();
};
function renderMedRequests(){
  const container=document.getElementById('medRequestsList'); if(!container) return;
  const s=getSession(); const reqs=getMedRequests().filter(r=>r.patientId===s.id).slice().reverse();
  if(!reqs.length){container.innerHTML='<p style="font-size:0.82rem;color:#7A9CA8;text-align:center;padding:16px;">No active requests.</p>';return;}
  container.innerHTML=reqs.map(r=>{
    const sc=r.status==='pending'?{clr:'#A0620A',bg:'#FBF0DC'}:r.status==='fulfilled'?{clr:'#1E8A65',bg:'#D5F3EB'}:{clr:'#7A9CA8',bg:'#EDF5F2'};
    return `<div style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;">
      <div style="width:36px;height:36px;border-radius:10px;background:${sc.bg};display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">💊</div>
      <div style="flex:1;"><div style="font-weight:700;color:#1B5271;font-size:0.9rem;">${r.medicine}${r.dosage?' · '+r.dosage:''}</div><div style="font-size:0.78rem;color:#7A9CA8;margin-top:2px;">${r.message}</div><div style="margin-top:8px;display:flex;align-items:center;gap:8px;"><span style="font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${sc.clr};background:${sc.bg};padding:3px 10px;border-radius:100px;">${r.status}</span><span style="font-size:0.7rem;color:#7A9CA8;">${timeAgo(r.createdAt)}</span></div>${r.pharmacyReply?`<div style="margin-top:10px;background:#EDF5F2;border:1px solid #9DD1C2;border-left:3px solid #5DAC96;border-radius:8px;padding:10px 12px;font-size:0.82rem;color:#1B5271;"><strong>🏪 Pharmacy:</strong> ${r.pharmacyReply}</div>`:''}</div></div>`;
  }).join('');
}

/* ── Caregivers ─────────────────────────────────────────────── */
function renderCaregivers(){
  const container=document.getElementById('caregiversList'); if(!container) return;
  const s=getSession(); const cgs=getCaregivers().filter(c=>c.patientId===s.id);
  if(!cgs.length){container.innerHTML='<p style="font-size:0.82rem;color:#7A9CA8;text-align:center;padding:12px;">No caregivers added yet.</p>';return;}
  container.innerHTML=cgs.map(c=>`
    <div style="background:#FFFFFF;border:1px solid ${c.isMe?'#9DD1C2':'#D1E4DE'};border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:12px;">
      <div style="width:38px;height:38px;border-radius:50%;background:${c.isMe?'linear-gradient(135deg,#5DAC96,#9DD1C2)':'linear-gradient(135deg,#5DAC96,#1B5271)'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.78rem;color:#FFFFFF;flex-shrink:0;">${c.isMe?'ME':c.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
      <div style="flex:1;"><div style="font-weight:700;color:#1B5271;font-size:0.875rem;">${c.name}${c.isMe?' <span style="font-size:0.70rem;color:#5DAC96;">(You)</span>':''}</div><div style="font-size:0.75rem;color:#7A9CA8;">${relLabel(c.relationship)} · ${c.phone}</div></div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span style="font-size:0.70rem;font-weight:600;color:${c.reminders?'#2DAF83':'#7A9CA8'};">${c.reminders?'🔔 SMS on':'SMS off'}</span>
        <button onclick="removeCg('${c.id}')" style="background:#FAE8E8;border:1px solid #F0AAAA;border-radius:7px;padding:4px 10px;font-size:0.72rem;font-weight:700;color:#D94F4F;cursor:pointer;font-family:'Outfit',sans-serif;">Remove</button>
      </div>
    </div>`).join('');
}
window.removeCg=function(id){ const cgs=getCaregivers().filter(c=>c.id!==id); DB.set('dt_caregivers',cgs); renderCaregivers(); showToast('Caregiver removed.'); };
window.openCgModal=function(){ const m=document.getElementById('cgModal'); if(m){m.classList.add('open');document.body.style.overflow='hidden';} };
window.closeCgModal=function(){ const m=document.getElementById('cgModal'); if(m){m.classList.remove('open');document.body.style.overflow='';} };
window.submitCg=function(){
  const s=getSession(); const rel=document.getElementById('cg-rel')?.value||'relative'; const isMe=rel==='me';
  let name=document.getElementById('cg-name')?.value.trim(); let phone=document.getElementById('cg-phone')?.value.trim();
  const reminders=document.getElementById('cg-reminders')?.checked!==false;
  if(isMe){ name=name||s.name; phone=phone||s.phone||''; if(!phone){showToast('Please add your phone number.','error');return;} }
  else { if(!name||!phone){showToast('Name and phone are required.','error');return;} }
  const cgs=getCaregivers();
  if(isMe&&cgs.find(c=>c.patientId===s.id&&c.isMe)){showToast('You already added yourself.','error');return;}
  cgs.push({id:nextCgId(),patientId:s.id,name,phone,relationship:rel,reminders,isMe});
  DB.set('dt_caregivers',cgs); renderCaregivers(); closeCgModal();
  showToast(`${isMe?'Your number':''+name} added — ${reminders?'will receive':'will NOT receive'} SMS reminders.`);
  ['cg-name','cg-phone'].forEach(id=>{ const el=document.getElementById(id); if(el)el.value=''; });
};
window.onCgRelChange=function(){
  const rel=document.getElementById('cg-rel')?.value; const s=getSession();
  if(rel==='me'){
    const nameEl=document.getElementById('cg-name'); const phoneEl=document.getElementById('cg-phone');
    if(nameEl&&!nameEl.value) nameEl.value=s.name||'';
    if(phoneEl&&!phoneEl.value) phoneEl.value=s.phone||'';
  }
};
window.simulateSMSNow=function(){
  const s=getSession(); const cgs=getCaregivers().filter(c=>c.patientId===s.id&&c.reminders);
  if(!cgs.length){showToast('No caregivers with SMS enabled. Add one first.','info');return;}
  const link='https://mezadawa.com/patient-dashboard';
  if(s.phone){ const msg=buildPatientSMS(s.name,'your medication',link); showToast(`📱 SMS → You (${s.phone}): "${msg.slice(0,65)}…"`,'success'); }
  cgs.forEach((cg,i)=>{ setTimeout(()=>{ const msg=buildCaregiverSMS(cg.name,s.name,'their medication',link); showToast(`📱 SMS → ${cg.name} (${cg.phone}): "${msg.slice(0,65)}…"`,'success'); },(i+1)*1400); });
};

/* ── Schedules ────────────────────────────────────────────────── */
function renderSchedules(){
  const container=document.getElementById('schedulesList'); if(!container) return;
  const s=getSession(); const sch=getSchedules().filter(sc=>sc.patientId===s.id).slice().reverse();
  if(!sch.length){ container.innerHTML=`<div style="text-align:center;padding:24px 14px;"><div style="font-size:2rem;margin-bottom:8px;">📅</div><p style="font-size:0.82rem;color:#7A9CA8;">No schedules yet. Fill in Start Date, End Date and Interval Hrs when logging a medication.</p></div>`; return; }
  container.innerHTML=sch.map(sc=>{
    const dpd=dosesPerDay(sc.intervalHrs); const today=new Date().toISOString().split('T')[0];
    const active=sc.active&&today>=sc.startDate&&today<=sc.endDate;
    const doses=getUpcomingDoses(sc,3);
    const upcoming=doses.map(d=>{ const hh=String(d.getHours()).padStart(2,'0'); const mm=String(d.getMinutes()).padStart(2,'0'); return `${d.toLocaleDateString('en-KE',{month:'short',day:'numeric'})} ${hh}:${mm}`; }).join(' · ');
    return `<div style="background:#FFFFFF;border:1px solid ${active?'#9DD1C2':'#D1E4DE'};border-left:3px solid ${active?'#5DAC96':'#7A9CA8'};border-radius:12px;padding:14px 16px;margin-bottom:10px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;">
        <div style="flex:1;">
          <div style="font-weight:700;color:#1B5271;font-size:0.92rem;">${sc.medicine}${sc.dosage?' · '+sc.dosage:''}</div>
          <div style="font-size:0.78rem;color:#7A9CA8;margin-top:3px;">📅 ${fmtDate(sc.startDate)} → ${fmtDate(sc.endDate)} &nbsp;·&nbsp; Every <strong style="color:#1B5271;">${sc.intervalHrs}hrs</strong> &nbsp;·&nbsp; <strong style="color:#5DAC96;">1×${dpd}</strong>/day</div>
          <div style="font-size:0.75rem;color:#7A9CA8;margin-top:3px;">⏰ First dose: <strong style="color:#1B5271;">${sc.firstDoseTime}</strong> &nbsp;·&nbsp; Next 3: ${upcoming||'—'}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-shrink:0;">
          <span style="font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;padding:3px 10px;border-radius:100px;${active?'background:#D5F3EB;color:#1E8A65;':'background:#EDF5F2;color:#7A9CA8;'}">${active?'Active':'Inactive'}</span>
          <button onclick="testScheduleSMS('${sc.id}')" style="background:#EDF5F2;border:1px solid #D1E4DE;border-radius:7px;padding:4px 10px;font-size:0.72rem;font-weight:700;color:#5DAC96;cursor:pointer;font-family:'Outfit',sans-serif;white-space:nowrap;">📱 Test SMS</button>
          <button onclick="toggleSchedule('${sc.id}')" style="background:${active?'#FAE8E8':'#D5F3EB'};border:1px solid ${active?'#F0AAAA':'#A8E4D0'};border-radius:7px;padding:4px 10px;font-size:0.72rem;font-weight:700;color:${active?'#D94F4F':'#1E8A65'};cursor:pointer;font-family:'Outfit',sans-serif;white-space:nowrap;">${active?'Pause':'Resume'}</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
window.testScheduleSMS=function(schId){ const s=getSession(); const sc=getSchedules().find(x=>x.id===schId); if(!sc)return; simulateSMSForSchedule(sc,s.name,s.phone||''); };
window.toggleSchedule=function(schId){ const sch=getSchedules(); const idx=sch.findIndex(x=>x.id===schId); if(idx!==-1){sch[idx].active=!sch[idx].active;DB.set('dt_schedules',sch);renderSchedules();} };

/* ── Pharmacy messages ─────────────────────────────────────── */
function renderPharmacyMessages(){
  const container=document.getElementById('pharmacyFeed'); if(!container) return;
  const s=getSession(); const msgs=getPhNotes().filter(m=>m.patientId===s.id).slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if(!msgs.length){container.innerHTML='<p style="font-size:0.82rem;color:#7A9CA8;text-align:center;padding:20px;">No pharmacy messages yet.</p>';return;}
  container.innerHTML=msgs.map(m=>`<div style="background:${m.read?'#FFFFFF':'#EDF5F2'};border:1px solid ${m.read?'#D1E4DE':'#9DD1C2'};border-left:3px solid #5DAC96;border-radius:12px;padding:14px 16px;margin-bottom:10px;cursor:pointer;position:relative;" onclick="markPhMsgRead(${m.id})">
    ${!m.read?`<div style="position:absolute;top:10px;right:12px;width:7px;height:7px;border-radius:50%;background:#5DAC96;"></div>`:''}
    <div style="display:flex;gap:10px;align-items:flex-start;"><span style="font-size:1.1rem;flex-shrink:0;">🏪</span><div style="flex:1;"><div style="font-size:0.70rem;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:#5DAC96;margin-bottom:5px;">Pharmacy · ${m.subject||'Message'}</div><p style="font-size:0.84rem;color:#3A5563;margin:0;line-height:1.6;">${m.message}</p><div style="font-size:0.70rem;color:#7A9CA8;margin-top:6px;">— ${m.pharmacistName||'Pharmacist'} · ${timeAgo(m.createdAt)}</div></div></div>
  </div>`).join('');
}
window.markPhMsgRead=function(id){ const msgs=getPhNotes(); const idx=msgs.findIndex(m=>m.id===id); if(idx!==-1){msgs[idx].read=true;DB.set('dt_ph_notes',msgs);renderPharmacyMessages();} };

/* ── KPIs ───────────────────────────────────────────────────── */
function renderPatientKPIs(){
  const s=getSession(); const logs=getLogs().filter(l=>l.patientId===s.id); const rate=adherenceRate(logs);
  const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
  set('kpi-total',logs.length); set('kpi-taken',logs.filter(l=>l.taken).length); set('kpi-missed',logs.filter(l=>!l.taken).length); set('kpi-rate',rate+'%');
  const bar=document.getElementById('kpi-bar'); if(bar){bar.style.width=rate+'%';bar.className='adherence-fill'+(rate>=80?'':rate>=50?' warning':' danger');}
}
function updateSidebarRate(){
  const s=getSession(); const logs=getLogs().filter(l=>l.patientId===s.id); const rate=adherenceRate(logs);
  const el=document.getElementById('sidebar-rate'); const bar=document.getElementById('sidebar-bar');
  if(el) el.textContent=logs.length?rate+'%':'—';
  if(bar){bar.style.width=(logs.length?rate:0)+'%';bar.className='adherence-fill'+(rate>=80?'':rate>=50?' warning':' danger');}
}

/* ── Medication history ─────────────────────────────────────── */
function renderPatientLogs(){
  const s=getSession(); const cnt=document.getElementById('patientLogs'); if(!cnt) return;
  const logs=getLogs().filter(l=>l.patientId===s.id).slice().reverse();
  if(!logs.length){cnt.innerHTML=`<div style="text-align:center;padding:56px 20px;background:#FFFFFF;border:1px solid #D1E4DE;border-radius:16px;"><div style="font-size:3rem;margin-bottom:14px;">💊</div><div style="font-weight:700;color:#1B5271;margin-bottom:6px;">No medications logged yet</div><p style="font-size:0.85rem;color:#7A9CA8;">Use the form to log your first dose.</p></div>`;return;}
  cnt.innerHTML=logs.map(log=>{
    const notes=getNotes().filter(n=>n.patientId===s.id&&n.logId===log.id);
    return `<div style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:16px;overflow:hidden;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:14px;padding:18px 20px;flex-wrap:wrap;">
        <div style="width:46px;height:46px;border-radius:12px;background:${log.taken?'#D5F3EB':'#FAE0E0'};border:1px solid ${log.taken?'#A8E4D0':'#F0AAAA'};display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">${log.taken?'✅':'❌'}</div>
        <div style="flex:1;min-width:120px;"><div style="font-weight:700;font-size:0.95rem;color:#1B5271;">${log.medicine}${log.dosage?' <span style="font-weight:400;color:#7A9CA8;font-size:0.80rem;">· '+log.dosage+'</span>':''}</div><div style="font-size:0.76rem;color:#7A9CA8;margin-top:3px;">📅 ${fmtDate(log.date)}${log.time?' · ⏰ '+log.time:''}</div></div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          ${log.taken?'<span class="badge badge-green">✓ Taken</span>':'<span class="badge badge-red">✗ Missed</span>'}
          ${!log.taken?`<button onclick="openMedOutModal()" style="background:#FBF0DC;border:1px solid #F0CC88;border-radius:7px;padding:4px 10px;font-size:0.72rem;font-weight:700;color:#A0620A;cursor:pointer;font-family:'Outfit',sans-serif;">💊 Need refill?</button>`:''}
        </div>
      </div>
      ${log.notes?`<div style="padding:0 20px 14px;display:flex;gap:8px;"><span style="color:#7A9CA8;">📝</span><p style="font-size:0.85rem;color:#3A5563;margin:0;line-height:1.6;">${log.notes}</p></div>`:''}
      ${notes.map(n=>{const st=noteTypeStyle(n.type);return `<div style="margin:0 16px 14px;background:${st.bg};border:1px solid ${st.border};border-left:3px solid ${st.accentBg};border-radius:10px;padding:12px 14px;display:flex;gap:10px;"><span style="font-size:1.1rem;flex-shrink:0;">${st.icon}</span><div><div style="font-size:0.65rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${st.labelColor};margin-bottom:4px;">Dr. Note · ${st.label}</div><p style="font-size:0.85rem;color:#3A5563;margin:0;line-height:1.6;">${n.message}</p><div style="font-size:0.70rem;color:#7A9CA8;margin-top:6px;">${fmtTime(n.createdAt)} · ${n.doctorName}</div></div></div>`;}).join('')}
    </div>`;
  }).join('');
}

/* ── Care feed ──────────────────────────────────────────────── */
function renderCareFeed(){
  const s=getSession(); const cnt=document.getElementById('careFeed'); if(!cnt) return;
  const notes=getNotes().filter(n=>n.patientId===s.id).slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if(!notes.length){cnt.innerHTML=`<div style="text-align:center;padding:28px 14px;"><div style="font-size:2rem;margin-bottom:10px;">🩺</div><p style="font-size:0.82rem;color:#7A9CA8;">No messages yet.</p></div>`;return;}
  cnt.innerHTML=notes.map(n=>{const st=noteTypeStyle(n.type);return `<div style="background:${n.read?'#FFFFFF':st.bg};border:1px solid ${n.read?'#D1E4DE':st.border};border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer;position:relative;" onclick="markNoteRead(${n.id})">
    ${!n.read?`<div style="position:absolute;top:10px;right:12px;width:8px;height:8px;border-radius:50%;background:${st.accentBg};"></div>`:''}
    <div style="display:flex;gap:10px;align-items:flex-start;"><div style="width:34px;height:34px;border-radius:9px;background:${st.accentBg};display:flex;align-items:center;justify-content:center;font-size:0.95rem;flex-shrink:0;">${st.icon}</div><div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;margin-bottom:5px;"><span style="font-size:0.68rem;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:${st.labelColor};">${st.label}</span><span style="font-size:0.68rem;color:#7A9CA8;">${timeAgo(n.createdAt)}</span></div><p style="font-size:0.84rem;color:#3A5563;margin:0;line-height:1.6;">${n.message}</p><div style="font-size:0.70rem;color:#7A9CA8;margin-top:7px;font-weight:500;">— ${n.doctorName}</div></div></div>
  </div>`;}).join('');
}
function updateUnreadBadge(){
  const s=getSession(); if(!s) return;
  const count=getNotes().filter(n=>n.patientId===s.id&&!n.read).length;
  const phCount=getPhNotes().filter(m=>m.patientId===s.id&&!m.read).length;
  const total=count+phCount;
  ['unreadBadge','unreadBadge2'].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.textContent=total;el.style.display=total>0?'inline-flex':'none';});
}

/* ── Weekly chart ──────────────────────────────────────────── */
function renderPatientChart(){
  const canvas=document.getElementById('patientChart'); if(!canvas||!window.Chart) return;
  const ex=Chart.getChart(canvas); if(ex) ex.destroy();
  const s=getSession(); const logs=getLogs().filter(l=>l.patientId===s.id);
  const days=last7Days();
  const taken=days.map(d=>logs.filter(l=>l.date===d&&l.taken).length);
  const missed=days.map(d=>logs.filter(l=>l.date===d&&!l.taken).length);
  const labels=days.map(d=>new Date(d+'T00:00:00').toLocaleDateString('en-KE',{day:'numeric',month:'short'}));
  new Chart(canvas.getContext('2d'),{type:'bar',data:{labels,datasets:[{label:'Taken',data:taken,backgroundColor:'rgba(93,172,150,0.75)',borderColor:'#5DAC96',borderWidth:1,borderRadius:6},{label:'Missed',data:missed,backgroundColor:'rgba(217,79,79,0.45)',borderColor:'#D94F4F',borderWidth:1,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#7A9CA8',font:{family:'Outfit',size:11},boxWidth:12}},tooltip:{backgroundColor:'#1B5271',titleColor:'#FFFFFF',bodyColor:'#9DD1C2',padding:12}},scales:{x:{grid:{color:'rgba(209,228,222,0.5)'},ticks:{color:'#7A9CA8',font:{family:'Outfit',size:11}}},y:{beginAtZero:true,grid:{color:'rgba(209,228,222,0.5)'},ticks:{color:'#7A9CA8',stepSize:1,font:{family:'Outfit',size:11}}}}}});
}

/* ════════════════════════════════════════════════════════════════
   DOCTOR DASHBOARD — filtered to assigned patients only
════════════════════════════════════════════════════════════════ */
function initDoctorDashboard(){
  seedDemoData(); requireRole('doctor');
  const s=getSession();
  const nEl=document.getElementById('doctorName'); if(nEl) nEl.textContent=s.name;
  renderDoctorOverview(); renderPatientList('all');
  setTimeout(()=>{ renderTrendChart(); renderDonutChart(); updateSidebarAtRisk(); },200);
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); renderPatientList(btn.dataset.filter||'all');
    });
  });
  /* Poll for new patients assigned to this doctor every 10s (keeps charts + live dates fresh) */
  setInterval(()=>{ renderDoctorOverview(); updateSidebarAtRisk(); renderTrendChart(); renderDonutChart(); },10000);
}

/* Get patients belonging to the logged-in doctor only */
function getMyPatients(){
  const s=getSession(); if(!s) return [];
  const myPids=getDoctorPatientIds(s.id);
  const allLogs=getLogs();
  return myPids.map(pid=>{
    const pLogs=allLogs.filter(l=>l.patientId===pid);
    const user=getUsers().find(u=>u.id===pid);
    return {pid,name:user?.name||pid,email:user?.email||'',phone:user?.phone||'',logs:pLogs,rate:adherenceRate(pLogs),medicine:pLogs[0]?.medicine||'—'};
  });
}

function renderDoctorOverview(){
  const s=getSession(); if(!s) return;
  const patients=getMyPatients(); const allLogs=patients.flatMap(p=>p.logs); const atRisk=patients.filter(p=>p.rate<60).length;
  const totalUsers=getUsers().filter(u=>u.role==='patient').length;
  const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
  set('dr-patients',patients.length); set('dr-rate',adherenceRate(allLogs)+'%');
  set('dr-atrisk',atRisk); set('dr-logs',allLogs.length);
  set('dr-total-system',totalUsers);
  /* Unassigned count */
  const unassigned=getUsers().filter(u=>u.role==='patient'&&!u.doctorId).length;
  set('dr-unassigned',unassigned);
}
function updateSidebarAtRisk(){
  const n=getMyPatients().filter(p=>p.rate<60).length;
  const el=document.getElementById('sidebar-atrisk'); if(el) el.textContent=n;
}

function renderPatientList(filter, customContainerId){
  const container=document.getElementById(customContainerId||'doctorPatientList'); if(!container) return;
  let patients=getMyPatients();
  if(filter==='atrisk') patients=patients.filter(p=>p.rate<60);
  else if(filter==='good') patients=patients.filter(p=>p.rate>=80);
  patients.sort((a,b)=>a.rate-b.rate);

  if(!patients.length){
    container.innerHTML=`<div style="padding:40px;text-align:center;background:#FFFFFF;border:1px solid #D1E4DE;border-radius:16px;">
      <div style="font-size:2.5rem;margin-bottom:14px;">${filter==='atrisk'?'🎉':'👥'}</div>
      <div style="font-weight:700;color:#1B5271;margin-bottom:6px;">${filter==='atrisk'?'No at-risk patients':'No patients assigned yet'}</div>
      <p style="font-size:0.875rem;color:#7A9CA8;">${filter==='atrisk'?'All your patients are above 60% adherence.':'Patients will appear here once they select you as their doctor from their dashboard.'}</p>
    </div>`;
    return;
  }

  container.innerHTML=patients.map(p=>{
    const initials=p.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
    const avatarBg=p.rate>=80?'linear-gradient(135deg,#5DAC96,#9DD1C2)':p.rate>=50?'linear-gradient(135deg,#D98A2A,#F0C070)':'linear-gradient(135deg,#D94F4F,#F09090)';
    const sparks=p.logs.slice(-7).map(l=>`<div class="spark-bar" style="height:${l.taken?Math.floor(Math.random()*30+60):18}%;background:${l.taken?'#5DAC96':'#D94F4F'};opacity:${l.taken?'0.85':'0.35'};"></div>`).join('');
    const rows=p.logs.slice().reverse().map(log=>{
      const en=getNotes().find(n=>n.patientId===p.pid&&n.logId===log.id);
      return `<tr>
        <td style="white-space:nowrap;">${fmtDate(log.date)}</td>
        <td style="color:#1B5271;font-weight:600;">${log.medicine}${log.dosage?'<br><span style="color:#7A9CA8;font-weight:400;font-size:0.73rem;">'+log.dosage+'</span>':''}</td>
        <td>${log.taken?'<span class="badge badge-green">✓ Taken</span>':'<span class="badge badge-red">✗ Missed</span>'}</td>
        <td style="color:#7A9CA8;">${log.time||'—'}</td>
        <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#3A5563;">${log.notes||'—'}</td>
        <td>
          <select id="ntype-${log.id}" onclick="event.stopPropagation()"
            style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:7px;color:#1B5271;font-size:0.75rem;padding:5px 8px;font-family:'Outfit',sans-serif;cursor:pointer;margin-bottom:4px;width:100%;">
            <option value="advice"   ${en?.type==='advice'  ?'selected':''}>💊 Advice</option>
            <option value="reminder" ${en?.type==='reminder'?'selected':''}>🔔 Reminder</option>
            <option value="praise"   ${en?.type==='praise'  ?'selected':''}>🌟 Praise</option>
            <option value="urgent"   ${en?.type==='urgent'  ?'selected':''}>⚠️ Urgent</option>
          </select>
          <input type="text" placeholder="Write note to patient…" value="${en?.message||''}"
            id="note-${log.id}" onclick="event.stopPropagation()"
            style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:7px;color:#0E1C28;font-size:0.78rem;padding:5px 10px;width:100%;font-family:'Outfit',sans-serif;">
        </td>
        <td><button class="btn-secondary" onclick="saveNote('${p.pid}',${log.id},event)" style="font-size:0.75rem;padding:5px 12px;white-space:nowrap;">Send →</button></td>
      </tr>`;
    }).join('');

    return `<div class="patient-card mb-3" style="margin-bottom:14px;">
      <div class="patient-card-header" onclick="toggleDetail('${p.pid}')">
        <div class="patient-avatar" style="background:${avatarBg};width:48px;height:48px;font-size:1rem;flex-shrink:0;">${initials}</div>
        <div style="flex:1;min-width:120px;">
          <div style="font-weight:700;font-size:0.95rem;color:#1B5271;">${p.name}</div>
          <div style="font-size:0.75rem;color:#7A9CA8;margin-top:2px;">${p.email||p.phone||'—'} · ${p.medicine} · ${p.logs.length} logs</div>
        </div>
        <div style="min-width:90px;">${badgeAdherence(p.rate)}<div class="adherence-bar" style="margin-top:6px;width:90px;"><div class="adherence-fill${p.rate>=80?'':p.rate>=50?' warning':' danger'}" style="width:${p.rate}%;"></div></div></div>
        <div class="sparkline" style="width:72px;height:36px;">${sparks}</div>
        <div>${riskBadge(p.rate)}</div>
        <div style="color:#7A9CA8;font-size:0.75rem;margin-left:auto;user-select:none;" id="arr-${p.pid}">▼ expand</div>
      </div>
      <div class="patient-card-detail" id="det-${p.pid}">
        <div style="font-weight:700;font-size:0.875rem;color:#1B5271;margin-bottom:14px;">📋 Medication Log — send a care note via the last column</div>
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

window.toggleDetail=function(pid){ const el=document.getElementById('det-'+pid); const arr=document.getElementById('arr-'+pid); if(!el)return; const open=el.style.display==='block'; el.style.display=open?'none':'block'; if(arr) arr.textContent=open?'▼ expand':'▲ collapse'; };
window.saveNote=function(patientId,logId,e){
  e.stopPropagation();
  const input=document.getElementById('note-'+logId); const typeEl=document.getElementById('ntype-'+logId);
  const message=input?.value.trim(); const type=typeEl?.value||'advice';
  if(!message){showToast('Please write a note first.','error');return;}
  const s=getSession(); const notes=getNotes();
  const filtered=notes.filter(n=>!(n.patientId===patientId&&n.logId===logId));
  filtered.push({id:nextNoteId(),doctorId:s.id,doctorName:s.name,patientId,logId,message,type,createdAt:new Date().toISOString(),read:false});
  DB.set('dt_notes',filtered); showToast('Note sent to patient!');
};

function renderTrendChart(){
  const canvas=document.getElementById('trendChart'); if(!canvas||!window.Chart) return;
  const ex=Chart.getChart(canvas); if(ex) ex.destroy();
  const allLogs=getMyPatients().flatMap(p=>p.logs);
  const days=last7Days();
  const rates=days.map(d=>{const dl=allLogs.filter(l=>l.date===d);return dl.length?adherenceRate(dl):null;});
  const labels=days.map(d=>new Date(d+'T00:00:00').toLocaleDateString('en-KE',{day:'numeric',month:'short'}));
  new Chart(canvas.getContext('2d'),{type:'line',data:{labels,datasets:[{label:'Adherence %',data:rates,borderColor:'#5DAC96',backgroundColor:'rgba(93,172,150,0.10)',borderWidth:2.5,pointBackgroundColor:'#5DAC96',pointBorderColor:'#FFFFFF',pointBorderWidth:2,pointRadius:5,pointHoverRadius:7,tension:0.4,fill:true,spanGaps:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1B5271',titleColor:'#FFFFFF',bodyColor:'#9DD1C2',padding:12}},scales:{x:{grid:{color:'rgba(209,228,222,0.5)'},ticks:{color:'#7A9CA8',font:{family:'Outfit',size:11}}},y:{min:0,max:100,grid:{color:'rgba(209,228,222,0.5)'},ticks:{color:'#7A9CA8',font:{family:'Outfit',size:11},callback:v=>v+'%'}}}}});
}
function renderDonutChart(){
  const canvas=document.getElementById('donutChart'); if(!canvas||!window.Chart) return;
  const ex=Chart.getChart(canvas); if(ex) ex.destroy();
  const patients=getMyPatients();
  const good=patients.filter(p=>p.rate>=80).length; const fair=patients.filter(p=>p.rate>=60&&p.rate<80).length; const risk=patients.filter(p=>p.rate<60).length;
  new Chart(canvas.getContext('2d'),{type:'doughnut',data:{labels:['Good ≥80%','Fair 60–79%','At Risk <60%'],datasets:[{data:[good,fair,risk],backgroundColor:['rgba(93,172,150,0.85)','rgba(217,138,42,0.85)','rgba(217,79,79,0.85)'],borderColor:'#FFFFFF',borderWidth:3,hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false},tooltip:{backgroundColor:'#1B5271',titleColor:'#FFFFFF',bodyColor:'#9DD1C2'}}}});
}

/* ════════════════════════════════════════════════════════════════
   GLOBAL INIT
════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  const path=window.location.pathname;
  if     (path.includes('portal'))            initPortal();
  else if(path.includes('patient-dashboard')) initPatientDashboard();
  else if(path.includes('doctor-dashboard'))  initDoctorDashboard();
  else                                         seedDemoData();

  document.querySelectorAll('.nav-link').forEach(l=>{const href=l.getAttribute('href');if(href&&window.location.pathname.endsWith(href))l.classList.add('active-link');});
  document.querySelectorAll('[data-logout]').forEach(btn=>{btn.addEventListener('click',()=>{clearSession();window.location.href='portal.html';});});
  document.querySelectorAll('.dt-modal-overlay,.forgot-overlay').forEach(ov=>{ov.addEventListener('click',e=>{if(e.target===ov){ov.classList.remove('open');document.body.style.overflow='';}});});
});

function validateForm(){
  const name=document.getElementById('name')?.value.trim();
  const email=document.getElementById('email')?.value.trim();
  if(!name||!email){showToast('Please fill required fields.','error');return false;}
  showToast("Inquiry submitted! We'll respond within 24 hours.");
  return false;
}
