/* Implify Visuals: secure checkout (page 3). Invoice code below is shared with page 2 so the document is identical. */
const WHATSAPP_NUMBER = "2348121986430";
const $ = (id) => document.getElementById(id);
const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || {}; } catch (_) { return {}; } };
const state = Object.assign({ name:'', email:'', whatsapp:'', business:'', brief:'', timeline:'', service:'', packageName:'', amount:null, ngnAmount:null, usdAmount:null, currency:'NGN', paymentStatus:'Awaiting Payment', paymentReference:'', ref:'' }, load('implifyBookingState'));
const co = load('implifyCheckout');

function money(value, currency = state.currency) {
  if (value == null) return "Quote after review";
  const symbol = currency === 'NGN' ? '\u20A6' : '$';
  return `${symbol}${Number(value).toLocaleString('en-US', {maximumFractionDigits:0})}`;
}
function toast(message) {
  const el = $('toast'); if (!el) return; el.textContent = message; el.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 3500);
}
function saveState() { try { localStorage.setItem('implifyBookingState', JSON.stringify(state)); } catch (_) {} }

function renderInvoiceDocument() {
  const paid = state.paymentStatus === 'Paid';
  $('invoiceTitle').textContent = paid ? 'INVOICE' : 'QUOTATION';
  $('invoiceTitle').textContent = $('invoiceTitle').textContent.toUpperCase();
  $('invoiceTitle').dataset.t = $('invoiceTitle').textContent;
  try{fitDocText();document.fonts&&document.fonts.ready.then(fitDocText);}catch(e){}
  $('invoiceRef').textContent = state.ref;
  $('invoiceDate').textContent = new Date().toLocaleDateString('en-NG', {day:'2-digit', month:'short', year:'numeric'});
  $('invoiceDue').textContent = $('invoiceDate').textContent;
  $('invoiceClient').textContent = state.name || 'Client';
  $('invoiceContact').textContent = [state.email, state.whatsapp, state.business].filter(Boolean).join(' · ');
  $('invoiceLines').innerHTML = `<tr><td>${state.service || 'Project'}</td><td>${state.packageName || 'Custom scope'}</td><td>1</td><td>${money(state.amount,state.currency)}</td><td>${money(state.amount,state.currency)}</td></tr>`;
  $('invoiceNotes').textContent = state.brief || 'Project scope as discussed with Implify Visuals.';
  $('invoiceSubtotal').textContent = money(state.amount,state.currency);
  $('invoiceTotal').textContent = money(state.amount,state.currency);
  $('invoiceStatusLabel').textContent = paid ? 'TOTAL PAID' : 'TOTAL DUE:';
  $('invoiceCurrencyNote').textContent = state.currency === 'USD' ? 'USD studio price · fixed reference, not live FX' : 'Currency: ' + state.currency;
}
function openInvoice() {
  renderInvoiceDocument();
  const modal=$('invoiceModal'); modal.hidden=false; modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
  fitInvoice(); setTimeout(fitInvoice,60);
}
function closeInvoice() {
  const modal=$('invoiceModal'); modal.hidden=true; modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open');
}
$('closeInvoice')?.addEventListener('click', closeInvoice);
document.querySelector('[data-close-invoice]')?.addEventListener('click', closeInvoice);
$('printInvoiceModal')?.addEventListener('click', () => downloadInvoice());
$('shareInvoiceModal')?.addEventListener('click', async () => {
  const shareText = `${state.paymentStatus === 'Paid' ? 'Implify Visuals Invoice' : 'Implify Visuals Project Quotation'} ${state.ref}\n${state.name}\n${state.service}\n${state.packageName}\n${money(state.amount,state.currency)}`;
  if (navigator.share) await navigator.share({title:`Implify Visuals ${state.ref}`, text:shareText}).catch(()=>{});
  else { await navigator.clipboard?.writeText(shareText); toast('Invoice details copied.'); }
});


