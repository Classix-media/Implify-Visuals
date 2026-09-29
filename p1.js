(()=>{const $=s=>document.querySelector(s),rm=matchMedia('(prefers-reduced-motion:reduce)').matches,d=document.body;
$('#yr').textContent=new Date().getFullYear();
const hf=$('.hf');for(let i=0;i<14;i++){const s=document.createElement('span'),z=Math.random()<.25?2:1;s.className='st';s.style.cssText=`left:${Math.random()*96+2}%;top:${Math.random()*55+2}%;width:${z}px;height:${z}px;--d:${3+Math.random()*4}s;--l:${Math.random()*5}s`;hf.prepend(s)}
d.classList.add('li');d.style.overflow='hidden';
setTimeout(()=>{$('#intro').classList.add('x');d.style.overflow='';d.classList.add('go')},rm?300:3200);
setTimeout(()=>$('#intro')?.remove(),4200);
const mb=$('#mb'),nl=$('.nl');mb.onclick=()=>{const o=nl.classList.toggle('o');mb.setAttribute('aria-expanded',o)};nl.onclick=e=>{if(e.target.tagName=='A')nl.classList.remove('o')};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv').forEach(e=>io.observe(e));
$('#cf').onsubmit=e=>{e.preventDefault();const v=id=>$('#'+id).value.trim();
open('https://wa.me/2348121986430?text='+encodeURIComponent(`Hi Implify Visuals, I'd like to start a project.\n\nName: ${v('fn')}\nEmail: ${v('em')}\nService: ${v('sv')}\nProject details: ${v('ms')}`),'_blank')}})();
