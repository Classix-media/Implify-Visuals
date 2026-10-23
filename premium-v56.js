/* v56 premium additions: growth graph loop + WhatsApp-style chat demo */
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Growth graph: rises when visible, replays every few seconds */
  var g = document.querySelector('.gx-card');
  if (g) {
    var gt;
    var play = function(){ g.classList.remove('play'); void g.offsetWidth; g.classList.add('play'); };
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function(es){
        es.forEach(function(e){
          clearInterval(gt);
          if (e.isIntersecting) { play(); gt = setInterval(play, 6500); }
        });
      }, {threshold:.35}).observe(g);
    } else { g.classList.add('play'); }
  }

  /* Chat demo */
  var sec = document.querySelector('.workflow-section');
  if (!sec) return;
  var steps = [].slice.call(sec.querySelectorAll('.wf-step'));
  var body = sec.querySelector('.chat-body');
  var status = sec.querySelector('.chat-head small');
  var DUR = 7500;
  sec.style.setProperty('--dur', DUR/1000 + 's');

  var script = [
    [ {t:'sys',x:'You chose: Brand Identity'}, {t:'out',x:"Hello Implify Visuals 👋 I'd like to start a project."}, {t:'card',h:'PROJECT REQUEST',x:'Service: Brand Identity<br>Status: Brief received'}, {t:'in',x:"Got it! Tell us a little about your brand."}, {t:'out',x:"It's a fashion label launching next month."}, {t:'in',x:"Lovely. We'll prepare a short brief for you."} ],
    [ {t:'in',x:"Welcome! 👋 Tell us about your brand and what you need."}, {t:'out',x:"A logo and a clean brand look for my business."}, {t:'in',x:"Perfect. We'll confirm the scope, timeline and quote with you here."}, {t:'out',x:"How long will it take?"}, {t:'in',x:"About a week for the first concepts."}, {t:'out',x:"Great, let's go! 🙌"} ],
    [ {t:'in',x:"First concepts are ready ✨ Take a look."}, {t:'card',h:'CONCEPTS · ROUND 1',x:'3 directions shared<br>Send feedback and we refine'}, {t:'out',x:"Love direction 2! Small tweak on the colors please."}, {t:'in',x:"Noted, updating the colors now 🎨"}, {t:'out',x:"Can the logo feel a bit bolder too?"}, {t:'in',x:"Done. Sending the refined version ✨"} ],
    [ {t:'in',x:"Done ✅ Final files are ready: logo pack, brand guide and social kit."}, {t:'card',h:'FINAL FILES · DELIVERED',x:'Logo pack · Brand guide<br>Social media kit'}, {t:'out',x:"Amazing work, thank you! 🙌"}, {t:'in',x:"Our pleasure. We're here for whatever comes next."}, {t:'out',x:"Definitely working with you again!"}, {t:'in',x:"Anytime 💙"} ]
  ];

  var cur = -1, timers = [];
  function clear(){ timers.forEach(clearTimeout); timers = []; }
  function add(m){
    var d = document.createElement('div');
    d.className = 'msg ' + m.t;
    if (m.t === 'card') d.innerHTML = '<b>' + m.h + '</b><span>' + m.x + '</span>';
    else d.textContent = m.x;
    body.appendChild(d);
    while (body.children.length > 7) body.removeChild(body.firstChild);
    return d;
  }
  function run(i){
    clear(); cur = i;
    steps.forEach(function(s,k){
      s.classList.remove('active'); void s.offsetWidth;
      if (k === i) s.classList.add('active');
    });
    body.innerHTML = '';
    if (status) status.textContent = 'online';
    var t = 150;
    script[i].forEach(function(m){
      var incoming = m.t === 'in' || m.t === 'card';
      if (incoming && !reduce) {
        timers.push(setTimeout(function(){
          if (status) status.textContent = 'typing…';
          var ty = document.createElement('div');
          ty.className = 'msg typing'; ty.innerHTML = '<i></i><i></i><i></i>';
          body.appendChild(ty);
          timers.push(setTimeout(function(){ if (ty.parentNode) ty.parentNode.removeChild(ty); if (status) status.textContent = 'online'; add(m); }, 450));
        }, t));
        t += 450 + 300;
      } else {
        timers.push(setTimeout(function(){ add(m); }, t));
        t += 450;
      }
    });
    if (!reduce) timers.push(setTimeout(function(){ run((i+1) % steps.length); }, DUR));
  }

  steps.forEach(function(s,i){ s.addEventListener('click', function(){ run(i); }); });

  if ('IntersectionObserver' in window && !reduce) {
    new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting) { sec.classList.remove('paused'); if (cur < 0) run(0); else run(cur); }
        else { sec.classList.add('paused'); clear(); }
      });
    }, {threshold:.3}).observe(sec);
  } else { run(0); }
})();

/* v60: custom cursor follower */
(function(){
  if(!window.matchMedia||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  var d=document.createElement('div'),r=document.createElement('div');
  d.className='cursor-dot';r.className='cursor-ring';
  document.body.appendChild(r);document.body.appendChild(d);
  var x=-100,y=-100,rx=-100,ry=-100;
  window.addEventListener('mousemove',function(e){x=e.clientX;y=e.clientY;document.documentElement.classList.add('cursor-on');d.style.transform='translate('+x+'px,'+y+'px)'});
  document.addEventListener('mouseleave',function(){document.documentElement.classList.remove('cursor-on')});
  document.addEventListener('mouseenter',function(){document.documentElement.classList.add('cursor-on')});
  window.addEventListener('mousedown',function(){r.classList.add('down')});
  window.addEventListener('mouseup',function(){r.classList.remove('down')});
  document.addEventListener('mouseover',function(e){r.classList.toggle('hover',!!(e.target.closest&&e.target.closest('a,button,[role=button],.wf-step,input,textarea,select')))});
  (function loop(){rx+=(x-rx)*.18;ry+=(y-ry)*.18;r.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(loop)})();
})();