/* ===== v19: universal invoice sizing + download (works in Instagram/in-app browsers) ===== */
function fitDocText(){
  const t=document.getElementById('invoiceTitle');
  if(t){t.style.setProperty('--tf',1);const p=t.parentElement,cs=getComputedStyle(p);
    const avail=p.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    const prev=t.style.width;t.style.width='max-content';const nat=t.offsetWidth;t.style.width=prev;
    if(nat&&avail>0)t.style.setProperty('--tf',Math.min(1.5,avail/nat*0.97).toFixed(3));}
  const n=document.getElementById('invoiceClient');
  if(n){n.style.setProperty('--tf',1);const cw=n.clientWidth,sw=n.scrollWidth;if(cw&&sw>cw+1)n.style.setProperty('--tf',(cw/sw*0.97).toFixed(3));}
}
function fitInvoice(){
  const d=document.querySelector('.inv-doc'); if(!d) return;
  const w=d.parentElement.clientWidth||d.clientWidth; if(!w) return;
  d.style.setProperty('--u',(w/100)+'px');
  d.style.height=(w*2296/1623)+'px';
  fitDocText();
}
window.addEventListener('resize',fitInvoice);
window.addEventListener('orientationchange',()=>setTimeout(fitInvoice,150));

function inAppBrowser(){const ua=navigator.userAgent||'';
  if(/Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|Barcelona|Threads|Line\/|TikTok|musical_ly|BytedanceWebview|Snapchat|Twitter|LinkedInApp|Pinterest|WhatsApp|Telegram|MicroMessenger|Discord|GSA\/|MicrosoftTeams|KAKAOTALK|; wv\)|Version\/[\d.]+ Chrome\/[\d.]+ Mobile/i.test(ua))return true;
  if(/iPhone|iPad|iPod/i.test(ua)&&/AppleWebKit/i.test(ua)&&!/Safari\//i.test(ua))return true; /* iOS WebViews */
  return false;}

