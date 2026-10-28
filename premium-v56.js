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
    [ {t:'sys',x:'You chose: Brand Identity'}, {t:'out',x:"Hello Implify Visuals 👋 I'd like to start a project."}, {t:'card',h:'PROJECT REQUEST',x:'Service: Brand Identity<br>Status: Brief received'}, {t:'in',x:"Thank you for reaching out. Could you tell us about your brand and audience?"}, {t:'out',x:"We're a fashion label launching next month and want a premium, modern identity."}, {t:'in',x:"Understood. We'll prepare a creative brief and confirm the scope with you."} ],
    [ {t:'in',x:"Here is the proposed scope: logo system, colour palette, typography and brand guidelines."}, {t:'out',x:"That covers what we need. What does the timeline look like?"}, {t:'in',x:"Delivery is 10 days from kickoff, with progress updates along the way."}, {t:'card',h:'PROJECT SCOPE',x:'Brand Identity · Premium<br>Timeline: 10 days'}, {t:'out',x:"Perfect. Please send the invoice."}, {t:'in',x:"Invoice sent. We begin as soon as the deposit is confirmed."} ],
    [ {t:'in',x:"Your concepts are ready. We have prepared three strategic directions."}, {t:'card',h:'CONCEPTS · ROUND 1',x:'3 directions presented<br>Feedback and refinement included'}, {t:'out',x:"Direction 2 feels right for our audience."}, {t:'in',x:"Excellent choice. We will develop it further and share the refined version."}, {t:'out',x:"Looking forward to it."}, {t:'in',x:"The refined concept is ready and awaiting your approval."} ],
    [ {t:'in',x:"Your brand identity is complete. The final files are ready."}, {t:'card',h:'FINAL FILES · DELIVERED',x:'Logo pack · Brand guidelines<br>Social media kit'}, {t:'out',x:"This is outstanding work. Thank you."}, {t:'in',x:"It was a pleasure. We remain available for any future needs."}, {t:'out',x:"We will definitely be in touch."}, {t:'in',x:"We look forward to it 💙"} ]
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
    /* natural chat pace; the step lasts only as long as its conversation + a short hand-off */
    var tt = 250;
    script[i].forEach(function(m){ tt += ((m.t === 'in' || m.t === 'card') && !reduce) ? 1650 : 800; });
    var dur = tt + 600;
    sec.style.setProperty('--dur', dur/1000 + 's');
    steps.forEach(function(s,k){
      s.classList.remove('active'); void s.offsetWidth;
      if (k === i) s.classList.add('active');
    });
    body.innerHTML = '';
    if (status) status.textContent = 'online';
    var t = 250;
    script[i].forEach(function(m){
      var incoming = m.t === 'in' || m.t === 'card';
      if (incoming && !reduce) {
        timers.push(setTimeout(function(){
          if (status) status.textContent = 'typing…';
          var ty = document.createElement('div');
          ty.className = 'msg typing'; ty.innerHTML = '<i></i><i></i><i></i>';
          body.appendChild(ty);
          timers.push(setTimeout(function(){ if (ty.parentNode) ty.parentNode.removeChild(ty); if (status) status.textContent = 'online'; add(m); }, 900));
        }, t));
        t += 1150 + 500;
      } else {
        timers.push(setTimeout(function(){ add(m); }, t));
        t += 800;
      }
    });
    if (!reduce) timers.push(setTimeout(function(){ run((i+1) % steps.length); }, dur));
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

/* v59: ring + percentage + LED clock, all driven by one timer so they stay in step */
(function(){
  var w=document.getElementById('promiseRing'),n=document.getElementById('promiseNum'),clk=document.getElementById('ringClock'); if(!w||!n||!clk) return;
  var NS='http://www.w3.org/2000/svg',SEG={a:'10,2 50,2 44,10 16,10',b:'52,5 52,47 46,50 46,12',c:'52,53 52,95 46,88 46,50',d:'10,98 50,98 44,90 16,90',e:'8,53 8,95 14,88 14,50',f:'8,5 8,47 14,50 14,12',g:'12,50 18,45 42,45 48,50 42,55 18,55'};
  var MAP=['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg'],digits=[],xs=[0,70,170,240];
  xs.forEach(function(x){var g=document.createElementNS(NS,'g');g.setAttribute('transform','translate('+x+',0)');var o={};
    Object.keys(SEG).forEach(function(k){var p=document.createElementNS(NS,'polygon');p.setAttribute('points',SEG[k]);p.setAttribute('class','seg');g.appendChild(p);o[k]=p;});clk.appendChild(g);digits.push(o);});
  [30,70].forEach(function(y){var c=document.createElementNS(NS,'circle');c.setAttribute('cx',150);c.setAttribute('cy',y);c.setAttribute('r',5);c.setAttribute('class','dot');clk.appendChild(c);});
  var last='';function show(str){if(str===last)return;last=str;for(var i=0;i<4;i++){var on=MAP[+str[i]];for(var k in digits[i])digits[i][k].setAttribute('class','seg'+(on.indexOf(k)>-1?' on':''));}}
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){w.style.setProperty('--p',1);n.textContent='100';show('0010');return;}
  var T=7600,RUN=6400,HOLD=7000,raf=0,t0=0,vis=false;
  var ease=function(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;};
  function frame(now){
    if(!vis){raf=0;return;}
    var t=(now-t0)%T,p=t<RUN?ease(t/RUN):1,o=1;
    if(t>HOLD)o=Math.max(0,1-(t-HOLD)/(T-HOLD)); else if(t<250)o=t/250;
    w.style.setProperty('--p',p.toFixed(4));w.style.setProperty('--o',o.toFixed(3));n.textContent=Math.round(p*100);
    var s=Math.min(10,Math.floor(p*10+0.0001));show('00'+(s<10?'0'+s:''+s));
    raf=requestAnimationFrame(frame);
  }
  show('0000');
  new IntersectionObserver(function(es){es.forEach(function(e){vis=e.isIntersecting;if(vis&&!raf){t0=performance.now();raf=requestAnimationFrame(frame);}});},{threshold:.2}).observe(w);
})();
