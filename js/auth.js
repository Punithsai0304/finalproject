"use strict";
const K=CN.KEYS;
const reg=document.getElementById("registerForm");
if(reg) reg.addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("regName").value.trim();
  const email=document.getElementById("regEmail").value.trim().toLowerCase();
  const phone=document.getElementById("regPhone").value.trim();
  const dob=document.getElementById("regDob").value;
  const password=document.getElementById("regPassword").value;
  if(!name||!email||!phone||!dob||password.length<6){CN.flash("registerMessage","Please complete every field. Password must be at least 6 characters.",true);return;}
  const patients=CN.get(K.patients);
  if(patients.some(p=>p.email.toLowerCase()===email)){CN.flash("registerMessage","An account already exists for this email. Sign in or recover your Patient ID.",true);return;}
  const patient={id:CN.patientId(),name,email,phone,dob,password,role:"patient",created:new Date().toISOString()};
  patients.push(patient);CN.set(K.patients,patients);
  const box=document.getElementById("createdAccount");
  box.classList.remove("hidden");
  box.innerHTML=`<b>Welcome to CareNova, ${CN.esc(name)}!</b><p>Your permanent Patient ID is:</p><strong>${CN.esc(patient.id)}</strong><p>Save this ID. Use it every time you sign in.</p><a class="btn btn-dark full" href="login.html">Continue to sign in ↗</a>`;
  reg.reset();CN.flash("registerMessage","Account created successfully.");
});
const login=document.getElementById("loginForm");
if(login) login.addEventListener("submit",e=>{
  e.preventDefault();
  const id=document.getElementById("loginId").value.trim().toUpperCase();
  const password=document.getElementById("loginPassword").value;
  const p=CN.get(K.patients).find(x=>x.id.toUpperCase()===id && x.password===password);
  if(!p){CN.flash("loginMessage","Patient ID or password is incorrect.",true);return;}
  CN.set(K.session,{id:p.id});
  location.href=p.role==="admin"?"admin.html":"user-dashboard.html";
});
const recover=document.getElementById("recoverBtn");
if(recover) recover.addEventListener("click",()=>document.getElementById("recoveryBox").classList.toggle("hidden"));
const recoverSubmit=document.getElementById("recoverSubmit");
if(recoverSubmit) recoverSubmit.addEventListener("click",()=>{
  const email=document.getElementById("recoverEmail").value.trim().toLowerCase();
  const p=CN.get(K.patients).find(x=>x.email.toLowerCase()===email);
  document.getElementById("recoveryMessage").textContent=p?"Your permanent Patient ID is: "+p.id:"No account was found for this email.";
});