async function drawInvoiceCanvas(){
  const W=1623,H=2296,u=W/100,c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d'),F='"Inter Tight","Helvetica Neue",Helvetica,Arial,sans-serif',T=id=>(document.getElementById(id)?.textContent||'').trim();
  try{await document.fonts.load('400 20px Anton');for(const f of ['400 20px "Inter Tight"','500 20px "Inter Tight"','600 20px "Inter Tight"','700 20px "Inter Tight"'])await document.fonts.load(f);await document.fonts.ready;}catch(e){}
  const BL='#005fff';
  const font=(w,s,f)=>x.font=`${w} ${s*u}px ${f||F}`;
  const txt=(s,px,py,o={})=>{font(o.w||400,o.s||2,o.f);x.fillStyle=o.c||'#000';x.textAlign=o.a||'left';x.textBaseline='middle';
    let size=o.s||2;const max=o.max;if(max){while(x.measureText(s).width>max*u&&size>0.8){size-=.1;font(o.w||400,size,o.f);}}x.fillText(s,px*u,py*u);};
  const rr=(px,py,w,h,r,fill)=>{x.beginPath();x.roundRect?x.roundRect(px*u,py*u,w*u,h*u,r*u):x.rect(px*u,py*u,w*u,h*u);x.fillStyle=fill;x.fill();};
  const wrapTo=(s,w,sz,mw)=>{font(w,sz);const out=[];let l='';s.split(/\s+/).filter(Boolean).forEach(t=>{const k=l?l+' '+t:t;if(x.measureText(k).width>mw*u&&l){out.push(l);l=t;}else l=k;});if(l)out.push(l);return out;};
  const img=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src='images/logo.png';});
  x.fillStyle=BL;x.fillRect(0,0,W,H);
  x.fillStyle='#fff';x.fillRect(5.4*u,7.3*u,89.2*u,128*u);
  x.beginPath();x.moveTo(34.7*u,0);x.lineTo(W,0);x.lineTo(W,33.9*u);x.lineTo(43.7*u,33.9*u);x.arcTo(34.7*u,33.9*u,34.7*u,24.9*u,9*u);x.lineTo(34.7*u,0);x.fillStyle=BL;x.fill();
  if(img)x.drawImage(img,13.55*u,12*u,13*u,13*u);
  txt('Implify Visuals',20.05,28.3,{s:2.2,w:400,a:'center'});
  // ref pill + dates
  const ref=T('invoiceRef');font(500,3.8);const rw=x.measureText(ref).width/u+6.4;
  rr(38.7,3.4,rw,7.8,2.2,'#fff');txt(ref,38.7+3.2,7.3,{s:3.8,w:500,c:'#111'});
  const dx=38.7+rw+4;
  txt('ISSUED:',dx,5.8,{s:1.9,w:600,c:'#fff'});txt(T('invoiceDate'),dx+8.4,5.8,{s:1.9,w:400,c:'#fff'});
  txt('DUE:',dx,8.8,{s:1.9,w:600,c:'#fff'});txt(T('invoiceDue'),dx+8.4,8.8,{s:1.9,w:400,c:'#fff'});
  // title: Impact, uppercase, grows/shrinks to fill the width
  const IMP='Impact,Anton,"Haettenschweiler","Arial Narrow Bold",sans-serif',tt=T('invoiceTitle').toUpperCase();
  font(400,11.5,IMP);const nat=x.measureText(tt).width/u,ts=Math.min(11.5*1.5,11.5*(100-38.7-3.5)/nat*0.97);
  x.font=`400 ${ts*u}px ${IMP}`;x.textBaseline='alphabetic';x.textAlign='left';
  const asc=x.measureText(tt).actualBoundingBoxAscent||ts*u*.75,base=22.4*u+asc/2;
  const g=x.createLinearGradient(0,base-asc,0,base);g.addColorStop(0,'#fff');g.addColorStop(1,'#b9b9b9');
  x.fillStyle=g;x.fillText(tt,38.7*u,base);
  txt('INVOICE TO:',9,39,{s:2.4,w:600});
  txt(T('invoiceClient').toUpperCase(),9,44.6,{s:5.6,w:700,max:84});
  txt(T('invoiceContact'),9,50,{s:2,w:400,c:'#111',max:84});
  // table
  const tx=8.9,tw=82.2,cw=[.32,.17,.17,.17,.17].map(p=>p*tw),heads=['Description','Package','Qty','Price','Subtotal'];
  let cx=tx;heads.forEach((h,i)=>{x.fillStyle=BL;x.fillRect(cx*u,56.6*u,(cw[i]-.4)*u,7.4*u);
    txt(h,i?cx+cw[i]/2:cx+1.6,60.3,{s:2.6,w:400,c:'#fff',a:i?'center':'left',max:cw[i]-2});cx+=cw[i];});
  const cells=[...document.querySelectorAll('#invoiceLines td')].map(t=>t.textContent.trim());
  cx=tx;cells.forEach((t,i)=>{txt(t,i?cx+cw[i]/2:cx+1.6,68.5,{s:2,w:i===4?600:400,c:'#111',a:i?'center':'left',max:cw[i]-2});cx+=cw[i];});
  txt('PROJECT NOTES',9,76.4,{s:1.7,w:600,c:BL});
  const nl=wrapTo(T('invoiceNotes'),400,1.8,82).slice(0,5);let ly=79.6;
  nl.forEach((s,i)=>{txt(s,9,ly+i*2.6,{s:1.8,w:400,c:'#333'});});ly=79.6+Math.max(0,nl.length-1)*2.6;
  const ruleY=Math.max(83.1,ly+2);x.fillStyle='#555';x.fillRect(5.4*u,ruleY*u,89.2*u,1*u);
  // bands
  x.fillStyle=BL;x.fillRect(0,94*u,W,7.1*u);
  txt('SUBTOTAL:',3.6,97.55,{s:2.7,w:600,c:'#fff'});txt(T('invoiceSubtotal'),95,97.55,{s:2.3,w:400,c:'#fff',a:'right'});
  x.fillStyle='#fff';x.fillRect(0,101.1*u,W,7.1*u);
  txt('DISCOUNT:',3.6,104.65,{s:2.7,w:600});txt('—',95,104.65,{s:2.3,w:400,a:'right'});
  x.fillStyle=BL;x.fillRect(0,108.2*u,W,7.1*u);
  txt(T('invoiceStatusLabel'),3.6,111.75,{s:2.7,w:600,c:'#fff'});txt(T('invoiceTotal'),95,111.75,{s:2.3,w:400,c:'#fff',a:'right'});
  // footer
  x.fillStyle='#fff';x.fillRect(0,115.3*u,W,20*u);
  // compact balanced pill (one size, one font)
  const full=('Payment is required before project work begins. '+T('invoiceCurrencyNote')).trim(),maxW=54-4.4;
  font(500,1.7);const total=x.measureText(full).width/u,n=Math.max(1,Math.ceil(total/maxW)),lines=wrapTo(full,500,1.7,Math.min(maxW,total/n*1.1+.8));
  const lh=2.4,ph=lines.length*lh+2.8,py=125.3-ph/2;rr(4,py,54,ph,2.6,'#767676');
  lines.forEach((s,i)=>txt(s,31,py+1.4+(i+.5)*lh,{s:1.7,w:500,c:'#fff',a:'center'}));
  // signature
  x.fillStyle='#111';x.fillRect(75*u,131.2*u,21*u,.35*u);
  font('italic 400',1.5);x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';x.fillText('Authorized Signed',85.5*u,133.1*u);
  return c;
}

