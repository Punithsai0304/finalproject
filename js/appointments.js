"use strict";
function openFeedback(appointmentId){
 const appt=CN.get(CN.KEYS.appointments).find(a=>a.id===appointmentId);
 if(!appt||appt.status!=="Completed")return;
 const existing=CN.get(CN.KEYS.feedback).some(f=>f.appointmentId===appointmentId);
 if(existing){alert("Feedback has already been submitted for this appointment.");return;}
 const rating=prompt("Rate your visit from 1 to 5 stars:");
 if(rating===null)return;
 const n=Number(rating);if(!Number.isInteger(n)||n<1||n>5){alert("Please enter a rating from 1 to 5.");return;}
 const comment=prompt("Optional written feedback (leave blank to skip):")||"";
 const all=CN.get(CN.KEYS.feedback);
 all.push({id:CN.id("FB"),appointmentId,patientId:appt.patientId,providerId:appt.providerId,rating:n,comment:comment.trim(),created:new Date().toISOString()});
 CN.set(CN.KEYS.feedback,all);
 alert("Thank you! Your feedback has been submitted.");
 if(typeof renderPatient==="function")renderPatient();
 if(typeof renderAdmin==="function")renderAdmin();
}
