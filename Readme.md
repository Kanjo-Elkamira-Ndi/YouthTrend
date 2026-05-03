<div align="center">

# YouthTrend 🌿

**Your Campus. Your Gist. Your Voice.**

A bilingual (EN/FR) campus-first content & gist platform for Cameroonian university students —  
monorepo powering the web app, REST API, and Flutter mobile client.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20Development-blue)]()
[![Made in Cameroon](https://img.shields.io/badge/Made%20in-Cameroon%20🇨🇲-009A44)]()
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)]()
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)]()

---

</div>

## Table of Contents

- [Overview](#overview)
- [Why YouthTrend?](#why-youthtrend)
- [Platform Roles](#platform-roles)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Apps](#running-the-apps)
- [Environment Variables](#environment-variables)
- [Release Roadmap](#release-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

YouthTrend is a Medium-inspired publishing and gist platform built specifically for Cameroonian university students. It gives students a structured, permanent, and moderated space to share news, opinions, announcements, stories, and hot takes — in English or French.

Unlike WhatsApp groups where campus gist disappears overnight, YouthTrend gives content a discoverable home with a real authorship system, campus-scoped feeds, and an institutional moderation layer that keeps things safe without being overbearing.

The platform is structured around **campus nodes** — each university operates its own feed, managed by a Campus Admin and moderated by staff-appointed moderators. A Super Admin (the platform developer) oversees the entire system.

---

## Why YouthTrend?

| Problem | YouthTrend Solution |
|---|---|
| Campus gist lives and dies in WhatsApp groups | Permanent, searchable, discoverable posts |
| No platform targets Cameroonian student culture specifically | Built for Cameroon — bilingual, local names, local context |
| Global platforms (Medium, Substack) have no campus context | Campus-scoped feeds with university identity |
| No institutional oversight on student content | Campus Admin + Moderator role system |
| Students have no authorship identity online | Writer profiles, follower counts, clap analytics |

---

## Platform Roles

| Role | Description |
|---|---|
| **Super Admin** | Platform developer — full system access across all campuses |
| **Campus Admin** | University representative — manages their campus node |
| **Campus Moderator** | Staff delegate — reviews flagged content and moderation queue |
| **Content Writer** | Registered student who can publish posts |
| **General Reader** | Registered student who reads, claps, comments, and bookmarks |
| **Guest** | Unregistered visitor — read-only access to public posts |

---

## Tech Stack

### Web Frontend
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — animations and page transitions
- **React Router v6** — client-side routing
- **Zustand** — lightweight global state

### Backend API
- **Node.js 20+** + **Express** + **TypeScript**
- **PostgreSQL 16** — primary database
- **Drizzle ORM** — type-safe SQL
- **Zod** — schema validation
- **JWT** + **bcrypt** — authentication and password hashing
- **Cloudflare R2** (or S3-compatible) — media storage

### Mobile (Phase 3+)
- **Flutter 3.x** + **Dart**
- **GoRouter** — navigation
- **Riverpod** — state management
- **Dio** — HTTP client

### Shared
- `packages/shared-types` — TypeScript types shared across web and API

### Infrastructure
- **Railway / Render** — API and database hosting
- **Vercel** — web frontend deployment
- **Cloudflare** — CDN and R2 storage

---

## Monorepo Structure

```
youthtrend-platform/
│
├── YouthTrend/
│   ├── web/                        # React + Vite web application
│   │   └── src/
│   │       ├── assets/             # Images, icons, fonts
│   │       ├── components/
│   │       │   ├── common/         # Button, Input, Badge, Avatar, Modal
│   │       │   ├── layout/         # Navbar, Sidebar, Footer, PageWrapper
│   │       │   ├── feed/           # PostCard, FeedTabs, CategoryFilter
│   │       │   ├── post/           # PostBody, ClapButton, CommentThread
│   │       │   ├── editor/         # EditorToolbar, CoverUpload, TagInput
│   │       │   ├── auth/           # SocialButton, SplitScreen, AuthForm
│   │       │   └── admin/          # Campus admin UI components (reserved)
│   │       ├── pages/              # Landing, Feed, PostView, Write, Profile...
│   │       ├── hooks/              # useTheme, useAuth, useFeed, usePost
│   │       ├── context/            # ThemeContext, AuthContext, CampusContext
│   │       ├── lib/                # api.ts, utils.ts, constants.ts
│   │       ├── mock/               # mockPosts.ts, mockUsers.ts, mockCampuses.ts
│   │       ├── types/              # Local TypeScript types (extends shared-types)
│   │       ├── styles/             # globals.css, theme.css
│   │       └── router/             # routes.tsx
│   │
│   └── mobile/                     # Flutter mobile app (Phase 3+)
│       └── lib/
│           ├── core/               # theme/, router/, constants/
│           ├── features/           # auth/, feed/, post/, write/, profile/, settings/
│           └── shared/             # widgets/, services/
│
├── packages/
│   └── shared-types/               # TypeScript types shared by web + API
│       └── src/
│           ├── user.ts
│           ├── post.ts
│           ├── campus.ts
│           ├── comment.ts
│           └── index.ts
│
├── server/                         # Node.js + Express REST API
│   └── src/
│       ├── config/                 # db.ts, env.ts, cors.ts
│       ├── modules/
│       │   ├── auth/               # controller, service, routes
│       │   ├── users/
│       │   ├── posts/
│       │   ├── comments/
│       │   ├── campus/
│       │   ├── moderation/         # reports, queue, audit log
│       │   ├── notifications/
│       │   └── admin/              # super admin routes (protected)
│       ├── middleware/             # auth, rbac, rateLimit, validate
│       ├── shared/                 # types, utils, errors
│       └── db/                     # migrations/, seeds/, schema.sql
│
└── docs/
    ├── YouthTrend_SRS.docx         # Software Requirements Specification
    ├── api/                        # OpenAPI / Postman collection
    └── diagrams/                   # ERD, architecture diagrams
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** >= 20.x — [nodejs.org](https://nodejs.org)
- **npm** >= 10.x (comes with Node.js)
- **PostgreSQL** >= 16 — [postgresql.org](https://www.postgresql.org)
- **Git**
- **Flutter** >= 3.x (only needed for mobile development) — [flutter.dev](https://flutter.dev)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Kanjo-Elkamira-Ndi/YouthTrend/
cd youthtrend
```

**2. Install all workspace dependencies**

```bash
npm install
```

This installs dependencies for `apps/web`, `server`, and `packages/shared-types` in one command via npm workspaces.

**3. Set up environment variables**

```bash
cp .env.example .env
```

Fill in your values — see [Environment Variables](#environment-variables) below.

**4. Set up the database**

```bash
# Create your PostgreSQL database
createdb youthtrend_dev

# Run migrations
npm run db:migrate --workspace=server
```

**5. (Optional) Seed with mock data**

```bash
npm run db:seed --workspace=server
```

### Running the Apps

**Run everything in development (web + API simultaneously):**

```bash
npm run dev
```

**Run individually:**

```bash
# Web frontend only — http://localhost:5173
npm run dev --workspace=apps/web

# API server only — http://localhost:4000
npm run dev --workspace=server
```

**Build for production:**

```bash
# Build web
npm run build --workspace=apps/web

# Build API
npm run build --workspace=server
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# ── Server ──────────────────────────────────────
PORT=4000
NODE_ENV=development

# ── Database ─────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/youthtrend_dev

# ── JWT ──────────────────────────────────────────
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# ── OAuth (optional in dev) ──────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# ── Storage (Cloudflare R2 or S3) ────────────────
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=youthtrend-media

# ── Email ────────────────────────────────────────
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@youthtrend.cm

# ── Frontend ─────────────────────────────────────
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

---

## Release Roadmap

| Version | Name | Focus | Status |
|---|---|---|---|
| **v1.0** | Single Campus MVP | Core publishing loop, auth, moderation on one campus | 🔨 In Progress |
| **v2.0** | Multi-Campus Expansion | 3–5 campuses, cross-campus Explore feed, analytics | 📋 Planned |
| **v3.0** | Community Layer | Publications, clubs, events, polls, push notifications | 📋 Planned |
| **v4.0** | National Platform | Open to all Cameroonian youth, Flutter mobile apps, monetisation | 📋 Planned |

See the full [SRS document](docs/YouthTrend_SRS.docx) for detailed requirements and success criteria per phase.

---

## Contributing

YouthTrend is currently in active early development. Contributions are not open to the public yet.

If you are a collaborator or have been invited to contribute:

1. Fork the repository and create a feature branch from `develop`
2. Branch naming: `feature/your-feature-name` | `fix/issue-description` | `chore/task-name`
3. Commit style: follow [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `docs:`
4. Open a Pull Request against `develop` — never directly against `main`
5. All PRs require at least one review before merging

```
main        → production-ready code only
develop     → integration branch for all features
feature/*   → individual feature branches
fix/*       → bug fix branches
```

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Author

<div align="center">

Built with 💚 by **KANJO ELKAMIRA NDI (ALCHEMY CODES)**

[GitHub](https://github.com/Kanjo-Elkamira-Ndi) · [LinkedIn](https://www.linkedin.com/in/kanjo-elkamira-ndi-a767b7229)

*Where Campus Gist Lives 🇨🇲*

</div>