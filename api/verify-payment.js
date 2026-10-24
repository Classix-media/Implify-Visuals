/**
 * POST /api/verify-payment   (Vercel serverless, server-side only)
 * Confirms a Paystack payment directly with Paystack (status, exact amount, currency, reference, booking association)
 * before the checkout page shows a PAID state. The browser callback alone is never trusted.
 * If SUPABASE_* env vars are set, the booking row is also marked paid server-side after verification.
 *
 * Env (server only): PAYSTACK_SECRET_KEY. Optional: ALLOWED_ORIGINS, REQUIRE_BOOKING_BINDING, SUPABASE_* (see README-CHECKOUT.md)
 */
const { clean, originOk, verifyTransaction, markPaidInSupabase } = require('./_lib/shared');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) { console.error('verify-payment: PAYSTACK_SECRET_KEY missing'); return res.status(500).json({ error: 'server_not_configured' }); }
  if (!originOk(req)) return res.status(403).json({ error: 'origin_not_allowed' });

  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (_) { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ error: 'invalid_body' });
  const reference = clean(b.reference, 100), service = clean(b.service, 80), pkg = clean(b.package, 40), ref = clean(b.ref, 60);
  const currency = clean(b.currency, 3).toUpperCase(), email = clean(b.email, 254).toLowerCase();
  if (!/^[A-Za-z0-9_.=-]{6,100}$/.test(reference)) return res.status(400).json({ error: 'invalid_reference' });
  if (!ref) return res.status(400).json({ error: 'invalid_booking_ref' });
  try {
    const out = await verifyTransaction(key, { reference, ref, service, package: pkg, currency, email });
    if (out.reason === 'unknown_package') return res.status(400).json({ error: 'unknown_package' });
    if (!out.verified) return res.status(200).json({ verified: false, reason: out.reason });
    out.supabase = await markPaidInSupabase(ref, out);
    return res.status(200).json(out);
  } catch (e) {
    console.error('verify-payment:', e && e.message);
    return res.status(502).json({ error: 'verification_unavailable' });
  }
};
