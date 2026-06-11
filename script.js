/* ═══════════════════════════════════════════════════════════════════
   DAWATRACK · script.js
   Role-based auth · Medication tracking · Live Care Feed
   Caregivers · Medicine-Out Requests · Pharmacy bridge
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
function seedDemoData() {}

/* ── Core helpers ────────────────────────────────────────────── */
function getLogs()       { return DB.get('dt_logs')        || []; }
function getNotes()      { return DB.get('dt_notes')       || []; }
function getUsers()      { return DB.get('dt_users')       || []; }
function getCaregivers() { return DB.get('dt_caregivers')  || []; }
function getMedRequests(){ return DB.get('dt_med_requests')|| []; }
function getDispLog()    { return DB.get('dt_disp_log')    || []; }
function getPhNotes()    { return DB.get('dt_ph_notes')    || []; }

function nextLogId()   { const id=DB.get('dt_next_log_id')||1;  DB.set('dt_next_log_id',  id+1); return id; }
function nextNoteId()  { const id=DB.get('dt_next_note_id')||1; DB.set('dt_next_note_id', id+1); return id; }
function nextReqId()   { const id=DB.get('dt_next_req_id')||1;  DB.set('dt_next_req_id',  id+1); return 'req'+id; }
function nextCgId()    { const id=DB.get('dt_next_cg_id')||1;   DB.set('dt_next_cg_id',   id+1); return 'cg'+id; }

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
function timeAgo(isoStr) {
  const diff=(Date.now()-new Date(isoStr))/1000;
  if (diff<60)    return 'just now';
  if (diff<3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff<86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function showToast(msg, type='success') {
  let c=document.querySelector('.toast-container');
  if (!c){ c=document.createElement('div'); c.className='toast-container'; document.body.appendChild(c); }
  const t=document.createElement('div');
  t.className=`toast-item ${type}`;
  const icon=type==='success'?'✓':type==='error'?'✗':'ℹ';
  const clr=type==='success'?'#2DAF83':type==='error'?'#D94F4F':'#3A8DC4';
  t.innerHTML=`<span style="color:${clr};font-weight:800;font-size:1.05rem;">${icon}</span><span style="font-size:0.875rem;color:#3A5563;">${msg}</span>`;
  c.appendChild(t);
  setTimeout(()=>{ t.style.cssText+='opacity:0;transform:translateX(16px);transition:all 0.3s;'; setTimeout(()=>t.remove(),300); },3500);
}

function badgeAdherence(rate) {
  if (rate>=80) return `<span class="badge badge-green">✓ ${rate}%</span>`;
  if (rate>=50) return `<span class="badge badge-amber">⚠ ${rate}%</span>`;
  return `<span class="badge badge-red">✗ ${rate}%</span>`;
}
function riskBadge(rate) {
  if (rate>=80) return '<span class="badge badge-green">Low Risk</span>';
  if (rate>=50) return '<span class="badge badge-amber">Medium Risk</span>';
  return '<span class="badge badge-red">High Risk</span>';
}
function noteTypeStyle(type) {
  switch(type) {
    case 'praise':   return { icon:'🌟', bg:'#EDF5F2', border:'#9DD1C2', accentBg:'#5DAC96', label:'Great news', labelColor:'#2E7A65' };
    case 'reminder': return { icon:'🔔', bg:'#FBF5E6', border:'#F0CC88', accentBg:'#D98A2A', label:'Reminder',   labelColor:'#A0620A' };
    case 'urgent':   return { icon:'⚠️', bg:'#FAF0F0', border:'#F0AAAA', accentBg:'#D94F4F', label:'Urgent',     labelColor:'#B03030' };
    case 'advice':   return { icon:'💊', bg:'#EAF3FA', border:'#9DD0F0', accentBg:'#3A8DC4', label:'Advice',     labelColor:'#1A6496' };
    case 'pharmacy': return { icon:'🏪', bg:'#EDF5F2', border:'#9DD1C2', accentBg:'#5DAC96', label:'Pharmacy',   labelColor:'#2E7A65' };
    default:         return { icon:'📋', bg:'#F4F8F7', border:'#D1E4DE', accentBg:'#1B5271', label:'Note',       labelColor:'#1B5271' };
  }
}

/* ════════════════════════════════════════════════════════════════
   PORTAL — LOGIN / REGISTER
════════════════════════════════════════════════════════════════ */
function initPortal() {
  seedDemoData();
  const s=getSession();
  if (s) { window.location.href=s.role==='doctor'?'doctor-dashboard.html':'patient-dashboard.html'; return; }

  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      const tgt=document.getElementById(btn.dataset.tab);
      if(tgt) tgt.classList.add('active');
    });
  });
  document.querySelectorAll('.role-option').forEach(opt=>{
    opt.addEventListener('click',()=>{
      document.querySelectorAll('.role-option').forEach(o=>o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked=true;
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
    users.push({id,role,name,email,password:pass,phone:phone||''});
    DB.set('dt_users',users);
    setSession({id,role,name,email,phone:phone||''});
    showToast('Account created! Redirecting…');
    setTimeout(()=>{ window.location.href=role==='doctor'?'doctor-dashboard.html':'patient-dashboard.html'; },900);
  };

  window.handleLogout=function(){ clearSession(); window.location.href='portal.html'; };
}

/* ════════════════════════════════════════════════════════════════
   PATIENT DASHBOARD
════════════════════════════════════════════════════════════════ */
let careFeedInterval=null;

function initPatientDashboard() {
  seedDemoData();
  requireRole('patient');
  const s=getSession();

  const nameEl=document.getElementById('patientName');
  if(nameEl) nameEl.textContent=s.name;

  const dateEl=document.getElementById('medDate');
  if(dateEl) dateEl.valueAsDate=new Date();

  renderPatientKPIs();
  renderPatientLogs();
  renderCareFeed();
  renderPharmacyMessages();
  updateSidebarRate();
  renderCaregivers();
  renderMedRequests();
  setTimeout(renderPatientChart,200);

  careFeedInterval=setInterval(()=>{
    renderCareFeed();
    renderPharmacyMessages();
    updateUnreadBadge();
  },5000);

  /* Medication log form */
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
      if(!med||!date){ showToast('Please fill required fields.','error'); return; }
      const logs=getLogs();
      logs.push({id:nextLogId(),patientId:s.id,medicine:med,dosage,date,taken,notes,time,loggedAt:new Date().toISOString()});
      DB.set('dt_logs',logs);
      renderPatientLogs(); renderPatientKPIs(); updateSidebarRate();
      setTimeout(renderPatientChart,100);
      form.reset(); dateEl.valueAsDate=new Date(); setStatusUI(null);

      /* If medicine flagged as out, auto-create request */
      if(!taken && notes.toLowerCase().includes('ran out')){
        flagMedicineOut(med,dosage,notes);
      }
      showToast('Medication logged!');
    });
  }

  window.setStatusUI=function(val){
    const cb=document.getElementById('medTaken');
    if(cb) cb.checked=val==='taken';
    ['taken','missed'].forEach(v=>{
      const lbl=document.getElementById('lbl-'+v);
      if(!lbl) return;
      lbl.style.borderColor=val===v?(v==='taken'?'#5DAC96':'#D94F4F'):'#D1E4DE';
      lbl.style.background=val===v?(v==='taken'?'#EDF5F2':'#FAE8E8'):'#FFFFFF';
    });
  };

  window.markNoteRead=function(noteId){
    const notes=getNotes(); const idx=notes.findIndex(n=>n.id===noteId);
    if(idx!==-1){ notes[idx].read=true; DB.set('dt_notes',notes); renderCareFeed(); updateUnreadBadge(); }
  };

  updateUnreadBadge();
}

