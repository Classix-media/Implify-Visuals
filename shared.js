/* Shared server-side helpers (underscore folder: not exposed as a Vercel route). */
// Must match the prices in booking.js (USD whole dollars, NGN whole naira).
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
const safeRef = (ref) => String(ref || '').replace(/[^A-Za-z0-9.-]/g, '-').slice(0, 50);
const priceOf = (service, pkg, currency) => {
  const p = PRICES[service] && PRICES[service][pkg] && PRICES[service][pkg][currency];
  return Number.isInteger(p) && p > 0 ? p : null;
};

function originOk(req) {
  const allowed = (process.env.ALLOWED_ORIGINS || 'https://implify-visuals.vercel.app').split(',').map((s) => s.trim().replace(/\/+$/, ''));
  const origin = req.headers.origin;
  return !origin || allowed.includes(origin);
}

/**
 * Independent verification against Paystack. Returns {verified:boolean, reason?, ...}.
 * expected = { reference, ref (booking ref), service, package, currency, email? }
 */
async function verifyTransaction(key, expected) {
  const price = priceOf(expected.service, expected.package, expected.currency);
  if (!price) return { verified: false, reason: 'unknown_package' };
  const r = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(expected.reference), {
    headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' }, signal: AbortSignal.timeout(10000),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j || j.status !== true || !j.data) return { verified: false, reason: 'not_found' };
  const d = j.data;
  if (String(d.status).toLowerCase() !== 'success') return { verified: false, reason: String(d.status || 'pending') };
  if (String(d.currency).toUpperCase() !== expected.currency) return { verified: false, reason: 'currency_mismatch' };
  if (Number(d.amount) !== price * 100) return { verified: false, reason: 'amount_mismatch' };
  const payer = String((d.customer && d.customer.email) || '').toLowerCase();
  if (expected.email && payer && payer !== expected.email) return { verified: false, reason: 'email_mismatch' };
  // Booking association: metadata.project_id (set by /api/init-payment), or reference equals/starts with the booking ref.
  const metaRef = d.metadata && typeof d.metadata === 'object' ? String(d.metadata.project_id || '') : '';
  let binding = null;
  if (metaRef) { if (metaRef !== expected.ref) return { verified: false, reason: 'booking_mismatch' }; binding = 'metadata'; }
  else if (d.reference === expected.ref || String(d.reference).startsWith(safeRef(expected.ref) + '-p')) binding = 'reference';
  else if (process.env.REQUIRE_BOOKING_BINDING === 'true') return { verified: false, reason: 'booking_unbound' };
  else binding = 'email_only'; // legacy Make-initialised transactions carry no booking id; amount+currency+email were still verified
  return { verified: true, reference: d.reference, amount: price, currency: expected.currency, channel: d.channel || null, paid_at: d.paid_at || null, binding };
}

/**
 * Optional server-side Supabase update. Enabled ONLY when SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and
 * SUPABASE_BOOKINGS_TABLE are all set. Never throws, never blocks the verified result.
 */
async function markPaidInSupabase(ref, info) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, table = process.env.SUPABASE_BOOKINGS_TABLE;
  if (!url || !key || !table) return 'disabled';
  const refCol = process.env.SUPABASE_REF_COLUMN || 'project_id';
  const body = { [process.env.SUPABASE_STATUS_COLUMN || 'payment_status']: process.env.SUPABASE_PAID_VALUE || 'PAID' };
  if (process.env.SUPABASE_REFERENCE_COLUMN) body[process.env.SUPABASE_REFERENCE_COLUMN] = info.reference;
  if (process.env.SUPABASE_PAID_AT_COLUMN && info.paid_at) body[process.env.SUPABASE_PAID_AT_COLUMN] = info.paid_at;
  try {
    const r = await fetch(url.replace(/\/+$/, '') + '/rest/v1/' + encodeURIComponent(table) + '?' + encodeURIComponent(refCol) + '=eq.' + encodeURIComponent(ref), {
      method: 'PATCH', headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) { console.error('supabase update failed', r.status); return 'error'; }
    const rows = await r.json().catch(() => []);
    return Array.isArray(rows) && rows.length ? 'updated' : 'no_match';
  } catch (e) { console.error('supabase update error', e && e.message); return 'error'; }
}

module.exports = { PRICES, clean, safeRef, priceOf, originOk, verifyTransaction, markPaidInSupabase };
