# Setup Guide - New Features

## What's New
1. **Resolution/Completion Notes** - editable notes on each ticket
2. **Labor Line Items** - add multiple labor entries when creating or viewing a ticket
3. **Email Customer** - send emails directly from a ticket (via Resend)
4. **Text Customer** - send SMS directly from a ticket (via Twilio)

---

## STEP 1: Run the Database Migration

Go to **Supabase Dashboard → SQL Editor** and paste the contents of:
```
01-database-migration.sql
```
Click **Run**. This adds the `resolution_notes` column and ensures the
`ticket_labor` table exists.

---

## STEP 2: Copy the Files Into Your Project

Replace/add these files in your project (from the output folder):

```
app/
  dashboard/
    tickets/
      new/
        page.tsx                ← REPLACE (adds labor lines to new ticket form)
      [id]/
        page.tsx                ← REPLACE (updated detail page)
        ResolutionNotes.tsx     ← NEW (resolution notes component)
        LaborManager.tsx        ← NEW (add/remove labor on detail page)
        ContactActions.tsx      ← NEW (email & text buttons + modals)
  api/
    send-email/
      route.ts                  ← NEW (Resend email API)
    send-sms/
      route.ts                  ← NEW (Twilio SMS API)
```

---

## STEP 3: Set Up Email (Resend)

1. Go to https://resend.com and sign up (free - 100 emails/day)
2. Go to the dashboard and copy your API key
3. Open your `.env.local` file and add:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. (Optional) To send from your own domain instead of @resend.dev:
   - Go to Resend dashboard → Domains → Add Domain
   - Add the DNS records they give you
   - Then update `.env.local`:
   ```
   EMAIL_FROM=Your Shop Name <noreply@yourdomain.com>
   ```

---

## STEP 4: Set Up SMS (Twilio)

1. Go to https://twilio.com and sign up (free trial = $15 credit)
2. Get a phone number from the Twilio console
3. Open your `.env.local` file and add:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

**Note:** On the free trial, you can only text numbers you've verified
in the Twilio console. Upgrade to remove that restriction.

---

## STEP 5: Restart Your Dev Server

```bash
npm run dev
```

---

## How It Works

### Resolution Notes
- On any ticket detail page, there's a new "Resolution / Completion Notes" section
- Click "Add Resolution Notes" to write what was done
- Click "Save" and it saves directly to the ticket

### Labor (New Ticket)
- When creating a ticket, scroll down to the "Labor" section
- Click "+ Add Labor Line" to add description, hours, and rate
- Add as many lines as needed
- They're saved when you create the ticket

### Labor (Existing Ticket)
- On the ticket detail page, the Labor section now has an "+ Add Labor" button
- You can add new labor lines or remove existing ones
- Changes are saved immediately

### Email Customer
- On a ticket detail page, click "📧 Email Customer"
- A pre-filled email opens with ticket details
- Edit the message and click "Send Email"
- Only works if the customer has an email on file

### Text Customer
- On a ticket detail page, click "💬 Text Customer"
- A pre-filled SMS opens with a status update
- Edit and click "Send Text"
- Only works if the customer has a phone on file