/* ── Patient: flag medicine as out ─── */
function flagMedicineOut(medicine, dosage, notes) {
  const s=getSession();
  const reqs=getMedRequests();
  /* Don't duplicate active requests for same medicine */
  if(reqs.find(r=>r.patientId===s.id&&r.medicine===medicine&&r.status==='pending')) return;
  reqs.push({
    id:nextReqId(), patientId:s.id, patientName:s.name,
    medicine, dosage, message:notes||'Medicine out — requesting refill.',
    status:'pending', createdAt:new Date().toISOString()
  });
  DB.set('dt_med_requests',reqs);
  showToast('Pharmacy notified that you need '+medicine,'info');
}

window.openMedOutModal=function(){
  const modal=document.getElementById('medOutModal');
  if(modal){ modal.classList.add('open'); document.body.style.overflow='hidden'; }
};
window.closeMedOutModal=function(){
  const modal=document.getElementById('medOutModal');
  if(modal){ modal.classList.remove('open'); document.body.style.overflow=''; }
};
window.submitMedRequest=function(){
  const s=getSession();
  const med=document.getElementById('req-medicine')?.value.trim();
  const dosage=document.getElementById('req-dosage')?.value.trim()||'';
  const msg=document.getElementById('req-message')?.value.trim()||'';
  if(!med){ showToast('Please enter medicine name.','error'); return; }
  flagMedicineOut(med,dosage,msg||'Requesting refill.');
  renderMedRequests();
  closeMedOutModal();
};

