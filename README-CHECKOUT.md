# Checkout (Page 3) setup

Vercel env vars (server only):
- PAYSTACK_SECRET_KEY (required, already set)
- ALLOWED_ORIGINS (optional, default https://implify-visuals.vercel.app; add your custom domain)
- REQUIRE_BOOKING_BINDING=true (optional; reject transactions that carry no booking id, e.g. old Make-initialised ones)
- Supabase paid update (optional, all three needed to enable): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BOOKINGS_TABLE
  Optional names: SUPABASE_REF_COLUMN (default project_id), SUPABASE_STATUS_COLUMN (default payment_status), SUPABASE_PAID_VALUE (default PAID),
  SUPABASE_REFERENCE_COLUMN, SUPABASE_PAID_AT_COLUMN

Paystack Dashboard: Settings > API Keys & Webhooks > Webhook URL = https://<your-domain>/api/paystack-webhook
