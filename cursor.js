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