function renderMedRequests(){
  const container=document.getElementById('medRequestsList');
  if(!container) return;
  const s=getSession();
  const reqs=getMedRequests().filter(r=>r.patientId===s.id).slice().reverse();
  if(!reqs.length){
    container.innerHTML='<p style="font-size:0.82rem;color:#7A9CA8;text-align:center;padding:16px;">No active requests.</p>';
    return;
  }
  container.innerHTML=reqs.map(r=>{
    const statusColor=r.status==='pending'?'#D98A2A':r.status==='fulfilled'?'#2DAF83':'#7A9CA8';
    const statusBg=r.status==='pending'?'#FBF0DC':r.status==='fulfilled'?'#D5F3EB':'#EDF5F2';
    return `<div style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px;">
      <div style="width:36px;height:36px;border-radius:10px;background:${statusBg};display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">💊</div>
      <div style="flex:1;">
        <div style="font-weight:700;color:#1B5271;font-size:0.9rem;">${r.medicine}${r.dosage?' · '+r.dosage:''}</div>
        <div style="font-size:0.78rem;color:#7A9CA8;margin-top:2px;">${r.message}</div>
        <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
          <span style="font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${statusColor};background:${statusBg};padding:3px 10px;border-radius:100px;">${r.status.toUpperCase()}</span>
          <span style="font-size:0.7rem;color:#7A9CA8;">${timeAgo(r.createdAt)}</span>
        </div>
        ${r.pharmacyReply?`<div style="margin-top:10px;background:#EDF5F2;border:1px solid #9DD1C2;border-left:3px solid #5DAC96;border-radius:8px;padding:10px 12px;font-size:0.82rem;color:#1B5271;"><strong>🏪 Pharmacy:</strong> ${r.pharmacyReply}</div>`:''}
      </div>
    </div>`;
  }).join('');
}

/* ── Caregivers ─── */
function renderCaregivers(){
  const container=document.getElementById('caregiversList');
  if(!container) return;
  const s=getSession();
  const cgs=getCaregivers().filter(c=>c.patientId===s.id);
  if(!cgs.length){
    container.innerHTML='<p style="font-size:0.82rem;color:#7A9CA8;text-align:center;padding:12px;">No caregivers added yet.</p>';
    return;
  }
  const relLabel={'spouse':'Spouse','partner':'Partner','parent':'Parent','sibling':'Sibling','child':'Child','relative':'Relative','caregiver':'Caregiver','friend':'Friend'};
  container.innerHTML=cgs.map(c=>`
    <div style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:12px;">
      <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#5DAC96,#1B5271);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.78rem;color:#FFFFFF;flex-shrink:0;">${c.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
      <div style="flex:1;">
        <div style="font-weight:700;color:#1B5271;font-size:0.875rem;">${c.name}</div>
        <div style="font-size:0.75rem;color:#7A9CA8;">${relLabel[c.relationship]||c.relationship} · ${c.phone}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:0.7rem;font-weight:600;color:${c.reminders?'#2DAF83':'#7A9CA8'};">${c.reminders?'🔔 Reminders on':'Reminders off'}</span>
        <button onclick="removeCg('${c.id}')" style="background:#FAE8E8;border:1px solid #F0AAAA;border-radius:7px;padding:4px 10px;font-size:0.72rem;font-weight:700;color:#D94F4F;cursor:pointer;font-family:'Outfit',sans-serif;">Remove</button>
      </div>
    </div>`).join('');
}

window.removeCg=function(id){
  const cgs=getCaregivers().filter(c=>c.id!==id);
  DB.set('dt_caregivers',cgs);
  renderCaregivers();
  showToast('Caregiver removed.');
};

