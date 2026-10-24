/**
 * POST /api/paystack-webhook  : Paystack -> server, signed with HMAC-SHA512 using PAYSTACK_SECRET_KEY.
 * Lets the booking be marked PAID even if the customer closes the page (bank transfer / USSD).
 * It never trusts the payload: it re-verifies the reference with Paystack using the booking data in metadata.
 * Set the URL in Paystack Dashboard > Settings > API Keys & Webhooks.
 */
const crypto = require('crypto');
const { verifyTransaction, markPaidInSupabase } = require('./_lib/shared');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return res.status(500).end();
  const chunks = []; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks);
  const sig = String(req.headers['x-paystack-signature'] || '');
  const calc = crypto.createHmac('sha512', key).update(raw).digest('hex');
  const a = Buffer.from(sig), c2 = Buffer.from(calc);
  if (a.length !== c2.length || !crypto.timingSafeEqual(a, c2)) return res.status(401).end();
  let ev; try { ev = JSON.parse(raw.toString('utf8')); } catch (_) { return res.status(400).end(); }
  if (!ev || ev.event !== 'charge.success' || !ev.data || !ev.data.reference) return res.status(200).json({ ok: true, ignored: true });
  const md = ev.data.metadata && typeof ev.data.metadata === 'object' ? ev.data.metadata : {};
  if (!md.project_id || !md.service || !md.package) return res.status(200).json({ ok: true, ignored: 'no_booking_metadata' });
  try {
    const out = await verifyTransaction(key, { reference: String(ev.data.reference), ref: String(md.project_id), service: String(md.service),
      package: String(md.package), currency: String(ev.data.currency || '').toUpperCase(), email: '' });
    if (!out.verified) return res.status(200).json({ ok: true, verified: false, reason: out.reason });
    const sb = await markPaidInSupabase(String(md.project_id), out);
    return res.status(200).json({ ok: true, verified: true, supabase: sb });
  } catch (e) { console.error('webhook:', e && e.message); return res.status(500).end(); }
};
module.exports.config = { api: { bodyParser: false } };
