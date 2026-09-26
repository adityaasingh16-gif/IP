const API = window.IP_API_URL || "http://localhost:8080/api/students";
const DEPARTMENTS = ["Computer Engineering","Information Technology","Electronics & Telecommunication","Mechanical Engineering","Civil Engineering"];
const DEMO_KEY = "ip_student_records_v2";
const MODE_KEY = "ip_demo_mode";
let students = [];
let demoMode = localStorage.getItem(MODE_KEY) !== "false";

const DEMO_STUDENTS = [
 {id:"demo-1",studentId:"IP2026CS001",name:"Aarav Sharma",email:"aarav@college.edu",phone:"9876543210",department:"Computer Engineering",year:3,semester:5,attendance:91.5,marks:88,achievements:["Hackathon Finalist","Coding Club"]},
 {id:"demo-2",studentId:"IP2026IT014",name:"Riya Patil",email:"riya@college.edu",phone:"9876543211",department:"Information Technology",year:2,semester:4,attendance:84,marks:81,achievements:["Technical Paper"]},
 {id:"demo-3",studentId:"IP2026ET022",name:"Kabir Mehta",email:"kabir@college.edu",phone:"9876543212",department:"Electronics & Telecommunication",year:4,semester:8,attendance:72.5,marks:76,achievements:["Robotics Club"]},
 {id:"demo-4",studentId:"IP2026ME031",name:"Sneha Joshi",email:"sneha@college.edu",phone:"9876543213",department:"Mechanical Engineering",year:3,semester:6,attendance:68,marks:64,achievements:["CAD Workshop"]},
 {id:"demo-5",studentId:"IP2026CE009",name:"Vihaan Shah",email:"vihaan@college.edu",phone:"9876543214",department:"Civil Engineering",year:2,semester:3,attendance:79,marks:73,achievements:["NSS Volunteer"]},
 {id:"demo-6",studentId:"IP2026CS018",name:"Ananya Kulkarni",email:"ananya@college.edu",phone:"9876543215",department:"Computer Engineering",year:1,semester:2,attendance:96,marks:92,achievements:["Merit Scholarship"]}
];

