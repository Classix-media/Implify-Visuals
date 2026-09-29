/* Implify Visuals v2 — hero stars/planet + one-time entrance. Additive; script.js untouched. */
(function(){
  var hero=document.querySelector('.hero-section');if(!hero)return;
  var planet=document.createElement('span');planet.className='hero-planet';planet.setAttribute('aria-hidden','true');hero.prepend(planet);
  for(var i=0;i<14;i++){var s=document.createElement('span');s.className='hero-star';s.setAttribute('aria-hidden','true');
    var z=Math.random()<.25?2:1;s.style.cssText='left:'+(Math.random()*96+2)+'%;top:'+(Math.random()*62+2)+'%;width:'+z+'px;height:'+z+'px;--d:'+(3+Math.random()*4)+'s;--l:'+(Math.random()*5)+'s;--o:'+(.35+Math.random()*.45);hero.prepend(s);}
  var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(function(){document.body.classList.add('hero-in');},rm?0:5100);
})();
