# SkipPD (PD Hub) - Project Blueprint v2

> Replaces `SkipPD.md`. Sections 1-2 describe the product; sections 3-8 hold the Part 1 plan.

---

## 1. Features

**Initial blueprint (HTML POC):** https://pd-hub-teacher-marketplace.funnote7.chatgpt.site/
The POC shows the intended look and front-end features. This document covers the backend needed to make it functional.

### 1.1 Login / Logout
There are 2 account types, chosen at signup: **Teacher** or **Hiring party** (a school, for example).

#### Teacher
A teacher can list their own training services and can also hire other teachers' services (book as an individual).
- **Listing a training** - fill out the training details (title, credentials, topic, format, duration, price, grade level, keywords, description, outcomes, optional image). When another teacher/school requests the training, the request appears on the teacher's **Jobs** page (visible after login), where they can respond to it.

  ![Jobs page reference](<WhatsApp Image 2026-10-19 at 10.14.37 PM.jpeg>)

  Layout reference only (screenshot from a different platform): a list of incoming requests with filters, search, sort and a table. The status tabs shown do **not** apply; SkipPD's Jobs page groups bookings by the states in section 5.3.

#### Hiring party (School)
Can only browse, contact and hire teachers. It is not possible to create a training listing from a hiring account.

### 1.2 Training Service Listing / Booking
On a listing, the hiring party customizes parts of the request: number of participants, date, and goals.

The teacher gets an email notification and can **approve** as is, **counter-propose** (different date/other fields), or **reject**. A counter-proposal starts a negotiation that continues until the request is confirmed or rejected.

Once accepted, the hiring party pays and the process starts.

After the training takes place and the hiring party confirms, the trainer is paid and the training is considered finished.

### 1.3 Chat Service
A chat lets the trainer and the hiring party settle training details. One chat thread per booking.

---

## 2. Problems

### 2.1 How do you prove that the training did or did not take place?
The trainer must have proof that the training took place; without proof the training is not considered complete and payment is not released.

**Chosen approach: hiring-party confirmation + evidence fallback**
1. After the scheduled date, the trainer marks the booking as **delivered**.
2. The hiring party is asked to **confirm** or **dispute**.
3. If the hiring party does nothing within N days (proposed: 7), the booking **auto-confirms**.
4. If disputed, the trainer uploads evidence (attendance sheet, photos, video-call log/recording link, signed sign-in sheet). An admin reviews and decides.
5. Funds are held by the payment provider the whole time and are only released on confirmation (or refunded on a dispute ruled for the school).

Optional later improvements: attendance check-in via QR code / link at the session, automatic meeting logs from Zoom/Google Meet integrations.

---

## 3. Decisions taken (Q&A, Oct 2026)

| Question | Decision |
|---|---|
| Stack | TypeScript + Next.js + Supabase (recommended stack) |
| Hosting budget | Free tiers to start |
| Market | USA (USD, US grade bands, US schools) |
| Accounts | Separate account types (Teacher / School). Teachers can also book. |
| Formats | Live online + In person. **Self-paced deferred.** |
| Proof of training | Hiring party confirms + evidence fallback (section 2.1) |

---

## 4. POC Analysis

### 4.1 Features present in the POC (all front-end only, data in `localStorage`)
| Feature | POC behaviour | Needs backend? |
|---|---|---|
| Catalog grid | 6 hard-coded sample courses + user-added ones | Yes - DB |
| Search | Matches title, category, trainer, tags | Yes - DB query |
| Category chips | All topics, Literacy, EdTech & AI, ESL & ELL, Special education, Classroom management, Leadership | Categories table or fixed enum |
| Filters | Format (checkbox), Grade (K-5/6-8/9-12), Duration (<=2h / >2h), Max price (<$75/$150/$300) | Yes - DB query |
| Sort | Recommended, price low/high, duration | Yes - DB query |
| Saved (bookmarks) | Heart toggle + "Saved" view with counter | Yes - per user |
| Course detail modal | Description, trainer + credentials, outcomes, hours, grades, price/person | Yes - DB |
| Booking request form | Name, email, booking for (Myself / School team / Teacher group), participants, school, preferred date (>= today), focus message | Yes - DB + email |
| My requests | Lists requests with status "Draft", remove button | Yes - DB |
| List your training | Form (see 1.1) incl. image <= 1 MB JPG/PNG/WebP | Yes - DB + file storage |

### 4.2 Features missing from the POC (required by this blueprint)
- Real accounts, login/logout, roles
- Jobs page for teachers (incoming requests)
- Accept / counter-propose / reject + negotiation history
- Email notifications
- Chat
- Payments, held funds, payouts
- Delivery / confirmation / dispute / evidence upload
- Admin view (disputes, moderation)
- Editing and deleting own listings
- Trainer profile page
- Reviews / ratings (CSS exists in POC, not used)

### 4.3 POC details worth keeping
- Price is **per person**; total = price x participants (group pricing "agreed with the trainer" - see open questions).
- "PD credit eligibility must be confirmed with your school or district" disclaimer.
- Up to 5 tags per listing; outcomes one per line.
- Visual design (fonts DM Sans / Manrope, purple `#6854d8`) - port as-is.

---

## 5. Technical Plan

