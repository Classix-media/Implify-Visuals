const MAKE_BOOKING_WEBHOOK = "https://hook.eu1.make.com/n3jqpabohrg84iiighvhr6cfvejbhxis";
const WHATSAPP_NUMBER = "2348121986430";

const FX_NGN_PER_USD = 1325; // fixed studio pricing reference; not a live FX feed

const prices = {
  "Brand Identity Design": [
    ["Basic", 80000, 60, "Core identity direction"],
    ["Standard", 140000, 106, "Expanded identity system"],
    ["Premium", 200000, 151, "Complete premium identity"],
  ],
  "Motion Graphics / Video Editing": [
    ["Basic", 50000, 38, "Focused motion deliverable"],
    ["Standard", 100000, 75, "Full motion treatment"],
    ["Premium", 150000, 113, "Advanced motion package"],
  ],
  "Social Media Design": [
    ["1 Design", 25000, 19, "One social media design"],
    ["3 Designs", 75000, 57, "Three coordinated designs"],
    ["5 Designs", 125000, 94, "Five coordinated designs"],
  ],
  "UI/UX Interface Design": [
    ["Basic", 15000, 11, "1–2 screens"],
    ["Standard", 25000, 19, "3–5 screens"],
    ["Premium", 40000, 30, "6–10 screens"],
  ],
  "Custom Project": [["Manual Quote", null, null, "Scope reviewed before pricing"]]
};


