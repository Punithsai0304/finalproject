"use strict";
const CN = (() => {
  const KEYS = {patients:"cn_patients",pets:"cn_pets",providers:"cn_providers",appointments:"cn_appointments",feedback:"cn_feedback",session:"cn_session"};
  const get = (key, fallback=[]) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const id = prefix => prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,6).toUpperCase();

  // Short, sequential, permanent patient IDs
  const patientId = () => {
    const numbers = get(KEYS.patients)
      .map(p => /^CN-(\d+)$/.exec(p.id))
      .filter(Boolean)
      .map(m => Number(m[1]));

    const next = Math.max(0, ...numbers) + 1;
    return "CN-" + String(next).padStart(4, "0");
  };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const date = value => value ? new Date(value+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const stamp = value => value ? new Date(value).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}) : "—";
  const patient = () => { const s=get(KEYS.session,null); return s ? get(KEYS.patients).find(p=>p.id===s.id) || null : null; };
  const providerRating = providerId => { const all=get(KEYS.feedback).filter(f=>f.providerId===providerId); return all.length ? (all.reduce((sum,f)=>sum+Number(f.rating),0)/all.length).toFixed(1) : "New"; };
  const providers = () => get(KEYS.providers);
  const seed = () => {
    if(!get(KEYS.providers).length) set(KEYS.providers,[
      {id:id("DOC"),name:"Dr. Mira Rao",type:"Human",specialty:"Cardiology",experience:10,available:true},
      {id:id("DOC"),name:"Dr. Arjun Mehta",type:"Human",specialty:"Dermatology",experience:8,available:true},
      {id:id("DOC"),name:"Dr. Nisha Kumar",type:"Human",specialty:"General Medicine",experience:7,available:true},
      {id:id("VET"),name:"Dr. Tara Sen",type:"Veterinary",specialty:"Veterinary Medicine",experience:9,available:true},
      {id:id("VET"),name:"Dr. Karan Das",type:"Veterinary",specialty:"Pet Dermatology",experience:6,available:true}
    ]);
    if(!get(KEYS.patients).some(p=>p.id==="ADMIN")) set(KEYS.patients,[...get(KEYS.patients),{id:"ADMIN",name:"CareNova Admin",email:"admin@carenova.demo",phone:"0000000000",dob:"1990-01-01",password:"Admin@123",role:"admin",created:new Date().toISOString()}]);
  };
  const requirePatient = () => { if(!patient()){location.href="login.html";return null;}return patient(); };
  const logout = () => {localStorage.removeItem(KEYS.session);location.href="login.html";};
  const status = s => `<span class="status ${esc(s.toLowerCase())}">${esc(s)}</span>`;
  const stars = rating => rating==="New" ? "Not rated yet" : "★ "+rating+"/5";
  const flash = (id,text,error=false) => {const el=document.getElementById(id);if(el){el.textContent=text;el.className="form-message "+(error?"error":"success");}};
  seed();
  return {KEYS,get,set,id,patientId,esc,date,stamp,patient,providerRating,providers,requirePatient,logout,status,stars,flash};
})();