### 5.1 Stack
| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript | One language front + back, strong typing catches errors early |
| Framework | Next.js (App Router) | Pages + server code (API routes / server actions) in one project |
| Database | PostgreSQL (Supabase) | Bookings, negotiations and payments are relational; SQL fits better than NoSQL |
| Auth | Supabase Auth | Email/password (+ Google later), role stored on profile |
| Security | Postgres Row-Level Security (RLS) | DB itself enforces "only owner can edit listing", etc. |
| File storage | Supabase Storage | Course images, evidence files |
| Realtime chat | Supabase Realtime | Live messages without a separate chat server |
| Email | Resend (free tier: 3,000/month) | Transactional notifications |
| Payments (later) | Stripe Connect | Marketplace payments: charge school, hold, pay out to trainer |
| Hosting | Vercel (free Hobby) + Supabase (free) | $0 start, deploy on git push |
| Source control | GitHub | Required by Vercel auto-deploy |

**Free-tier caveats:** Supabase free projects pause after ~1 week of inactivity and have 500 MB DB / 1 GB storage. Vercel Hobby is officially for non-commercial use - move to Pro ($20/mo) before charging real money.

### 5.2 Data model (entities, not final schema)
- **Profile** - user id, role (`teacher` | `school`), name, email, credentials/bio, school/organization, Stripe account id (later)
- **Training listing** - owner (teacher), title, category, format, duration hours, price per person, grade levels, tags, description, outcomes, image, active flag
- **Saved listing** - user, listing
- **Booking** - listing, requester, trainer, status, current agreed terms, created/updated
- **Booking proposal** - booking, author, date, participants, goals, price, created (one row per negotiation round = full history)
- **Message** - booking, sender, text, created
- **Evidence** - booking, uploader, file, note
- **Payment** (later) - booking, Stripe ids, amount, platform fee, status
- **Review** (later) - booking, author, rating, text

### 5.3 Booking state machine
```
requested -> negotiating <-> negotiating -> accepted -> paid -> delivered -> completed
    |             |                            |          |         |
    v             v                            v          v         v
 rejected      rejected                    cancelled  cancelled  disputed -> completed | refunded
```
- Only the party who did *not* make the latest proposal can accept it.
- Until payments exist (step 10), `accepted` goes straight to `scheduled`/`delivered`.

### 5.4 Difficulty ranking
| Easy | Medium | Hard (later) |
|---|---|---|
| Catalog, search, filters, sort | Auth + roles + RLS | Payments / held funds / payouts |
| Listing CRUD | Negotiation flow | Disputes + admin tooling |
| Saved listings | Email notifications | Tax forms (1099 via Stripe), refunds |
| Image upload | Realtime chat | Self-paced content hosting |

---

## 6. Roadmap (each step ends with a working, deployed checkpoint)

| # | Step | Done when |
|---|---|---|
| 1 | Repo + Next.js skeleton, port POC UI as static pages, deploy to Vercel | POC look-alike live on a Vercel URL |
| 2 | Supabase project, initial schema, seed the 6 sample courses; catalog/search/filters/sort read from DB | Live site shows DB data; adding a row in Supabase shows on site |
| 3 | Auth: signup with role, login/logout, profile page | Can create Teacher and School accounts; header changes per role |
| 4 | Listing CRUD for teachers + image upload; RLS policies | Teacher creates/edits/deletes own listing; school cannot list |
| 5 | Saved listings per user | Saved items persist across devices |
| 6 | Booking requests; "My requests" (requester) and "Jobs" (trainer) pages | Request appears on trainer's Jobs page |
| 7 | Negotiation (accept / counter / reject) + email notifications | Full negotiation round-trip works with emails |
| 8 | Chat per booking (realtime) | Both parties chat live on a booking |
| 9 | Completion flow: delivered, confirm, auto-confirm, dispute, evidence upload, minimal admin page | A booking can reach `completed` or `disputed` |
| 10 | Stripe Connect: trainer onboarding, payment on accept, payout on completion | Test-mode payment end to end |
| 11 | Later: reviews, trainer profiles, self-paced, PD certificates, Google login, analytics | - |

Rule: do not start step N+1 until step N is deployed and manually tested.

---

## 7. Open Questions (to decide before the relevant step)
1. **Platform fee** - what % does SkipPD keep? (step 10)
2. **Group pricing** - always price x participants, or can trainers quote a flat group price during negotiation? (step 7)
3. **Cancellation / refund policy** - who can cancel after payment, and how much is refunded? (step 10)
4. **Auto-confirm window** - 7 days OK? (step 9)
5. **Trainer vetting** - anyone can list, or manual approval / credential check first? (step 4)
6. **In-person travel costs** - part of the price, or negotiated separately? (step 7)
7. **Who is admin** - you only, or a team? (step 9)
8. **Product name** - "SkipPD" or "PD Hub"? (step 1, branding)
9. **Privacy** - will any student data ever be stored (e.g. in evidence photos)? If yes, FERPA/COPPA considerations apply. Recommendation: forbid student-identifiable data in uploads.

---

## 8. Part 2 (next step) - Steps 1 and 2 of the roadmap

### Prerequisites (you)
- Install Node.js LTS (20+) and Git
- Create free accounts: GitHub, Vercel, Supabase

### Step 1 - Skeleton + deploy
1. Create Next.js app (TypeScript) and GitHub repo.
2. Port the POC layout into components: header, hero, filters, course card, course detail, forms.
3. Keep sample data in a local file for now.
4. Connect repo to Vercel and deploy.
**Checkpoint:** live URL matches the POC visually.

### Step 2 - Database-backed catalog
1. Create Supabase project; add categories and listings tables.
2. Seed the 6 POC courses.
3. Replace local sample data with DB queries (search, filters, sort on the server).
4. Store Supabase keys as Vercel environment variables (never commit them).
**Checkpoint:** editing a course in the Supabase dashboard changes the live site.
