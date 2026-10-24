/**
 * POST /api/charge-payment : on-site Bank transfer and USSD via Paystack's Charge API (NGN only).
 * Returns ONLY details Paystack actually returned (account number / USSD code). Nothing is invented and nothing is marked paid here:
 * success is decided by /api/verify-payment (and the webhook).
 */
const { clean, safeRef, priceOf, originOk } = require('./_lib/shared');
const USSD = { '737': 'GTBank', '966': 'Zenith Bank', '919': 'UBA', '822': 'Sterling Bank' };
const find = (o, keys, d = 0) => { if (!o || typeof o !== 'object' || d > 4) return ''; for (const k of keys) if (typeof o[k] === 'string' && o[k]) return o[k];
  for (const v of Object.values(o)) { const r = find(v, keys, d + 1); if (r) return r; } return ''; };

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'server_not_configured' });
  if (!originOk(req)) return res.status(403).json({ error: 'origin_not_allowed' });
  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (_) { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ error: 'invalid_body' });
  const ref = clean(b.ref, 60), service = clean(b.service, 80), pkg = clean(b.package, 40), name = clean(b.name, 120);
  const currency = clean(b.currency, 3).toUpperCase(), email = clean(b.email, 254).toLowerCase(), method = clean(b.method, 20), ussdType = clean(b.ussdType, 4);
  if (method !== 'bank_transfer' && method !== 'ussd') return res.status(400).json({ error: 'unknown_method' });
  if (currency !== 'NGN') return res.status(400).json({ error: 'method_unavailable_for_currency' });
  if (method === 'ussd' && !USSD[ussdType]) return res.status(400).json({ error: 'unknown_bank' });
  if (!ref || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'invalid_booking' });
  const price = priceOf(service, pkg, currency);
  if (!price) return res.status(400).json({ error: 'unknown_package' });
  const reference = safeRef(ref) + '-p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const body = { email, amount: String(price * 100), currency, reference, metadata: { project_id: ref, service, package: pkg, client_name: name, method } };
  if (method === 'bank_transfer') body.bank_transfer = {}; else body.ussd = { type: ussdType };
  try {
    const r = await fetch('https://api.paystack.co/charge', { method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.status || !j.data) { console.error('charge refused', r.status, j && j.message); return res.status(502).json({ error: 'charge_failed', message: String((j && j.message) || '').slice(0, 160) }); }
    const d = j.data, out = { reference: d.reference || reference, amount: price, currency, method, display_text: String(d.display_text || '').slice(0, 200) };
    if (method === 'bank_transfer') {
      out.account_number = find(d, ['account_number']); out.account_name = find(d, ['account_name']);
      out.bank_name = find(d, ['bank_name', 'bank']); out.expires_at = find(d, ['account_expires_at', 'expires_at']);
      if (!out.account_number) return res.status(502).json({ error: 'no_details', message: 'Paystack did not return transfer details for this account.' });
    } else {
      out.ussd_code = find(d, ['ussd_code']); out.bank_name = USSD[ussdType];
      if (!out.ussd_code) return res.status(502).json({ error: 'no_details', message: 'Paystack did not return a USSD code.' });
    }
    return res.status(200).json(out);
  } catch (e) { console.error('charge-payment:', e && e.message); return res.status(502).json({ error: 'charge_unavailable' }); }
};