window.openCgModal=function(){
  const m=document.getElementById('cgModal');
  if(m){ m.classList.add('open'); document.body.style.overflow='hidden'; }
};
window.closeCgModal=function(){
  const m=document.getElementById('cgModal');
  if(m){ m.classList.remove('open'); document.body.style.overflow=''; }
};
window.submitCg=function(){
  const s=getSession();
  const name=document.getElementById('cg-name')?.value.trim();
  const phone=document.getElementById('cg-phone')?.value.trim();
  const rel=document.getElementById('cg-rel')?.value||'relative';
  const reminders=document.getElementById('cg-reminders')?.checked!==false;
  if(!name||!phone){ showToast('Name and phone are required.','error'); return; }
  const cgs=getCaregivers();
  cgs.push({id:nextCgId(),patientId:s.id,name,phone,relationship:rel,reminders});
  DB.set('dt_caregivers',cgs);
  renderCaregivers();
  closeCgModal();
  showToast(`${name} added as caregiver. They will receive medication reminders.`);
  /* Reset */
  ['cg-name','cg-phone'].forEach(id=>{ const el=document.getElementById(id); if(el)el.value=''; });
};

/* ── Pharmacy messages to patient ─── */
function renderPharmacyMessages(){
  const container=document.getElementById('pharmacyFeed');
  if(!container) return;
  const s=getSession();
  const msgs=getPhNotes().filter(m=>m.patientId===s.id).slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if(!msgs.length){ container.innerHTML='<p style="font-size:0.82rem;color:#7A9CA8;text-align:center;padding:20px 16px;">No pharmacy messages yet.</p>'; return; }
  container.innerHTML=msgs.map(m=>{
    const unread=!m.read;
    return `<div style="background:${unread?'#EDF5F2':'#FFFFFF'};border:1px solid ${unread?'#9DD1C2':'#D1E4DE'};border-left:3px solid #5DAC96;border-radius:12px;padding:14px 16px;margin-bottom:10px;cursor:pointer;position:relative;"
      onclick="markPhMsgRead(${m.id})">
      ${unread?`<div style="position:absolute;top:10px;right:10px;width:7px;height:7px;border-radius:50%;background:#5DAC96;"></div>`:''}
      <div style="display:flex;gap:10px;align-items:flex-start;">
        <span style="font-size:1.1rem;flex-shrink:0;">🏪</span>
        <div style="flex:1;">
          <div style="font-size:0.7rem;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:#5DAC96;margin-bottom:5px;">Pharmacy · ${m.subject||'Message'}</div>
          <p style="font-size:0.84rem;color:#3A5563;margin:0;line-height:1.6;">${m.message}</p>
          <div style="font-size:0.7rem;color:#7A9CA8;margin-top:6px;">— ${m.pharmacistName||'Pharmacist'} · ${timeAgo(m.createdAt)}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

window.markPhMsgRead=function(id){
  const msgs=getPhNotes(); const idx=msgs.findIndex(m=>m.id===id);
  if(idx!==-1){ msgs[idx].read=true; DB.set('dt_ph_notes',msgs); renderPharmacyMessages(); }
};

/* ── KPIs ─── */
function renderPatientKPIs(){
  const s=getSession();
  const logs=getLogs().filter(l=>l.patientId===s.id);
  const rate=adherenceRate(logs);
  const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
  set('kpi-total', logs.length);
  set('kpi-taken', logs.filter(l=>l.taken).length);
  set('kpi-missed',logs.filter(l=>!l.taken).length);
  set('kpi-rate',  rate+'%');
  const bar=document.getElementById('kpi-bar');
  if(bar){ bar.style.width=rate+'%'; bar.className='adherence-fill'+(rate>=80?'':rate>=50?' warning':' danger'); }
}

function updateSidebarRate(){
  const s=getSession();
  const logs=getLogs().filter(l=>l.patientId===s.id);
  const rate=adherenceRate(logs);
  const el=document.getElementById('sidebar-rate');
  const bar=document.getElementById('sidebar-bar');
  if(el) el.textContent=logs.length?rate+'%':'—';
  if(bar){ bar.style.width=(logs.length?rate:0)+'%'; bar.className='adherence-fill'+(rate>=80?'':rate>=50?' warning':' danger'); }
}

function renderPatientLogs(){
  const s=getSession();
  const container=document.getElementById('patientLogs');
  if(!container) return;
  const logs=getLogs().filter(l=>l.patientId===s.id).slice().reverse();
  if(!logs.length){
    container.innerHTML=`<div style="text-align:center;padding:56px 20px;background:#FFFFFF;border:1px solid #D1E4DE;border-radius:16px;"><div style="font-size:3rem;margin-bottom:14px;">💊</div><div style="font-weight:700;color:#1B5271;font-size:1rem;margin-bottom:6px;">No medications logged yet</div><p style="font-size:0.85rem;color:#7A9CA8;">Use the form on the left to log your first dose.</p></div>`;
    return;
  }
  container.innerHTML=logs.map(log=>{
    const notes=getNotes().filter(n=>n.patientId===s.id&&n.logId===log.id);
    return `<div style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:16px;overflow:hidden;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:14px;padding:18px 20px;flex-wrap:wrap;">
        <div style="width:46px;height:46px;border-radius:12px;background:${log.taken?'#D5F3EB':'#FAE0E0'};border:1px solid ${log.taken?'#A8E4D0':'#F0AAAA'};display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">${log.taken?'✅':'❌'}</div>
        <div style="flex:1;min-width:120px;">
          <div style="font-weight:700;font-size:0.95rem;color:#1B5271;">${log.medicine}${log.dosage?' <span style="font-weight:400;color:#7A9CA8;font-size:0.82rem;">· '+log.dosage+'</span>':''}</div>
          <div style="font-size:0.76rem;color:#7A9CA8;margin-top:3px;">📅 ${fmtDate(log.date)}${log.time?' · ⏰ '+log.time:''}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          ${log.taken?'<span class="badge badge-green">✓ Taken</span>':'<span class="badge badge-red">✗ Missed</span>'}
          ${!log.taken?`<button onclick="openMedOutModal()" style="background:#FBF0DC;border:1px solid #F0CC88;border-radius:7px;padding:4px 10px;font-size:0.72rem;font-weight:700;color:#A0620A;cursor:pointer;font-family:'Outfit',sans-serif;">💊 Need refill?</button>`:''}
        </div>
      </div>
      ${log.notes?`<div style="padding:0 20px 14px;display:flex;gap:8px;"><span style="color:#7A9CA8;font-size:0.9rem;">📝</span><p style="font-size:0.85rem;color:#3A5563;margin:0;line-height:1.6;">${log.notes}</p></div>`:''}
      ${notes.map(n=>{ const st=noteTypeStyle(n.type); return `<div style="margin:0 16px 14px;background:${st.bg};border:1px solid ${st.border};border-left:3px solid ${st.accentBg};border-radius:10px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;"><span style="font-size:1.1rem;flex-shrink:0;">${st.icon}</span><div><div style="font-size:0.65rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${st.labelColor};margin-bottom:4px;">Dr. Note · ${st.label}</div><p style="font-size:0.85rem;color:#3A5563;margin:0;line-height:1.6;">${n.message}</p><div style="font-size:0.7rem;color:#7A9CA8;margin-top:6px;">${fmtTime(n.createdAt)} · ${n.doctorName}</div></div></div>`; }).join('')}
    </div>`;
  }).join('');
}

function renderCareFeed(){
  const s=getSession(); const container=document.getElementById('careFeed'); if(!container) return;
  const notes=getNotes().filter(n=>n.patientId===s.id).slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if(!notes.length){ container.innerHTML=`<div style="text-align:center;padding:40px 16px;"><div style="font-size:2.5rem;margin-bottom:12px;">🩺</div><div style="font-weight:600;color:#1B5271;font-size:0.9rem;margin-bottom:4px;">No messages yet</div><p style="font-size:0.8rem;color:#7A9CA8;">Your doctor's notes will appear here.</p></div>`; return; }
  container.innerHTML=notes.map(n=>{ const st=noteTypeStyle(n.type); return `<div style="background:${n.read?'#FFFFFF':st.bg};border:1px solid ${n.read?'#D1E4DE':st.border};border-radius:14px;padding:16px;margin-bottom:12px;cursor:pointer;position:relative;" onclick="markNoteRead(${n.id})">
    ${!n.read?`<div style="position:absolute;top:12px;right:12px;width:8px;height:8px;border-radius:50%;background:${st.accentBg};"></div>`:''}
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
  </div>`; }).join('');
}

function updateUnreadBadge(){
  const s=getSession(); if(!s) return;
  const count=getNotes().filter(n=>n.patientId===s.id&&!n.read).length;
  const phCount=getPhNotes().filter(m=>m.patientId===s.id&&!m.read).length;
  const total=count+phCount;
  ['unreadBadge','unreadBadge2'].forEach(id=>{ const el=document.getElementById(id); if(!el) return; el.textContent=total; el.style.display=total>0?'inline-flex':'none'; });
}

function renderPatientChart(){
  const canvas=document.getElementById('patientChart'); if(!canvas||!window.Chart) return;
  const ex=Chart.getChart(canvas); if(ex) ex.destroy();
  const s=getSession();
  const logs=getLogs().filter(l=>l.patientId===s.id);
  const days=[]; for(let i=6;i>=0;i--){ const d=new Date('2026-05-11'); d.setDate(d.getDate()-i); days.push(d.toISOString().split('T')[0]); }
  const taken=days.map(d=>logs.filter(l=>l.date===d&&l.taken).length);
  const missed=days.map(d=>logs.filter(l=>l.date===d&&!l.taken).length);
  const labels=days.map(d=>parseInt(d.split('-')[2])+' May');
  new Chart(canvas.getContext('2d'),{
    type:'bar',
    data:{labels,datasets:[{label:'Taken',data:taken,backgroundColor:'rgba(93,172,150,0.75)',borderColor:'#5DAC96',borderWidth:1,borderRadius:6},{label:'Missed',data:missed,backgroundColor:'rgba(217,79,79,0.45)',borderColor:'#D94F4F',borderWidth:1,borderRadius:6}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#7A9CA8',font:{family:'Outfit',size:11},boxWidth:12}},tooltip:{backgroundColor:'#1B5271',titleColor:'#FFFFFF',bodyColor:'#9DD1C2',padding:12}},scales:{x:{grid:{color:'rgba(209,228,222,0.5)'},ticks:{color:'#7A9CA8',font:{family:'Outfit',size:11}}},y:{beginAtZero:true,grid:{color:'rgba(209,228,222,0.5)'},ticks:{color:'#7A9CA8',stepSize:1,font:{family:'Outfit',size:11}}}}}
  });
}

/* ════════════════════════════════════════════════════════════════
   DOCTOR DASHBOARD
════════════════════════════════════════════════════════════════ */
function initDoctorDashboard(){
  seedDemoData();
  requireRole('doctor');
  const s=getSession();
  const nEl=document.getElementById('doctorName'); if(nEl) nEl.textContent=s.name;
  renderDoctorOverview(); renderPatientList('all');
  setTimeout(()=>{ renderTrendChart(); renderDonutChart(); updateSidebarAtRisk(); },200);
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{ document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); renderPatientList(btn.dataset.filter||'all'); });
  });
}

