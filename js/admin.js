"use strict";
const AK=CN.KEYS;
const adminRoot=document.getElementById("adminApp");
let adminTab="overview";
function allAppointments(){return CN.get(AK.appointments);}
function patientById(id){return CN.get(AK.patients).find(p=>p.id===id);}
function petById(id){return CN.get(AK.pets).find(p=>p.id===id);}
function adminProvider(id){return CN.providers().find(p=>p.id===id);}
function adminHead(title,sub){return `<div class="dash-heading"><div><p class="eyebrow">CARENOVA ADMINISTRATION</p><h1>${title}</h1><p>${sub}</p></div></div>`;}
function adminStats(){const a=allAppointments();return `<div class="stats-grid"><div class="stat-card"><small>Registered patients</small><b>${CN.get(AK.patients).filter(p=>p.role!=="admin").length}</b></div><div class="stat-card"><small>Pet profiles</small><b>${CN.get(AK.pets).length}</b></div><div class="stat-card"><small>Total appointments</small><b>${a.length}</b></div><div class="stat-card"><small>Completed consultations</small><b>${a.filter(x=>x.status==="Completed").length}</b></div></div>`;}
function adminAppointmentTable(list){
 if(!list.length)return `<div class="empty-state">No appointments found.</div>`;
 return `<div class="table-wrap"><table><thead><tr><th>Appointment</th><th>Patient / pet</th><th>Provider</th><th>Date</th><th>Status</th><th>Manage</th></tr></thead><tbody>${list.map(a=>{const p=patientById(a.patientId),v=adminProvider(a.providerId);return `<tr><td>${CN.esc(a.id)}<br>${CN.esc(a.kind)}</td><td>${CN.esc(p?.name||"Unknown")}<br><small>${CN.esc(a.kind==="Pet"?a.petName||"Pet":p?.id||"")}</small></td><td>${CN.esc(v?.name||"Unavailable")}</td><td>${CN.date(a.date)}<br>${CN.esc(a.time)}</td><td>${CN.status(a.status)}</td><td>${a.status==="Pending"?`<button class="action-btn" onclick="adminSetStatus('${a.id}','Confirmed')">Confirm</button>`:""}${["Pending","Confirmed"].includes(a.status)?`<button class="action-btn" onclick="adminSetStatus('${a.id}','Completed')">Complete</button><button class="action-btn danger" onclick="adminSetStatus('${a.id}','Cancelled')">Cancel</button>`:"—"}</td></tr>`;}).join("")}</tbody></table></div>`;
}
function adminSetStatus(id,status){
 const all=allAppointments(),a=all.find(x=>x.id===id);if(!a)return;
 if(status==="Completed"&&!["Pending","Confirmed"].includes(a.status))return;
 a.status=status;a.updated=new Date().toISOString();CN.set(AK.appointments,all);renderAdmin();
}
function renderAdmin(){
 const s=CN.get(AK.session,null),p=s&&patientById(s.id);
 if(!p||p.role!=="admin"){location.href="login.html";return;}
 document.querySelectorAll("[data-admin-tab]").forEach(b=>b.classList.toggle("active",b.dataset.adminTab===adminTab));
 if(adminTab==="overview")adminRoot.innerHTML=adminHead("Good morning, CareNova.","A clear view of your healthcare community.")+adminStats()+`
 <section class="panel"><div class="panel-head"><h2>Recent appointments</h2><button class="btn btn-outline btn-small" onclick="adminTab='appointments';renderAdmin()">Manage all</button></div>${adminAppointmentTable(allAppointments().slice().reverse().slice(0,8))}</section>
 <section class="panel"><div class="panel-head"><h2>Quick patient lookup</h2></div><form class="inline-form" id="quickSearch"><input class="search-input" id="quickId" placeholder="Enter Patient ID or Pet ID"><button class="btn btn-dark btn-small">Search</button></form><div id="quickResult"></div></section>`;
 else if(adminTab==="patients")renderAdminPatients();
 else if(adminTab==="appointments")adminRoot.innerHTML=adminHead("Appointment management","Confirm requests, complete consultations, or cancel appointments.")+`<section class="panel"><div class="panel-head"><h2>All appointments</h2></div>${adminAppointmentTable(allAppointments())}</section>`;
 else if(adminTab==="providers")renderAdminProviders();
 else if(adminTab==="feedback")renderAdminFeedback();
 const quick=document.getElementById("quickSearch");
 if(quick)quick.addEventListener("submit",e=>{e.preventDefault();const id=document.getElementById("quickId").value.trim().toUpperCase();const patient=patientById(id),pet=petById(id);const target=patient||pet;document.getElementById("quickResult").innerHTML=target?`<div class="notice"><b>${patient?"Patient":"Pet"} profile found</b><br>${CN.esc(target.name)} · ID: ${CN.esc(target.id)}<br>${patient?`Email: ${CN.esc(patient.email)} · Phone: ${CN.esc(patient.phone)}<br>Linked pets: ${CN.get(AK.pets).filter(x=>x.patientId===patient.id).map(x=>CN.esc(x.name)+" ("+CN.esc(x.id)+")").join(", ")||"None"}`:`Owner Patient ID: ${CN.esc(pet.patientId)}<br>Species: ${CN.esc(pet.species)} · Vaccination: ${CN.esc(pet.vaccination||"Not recorded")}<br>Medical notes: ${CN.esc(pet.notes||"None")}`}</div>`:`<div class="notice error">No patient or pet found with that ID.</div>`;});
}
function renderAdminPatients(){
 adminRoot.innerHTML=adminHead("Patients & pets","Search permanent IDs and view linked profiles. Records cannot be deleted.")+`
 <section class="panel"><div class="panel-head"><h2>Find a patient or pet</h2></div><form class="inline-form" id="patientSearch"><input class="search-input" id="patientQuery" placeholder="Patient ID, Pet ID, name or email"><button class="btn btn-dark btn-small">Search</button></form><div id="patientResults"></div></section>
 <section class="panel"><div class="panel-head"><h2>Registered patients</h2></div><div class="table-wrap"><table><thead><tr><th>Patient ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Linked pets</th></tr></thead><tbody>${CN.get(AK.patients).filter(p=>p.role!=="admin").map(p=>`<tr><td>${CN.esc(p.id)}</td><td>${CN.esc(p.name)}</td><td>${CN.esc(p.email)}</td><td>${CN.esc(p.phone)}</td><td>${CN.get(AK.pets).filter(x=>x.patientId===p.id).map(x=>CN.esc(x.name)+" · "+CN.esc(x.id)).join("<br>")||"—"}</td></tr>`).join("")}</tbody></table></div></section>`;
 document.getElementById("patientSearch").addEventListener("submit",e=>{e.preventDefault();const q=document.getElementById("patientQuery").value.trim().toLowerCase();const patients=CN.get(AK.patients).filter(p=>p.role!=="admin"&&(p.id.toLowerCase().includes(q)||p.name.toLowerCase().includes(q)||p.email.toLowerCase().includes(q)));const pets=CN.get(AK.pets).filter(p=>p.id.toLowerCase().includes(q)||p.name.toLowerCase().includes(q));document.getElementById("patientResults").innerHTML=[...patients.map(p=>`<div class="notice"><b>${CN.esc(p.name)}</b> · ${CN.esc(p.id)}<br>${CN.esc(p.email)} · ${CN.esc(p.phone)}<br>Linked pets: ${CN.get(AK.pets).filter(x=>x.patientId===p.id).map(x=>CN.esc(x.name)+" ("+CN.esc(x.id)+")").join(", ")||"None"}</div>`),...pets.map(p=>`<div class="notice"><b>${CN.esc(p.name)}</b> · ${CN.esc(p.id)}<br>Owner: ${CN.esc(patientById(p.patientId)?.name||"Unknown")} · ${CN.esc(p.patientId)}<br>${CN.esc(p.species)} · Vaccination: ${CN.esc(p.vaccination||"Not recorded")}</div>`)].join("")||`<div class="empty-state">No matching records.</div>`;});
}
function renderAdminProviders(){
 const list=CN.providers();
 adminRoot.innerHTML=adminHead("Care providers","Add or update doctors and veterinarians. Provider records cannot be deleted.")+`
 <section class="panel"><div class="panel-head"><h2>Add a provider</h2></div><form id="providerForm"><div class="field-grid three"><label class="field">Provider name<input id="providerName" required></label><label class="field">Type<select id="providerType"><option>Human</option><option>Veterinary</option></select></label><label class="field">Specialization<input id="providerSpecialty" required></label><label class="field">Years of experience<input id="providerExperience" type="number" min="0" max="70" required></label></div><div class="form-actions"><button class="btn btn-coral">Add provider</button></div><p id="providerMessage" class="form-message"></p></form></section>
 <section class="panel"><div class="panel-head"><h2>Manage providers</h2></div><div class="table-wrap"><table><thead><tr><th>Provider ID</th><th>Name</th><th>Type</th><th>Specialization</th><th>Rating</th><th>Availability</th><th>Update</th></tr></thead><tbody>${list.map(v=>`<tr><td>${CN.esc(v.id)}</td><td>${CN.esc(v.name)}</td><td>${CN.esc(v.type)}</td><td>${CN.esc(v.specialty)}</td><td>${CN.stars(CN.providerRating(v.id))}</td><td>${v.available?"Available":"Unavailable"}</td><td><button class="action-btn" onclick="editProvider('${v.id}')">Edit</button><button class="action-btn" onclick="toggleProvider('${v.id}')">${v.available?"Pause":"Enable"}</button></td></tr>`).join("")}</tbody></table></div></section>`;
 document.getElementById("providerForm").addEventListener("submit",e=>{e.preventDefault();const all=CN.providers();all.push({id:CN.id(document.getElementById("providerType").value==="Human"?"DOC":"VET"),name:document.getElementById("providerName").value.trim(),type:document.getElementById("providerType").value,specialty:document.getElementById("providerSpecialty").value.trim(),experience:Number(document.getElementById("providerExperience").value),available:true});CN.set(AK.providers,all);renderAdminProviders();});
}
function editProvider(id){
 const all=CN.providers(),p=all.find(x=>x.id===id);if(!p)return;
 const name=prompt("Update provider name:",p.name);if(name===null)return;
 const specialty=prompt("Update specialization:",p.specialty);if(specialty===null)return;
 const exp=prompt("Years of experience:",String(p.experience));if(exp===null||!Number.isFinite(Number(exp)))return;
 p.name=name.trim()||p.name;p.specialty=specialty.trim()||p.specialty;p.experience=Number(exp);CN.set(AK.providers,all);renderAdminProviders();
}
function toggleProvider(id){const all=CN.providers(),p=all.find(x=>x.id===id);if(p){p.available=!p.available;CN.set(AK.providers,all);renderAdminProviders();}}
function renderAdminFeedback(){
 const f=CN.get(AK.feedback);
 adminRoot.innerHTML=adminHead("Patient feedback","Ratings and comments submitted after completed consultations.")+`<section class="panel"><div class="panel-head"><h2>Feedback received · ${f.length}</h2></div>${f.length?f.slice().reverse().map(x=>{const p=patientById(x.patientId),v=adminProvider(x.providerId),a=allAppointments().find(y=>y.id===x.appointmentId);return `<div class="feedback-item"><b>${CN.esc(p?.name||"Patient")} · ${CN.esc(v?.name||"Provider")}</b><p><span class="rating">${"★".repeat(x.rating)}${"☆".repeat(5-x.rating)}</span> · ${CN.date(a?.date)}</p><p>${CN.esc(x.comment||"No written comment.")}</p><small>${CN.esc(x.appointmentId)}</small></div>`;}).join(""):`<div class="empty-state">No feedback submitted yet.</div>`}</section>`;
}
document.querySelectorAll("[data-admin-tab]").forEach(b=>b.addEventListener("click",()=>{adminTab=b.dataset.adminTab;renderAdmin();}));
document.getElementById("adminLogout").addEventListener("click",CN.logout);
renderAdmin();
