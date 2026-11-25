"use strict";
const K=CN.KEYS;
const root=document.getElementById("patientApp");
let activeTab="overview";
function patientPets(){const p=CN.patient();return CN.get(K.pets).filter(x=>x.patientId===p.id);}
function patientAppointments(){const p=CN.patient();return CN.get(K.appointments).filter(x=>x.patientId===p.id);}
function providerName(id){return CN.providers().find(x=>x.id===id)?.name||"Provider unavailable";}
function tabHead(title,sub,action=""){return `<div class="dash-heading"><div><p class="eyebrow">YOUR CARE JOURNEY</p><h1>${title}</h1><p>${sub}</p></div>${action}</div>`;}
function renderPatient(){
 const p=CN.requirePatient();if(!p)return;
 document.getElementById("userBadge").textContent=p.name;
 document.getElementById("sidebarPatientId").textContent=p.id;
 document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===activeTab));
 if(activeTab==="overview") root.innerHTML=tabHead("Hello, "+CN.esc(p.name.split(" ")[0])+".","Your care journey, thoughtfully organized.",`<button class="btn btn-coral" onclick="activeTab='appointments';renderPatient()">Book an appointment ↗</button>`)+`
 <div class="stats-grid"><div class="stat-card"><small>My appointments</small><b>${patientAppointments().length}</b></div><div class="stat-card"><small>Upcoming visits</small><b>${patientAppointments().filter(a=>["Pending","Confirmed"].includes(a.status)).length}</b></div><div class="stat-card"><small>My pets</small><b>${patientPets().length}</b></div><div class="stat-card"><small>Completed visits</small><b>${patientAppointments().filter(a=>a.status==="Completed").length}</b></div></div>
 <section class="panel"><div class="panel-head"><h2>Upcoming appointments</h2><button class="btn btn-outline btn-small" onclick="activeTab='appointments';renderPatient()">View all</button></div>${appointmentTable(patientAppointments().filter(a=>["Pending","Confirmed"].includes(a.status)))}</section>
 <section class="panel"><div class="panel-head"><h2>Your care profile</h2></div><p><b>${CN.esc(p.name)}</b> · ${CN.esc(p.email)} · ${CN.esc(p.phone)}</p><p>Permanent Patient ID: <b>${CN.esc(p.id)}</b></p></section>`;
 else if(activeTab==="appointments") renderAppointmentsPage();
 else if(activeTab==="pets") renderPetsPage();
 else if(activeTab==="doctors") renderProvidersPage();
}
function appointmentTable(list){
 if(!list.length)return `<div class="empty-state">No appointments to show yet.</div>`;
 return `<div class="table-wrap"><table><thead><tr><th>Visit</th><th>Provider</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>${list.map(a=>`<tr><td>${CN.esc(a.kind==="Pet"?"♡ "+a.petName:"✳ Human")}<br><small>${CN.esc(a.id)}</small></td><td>${CN.esc(providerName(a.providerId))}</td><td>${CN.date(a.date)}<br>${CN.esc(a.time)}</td><td>${CN.status(a.status)}</td><td>${a.status==="Pending"||a.status==="Confirmed"?`<button class="action-btn danger" onclick="cancelPatientAppointment('${a.id}')">Cancel</button>`:"—"} ${a.status==="Completed"&&!CN.get(K.feedback).some(f=>f.appointmentId===a.id)?`<button class="action-btn" onclick="openFeedback('${a.id}')">Rate visit</button>`:""}</td></tr>`).join("")}</tbody></table></div>`;
}
function renderAppointmentsPage(){
 root.innerHTML=tabHead("Appointments","Book human or veterinary care and follow each visit.")+`
 <section class="panel"><div class="panel-head"><h2>Book a visit</h2></div><form id="bookForm"><div class="field-grid three">
 <label class="field">Care type<select id="bookKind"><option>Human</option><option>Pet</option></select></label>
 <label class="field">Doctor / veterinarian<select id="bookProvider" required></select></label>
 <label class="field">Patient / pet<select id="bookSubject" required></select></label>
 <label class="field">Appointment date<input id="bookDate" type="date" required></label>
 <label class="field">Preferred time<select id="bookTime"><option>09:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>02:00 PM</option><option>03:00 PM</option><option>04:00 PM</option></select></label>
 <label class="field">Reason for visit<input id="bookReason" required placeholder="Brief reason"></label>
 </div><div class="form-actions"><button class="btn btn-coral" type="submit">Request appointment ↗</button></div><p id="bookMessage" class="form-message"></p></form></section>
 <section class="panel"><div class="panel-head"><h2>Appointment history</h2></div>${appointmentTable(patientAppointments())}</section>`;
 populateBooking();
 document.getElementById("bookKind").addEventListener("change",populateBooking);
 document.getElementById("bookForm").addEventListener("submit",bookAppointment);
}
function populateBooking(){
 const kind=document.getElementById("bookKind").value;
 const list=CN.providers().filter(x=>x.type===(kind==="Pet"?"Veterinary":"Human")&&x.available);
 document.getElementById("bookProvider").innerHTML=list.map(x=>`<option value="${x.id}">${CN.esc(x.name)} · ${CN.esc(x.specialty)}</option>`).join("");
 const subjects=kind==="Pet"?patientPets():[{id:CN.patient().id,name:CN.patient().name}];
 document.getElementById("bookSubject").innerHTML=subjects.map(x=>`<option value="${x.id}">${CN.esc(x.name)} · ${CN.esc(x.id)}</option>`).join("");
}
function bookAppointment(e){
 e.preventDefault();
 const p=CN.patient(),kind=document.getElementById("bookKind").value,subjectId=document.getElementById("bookSubject").value;
 if(kind==="Pet"&&!patientPets().some(x=>x.id===subjectId)){CN.flash("bookMessage","Add a pet profile before booking veterinary care.",true);return;}
 const date=document.getElementById("bookDate").value;
 if(!date||date<new Date().toISOString().slice(0,10)){CN.flash("bookMessage","Choose today or a future date.",true);return;}
 const providerId=document.getElementById("bookProvider").value;
 const pet=patientPets().find(x=>x.id===subjectId);
 const appt={id:CN.id("APT"),patientId:p.id,kind,petId:pet?.id||null,petName:pet?.name||null,providerId,date,time:document.getElementById("bookTime").value,reason:document.getElementById("bookReason").value.trim(),status:"Pending",created:new Date().toISOString()};
 const all=CN.get(K.appointments);all.push(appt);CN.set(K.appointments,all);
 CN.flash("bookMessage","Appointment requested. Your appointment ID is "+appt.id);
 document.getElementById("bookForm").reset();populateBooking();
}
function cancelPatientAppointment(id){
 const all=CN.get(K.appointments),a=all.find(x=>x.id===id);
 if(!a||!["Pending","Confirmed"].includes(a.status))return;
 a.status="Cancelled";CN.set(K.appointments,all);renderPatient();
}
function renderPetsPage(){
 const pets=patientPets();
 root.innerHTML=tabHead("My pets","Every companion has their own permanent Pet ID.")+`
 <section class="panel"><div class="panel-head"><h2>Add a pet profile</h2></div><form id="petForm"><div class="field-grid three">
 <label class="field">Pet name<input id="petName" required></label><label class="field">Species<select id="petSpecies"><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option></select></label><label class="field">Breed<input id="petBreed" placeholder="Breed"></label>
 <label class="field">Date of birth (optional)<input id="petDob" type="date"></label><label class="field">Vaccination information<input id="petVax" placeholder="e.g. Rabies, due Dec 2026"></label><label class="field">Medical notes<input id="petNotes" placeholder="Allergies or notes"></label></div><div class="form-actions"><button class="btn btn-coral">Add pet ↗</button></div><p id="petMessage" class="form-message"></p></form></section>
 <div class="card-grid">${pets.length?pets.map(p=>`<article class="pet-card-dash"><div class="provider-top"><div class="avatar">♡</div><span class="status confirmed">${CN.esc(p.species)}</span></div><h3>${CN.esc(p.name)}</h3><p>${CN.esc(p.breed||"Breed not specified")}</p><div class="pet-meta"><span>Pet ID: ${CN.esc(p.id)}</span><span>Vaccines: ${CN.esc(p.vaccination||"Not recorded")}</span></div><p>${CN.esc(p.notes||"No medical notes recorded.")}</p><p><b>Visit history:</b> ${patientAppointments().filter(a=>a.petId===p.id).length} appointment(s)</p></article>`).join(""):`<div class="empty-state">No pet profiles yet. Add your first companion above.</div>`}</div>`;
 document.getElementById("petForm").addEventListener("submit",e=>{
 e.preventDefault();const p=CN.patient(),all=CN.get(K.pets);
 const pet={id:CN.id("PET"),patientId:p.id,name:document.getElementById("petName").value.trim(),species:document.getElementById("petSpecies").value,breed:document.getElementById("petBreed").value.trim(),dob:document.getElementById("petDob").value,vaccination:document.getElementById("petVax").value.trim(),notes:document.getElementById("petNotes").value.trim(),created:new Date().toISOString()};
 all.push(pet);CN.set(K.pets,all);renderPetsPage();
 });
}
function renderProvidersPage(){
 const list=CN.providers().filter(x=>x.available);
 root.innerHTML=tabHead("Find your care","Explore our human healthcare and veterinary providers.")+`
 <section class="panel"><div class="field-grid"><label class="field">Care type<select id="providerKind"><option>Human</option><option>Veterinary</option></select></label><label class="field">Search specialization<input id="providerSearch" placeholder="Try cardiology or pet dermatology"></label></div></section><div id="providerCards" class="card-grid"></div>`;
 const draw=()=>{const kind=document.getElementById("providerKind").value,q=document.getElementById("providerSearch").value.toLowerCase();const found=CN.providers().filter(x=>x.available&&x.type===(kind==="Pet"?"Veterinary":"Human")&&(x.specialty+" "+x.name).toLowerCase().includes(q));document.getElementById("providerCards").innerHTML=found.map(x=>`<article class="provider-card"><div class="provider-top"><div class="avatar">✳</div><span class="rating">★ ${CN.stars(CN.providerRating(x.id))}</span></div><h3>${CN.esc(x.name)}</h3><p>${CN.esc(x.specialty)} · ${x.experience} years experience</p><button class="btn btn-dark btn-small" onclick="activeTab='appointments';renderPatient();setTimeout(()=>{document.getElementById('bookKind').value='${x.type==="Veterinary"?"Pet":"Human"}';populateBooking();document.getElementById('bookProvider').value='${x.id}'},0)">Book a visit ↗</button></article>`).join("")||`<div class="empty-state">No providers match your search.</div>`;};
 document.getElementById("providerKind").addEventListener("change",draw);document.getElementById("providerSearch").addEventListener("input",draw);draw();
}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{activeTab=b.dataset.tab;renderPatient();}));
document.getElementById("logoutBtn").addEventListener("click",CN.logout);
renderPatient();