function makePdfBlob(jpegDataUrl,w,h){
  const b=atob(jpegDataUrl.split(',')[1]),jpg=new Uint8Array(b.length);for(let i=0;i<b.length;i++)jpg[i]=b.charCodeAt(i);
  const pw=595.28,ph=pw*h/w,iw=pw,ih=ph,ox=0,oy=0;
  const enc=s=>new TextEncoder().encode(s),parts=[],offs=[];let len=0;
  const push=d=>{const u8=typeof d==='string'?enc(d):d;parts.push(u8);len+=u8.length;};
  const obj=(n,body)=>{offs[n]=len;push(`${n} 0 obj\n`);push(body);push('\nendobj\n');};
  push('%PDF-1.4\n');
  obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,'<</Type/Pages/Kids[3 0 R]/Count 1>>');
  obj(3,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${pw} ${ph}]/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>`);
  offs[4]=len;push(`4 0 obj\n<</Type/XObject/Subtype/Image/Width ${w}/Height ${h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jpg.length}>>\nstream\n`);push(jpg);push('\nendstream\nendobj\n');
  const cs=`q ${iw.toFixed(2)} 0 0 ${ih.toFixed(2)} ${ox.toFixed(2)} ${oy.toFixed(2)} cm /Im0 Do Q`;
  obj(5,`<</Length ${cs.length}>>\nstream\n${cs}\nendstream`);
  const xr=len;push('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)push(String(offs[i]).padStart(10,'0')+' 00000 n \n');
  push(`trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`);
  return new Blob(parts,{type:'application/pdf'});
}

function invoiceLink(){
  let p='';try{p=btoa(unescape(encodeURIComponent(JSON.stringify(state))));}catch(e){}
  return location.origin+location.pathname+'?inv='+encodeURIComponent(p);
}
function showInvoiceImage(url){
  document.getElementById('invSaveOverlay')?.remove();
  const link=invoiceLink(),isAnd=/Android/i.test(navigator.userAgent);
  const intent='intent://'+link.replace(/^https?:\/\//,'')+'#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url='+encodeURIComponent(link)+';end';
  const o=document.createElement('div');o.id='invSaveOverlay';
  o.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:#020617;overflow:auto;padding:16px;text-align:center;-webkit-overflow-scrolling:touch';
  const btn='display:block;width:100%;max-width:420px;margin:10px auto 0;padding:14px;border:0;border-radius:30px;font:700 15px Arial,sans-serif;text-decoration:none;box-sizing:border-box;';
  o.innerHTML='<p style="color:#fff;font:600 15px/1.4 Arial,sans-serif;margin:0 0 12px">Instagram cannot save PDFs.<br><span style="font-weight:400;opacity:.85">Tap <b>Get PDF in browser</b> below, or press and hold the invoice and tap <b>Save image</b>.</span></p>'
   +'<a id="invOpen" style="'+btn+'background:#005fff;color:#fff">Get PDF in browser</a>'
   +'<button id="invCopy" type="button" style="'+btn+'background:#fff;color:#111">Copy invoice link</button>'
   +'<img alt="Invoice" style="width:100%;max-width:600px;height:auto;background:#fff;margin-top:16px;-webkit-touch-callout:default;-webkit-user-select:auto;user-select:auto"><button id="invClose" type="button" style="'+btn+'background:transparent;color:#fff;border:1px solid #fff">Close</button>';
  o.querySelector('img').src=url;
  o.querySelector('#invOpen').href=isAnd?intent:link;
  if(!isAnd)o.querySelector('#invOpen').textContent='Open in Safari (tap ⋯ → Open in browser)';
  o.querySelector('#invCopy').onclick=async()=>{try{await navigator.clipboard.writeText(link);}catch(e){const t=document.createElement('textarea');t.value=link;document.body.appendChild(t);t.select();try{document.execCommand('copy');}catch(_){}t.remove();}toast('Link copied. Paste it in Chrome or Safari.');};
  o.querySelector('#invClose').onclick=()=>o.remove();
  document.body.appendChild(o);
}

(function restoreInvoiceFromLink(){
  try{
    const q=new URLSearchParams(location.search).get('inv');if(!q)return;
    Object.assign(state,JSON.parse(decodeURIComponent(escape(atob(q)))));
    const go=()=>{openInvoice();if(!inAppBrowser())toast('Tap Download / Save PDF');};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else setTimeout(go,50);
  }catch(e){}
})();

async function downloadInvoice(){
  const name=`Implify-${(state&&state.ref)||'Invoice'}`;
  try{
    const c=await drawInvoiceCanvas();
    const jpeg=c.toDataURL('image/jpeg',.92),png=c.toDataURL('image/png');
    const pdf=makePdfBlob(jpeg,c.width,c.height),file=(typeof File==='function')?new File([pdf],name+'.pdf',{type:'application/pdf'}):null;
    if(inAppBrowser()){
      if(file&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return;}catch(e){if(e&&e.name==='AbortError')return;}}
      showInvoiceImage(png);return;
    }
    if(navigator.msSaveOrOpenBlob){navigator.msSaveOrOpenBlob(pdf,name+'.pdf');return;}
    const url=URL.createObjectURL(pdf),a=document.createElement('a');a.href=url;a.download=name+'.pdf';a.rel='noopener';document.body.appendChild(a);a.click();
    setTimeout(()=>{a.remove();URL.revokeObjectURL(url);},4000);
  }catch(err){
    try{window.print();}catch(e){toast('Please open this page in Chrome or Safari to download.');}
  }
}


/* keep invoice title/name fitted when fonts finish loading or the preview resizes */
(function(){const d=document.querySelector('.inv-doc');
  if(d&&window.ResizeObserver)new ResizeObserver(()=>fitDocText()).observe(d);
  if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',()=>fitDocText());
  window.addEventListener('load',()=>setTimeout(fitDocText,50));})();


/* ================= checkout page logic ================= */
(function () {
  const views = { pay: $('viewPay'), verify: $('viewVerify'), paid: $('viewPaid') };
  const show = (name) => Object.keys(views).forEach((k) => { views[k].hidden = k !== name; if (k === name) { views[k].classList.remove('co-swap'); void views[k].offsetWidth; views[k].classList.add('co-swap'); } });
  const note = (t, bad) => { const n = $('coNote'); n.textContent = t || ''; n.classList.toggle('bad', !!bad); };
  const amount = Number(state.currency === 'USD' ? state.usdAmount : state.ngnAmount);
  const payBtn = $('coPayBtn');

  /* ----- video: behaves like the hero animation (no play icon on any device) ----- */
  (function video() {
    const v = $('coVideo'); if (!v) return;
    v.removeAttribute('controls'); v.removeAttribute('loop'); v.loop = false; v.controls = false; v.muted = true; v.defaultMuted = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    const go = () => { let p; try { p = v.play(); } catch (e) {} if (p && p.catch) p.catch(() => {}); };
    let fading = false;
    /* fade out just before the end, jump back to the start while hidden, fade in: no visible "replay" */
    v.addEventListener('timeupdate', () => { if (v.duration && v.duration - v.currentTime < 0.5 && !fading) { fading = true; v.classList.add('fade'); } });
    v.addEventListener('ended', () => { setTimeout(() => { v.currentTime = 0; go(); setTimeout(() => { v.classList.remove('fade'); fading = false; }, 120); }, 460); });
    go(); v.addEventListener('loadedmetadata', go); v.addEventListener('canplay', go);
    v.addEventListener('pause', () => { if (!document.hidden && !v.ended) setTimeout(go, 50); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) go(); });
    window.addEventListener('pageshow', go);
    ['touchstart', 'click', 'scroll'].forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
  })();

  const paid = load('implifyPaid');
  const isPaidHere = paid && paid.ref && paid.ref === state.ref && paid.reference;

  if (!state.ref || !state.service || !Number.isFinite(amount) || amount <= 0) {
    $('coEmpty').hidden = false; return;
  }
  $('coCard').hidden = false;
  $('coService').textContent = state.service;
  $('coPackage').textContent = state.packageName + ' package';
  $('coRef').textContent = state.ref;
  $('coName').textContent = state.name || '-';
  $('coTime').textContent = state.timeline || 'To be confirmed';
  $('coAmount').textContent = money(amount, state.currency);
  
  function showPaid(info) {
    state.paymentStatus = 'Paid'; state.paymentReference = info.reference; saveState();
    $('coPaidName').textContent = state.name ? ', ' + String(state.name).split(' ')[0] : '';
    $('rcAmount').textContent = money(amount, state.currency);
    $('rcRef').textContent = info.reference;
    $('rcDate').textContent = new Date(info.paid_at || info.at || Date.now()).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    $('rcMethod').textContent = info.channel ? String(info.channel).replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) : 'Secure payment';
    const msg = `Hi Implify Visuals, my payment is complete. \u2705\n\nProject Reference: ${state.ref}\nName: ${state.name}\nBusiness/Brand: ${state.business || 'Not provided'}\nService: ${state.service}\nPackage: ${state.packageName}\nAmount Paid: ${money(amount, state.currency)} (${state.currency})\nPayment Reference: ${info.reference}\nTimeline: ${state.timeline || 'Not provided'}\nProject Brief: ${state.brief}\n\nPlease confirm and let's get started.`;
    $('btnWhatsApp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    show('paid');
  }
  $('btnInvoice').addEventListener('click', openInvoice);
  $('btnDownload').addEventListener('click', () => { openInvoice(); setTimeout(() => downloadInvoice(), 150); });

  async function verify(reference, attempt = 1) {
    show('verify');
    try {
      const r = await fetch('/api/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, ref: state.ref, service: state.service, package: state.packageName, currency: state.currency, email: state.email }) });
      const out = await r.json().catch(() => ({}));
      if (r.ok && out.verified) {
        const info = { ref: state.ref, reference: out.reference || reference, channel: out.channel, paid_at: out.paid_at, at: Date.now() };
        try { localStorage.setItem('implifyPaid', JSON.stringify(info)); } catch (_) {}
        showPaid(info); return;
      }
      if (r.ok && (out.reason === 'pending' || out.reason === 'ongoing' || out.reason === 'processing') && attempt < 5) {
        $('coVerifyMsg').textContent = 'Your bank is still processing. Checking again…';
        setTimeout(() => verify(reference, attempt + 1), 3000); return;
      }
      show('pay'); resetBtn();
      note(r.status === 500 && out.error === 'server_not_configured'
        ? 'Payment may have gone through, but automatic confirmation is not set up yet. Please send your reference ' + reference + ' on WhatsApp.'
        : 'We could not confirm this payment automatically (' + (out.reason || out.error || 'unknown') + '). If you were charged, send reference ' + reference + ' on WhatsApp and we will confirm it.', true);
    } catch (e) {
      show('pay'); resetBtn();
      note('Network problem while confirming. If you were charged, send reference ' + reference + ' on WhatsApp and we will confirm it.', true);
    }
  }

  function resetBtn() { payBtn.disabled = !selected; payBtn.classList.remove('busy'); }
  function fallback() { if (co.url) { const f = $('coFallback'); f.href = co.url; f.hidden = false; } }

  /* ----- selectable payment methods (all map to real Paystack channels; Google Pay and OPay are not Paystack channels so they are not offered) ----- */
  const NGN_ONLY = ['bank_transfer', 'ussd', 'bank'];
  const INFO = {
    card: ['Card payment', 'Pay with a Visa, Mastercard or Verve debit/credit card. You enter the card details inside the encrypted payment window, never on our own page. Your bank may ask for a PIN, OTP or 3D Secure approval.'],
    apple_pay: ['Apple Pay', 'Available on Safari with Apple Pay set up on your device, and only if Apple Pay is enabled on our payment account. If it is not available for you, the window will tell you and you can choose another method.'],
    bank_transfer: ['Bank transfer', 'A one-time account number is generated for this exact order. Transfer the exact amount from your banking app. We confirm it with the payment processor before marking anything paid, which can take a few minutes.'],
    ussd: ['USSD', 'Pick your bank and you will get a USSD code to dial on your phone to approve the payment. Some banks have transaction limits.'],
    bank: ['Pay with bank', 'Log in to your bank account in the secure window and approve this payment directly. Only supported banks are listed.']
  };
  const NAMES = { card: 'Card', apple_pay: 'Apple Pay', bank_transfer: 'Bank transfer', ussd: 'USSD', bank: 'Pay with bank' };
  let selected = null, lastReference = '', busy = false, ussdType = '', pollTimer = null;
  const ONSITE = ['bank_transfer', 'ussd'], BANKS = { '737': 'GTBank', '966': 'Zenith Bank', '919': 'UBA', '822': 'Sterling Bank' };
  const info = $('coMethodInfo'), methodBtns = [...document.querySelectorAll('.co-m')];
  $('coCur').textContent = state.currency;
  $('coBkRef').textContent = 'Booking ' + state.ref;
  methodBtns.forEach((b) => {
    const m = b.dataset.method;
    if (state.currency !== 'NGN' && NGN_ONLY.includes(m)) { b.classList.add('off'); b.setAttribute('aria-disabled', 'true'); }
    b.addEventListener('click', () => {
      if (busy) return;
      if (b.classList.contains('off')) { note(NAMES[m] + ' is only available for NGN bookings. Your booking is in ' + state.currency + ', so please choose Card' + (m === 'apple_pay' ? '' : ' or Apple Pay') + '.', true); return; }
      selected = m; note('');
      methodBtns.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      info.innerHTML = '<strong></strong><span></span><ul><li></li><li></li></ul>';
      info.querySelector('strong').textContent = INFO[m][0]; info.querySelector('span').textContent = INFO[m][1];
      const li = info.querySelectorAll('li'); li[0].textContent = 'Amount: ' + money(amount, state.currency) + ' (' + state.currency + ')'; li[1].textContent = 'Booking reference: ' + state.ref;
      if (m === 'ussd') { const g = document.createElement('div'); g.className = 'co-banks'; Object.keys(BANKS).forEach((k) => { const x = document.createElement('button'); x.type = 'button'; x.className = 'co-bank'; x.textContent = BANKS[k]; x.setAttribute('aria-pressed', String(ussdType === k));
        x.addEventListener('click', () => { ussdType = k; g.querySelectorAll('button').forEach((y) => y.setAttribute('aria-pressed', String(y === x))); payBtn.disabled = false; }); g.appendChild(x); }); info.appendChild(g); }
      info.classList.add('on');
      payBtn.disabled = (m === 'ussd' && !ussdType);
      payBtn.querySelector('.co-pay-label').textContent = 'Pay ' + money(amount, state.currency) + ' with ' + NAMES[m];
    });
  });
  payBtn.disabled = true;
  payBtn.querySelector('.co-pay-label').textContent = 'Select a payment method';

  function checkLink() {
    let l = $('coCheck');
    if (!l) { l = document.createElement('button'); l.type = 'button'; l.id = 'coCheck'; l.className = 'co-fallback'; l.style.cssText = 'background:none;border:0;cursor:pointer;font-family:inherit;display:block';
      l.textContent = 'Already paid or transferred? Check my payment'; $('coFallback').after(l); l.addEventListener('click', () => lastReference && verify(lastReference)); }
    l.hidden = !lastReference;
  }
  function openWindow(access, ref0, legacy) {
    let loaded = false;
    const slow = setTimeout(() => { if (!loaded) { busy = false; resetBtn(); note('The secure window is taking long to load.', true); fallback(); } }, 12000);
    try {
      new PaystackPop().resumeTransaction(access, {
        onLoad: () => { loaded = true; clearTimeout(slow); busy = false; resetBtn(); note(legacy ? 'Choose your method in the secure window.' : 'Complete your ' + NAMES[selected] + ' payment in the secure window.'); },
        onSuccess: (tx) => { clearTimeout(slow); verify((tx && (tx.reference || tx.trxref)) || ref0); },
        onCancel: () => { clearTimeout(slow); busy = false; resetBtn(); checkLink(); note('Payment was not completed and nothing was charged by us. Choose a method to try again.'); },
        onError: () => { clearTimeout(slow); busy = false; resetBtn(); note('Could not open the secure window.', true); fallback(); }
      });
    } catch (e) { clearTimeout(slow); busy = false; resetBtn(); note('Could not open the secure window.', true); fallback(); }
  }

  function row(label, value, copy) { const d = document.createElement('div'); d.className = 'co-kv'; const s = document.createElement('span'); s.textContent = label; const bb = document.createElement('b'); bb.textContent = value; d.append(s, bb);
    if (copy) { const c = document.createElement('button'); c.type = 'button'; c.className = 'co-copy'; c.textContent = 'Copy'; c.onclick = async () => { try { await navigator.clipboard.writeText(value); c.textContent = 'Copied'; setTimeout(() => c.textContent = 'Copy', 1500); } catch (_) { toast('Copy not available. Select the text instead.'); } }; d.appendChild(c); } return d; }
  function stopPoll() { clearTimeout(pollTimer); pollTimer = null; }
  function backToMethods() { stopPoll(); $('coOnsite').hidden = true; $('coOnsite').innerHTML = ''; $('coMethods').hidden = false; info.hidden = false; payBtn.hidden = false; resetBtn(); note(''); }
  async function poll(reference, n) {
    stopPoll(); if (n > 120) { $('coWaitTxt') && ($('coWaitTxt').textContent = 'Still waiting. If you have paid, tap "Check my payment" or send your reference on WhatsApp.'); return; }
    try {
      const r = await fetch('/api/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, ref: state.ref, service: state.service, package: state.packageName, currency: state.currency, email: state.email }) });
      const out = await r.json().catch(() => ({}));
      if (r.ok && out.verified) { const inf = { ref: state.ref, reference: out.reference || reference, channel: out.channel, paid_at: out.paid_at, at: Date.now() }; try { localStorage.setItem('implifyPaid', JSON.stringify(inf)); } catch (_) {} stopPoll(); showPaid(inf); return; }
      if (r.ok && out.reason === 'failed') { $('coWaitTxt').textContent = 'The payment failed. Please go back and try again.'; return; }
    } catch (_) {}
    pollTimer = setTimeout(() => poll(reference, n + 1), 5000);
  }
  async function startOnsite() {
    busy = true; payBtn.disabled = true; payBtn.classList.add('busy');
    let out = null;
    try { const r = await fetch('/api/charge-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: state.ref, service: state.service, package: state.packageName, currency: state.currency, email: state.email, name: state.name, method: selected, ussdType }) });
      out = await r.json().catch(() => ({})); } catch (e) { out = null; }
    busy = false; resetBtn();
    if (!out || !out.reference || out.error) { note(NAMES[selected] + ' could not be started' + (out && out.message ? ' (' + out.message + ')' : '') + '. Please choose another method or try again.', true); return; }
    lastReference = out.reference;
    const box = $('coOnsite'); box.innerHTML = '';
    const h = document.createElement('h3'), p = document.createElement('p');
    h.textContent = selected === 'ussd' ? 'Dial to pay with ' + (out.bank_name || 'USSD') : 'Transfer to this account';
    p.textContent = selected === 'ussd' ? 'Dial this code on the phone linked to your bank account and follow the prompts.' : 'Send exactly ' + money(amount, state.currency) + ' from your banking app. This account is for this order only.';
    box.append(h, p);
    if (selected === 'ussd') box.appendChild(row('USSD code', out.ussd_code, true));
    else { box.appendChild(row('Bank', out.bank_name || '-', false)); box.appendChild(row('Account number', out.account_number, true)); box.appendChild(row('Account name', out.account_name || '-', false)); if (out.expires_at) box.appendChild(row('Expires', new Date(out.expires_at).toLocaleString('en-GB'), false)); }
    box.appendChild(row('Amount', money(amount, state.currency) + ' ' + state.currency, false)); box.appendChild(row('Booking reference', state.ref, false));
    const w = document.createElement('div'); w.className = 'co-wait'; w.innerHTML = '<i></i><span id="coWaitTxt"></span>'; box.appendChild(w); w.querySelector('span').textContent = 'Waiting for your payment. We confirm it automatically, keep this page open.';
    const chk = document.createElement('button'); chk.type = 'button'; chk.className = 'co-link'; chk.textContent = 'I have paid, check my payment'; chk.onclick = () => poll(out.reference, 0); box.appendChild(chk);
    const back = document.createElement('button'); back.type = 'button'; back.className = 'co-link'; back.textContent = 'Choose a different method'; back.onclick = backToMethods; box.appendChild(back);
    $('coMethods').hidden = true; info.hidden = true; payBtn.hidden = true; box.hidden = false; note('');
    poll(out.reference, 0);
  }

  payBtn.addEventListener('click', async () => {
    if (!selected || busy) return;
    note('');
    if (ONSITE.includes(selected)) return startOnsite(); busy = true; payBtn.disabled = true; payBtn.classList.add('busy');
    if (typeof PaystackPop === 'undefined') { busy = false; resetBtn(); note('The secure payment window could not load. Check your connection and try again.', true); return; }
    let out = null, status = 0;
    try {
      const r = await fetch('/api/init-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: state.ref, service: state.service, package: state.packageName, currency: state.currency, email: state.email, name: state.name, method: selected }) });
      status = r.status; out = await r.json().catch(() => ({}));
    } catch (e) { out = null; }
    if (out && out.access_code) { lastReference = out.reference; openWindow(out.access_code, out.reference, false); return; }
    const err = out && out.error;
    if (err === 'init_failed') { busy = false; resetBtn(); note(NAMES[selected] + ' is not available on our payment account right now' + (out.message ? ' (' + out.message + ')' : '') + '. Please choose another method.', true); return; }
    if (err === 'method_unavailable_for_currency') { busy = false; resetBtn(); note(NAMES[selected] + ' is not available for ' + state.currency + ' bookings.', true); return; }
    /* endpoint not deployed / not configured: fall back to the original Make-initialised session (method chosen inside the window) */
    if (co.access && co.ref === state.ref) { lastReference = ''; openWindow(co.access, state.ref, true); return; }
    if (co.url) { note('Opening the secure payment page…'); window.location.assign(co.url); return; }
    busy = false; resetBtn(); note('Checkout session expired. Please go back and start payment again.', true);
  });

  if (isPaidHere) verify(paid.reference); else show('pay');
})();
