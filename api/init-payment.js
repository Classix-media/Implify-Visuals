/**
 * POST /api/init-payment   (Vercel serverless, server-side only)
 * Initialises a Paystack transaction for the customer's chosen method. The price comes from the server price table
 * (never from the browser), the currency is sent explicitly, and the method restricts Paystack's `channels`.
 * Returns only the public access_code + reference. Success is NEVER decided here: see /api/verify-payment.
 */
const { clean, safeRef, priceOf, originOk } = require('./_lib/shared');

// Documented Paystack channel values. Google Pay and OPay are not Paystack channels, so they are not offered.
const METHODS = {
  card: { channels: ['card'], currencies: ['NGN', 'USD'] },            // card + Google Pay (shown by Paystack inside the card screen)
  zap: { channels: null, currencies: ['NGN'] },                         // Zap has no documented channel code: Paystack shows its normal method list
  bank_transfer: { channels: ['bank_transfer'], currencies: ['NGN'] },
  ussd: { channels: ['ussd'], currencies: ['NGN', 'USD'] },
  bank: { channels: ['bank'], currencies: ['NGN'] },
  payattitude: { channels: ['qr'], currencies: ['NGN', 'USD'] },               // PayAttitude is the QR channel
  opay: { channels: ['bank'], currencies: ['NGN'] },                    // OPay is listed inside Pay with Bank
};

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'server_not_configured' });
  if (!originOk(req)) return res.status(403).json({ error: 'origin_not_allowed' });
  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (_) { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ error: 'invalid_body' });
  const ref = clean(b.ref, 60), service = clean(b.service, 80), pkg = clean(b.package, 40), name = clean(b.name, 120);
  const currency = clean(b.currency, 3).toUpperCase(), email = clean(b.email, 254).toLowerCase(), method = clean(b.method, 20);
  const m = METHODS[method];
  if (!m) return res.status(400).json({ error: 'unknown_method' });
  if (!m.currencies.includes(currency)) return res.status(400).json({ error: 'method_unavailable_for_currency' });
  if (!ref || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'invalid_booking' });
  const price = priceOf(service, pkg, currency);
  if (!price) return res.status(400).json({ error: 'unknown_package' });
  const reference = safeRef(ref) + '-p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  try {
    const r = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount: price * 100, currency, reference, ...(m.channels ? { channels: m.channels } : {}),
        metadata: { project_id: ref, service, package: pkg, client_name: name, method } }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.status || !j.data || !j.data.access_code) {
      console.error('init-payment: paystack refused', r.status, j && j.message);
      return res.status(502).json({ error: 'init_failed', message: String((j && j.message) || '').slice(0, 160) });
    }
    return res.status(200).json({ access_code: j.data.access_code, reference: j.data.reference || reference, amount: price, currency, method });
  } catch (e) {
    console.error('init-payment:', e && e.message);
    return res.status(502).json({ error: 'init_unavailable' });
  }
};
