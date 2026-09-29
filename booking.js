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
  $('invoiceTitle').textContent = paid ? 'INVOICE' : 'PROJECT QUOTATION';
  $('invoiceRef').textContent = state.ref;
  $('invoiceDate').textContent = new Date().toLocaleDateString('en-NG', {day:'2-digit', month:'short', year:'numeric'});
  $('invoiceClient').textContent = state.name || 'Client';
  $('invoiceContact').textContent = [state.email, state.whatsapp, state.business].filter(Boolean).join(' · ');
  $('invoiceLines').innerHTML = `<tr><td>${state.service || 'Project'}</td><td>${state.packageName || 'Custom scope'}</td><td>1</td><td>${money(state.amount,state.currency)}</td><td>${money(state.amount,state.currency)}</td></tr>`;
  $('invoiceNotes').textContent = state.brief || 'Project scope as discussed with Implify Visuals.';
  $('invoiceSubtotal').textContent = money(state.amount,state.currency);
  $('invoiceTotal').textContent = money(state.amount,state.currency);
  $('invoiceStatusLabel').textContent = paid ? 'TOTAL PAID' : 'TOTAL';
  $('invoiceCurrencyNote').textContent = state.currency === 'USD' ? 'USD studio price · fixed reference, not live FX' : 'Currency: ' + state.currency;
}
function openInvoice() {
  renderInvoiceDocument();
  const modal=$('invoiceModal'); modal.hidden=false; modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
}
function closeInvoice() {
  const modal=$('invoiceModal'); modal.hidden=true; modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open');
}
$('closeInvoice')?.addEventListener('click', closeInvoice);
document.querySelector('[data-close-invoice]')?.addEventListener('click', closeInvoice);
$('printInvoiceModal')?.addEventListener('click', () => window.print());
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
  $('downloadInvoice').addEventListener('click', () => { openInvoice(); setTimeout(() => window.print(), 120); });
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

