/**
 * POST /api/verify-payment   (Vercel serverless, server-side only)
 * Confirms a Paystack payment directly with Paystack before the checkout page shows a PAID state.
 * The browser callback alone is never trusted.
 *
 * Env var (server only, never in browser code):  PAYSTACK_SECRET_KEY
 * Optional: ALLOWED_ORIGINS (comma list, default https://implify-visuals.vercel.app)
 */
// Must match the prices in booking.js (kept identical; generated from it).
const PRICES = {
  "Brand Identity Design": {
    "Basic": {
      "NGN": 80000,
      "USD": 60
    },
    "Standard": {
      "NGN": 140000,
      "USD": 106
    },
    "Premium": {
      "NGN": 200000,
      "USD": 151
    }
  },
  "Motion Graphics / Video Editing": {
    "Basic": {
      "NGN": 70000,
      "USD": 53
    },
    "Standard": {
      "NGN": 140000,
      "USD": 106
    },
    "Premium": {
      "NGN": 250000,
      "USD": 189
    }
  },
  "Social Media Design": {
    "1 Design": {
      "NGN": 25000,
      "USD": 19
    },
    "3 Designs": {
      "NGN": 75000,
      "USD": 57
    },
    "5 Designs": {
      "NGN": 125000,
      "USD": 94
    }
  },
  "Church Flyer Design": {
    "1 Design": {
      "NGN": 30000,
      "USD": 23
    },
    "3 Designs": {
      "NGN": 90000,
      "USD": 68
    },
    "5 Designs": {
      "NGN": 120000,
      "USD": 91
    }
  },
  "UI/UX Interface Design": {
    "Basic": {
      "NGN": 90000,
      "USD": 68
    },
    "Standard": {
      "NGN": 150000,
      "USD": 113
    },
    "Premium": {
      "NGN": 200000,
      "USD": 151
    }
  }
};

const clean = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) { console.error('verify-payment: PAYSTACK_SECRET_KEY missing'); return res.status(500).json({ error: 'server_not_configured' }); }

  const allowed = (process.env.ALLOWED_ORIGINS || 'https://implify-visuals.vercel.app').split(',').map((s) => s.trim().replace(/\/+$/, ''));
  const origin = req.headers.origin;
  if (origin && !allowed.includes(origin)) return res.status(403).json({ error: 'origin_not_allowed' });

  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (_) { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ error: 'invalid_body' });
  const reference = clean(b.reference, 100), service = clean(b.service, 80), pkg = clean(b.package, 40);
  const currency = clean(b.currency, 3).toUpperCase(), email = clean(b.email, 254).toLowerCase();
  if (!/^[A-Za-z0-9_.=-]{6,100}$/.test(reference)) return res.status(400).json({ error: 'invalid_reference' });
  const price = PRICES[service] && PRICES[service][pkg] && PRICES[service][pkg][currency];
  if (!Number.isInteger(price) || price <= 0) return res.status(400).json({ error: 'unknown_package' });

  try {
    const r = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(reference), {
      headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' }, signal: AbortSignal.timeout(10000),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j || j.status !== true || !j.data) return res.status(200).json({ verified: false, reason: 'not_found' });
    const d = j.data;
    if (String(d.status).toLowerCase() !== 'success') return res.status(200).json({ verified: false, reason: String(d.status || 'pending') });
    if (String(d.currency).toUpperCase() !== currency) return res.status(200).json({ verified: false, reason: 'currency_mismatch' });
    if (Number(d.amount) !== price * 100) return res.status(200).json({ verified: false, reason: 'amount_mismatch' });
    const payer = String((d.customer && d.customer.email) || '').toLowerCase();
    if (email && payer && payer !== email) return res.status(200).json({ verified: false, reason: 'email_mismatch' });
    return res.status(200).json({ verified: true, reference: d.reference, amount: price, currency, channel: d.channel || null, paid_at: d.paid_at || null });
  } catch (e) {
    console.error('verify-payment:', e && e.message);
    return res.status(502).json({ error: 'verification_unavailable' });
  }
};
