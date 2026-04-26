# ⚡ SwiftData — Deployment Guide

A step-by-step guide to get your store live on Vercel in under 30 minutes.

---

## WHAT YOU'RE GETTING

- **Frontend**: Professional storefront with MTN, Vodafone & AirtelTigo bundles
- **Backend**: API routes (Next.js) — place orders, track orders, admin auth
- **Database**: Supabase (free) — stores all orders with status
- **Notifications**: Twilio WhatsApp — instant WhatsApp alert when a new order comes in
- **Admin Dashboard**: `/admin` — view all orders, update delivery status

---

## STEP 1 — Set Up Supabase (Free Database)

1. Go to **https://supabase.com** → Sign up (free)
2. Click **New Project** → give it a name like "swiftdata"
3. Wait for project to be ready (~2 min)
4. Go to **SQL Editor** (left sidebar) and run this SQL:

```sql
create table orders (
  id uuid default gen_random_uuid() primary key,
  reference text unique not null,
  network text not null,
  bundle_size text not null,
  bundle_price text not null,
  phone text not null,
  recipient text,
  payment_method text not null,
  status text default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table orders enable row level security;

create policy "Allow inserts" on orders for insert with check (true);

create policy "Service role full access" on orders
  using (auth.role() = 'service_role');
```

5. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## STEP 2 — Set Up Twilio WhatsApp (Free Tier)

1. Go to **https://twilio.com** → Sign up (free)
2. In your console, go to **Messaging → Try it out → Send a WhatsApp message**
3. Follow the sandbox setup — you'll scan a QR code with your WhatsApp
4. From the Twilio Console homepage, copy:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`
5. The sandbox number is: `whatsapp:+14155238886` → `TWILIO_WHATSAPP_FROM`
6. Your WhatsApp number (with country code): e.g. `whatsapp:+233551234567` → `ADMIN_WHATSAPP_NUMBER`

> 💡 **Note**: The Twilio sandbox requires your number to opt in first.
> For production, you can upgrade to a paid Twilio number (~$1/month).

---

## STEP 3 — Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. Create a **GitHub account** at https://github.com if you don't have one
2. Create a **new repository** (can be private)
3. Upload all the project files to the repository
   - Or use GitHub Desktop (https://desktop.github.com) for easy drag-and-drop
4. Go to **https://vercel.com** → Sign up with GitHub
5. Click **Add New Project** → Import your GitHub repository
6. Vercel will auto-detect it as a Next.js project
7. **Before deploying**, click **Environment Variables** and add all these:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` |
| `ADMIN_WHATSAPP_NUMBER` | `whatsapp:+233XXXXXXXXX` |
| `ADMIN_PASSWORD` | A strong password for admin panel |

8. Click **Deploy** → Wait ~2 minutes
9. Your store is live! 🎉

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
cd swiftdata
vercel
# Follow the prompts, then add env vars in Vercel dashboard
```

---

## STEP 4 — Customise Your Store

### Update prices
Edit `/lib/bundles.js` — change the `price` and `priceNum` values for each bundle.

### Update store name
Search for "SwiftData" across all files and replace with your store name.

### Update contact numbers
In `/pages/index.js`, find the footer section and update:
- Phone: `href="tel:0XXXXXXXXX"`
- WhatsApp: `href="https://wa.me/233XXXXXXXXX"`

### Update payment numbers
In `/pages/index.js`, find the payment section and replace:
- `055 XXX XXXX` → Your MoMo number
- `020 XXX XXXX` → Your Vodafone Cash number

---

## STEP 5 — Access Admin Dashboard

1. Go to `https://your-domain.vercel.app/admin`
2. Enter the `ADMIN_PASSWORD` you set in Vercel
3. You'll see all orders, can update their status (Pending → Processing → Delivered)

---

## HOW IT ALL WORKS (Flow)

```
Customer visits store
       ↓
Picks a bundle → Fills in phone + payment method
       ↓
Clicks "Confirm Order"
       ↓
API saves order to Supabase (status: pending)
       ↓
WhatsApp message sent to YOUR number instantly
       ↓
You manually collect payment via MoMo/Vodafone Cash
       ↓
You send the data bundle to customer's number
       ↓
Go to /admin → Update order status to "Delivered"
       ↓
Customer can track order at /  (Track Order section)
```

---

## CUSTOM DOMAIN (Optional)

1. Buy a domain from https://domains.google or https://namecheap.com
   - Suggestions: swiftdata.store, yourstorename.com.gh
2. In Vercel → your project → Settings → Domains
3. Add your domain and follow the DNS instructions

---

## TROUBLESHOOTING

**Orders not saving?**
- Check Supabase URL and keys are correct in Vercel env vars
- Make sure the SQL table was created in Supabase

**WhatsApp not working?**
- Make sure your number has joined the Twilio sandbox (send the join code to +14155238886 on WhatsApp)
- Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct

**Admin not logging in?**
- Check ADMIN_PASSWORD in Vercel matches what you're typing
- Try redeploying after updating the env var

---

## SUPPORT

Need help? The technologies used are all well-documented:
- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
- Twilio WhatsApp: https://www.twilio.com/docs/whatsapp
- Next.js docs: https://nextjs.org/docs
