# PayFlow — Payout Management MVP

> A full-stack payout management tool built with **Next.js 14**, **MongoDB Atlas**, and **JWT authentication** with role-based access control.

## 🚀 Live Demo

> Deploy URL will be added after Vercel deployment.

**Demo credentials:**

| Role    | Email               | Password |
|---------|---------------------|----------|
| OPS     | ops@demo.com        | ops123   |
| FINANCE | finance@demo.com    | fin123   |

---

## ✅ Features

- **JWT Auth** (httpOnly cookie) with RBAC enforced on every API route
- **Vendor Management** — list & create vendors (OPS only)
- **Payout Requests** — create, submit, approve, reject with strict status transitions
- **Audit Trail** — every action logged with who, when, and what
- **Filters** — filter payouts by status and vendor
- **Clean dark UI** — responsive, loading states, error messages

---

## ⚡ Run Locally in Under 5 Minutes

### 1. Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier)

### 2. Clone & Install

```bash
git clone <your-repo-url>
cd practical_task
npm install
```

### 3. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local .env.local   # already exists, just edit it
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/payout_mgmt?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
```

> Get your `MONGODB_URI` from Atlas → your cluster → Connect → Drivers → Node.js.

### 4. Seed the Database

```bash
npm run seed
```

This creates:
- 2 users (`ops@demo.com`, `finance@demo.com`)
- 3 vendors (Acme Corp, Swift Logistics, Bright Media)
- 4 payouts in all statuses (Draft, Submitted, Approved, Rejected) with audit trails

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── api/                    # API routes (Next.js App Router)
│   │   ├── auth/login/         # POST — login
│   │   ├── auth/me/            # GET (session check), POST (logout)
│   │   ├── vendors/            # GET list, POST create
│   │   └── payouts/            # GET list, POST create, GET/:id
│   │       └── [id]/           # submit / approve / reject
│   ├── login/                  # Login page
│   ├── vendors/                # Vendor list + add form
│   └── payouts/                # List, New, [id] detail
├── components/                 # Sidebar, AppLayout
├── context/                    # AuthContext
├── lib/                        # db.js, auth.js, middleware.js
└── models/                     # User, Vendor, Payout, PayoutAudit
scripts/
└── seed.js                     # Database seeder
```

---

## 🔒 API Endpoints

| Method | Endpoint                     | Role    | Description                    |
|--------|------------------------------|---------|--------------------------------|
| POST   | `/api/auth/login`            | Public  | Login, returns JWT cookie      |
| GET    | `/api/auth/me`               | Any     | Session check                  |
| POST   | `/api/auth/me`               | Any     | Logout                         |
| GET    | `/api/vendors`               | Any     | List vendors                   |
| POST   | `/api/vendors`               | OPS     | Create vendor                  |
| GET    | `/api/payouts`               | Any     | List payouts (filters: status, vendor_id) |
| POST   | `/api/payouts`               | OPS     | Create payout (Draft)          |
| GET    | `/api/payouts/:id`           | Any     | Get payout + audit trail       |
| POST   | `/api/payouts/:id/submit`    | OPS     | Draft → Submitted              |
| POST   | `/api/payouts/:id/approve`   | FINANCE | Submitted → Approved           |
| POST   | `/api/payouts/:id/reject`    | FINANCE | Submitted → Rejected + reason  |

---

## 🏗️ Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy — Vercel auto-detects Next.js

---

## 📐 Assumptions

- Role is stored in and validated from the **JWT on the server** — frontend role is only used for UI rendering, never trusted for access control
- Vendors are not deletable from the UI to prevent accidental data loss (can be done via MongoDB Atlas console)
- No pagination added (MVP scope) — the list uses `sort: createdAt DESC`
- `is_active` defaults to `true` on vendor creation; no deactivation UI (MVP scope)