function getDoctorPatients(){
  const allLogs=getLogs();
  const pids=[...new Set(allLogs.map(l=>l.patientId))];
  return pids.map(pid=>{ const pLogs=allLogs.filter(l=>l.patientId===pid); const user=getUsers().find(u=>u.id===pid); return {pid,name:user?.name||pid,logs:pLogs,rate:adherenceRate(pLogs),medicine:pLogs[0]?.medicine||'—'}; });
}

function renderDoctorOverview(){
  const patients=getDoctorPatients(); const allLogs=patients.flatMap(p=>p.logs); const atRisk=patients.filter(p=>p.rate<60).length;
  const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
  set('dr-patients',patients.length); set('dr-rate',adherenceRate(allLogs)+'%'); set('dr-atrisk',atRisk); set('dr-logs',allLogs.length);
}

function updateSidebarAtRisk(){
  const patients=getDoctorPatients(); const n=patients.filter(p=>p.rate<60).length;
  const el=document.getElementById('sidebar-atrisk'); if(el) el.textContent=n;
}

function renderPatientList(filter){
  const container=document.getElementById('doctorPatientList'); if(!container) return;
  const allLogs=getLogs(); const pids=[...new Set(allLogs.map(l=>l.patientId))];
  let patients=pids.map(pid=>{ const pLogs=allLogs.filter(l=>l.patientId===pid); const user=getUsers().find(u=>u.id===pid); return {pid,name:user?.name||pid,logs:pLogs,rate:adherenceRate(pLogs),medicine:pLogs[0]?.medicine||'—'}; });
  if(filter==='atrisk') patients=patients.filter(p=>p.rate<60);
  else if(filter==='good') patients=patients.filter(p=>p.rate>=80);
  patients.sort((a,b)=>a.rate-b.rate);
  if(!patients.length){ container.innerHTML=`<div style="padding:40px;text-align:center;background:#FFFFFF;border:1px solid #D1E4DE;border-radius:16px;color:#7A9CA8;">No patients match this filter.</div>`; return; }
  container.innerHTML=patients.map(p=>{
    const initials=p.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
    const avatarBg=p.rate>=80?'linear-gradient(135deg,#5DAC96,#9DD1C2)':p.rate>=50?'linear-gradient(135deg,#D98A2A,#F0C070)':'linear-gradient(135deg,#D94F4F,#F09090)';
    const sparks=p.logs.slice(-7).map(l=>`<div class="spark-bar" style="height:${l.taken?Math.floor(Math.random()*30+60):18}%;background:${l.taken?'#5DAC96':'#D94F4F'};opacity:${l.taken?'0.85':'0.35'};"></div>`).join('');
    const rows=p.logs.slice().reverse().map(log=>{
      const en=getNotes().find(n=>n.patientId===p.pid&&n.logId===log.id);
      return `<tr><td style="white-space:nowrap;">${fmtDate(log.date)}</td><td style="color:#1B5271;font-weight:600;">${log.medicine}${log.dosage?' <span style="color:#7A9CA8;font-weight:400;">'+log.dosage+'</span>':''}</td><td>${log.taken?'<span class="badge badge-green">✓ Taken</span>':'<span class="badge badge-red">✗ Missed</span>'}</td><td style="color:#7A9CA8;">${log.time||'—'}</td><td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#3A5563;">${log.notes||'—'}</td><td><select id="ntype-${log.id}" onclick="event.stopPropagation()" style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:7px;color:#1B5271;font-size:0.75rem;padding:5px 8px;font-family:'Outfit',sans-serif;cursor:pointer;margin-bottom:4px;width:100%;"><option value="advice" ${en?.type==='advice'?'selected':''}>💊 Advice</option><option value="reminder" ${en?.type==='reminder'?'selected':''}>🔔 Reminder</option><option value="praise" ${en?.type==='praise'?'selected':''}>🌟 Praise</option><option value="urgent" ${en?.type==='urgent'?'selected':''}>⚠️ Urgent</option></select><input type="text" placeholder="Write note…" value="${en?.message||''}" id="note-${log.id}" onclick="event.stopPropagation()" style="background:#FFFFFF;border:1px solid #D1E4DE;border-radius:7px;color:#0E1C28;font-size:0.78rem;padding:5px 10px;width:200px;font-family:'Outfit',sans-serif;"></td><td><button class="btn-secondary" onclick="saveNote('${p.pid}',${log.id},event)" style="font-size:0.75rem;padding:5px 12px;white-space:nowrap;">Send →</button></td></tr>`;
    }).join('');
    return `<div class="patient-card mb-3" style="margin-bottom:14px;"><div class="patient-card-header" onclick="toggleDetail('${p.pid}')"><div class="patient-avatar" style="background:${avatarBg};width:48px;height:48px;font-size:1rem;flex-shrink:0;">${initials}</div><div style="flex:1;min-width:120px;"><div style="font-weight:700;font-size:0.95rem;color:#1B5271;">${p.name}</div><div style="font-size:0.75rem;color:#7A9CA8;margin-top:2px;">${p.medicine} · ${p.logs.length} logs</div></div><div style="min-width:90px;">${badgeAdherence(p.rate)}<div class="adherence-bar" style="margin-top:6px;width:90px;"><div class="adherence-fill${p.rate>=80?'':p.rate>=50?' warning':' danger'}" style="width:${p.rate}%;"></div></div></div><div class="sparkline" style="width:72px;height:36px;">${sparks}</div><div>${riskBadge(p.rate)}</div><div style="color:#7A9CA8;font-size:0.75rem;margin-left:auto;user-select:none;" id="arr-${p.pid}">▼ expand</div></div><div class="patient-card-detail" id="det-${p.pid}"><div style="font-weight:700;font-size:0.875rem;color:#1B5271;margin-bottom:14px;">📋 Medication Log</div><div style="overflow-x:auto;"><table class="dt-table" style="min-width:700px;"><thead><tr><th>Date</th><th>Medication</th><th>Status</th><th>Time</th><th>Patient Notes</th><th>Your Note</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div></div>`;
  }).join('');
}

