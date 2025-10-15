
const hero = document.getElementById('dna');
const overlay = document.getElementById('projects-overlay');
const openBtn = document.getElementById('open-projects');
const closeBtn = document.getElementById('close-projects');

function openProjects(e){
e?.preventDefault();
hero.style.display = 'none';
overlay.hidden = false;
overlay.setAttribute('aria-hidden','false');
document.body.style.overflow = 'hidden'; // no scrolling
document.body.classList.add('projects-open');
}
function closeProjects(e){
e?.preventDefault();
overlay.hidden = true;
overlay.setAttribute('aria-hidden','true');
hero.style.display = '';
document.body.style.overflow = '';
document.body.classList.remove('projects-open');
}

openBtn.addEventListener('click', openProjects);
closeBtn.addEventListener('click', closeProjects);

window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !overlay.hidden) closeProjects(); });