function init(){
  populateDepartments();
  document.querySelectorAll('nav a[data-section]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showSection(a.dataset.section)}));
  document.getElementById('studentForm').addEventListener('submit',saveStudent);
  document.getElementById('demoToggle').checked=demoMode;
  loadStudents();
}
function populateDepartments(){
  const select=document.getElementById('department');
  DEPARTMENTS.forEach(d=>select.insertAdjacentHTML('beforeend',`<option>${escapeHtml(d)}</option>`));
  const filter=document.getElementById('departmentFilter');
  DEPARTMENTS.forEach(d=>filter.insertAdjacentHTML('beforeend',`<option>${escapeHtml(d)}</option>`));
}
function getDemo(){try{return JSON.parse(localStorage.getItem(DEMO_KEY)||'null')||structuredClone(DEMO_STUDENTS)}catch{return structuredClone(DEMO_STUDENTS)}}
function saveDemo(){localStorage.setItem(DEMO_KEY,JSON.stringify(students));}
async function loadStudents(){
  if(demoMode){students=getDemo();saveDemo();renderAll();setMode(true);return;}
  try{const r=await fetch(API);if(!r.ok)throw new Error();students=await r.json();renderAll();setMode(false)}
  catch{showToast('API unavailable — switched to Demo Mode');demoMode=true;localStorage.setItem(MODE_KEY,'true');students=getDemo();renderAll();setMode(true)}
}
function setMode(demo){document.getElementById('modeBadge').textContent=demo?'● Demo Mode':'● Live API';document.getElementById('modeBadge').className='mode-badge '+(demo?'demo':'live')}
function renderAll(){renderStudents();updateStats();renderDepartments();renderDashboard();renderReports()}
function renderStudents(){
  const search=(document.getElementById('searchInput')?.value||'').toLowerCase(),dept=document.getElementById('departmentFilter')?.value||'',risk=document.getElementById('riskFilter')?.value||'';
  const filtered=students.filter(s=>{const r=isRisk(s);return (!dept||s.department===dept)&&(!risk||(risk==='risk'?r:r===false))&&(!search||[s.name,s.studentId,s.email].some(v=>String(v||'').toLowerCase().includes(search)))});
  const tbody=document.getElementById('studentTable'); if(!tbody)return; tbody.innerHTML=''; document.getElementById('emptyState').style.display=filtered.length?'none':'block';
  filtered.forEach(s=>tbody.appendChild(studentRow(s,true)));
}
function studentRow(s,actions){
  const tr=document.createElement('tr');const risk=isRisk(s);
  tr.innerHTML=`<td><div class="student-name">${escapeHtml(s.name)}</div><div class="student-id">${escapeHtml(s.studentId)}</div></td><td><span class="pill">${escapeHtml(s.department)}</span></td><td>Year ${s.year}<br><small>Sem ${s.semester}</small></td><td><span class="metric ${s.attendance<75?'bad':''}">${Number(s.attendance||0).toFixed(1)}%</span></td><td>${getMarks(s)==null?'—':getMarks(s).toFixed(1)+'%'}</td><td><span class="status ${risk?'risk':'good'}">${risk?'Needs Attention':'Good Standing'}</span></td>${actions?`<td><button class="action" onclick="viewStudent('${s.id}')">View</button><button class="action" onclick="editStudent('${s.id}')">Edit</button><button class="action delete" onclick="deleteStudent('${s.id}')">Delete</button></td>`:''}`;
  return tr;
}
function updateStats(){
  const n=students.length,att=n?students.reduce((a,s)=>a+Number(s.attendance||0),0)/n:0,marked=students.filter(s=>getMarks(s)!=null),marks=marked.length?marked.reduce((a,s)=>a+getMarks(s),0)/marked.length:0;
  setText('totalStudents',n);setText('totalDepartments',new Set(students.map(s=>s.department)).size);setText('avgAttendance',att.toFixed(1)+'%');setText('avgMarks',marked.length?marks.toFixed(1)+'%':'—');setText('attendanceStatus',att<75?'Below 75% threshold':'Healthy average');setText('studentTrend',n?'Live records':'No records')
}
function renderDashboard(){
  const bars=document.getElementById('departmentBars'),riskList=document.getElementById('riskList'),recent=document.getElementById('recentTable');if(!bars)return;
  bars.innerHTML=DEPARTMENTS.map(d=>{const list=students.filter(s=>s.department===d),avg=list.length?list.reduce((a,s)=>a+Number(s.attendance||0),0)/list.length:0;return `<div class="bar-row"><div><span>${escapeHtml(d)}</span><b>${avg.toFixed(0)}%</b></div><div class="bar"><i style="width:${Math.min(100,avg)}%"></i></div></div>`}).join('');
  const risks=students.filter(isRisk);setText('riskCount',risks.length);riskList.innerHTML=risks.length?risks.slice(0,5).map(s=>`<button class="risk-item" onclick="viewStudent('${s.id}')"><span>${escapeHtml(s.name)}<small>${escapeHtml(s.department)}</small></span><strong>${Number(s.attendance||0).toFixed(0)}% / ${getMarks(s)==null?'—':getMarks(s).toFixed(0)+'%'}</strong></button>`).join(''):'<div class="empty mini">No students currently flagged.</div>';
  recent.innerHTML=students.slice().reverse().slice(0,5).map(s=>studentRow(s,false)).join('');
}
function renderDepartments(){
  const wrap=document.getElementById('departmentCards');if(!wrap)return;
  wrap.innerHTML=DEPARTMENTS.map(d=>{const l=students.filter(s=>s.department===d),a=l.length?l.reduce((x,s)=>x+Number(s.attendance||0),0)/l.length:0,m=l.filter(s=>getMarks(s)!=null),mm=m.length?m.reduce((x,s)=>x+getMarks(s),0)/m.length:0;return `<div class="dept-card"><span class="dept-icon">▦</span><h3>${escapeHtml(d)}</h3><div class="dept-number">${l.length}</div><p>Students</p><div class="mini-stats"><span>Attendance <b>${a.toFixed(1)}%</b></span><span>Marks <b>${m.length?mm.toFixed(1)+'%':'—'}</b></span></div></div>`}).join('')
}
function renderReports(){
  const n=students.length,att=n?students.reduce((a,s)=>a+Number(s.attendance||0),0)/n:0,m=students.filter(s=>getMarks(s)!=null),marks=m.length?m.reduce((a,s)=>a+getMarks(s),0)/m.length:0,r=students.filter(isRisk).length;
  setText('reportAttendance',att.toFixed(1)+'%');setText('reportMarks',m.length?marks.toFixed(1)+'%':'—');document.getElementById('reportAttendanceBar').style.width=att+'%';document.getElementById('reportMarksBar').style.width=marks+'%';
  document.getElementById('reportSummary').innerHTML=`<p><b>${n}</b> student records across <b>${new Set(students.map(s=>s.department)).size}</b> departments.</p><p><b>${r}</b> record(s) meet the current attention criteria.</p><p>Generated: ${new Date().toLocaleString()}</p>`;
  document.getElementById('statusSummary').innerHTML=`<div class="status-line"><span class="status good">Good Standing</span><b>${n-r}</b></div><div class="status-line"><span class="status risk">Needs Attention</span><b>${r}</b></div>`
}
function isRisk(s){return Number(s.attendance||0)<75 || (getMarks(s)!=null&&getMarks(s)<60)}
function getMarks(s){if(typeof s.marks==='number')return Number(s.marks);if(Array.isArray(s.marks)&&s.marks.length)return s.marks.reduce((a,m)=>a+Number(m.marks||0),0)/s.marks.length;return s.marks==null?null:Number(s.marks)}
function openModal(s=null){
  document.getElementById('studentModal').classList.add('show');document.getElementById('modalTitle').textContent=s?'Edit Student':'Add Student';document.getElementById('recordId').value=s?.id||'';document.getElementById('studentId').value=s?.studentId||'';document.getElementById('name').value=s?.name||'';document.getElementById('email').value=s?.email||'';document.getElementById('phone').value=s?.phone||'';document.getElementById('department').value=s?.department||'';document.getElementById('year').value=s?.year||1;document.getElementById('semester').value=s?.semester||1;document.getElementById('attendance').value=s?.attendance??75;document.getElementById('marksInput').value=getMarks(s)??75;document.getElementById('achievements').value=(s?.achievements||[]).join(', ')
}
function closeModal(){document.getElementById('studentModal').classList.remove('show');document.getElementById('studentForm').reset()}
async function saveStudent(e){
  e.preventDefault();const id=document.getElementById('recordId').value;
  const payload={studentId:val('studentId'),name:val('name'),email:val('email'),phone:val('phone'),department:val('department'),year:Number(val('year')),semester:Number(val('semester')),attendance:Number(val('attendance')),marks:Number(val('marksInput')),achievements:val('achievements').split(',').map(x=>x.trim()).filter(Boolean)};
  if(!payload.name||!payload.studentId)return showToast('Name and Student ID are required');
  if(demoMode){const item={...payload,id:id||'demo-'+Date.now()};if(id)students=students.map(s=>s.id===id?item:s);else students.push(item);saveDemo();closeModal();renderAll();showToast(id?'Student updated':'Student added');return}
  try{const r=await fetch(id?`${API}/${id}`:API,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw new Error();closeModal();showToast(id?'Student updated':'Student added');loadStudents()}catch{showToast('Could not save student — check the API')}
}
function editStudent(id){const s=students.find(x=>x.id===id);if(s)openModal(s)}
async function deleteStudent(id){
  const s=students.find(x=>x.id===id);if(!s||!confirm(`Delete ${s.name}?`))return;
  if(demoMode){students=students.filter(x=>x.id!==id);saveDemo();renderAll();showToast('Student deleted');return}
  try{const r=await fetch(`${API}/${id}`,{method:'DELETE'});if(!r.ok)throw new Error();loadStudents();showToast('Student deleted')}catch{showToast('Could not delete student')}
}
function viewStudent(id){
  const s=students.find(x=>x.id===id);if(!s)return;document.getElementById('viewName').textContent=s.name;
  document.getElementById('viewContent').innerHTML=`<div class="profile-grid"><div><span>Student ID</span><b>${escapeHtml(s.studentId)}</b></div><div><span>Department</span><b>${escapeHtml(s.department)}</b></div><div><span>Year / Semester</span><b>${s.year} / ${s.semester}</b></div><div><span>Attendance</span><b>${Number(s.attendance||0).toFixed(1)}%</b></div><div><span>Marks</span><b>${getMarks(s)==null?'—':getMarks(s).toFixed(1)+'%'}</b></div><div><span>Email</span><b>${escapeHtml(s.email||'—')}</b></div><div><span>Phone</span><b>${escapeHtml(s.phone||'—')}</b></div><div class="wide"><span>Achievements</span><b>${escapeHtml((s.achievements||[]).join(' • ')||'No achievements recorded')}</b></div></div>`;
  document.getElementById('viewModal').classList.add('show')
}
function closeView(){document.getElementById('viewModal').classList.remove('show')}
function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active-section',s.id===id));document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.dataset.section===id));
  setText('pageTitle',{dashboard:'Student Dashboard',students:'Student Records',departments:'Department Analytics',reports:'Reports & Insights',settings:'Settings'}[id]||'Student Dashboard');location.hash=id
}
function exportCSV(){
  const headers=['Student ID','Name','Email','Phone','Department','Year','Semester','Attendance','Marks','Status','Achievements'];
  const rows=students.map(s=>[s.studentId,s.name,s.email,s.phone,s.department,s.year,s.semester,s.attendance,getMarks(s)??'',isRisk(s)?'Needs Attention':'Good Standing',(s.achievements||[]).join('; ')]);
  const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='IP-student-report.csv';a.click();URL.revokeObjectURL(a.href);showToast('CSV report exported')
}
function printReport(){
  const win=window.open('','_blank');const att=document.getElementById('reportAttendance').textContent,marks=document.getElementById('reportMarks').textContent;
  win.document.write(`<html><head><title>IP Student Report</title><style>body{font-family:Arial;padding:40px;color:#172033}h1{margin-bottom:4px}.box{display:inline-block;border:1px solid #ddd;border-radius:10px;padding:18px;margin:8px;width:180px}table{width:100%;border-collapse:collapse;margin-top:25px}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}</style></head><body><h1>IP — College Student Track Record</h1><p>Generated ${new Date().toLocaleString()}</p><div class="box"><b>${students.length}</b><br>Students</div><div class="box"><b>${att}</b><br>Avg Attendance</div><div class="box"><b>${marks}</b><br>Avg Marks</div><table><tr><th>Student</th><th>Department</th><th>Attendance</th><th>Marks</th><th>Status</th></tr>${students.map(s=>`<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.department)}</td><td>${Number(s.attendance||0).toFixed(1)}%</td><td>${getMarks(s)==null?'—':getMarks(s).toFixed(1)+'%'}</td><td>${isRisk(s)?'Needs Attention':'Good Standing'}</td></tr>`).join('')}</table></body></html>`);win.document.close();win.print()
}
function seedDemoData(){students=structuredClone(DEMO_STUDENTS);saveDemo();demoMode=true;localStorage.setItem(MODE_KEY,'true');renderAll();setMode(true);showToast('Demo dataset refreshed')}
function setDemoMode(v){demoMode=v;localStorage.setItem(MODE_KEY,String(v));loadStudents()}
function clearDemoData(){if(confirm('Clear demo records from this browser?')){localStorage.removeItem(DEMO_KEY);students=[];renderAll();showToast('Demo data cleared')}}
function toggleTheme(){document.body.classList.toggle('dark');localStorage.setItem('ip_theme',document.body.classList.contains('dark')?'dark':'light')}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open')}
function val(id){return document.getElementById(id).value.trim()}
function setText(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
function showToast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2500)}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
window.addEventListener('DOMContentLoaded',()=>{if(localStorage.getItem('ip_theme')==='dark')document.body.classList.add('dark');init();if(location.hash)showSection(location.hash.slice(1))});