window.toggleDetail=function(pid){ const el=document.getElementById('det-'+pid); const arr=document.getElementById('arr-'+pid); if(!el) return; const open=el.style.display==='block'; el.style.display=open?'none':'block'; if(arr) arr.textContent=open?'▼ expand':'▲ collapse'; };

window.saveNote=function(patientId,logId,e){
  e.stopPropagation();
  const input=document.getElementById('note-'+logId); const typeEl=document.getElementById('ntype-'+logId);
  const message=input?.value.trim(); const type=typeEl?.value||'advice';
  if(!message){ showToast('Please write a note first.','error'); return; }
  const s=getSession(); const notes=getNotes();
  const filtered=notes.filter(n=>!(n.patientId===patientId&&n.logId===logId));
  filtered.push({id:nextNoteId(),doctorId:s.id,doctorName:s.name,patientId,logId,message,type,createdAt:new Date().toISOString(),read:false});
  DB.set('dt_notes',filtered);
  showToast('Note sent to patient!');
};

function renderTrendChart(){
  const canvas=document.getElementById('trendChart'); if(!canvas||!window.Chart) return;
  const ex=Chart.getChart(canvas); if(ex) ex.destroy();
  const allLogs=getLogs();
  const days=[]; for(let i=6;i>=0;i--){ const d=new Date('2026-05-11'); d.setDate(d.getDate()-i); days.push(d.toISOString().split('T')[0]); }
  const rates=days.map(d=>{ const dl=allLogs.filter(l=>l.date===d); return dl.length?adherenceRate(dl):null; });
  const labels=days.map(d=>parseInt(d.split('-')[2])+' May');
  new Chart(canvas.getContext('2d'),{type:'line',data:{labels,datasets:[{label:'Adherence %',data:rates,borderColor:'#5DAC96',backgroundColor:'rgba(93,172,150,0.10)',borderWidth:2.5,pointBackgroundColor:'#5DAC96',pointBorderColor:'#FFFFFF',pointBorderWidth:2,pointRadius:5,pointHoverRadius:7,tension:0.4,fill:true,spanGaps:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1B5271',titleColor:'#FFFFFF',bodyColor:'#9DD1C2',padding:12}},scales:{x:{grid:{color:'rgba(209,228,222,0.5)'},ticks:{color:'#7A9CA8',font:{family:'Outfit',size:11}}},y:{min:0,max:100,grid:{color:'rgba(209,228,222,0.5)'},ticks:{color:'#7A9CA8',font:{family:'Outfit',size:11},callback:v=>v+'%'}}}}});
}

function renderDonutChart(){
  const canvas=document.getElementById('donutChart'); if(!canvas||!window.Chart) return;
  const ex=Chart.getChart(canvas); if(ex) ex.destroy();
  const patients=getDoctorPatients();
  const good=patients.filter(p=>p.rate>=80).length; const fair=patients.filter(p=>p.rate>=60&&p.rate<80).length; const risk=patients.filter(p=>p.rate<60).length;
  new Chart(canvas.getContext('2d'),{type:'doughnut',data:{labels:['Good ≥80%','Fair 60–79%','At Risk <60%'],datasets:[{data:[good,fair,risk],backgroundColor:['rgba(93,172,150,0.85)','rgba(217,138,42,0.85)','rgba(217,79,79,0.85)'],borderColor:'#FFFFFF',borderWidth:3,hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false},tooltip:{backgroundColor:'#1B5271',titleColor:'#FFFFFF',bodyColor:'#9DD1C2'}}}});
}

/* ════════════════════════════════════════════════════════════════
   GLOBAL INIT
════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  const path=window.location.pathname;
  if      (path.includes('portal'))            initPortal();
  else if (path.includes('patient-dashboard')) initPatientDashboard();
  else if (path.includes('doctor-dashboard'))  initDoctorDashboard();
  else                                          seedDemoData();

  document.querySelectorAll('.nav-link').forEach(l=>{ const href=l.getAttribute('href'); if(href&&window.location.pathname.endsWith(href)) l.classList.add('active-link'); });
  document.querySelectorAll('[data-logout]').forEach(btn=>{ btn.addEventListener('click',()=>{ clearSession(); window.location.href='portal.html'; }); });
});

function validateForm(){
  const name=document.getElementById('name')?.value.trim();
  const email=document.getElementById('email')?.value.trim();
  if(!name||!email){ showToast('Please fill required fields.','error'); return false; }
  showToast("Inquiry submitted! We'll respond within 24 hours.");
  return false;
}