const state = {
  step: 1,
  ref: `IV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
  name: "", email: "", whatsapp: "", business: "", brief: "", timeline: "",
  service: "", packageName: "", amount: null, ngnAmount: null, usdAmount: null, currency: "NGN", paymentStatus: "Awaiting Payment",
  paymentReference: ""
};

const $ = (id) => document.getElementById(id);
const steps = [...document.querySelectorAll('.booking-step')];
const journeySteps = [...document.querySelectorAll('.journey-step')];
const nextBtn = $('nextBtn');
const backBtn = $('backBtn');
const form = $('bookingForm');

$('projectRef').textContent = state.ref;

function money(value, currency = state.currency) {
  if (value == null) return "Quote after review";
  const symbol = currency === 'NGN' ? '₦' : '$';
  return `${symbol}${Number(value).toLocaleString('en-US', {maximumFractionDigits:0})}`;
}

function toast(message) {
  const el = $('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 3500);
}

function saveBookingState() {
  try { localStorage.setItem('implifyBookingState', JSON.stringify(state)); } catch (_) {}
}
function restoreBookingState() {
  try {
    const saved = JSON.parse(localStorage.getItem('implifyBookingState') || 'null');
    if (!saved) return false;
    Object.assign(state, saved);
    return true;
  } catch (_) { return false; }
}


function setStep(n) {
  state.step = n;
  steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === n));
  journeySteps.forEach((s,i) => s.classList.toggle('active', i === Math.min(n-1,5)));
  $('stepCounter').textContent = `${String(n).padStart(2,'0')} / 06`;
  $('progressBar').style.width = `${(n/6)*100}%`;
  backBtn.hidden = n === 1;
  nextBtn.hidden = n === 6;
  nextBtn.textContent = n === 4 ? (state.amount && ['NGN','USD'].includes(state.currency) ? 'Continue to payment →' : 'Continue →') : n === 5 ? 'Prepare WhatsApp handoff →' : 'Continue →';
  window.scrollTo({top:0,behavior:'smooth'});
}

function readDetails() {
  state.name = $('clientName').value.trim(); state.email = $('clientEmail').value.trim();
  state.whatsapp = $('clientWhatsapp').value.trim(); state.business = $('business').value.trim();
  state.brief = $('brief').value.trim(); state.timeline = $('timeline').value.trim();
}

function validStep1() {
  readDetails();
  if (!state.name || !state.email || !/^\S+@\S+\.\S+$/.test(state.email) || !state.whatsapp || !state.brief) {
    toast('Please complete the required project details.'); return false;
  }
  return true;
}

function renderPackages() {
  const wrap = $('packageChoices'); wrap.innerHTML = '';
  (prices[state.service] || []).forEach(([name, ngnAmount, usdAmount, note]) => {
    const b = document.createElement('button'); b.type='button'; b.className='package';
    if (state.packageName === name) b.classList.add('selected');
    const selectedAmount = state.currency === 'NGN' ? ngnAmount : usdAmount;
    const displayAmount = selectedAmount == null ? 'Manual quote' : money(selectedAmount, state.currency);
    b.innerHTML = `<span class="package-name">${name}</span><small>${note}</small><div class="package-price">${displayAmount}</div>`;
    b.addEventListener('click', () => { state.packageName=name; state.ngnAmount=ngnAmount; state.usdAmount=usdAmount; state.amount=state.currency === 'NGN' ? ngnAmount : usdAmount; [...wrap.children].forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); });
    wrap.appendChild(b);
  });
  $('packageHint').textContent = state.service === 'Custom Project' ? 'This route produces a manual quotation.' : `Choose a ${state.service === 'Social Media Design' ? 'design quantity' : 'package'} and your billing currency.`;
  $('customNote').hidden = state.service !== 'Custom Project';
  const currentAmount = state.currency === 'NGN' ? state.ngnAmount : state.usdAmount;
  const amountConfirm = $('amountConfirm');
  if (amountConfirm) amountConfirm.hidden = !(['NGN','USD'].includes(state.currency) && Number.isFinite(currentAmount));
  if (['NGN','USD'].includes(state.currency) && Number.isFinite(currentAmount)) {
    const input = $('amountInput');
    if (input) input.value = '';
    setAmountValidation();
  }
  $('amountPrefix').textContent = state.currency === 'NGN' ? '₦' : '$';
}


function setAmountValidation() {
  const wrap = $('amountConfirm');
  const input = $('amountInput');
  const feedback = $('amountFeedback');
  if (!wrap || !input || !feedback) return true;
  const expected = Number(state.amount);
  if (!['NGN','USD'].includes(state.currency) || !Number.isFinite(expected)) {
    wrap.hidden = true;
    input.value = '';
    input.classList.remove('invalid','valid');
    feedback.textContent = '';
    return true;
  }
  wrap.hidden = false;
  const raw = input.value.replace(/[^0-9]/g, '');
  const typed = raw === '' ? null : Number(raw);
  input.classList.remove('invalid','valid');
  if (typed === null) {
    input.classList.add('invalid');
    feedback.className = 'amount-feedback error';
    feedback.textContent = `Enter the exact ${money(expected,state.currency)} amount shown above to continue.`;
    return false;
  }
  if (typed !== expected) {
    input.classList.add('invalid');
    feedback.className = 'amount-feedback error';
    feedback.textContent = typed > expected
      ? `Amount is above the required ${money(expected,state.currency)}. Enter the exact amount.`
      : `Amount is below the required ${money(expected,state.currency)}. Enter the exact amount.`;
    return false;
  }
  input.classList.add('valid');
  feedback.className = 'amount-feedback success';
  feedback.textContent = 'Exact amount confirmed. You can continue.';
  return true;
}

$('amountInput')?.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
  setAmountValidation();
});

function renderQuote() {
  const manual = state.amount == null || state.currency !== 'NGN';
  $('quoteCard').innerHTML = `
    <div class="quote-head"><div><span class="eyebrow">IMPLIFY VISUALS</span><strong>PROJECT ${manual ? 'QUOTATION / ESTIMATE' : 'QUOTATION'}</strong></div><span class="quote-ref">${state.ref}</span></div>
    <div class="quote-client"><div><span>CLIENT</span><strong>${state.name}</strong><small>${[state.business,state.email,state.whatsapp].filter(Boolean).join(' · ')}</small></div><div><span>PROJECT</span><strong>${state.service}</strong><small>${state.timeline || 'Timeline to be agreed'}</small></div></div>
    <table class="quote-table"><thead><tr><th>Service</th><th>Package / Scope</th><th>Qty</th><th>Rate</th><th>Subtotal</th></tr></thead>
    <tbody><tr><td>${state.service}</td><td>${state.packageName}</td><td>1</td><td>${money(state.amount, state.currency)}</td><td>${money(state.amount, state.currency)}</td></tr></tbody></table>
    <div class="quote-total"><span>Total</span><strong>${money(state.amount, state.currency)}</strong></div>`;
}

function renderPayment() {
  const manual = state.amount == null || state.currency !== 'NGN';
  $('paymentTitle').textContent = manual ? 'Choose the approved payment route.' : 'Secure your project slot.';
  $('paymentCopy').textContent = manual ? 'This currency or project scope uses a manual route. Your quotation remains an estimate until payment is verified.' : 'For NGN bookings, the existing Implify Visuals Paystack workflow initializes the transaction through Make and verifies it before a paid state is shown.';
  $('paymentCard').innerHTML = manual
    ? `<div class="payment-method"><div><strong>${state.currency} · Manual payment</strong><span>Payment details will be confirmed with Implify Visuals.</span></div><span>REVIEW</span></div><p style="color:#748094;font-size:.8rem;line-height:1.7;margin:0">No automatic Paystack charge is attempted for this route. Continue to prepare the WhatsApp handoff.</p>`
    : `<div class="payment-method"><div><strong>NGN · Paystack</strong><span>Secure checkout initialized by the existing Make.com workflow. Available payment methods are shown by Paystack, including Apple Pay where eligible.</span></div><span>SECURE</span></div><button type="button" class="primary-action" id="payBtn">Initialize secure payment →</button>`;
  $('paymentStatus').hidden = true;
  if (!manual) $('payBtn').addEventListener('click', initializePaystack);
}

function findCheckoutUrl(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value) && /paystack|checkout|transaction/i.test(value)) return value;
    try { return findCheckoutUrl(JSON.parse(value)); } catch (_) { return null; }
  }
  if (typeof value !== 'object') return null;
  const priority = ['authorization_url','checkout_url','checkoutUrl','payment_url','paymentUrl','url'];
  for (const k of priority) if (typeof value[k] === 'string' && /^https?:\/\//i.test(value[k])) return value[k];
  for (const k of Object.keys(value)) { const found = findCheckoutUrl(value[k]); if (found) return found; }
  return null;
}

async function initializePaystack() {
  const btn = $('payBtn'); if (!btn) return;
  btn.disabled = true; btn.textContent = 'Connecting to secure checkout…';
  $('paymentStatus').hidden = false;
  $('paymentStatus').textContent = 'Sending your booking to the existing Make.com → Paystack initialization workflow. Your reference is ' + state.ref + '.';
  const payload = { project_id: state.ref, client_name: state.name, client_email: state.email, amount: state.amount, currency: state.currency, business: state.business, whatsapp: state.whatsapp, brief: state.brief, timeline: state.timeline };
  try {
    const res = await fetch(MAKE_BOOKING_WEBHOOK, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const text = await res.text();
    let data = text; try { data = JSON.parse(text); } catch (_) {}
    const checkout = findCheckoutUrl(data);
    if (checkout) {
      state.paymentReference = state.ref;
      saveBookingState();
      $('paymentStatus').textContent = 'Secure checkout is ready. Complete payment on Paystack; this page will not mark the booking paid from a browser redirect alone.';
      window.location.href = checkout;
      return;
    }
    $('paymentStatus').innerHTML = '<strong>Booking sent.</strong><br>The Make webhook accepted the request, but this static page did not receive a checkout URL in the response. The existing scenario needs to return Paystack’s authorization URL through a Webhook Response module before the browser can redirect automatically.';
    toast('Booking reached Make, but no checkout URL was returned.');
  } catch (err) {
    $('paymentStatus').textContent = 'The booking could not reach the payment workflow. Check the connection and try again. No payment was marked as paid.';
    toast('Payment connection failed.');
  } finally { btn.disabled=false; btn.textContent='Initialize secure payment →'; }
}

function buildMessage() {
  const amount = money(state.amount, state.currency);
  return `Hi Implify Visuals, I’m ready to proceed with my project.\n\nProject Reference: ${state.ref}\nName: ${state.name}\nBusiness/Brand: ${state.business || 'Not provided'}\nService: ${state.service}\nPackage: ${state.packageName}\nCurrency: ${state.currency}\nQuoted Amount: ${amount}\nTimeline: ${state.timeline || 'Not provided'}\nProject Brief: ${state.brief}\nPayment Status: ${state.paymentStatus}\n\nI’m sending these details for the next project step.`;
}

function renderInvoiceDocument() {
  const paid = state.paymentStatus === 'Paid';
  $('invoiceTitle').textContent = paid ? 'INVOICE' : 'QUOTATION';
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

function renderHandoff() {
  const message = buildMessage();
  $('handoffCard').textContent = message;
  $('whatsappLink').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  $('invoiceCard').innerHTML = `<div class="invoice-head"><div><h3>Implify Visuals</h3><span>${state.paymentStatus === 'Paid' ? 'PAID INVOICE' : 'PROJECT QUOTATION / ESTIMATE'}</span></div><span>${state.ref}</span></div>
    <div class="invoice-row"><span>Client</span><strong>${state.name}</strong></div><div class="invoice-row"><span>Service</span><strong>${state.service}</strong></div><div class="invoice-row"><span>Package</span><strong>${state.packageName}</strong></div><div class="invoice-row"><span>Currency</span><strong>${state.currency}</strong></div><div class="invoice-total"><span>Total</span><strong>${money(state.amount,state.currency)}</strong></div>
    <div class="invoice-actions"><button class="secondary-action" type="button" id="viewInvoice">View ${state.paymentStatus === 'Paid' ? 'Invoice' : 'Quotation'}</button><button class="secondary-action" type="button" id="downloadInvoice">Download / Save PDF</button><button class="secondary-action" type="button" id="shareInvoice">Share</button></div>`;
  $('viewInvoice').addEventListener('click', openInvoice);
  $('downloadInvoice').addEventListener('click', () => { openInvoice(); setTimeout(() => downloadInvoice(), 150); });
  $('shareInvoice').addEventListener('click', async () => { const text=buildMessage(); if(navigator.share){await navigator.share({title:`Implify Visuals ${state.ref}`,text}).catch(()=>{});} else {await navigator.clipboard?.writeText(text); toast('Invoice details copied.');} });
}

$('serviceChoices').addEventListener('click', (e) => {
  const choice=e.target.closest('.choice'); if(!choice)return;
  state.service=choice.dataset.service; state.packageName=''; state.amount=null; state.ngnAmount=null; state.usdAmount=null;
  document.querySelectorAll('.choice').forEach(c=>c.classList.toggle('selected',c===choice));
  renderPackages();
});

document.querySelectorAll('.currency').forEach(btn=>btn.addEventListener('click',()=>{
  state.currency=btn.dataset.currency;
  state.amount=state.currency === 'NGN' ? state.ngnAmount : state.usdAmount;
  document.querySelectorAll('.currency').forEach(b=>b.classList.toggle('active',b===btn));
  renderPackages();
}));

nextBtn.addEventListener('click', () => {
  if (state.step===1 && !validStep1()) return;
  if (state.step===2 && !state.service) {toast('Choose a service first.');return;}
  if (state.step===3 && !state.packageName) {toast('Choose a package or scope first.');return;}
  if (state.step===3 && ['NGN','USD'].includes(state.currency) && Number.isFinite(state.amount) && !setAmountValidation()) { toast('Enter the exact selected amount before continuing.'); return; }
  if (state.step===3) renderQuote();
  if (state.step===4) renderPayment();
  if (state.step===5) { renderHandoff(); }
  setStep(Math.min(6,state.step+1));
});
backBtn.addEventListener('click',()=>setStep(Math.max(1,state.step-1)));
$('copyMessage').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(buildMessage());toast('WhatsApp message copied.');}catch(_){toast('Copy is unavailable on this browser.');}});

const restored = restoreBookingState();
const returnedReference = new URLSearchParams(window.location.search).get('reference') || new URLSearchParams(window.location.search).get('trxref');
if (returnedReference && restored) {
  state.paymentStatus = 'Payment returned · awaiting verification';
  state.paymentReference = returnedReference;
  setStep(6);
  renderHandoff();
  toast('Payment returned. Awaiting trusted verification before marking the project paid.');
} else {
  setStep(1);
}



/* ===== v19: universal invoice sizing + download (works in Instagram/in-app browsers) ===== */
function fitInvoice(){
  const d=document.querySelector('.inv-doc'); if(!d) return;
  const w=d.parentElement.clientWidth||d.clientWidth; if(!w) return;
  d.style.setProperty('--u',(w/100)+'px');
  d.style.height=(w*2296/1623)+'px';
}
window.addEventListener('resize',fitInvoice);
window.addEventListener('orientationchange',()=>setTimeout(fitInvoice,150));

function inAppBrowser(){const ua=navigator.userAgent||'';
  if(/Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|Barcelona|Threads|Line\/|TikTok|musical_ly|BytedanceWebview|Snapchat|Twitter|LinkedInApp|Pinterest|WhatsApp|Telegram|MicroMessenger|Discord|GSA\/|MicrosoftTeams|KAKAOTALK|; wv\)|Version\/[\d.]+ Chrome\/[\d.]+ Mobile/i.test(ua))return true;
  if(/iPhone|iPad|iPod/i.test(ua)&&/AppleWebKit/i.test(ua)&&!/Safari\//i.test(ua))return true; /* iOS WebViews */
  return false;}

async function drawInvoiceCanvas(){
  const W=1623,H=2296,u=W/100,c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d'),F='"DM Sans",Arial,Helvetica,sans-serif',T=id=>(document.getElementById(id)?.textContent||'').trim();
  try{await document.fonts.load('700 20px "DM Sans"');await document.fonts.load('500 20px "DM Sans"');await document.fonts.ready;}catch(e){}
  const BL='#005fff';
  const font=(w,s)=>x.font=`${w} ${s*u}px ${F}`;
  const txt=(s,px,py,o={})=>{font(o.w||400,o.s||2);x.fillStyle=o.c||'#000';x.textAlign=o.a||'left';x.textBaseline='middle';
    let size=o.s||2;const max=o.max;if(max){while(x.measureText(s).width>max*u&&size>0.8){size-=.1;font(o.w||400,size);}}x.fillText(s,px*u,py*u);};
  const rr=(px,py,w,h,r,fill)=>{x.beginPath();x.roundRect?x.roundRect(px*u,py*u,w*u,h*u,r*u):x.rect(px*u,py*u,w*u,h*u);x.fillStyle=fill;x.fill();};
  const img=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src='images/logo.png';});
  x.fillStyle=BL;x.fillRect(0,0,W,H);
  x.fillStyle='#fff';x.fillRect(5.4*u,7.3*u,89.2*u,128*u);
  // blue header block with rounded bottom-left
  x.beginPath();x.moveTo(34.7*u,0);x.lineTo(W,0);x.lineTo(W,33.9*u);x.lineTo(43.7*u,33.9*u);x.arcTo(34.7*u,33.9*u,34.7*u,24.9*u,9*u);x.lineTo(34.7*u,0);x.fillStyle=BL;x.fill();
  if(img)x.drawImage(img,13.55*u,12*u,13*u,13*u);
  txt('Implify Visuals',20.05,28.3,{s:2.2,w:500,a:'center'});
  const ref=T('invoiceRef');font(700,3.6);const rw=x.measureText(ref).width/u+6.4;
  rr(38.7,3.4,rw,7.8,2.2,'#fff');txt(ref,38.7+3.2,7.3,{s:3.6,w:700,c:'#111'});
  const dx=38.7+rw+4;txt('ISSUED:',dx,5.2,{s:1.9,c:'#fff'});txt(T('invoiceDate'),dx+8.2,5.2,{s:1.9,w:500,c:'#fff'});
  txt('DUE:',dx,8.9,{s:1.9,c:'#fff'});txt(T('invoiceDue'),dx+8.2,8.9,{s:1.9,w:500,c:'#fff'});
  font(800,10);const g=x.createLinearGradient(0,12*u,0,22*u);g.addColorStop(0,'#fff');g.addColorStop(1,'#bfc4cc');
  txt(T('invoiceTitle'),38.7,17.6,{s:10,w:800,c:g,max:56});
  txt('INVOICE TO:',9,39,{s:2.4,w:700});
  txt(T('invoiceClient').toUpperCase(),9,44.6,{s:5.6,w:800,max:84});
  txt(T('invoiceContact'),9,50,{s:2,c:'#111',max:84});
  // table
  const tx=8.9,tw=82.2,cw=[.32,.17,.17,.17,.17].map(p=>p*tw),heads=['Description','Package','Qty','Price','Subtotal'];
  let cx=tx;heads.forEach((h,i)=>{x.fillStyle=BL;x.fillRect(cx*u,56.6*u,(cw[i]-.4)*u,7.4*u);
    txt(h,i?cx+cw[i]/2:cx+1.6,60.3,{s:2.3,w:500,c:'#fff',a:i?'center':'left',max:cw[i]-2});cx+=cw[i];});
  const cells=[...document.querySelectorAll('#invoiceLines td')].map(t=>t.textContent.trim());
  cx=tx;cells.forEach((t,i)=>{txt(t,i?cx+cw[i]/2:cx+1.6,68.5,{s:2,w:i===4?700:400,c:'#111',a:i?'center':'left',max:cw[i]-2});cx+=cw[i];});
  txt('PROJECT NOTES',9,76.4,{s:1.7,w:700,c:BL});
  // wrapped notes
  font(400,1.8);const words=T('invoiceNotes').split(/\s+/),maxW=(82)*u;let line='',ly=79.6,n=0;
  for(const w of words){const t=line?line+' '+w:w;if(x.measureText(t).width>maxW&&line){txt(line,9,ly,{s:1.8,c:'#333'});font(400,1.8);ly+=2.6;line=w;if(++n>=6)break;}else line=t;}
  if(line&&n<6)txt(line,9,ly,{s:1.8,c:'#333'});
  const ruleY=Math.max(83.1,ly+2);x.fillStyle='#555';x.fillRect(5.4*u,ruleY*u,89.2*u,1*u);
  // bands
  x.fillStyle=BL;x.fillRect(0,100*u,W,7.1*u);
  txt('SUBTOTAL:',3.6,103.55,{s:2.7,w:700,c:'#fff'});txt(T('invoiceSubtotal'),95,103.55,{s:2.3,w:500,c:'#fff',a:'right'});
  x.fillStyle='#fff';x.fillRect(0,107.1*u,W,7.1*u);
  txt('DISCOUNT:',3.6,110.65,{s:2.7,w:700});txt('—',95,110.65,{s:2.3,w:500,a:'right'});
  x.fillStyle=BL;x.fillRect(0,114.2*u,W,7.1*u);
  txt(T('invoiceStatusLabel'),3.6,117.75,{s:2.7,w:700,c:'#fff'});txt(T('invoiceTotal'),95,117.75,{s:2.3,w:500,c:'#fff',a:'right'});
  x.fillStyle='#fff';x.fillRect(0,121.3*u,W,14*u);
  if(img)x.drawImage(img,4*u,124.55*u,7.5*u,7.5*u);
  txt('Implify Visuals',12.9,128.3,{s:2.4,w:700});
  rr(33,123.7,63,9.3,3,'#767676');
  txt('Payment is required before project work begins.',64.5,126.2,{s:1.8,w:600,c:'#fff',a:'center',max:58});
  txt(T('invoiceCurrencyNote'),64.5,130.4,{s:2.6,w:800,c:'#fff',a:'center',max:58});
  return c;
}

function makePdfBlob(jpegDataUrl,w,h){
  const b=atob(jpegDataUrl.split(',')[1]),jpg=new Uint8Array(b.length);for(let i=0;i<b.length;i++)jpg[i]=b.charCodeAt(i);
  const pw=595.28,ph=841.89,mh=ph-24,mw=mh*w/h,iw=Math.min(pw-24,mw),ih=iw*h/w,ox=(pw-iw)/2,oy=(ph-ih)/2;
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
