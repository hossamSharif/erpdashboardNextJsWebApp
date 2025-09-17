# Tech Stack

This is the **DEFINITIVE technology selection** for the entire project. All development must use these exact versions and technologies.

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe frontend development | End-to-end type safety with backend, reduces runtime errors |
| Frontend Framework | Next.js | 14.2+ | React framework with App Router | SSR/SSG capabilities, API routes, excellent performance |
| UI Component Library | Headless UI + shadcn/ui | Latest | Accessible component foundation | WAI-ARIA compliance, customizable, Arabic RTL support |
| State Management | Zustand | 4.4+ | Lightweight state management | Simple API, TypeScript support, offline state persistence |
| Backend Language | TypeScript | 5.3+ | Server-side development | Shared types with frontend, single language stack |
| Backend Framework | Next.js API Routes | 14.2+ | Serverless API endpoints | Integrated with frontend, automatic deployment scaling |
| API Style | tRPC | 10.45+ | End-to-end type-safe APIs | Eliminates API layer complexity, full TypeScript integration |
| Database | PostgreSQL | 15+ | Primary data storage | ACID compliance for financial data, JSON support, mature ecosystem |
| ORM | Prisma | 5.6+ | Database toolkit and ORM | Type-safe database access, migration system, excellent DX |
| Cache | Redis (Upstash) | 7+ | Session and data caching | Session storage, API response caching, rate limiting |
| File Storage | Supabase Storage | Latest | Document and export storage | Integrated with auth, CDN distribution, S3-compatible |
| Authentication | NextAuth.js + Supabase Auth | 4.24+ | User authentication and authorization | JWT tokens, multiple providers, session management |
| Frontend Testing | Vitest + React Testing Library | Latest | Unit and integration tests | Fast test runner, React component testing |
| Backend Testing | Vitest + Supertest | Latest | API endpoint testing | Same test runner as frontend, HTTP testing utilities |
| E2E Testing | Playwright | 1.40+ | End-to-end browser testing | Cross-browser support, mobile testing, Arabic text support |
| Build Tool | Turborepo | 1.10+ | Monorepo build orchestration | Incremental builds, dependency caching, parallel execution |
| Bundler | Next.js (Webpack/Turbopack) | Built-in | Application bundling | Optimized for Next.js, tree shaking, code splitting |
| CSS Framework | Tailwind CSS | 3.3+ | Utility-first styling | RTL support, responsive design, consistent design system |
| Mobile Framework | React Native + Expo | 49+ | Cross-platform mobile development | Shared codebase with web, managed workflow, OTA updates |
| Mobile Navigation | Expo Router | 3+ | File-based routing for mobile | Consistent with Next.js App Router patterns |
| Offline Storage | SQLite (Expo) + AsyncStorage | Latest | Mobile offline data storage | Reliable offline storage, automatic sync capabilities |
| Push Notifications | Firebase Cloud Messaging | Latest | Mobile push notifications | Cross-platform support, reliable delivery, rich notifications |
| Internationalization | next-i18next + react-i18next | 14+ | Arabic/English localization | SSR support, pluralization, RTL layout management |
| Form Handling | React Hook Form + Zod | 7.47+ / 3.22+ | Type-safe form validation | Performance optimization, schema validation, TypeScript integration |
| Date Handling | date-fns | 2.30+ | Date manipulation and formatting | Lightweight, modular, Arabic calendar support |
| Icons | Lucide React + Heroicons | Latest | Consistent icon system | RTL-aware icons, customizable, extensive library |
| Charts | Recharts | 2.8+ | Financial charts and analytics | React-native support, responsive, customizable |
| PDF Generation | Puppeteer + React-PDF | Latest | Report generation | Server-side PDF creation, Arabic text support |
| Email Service | Resend | Latest | Transactional emails | Developer-friendly API, reliable delivery, template support |
| Error Tracking | Sentry | 7+ | Error monitoring and performance | Real-time error tracking, performance monitoring, release tracking |
| Analytics | Vercel Analytics | Latest | Usage analytics and monitoring | Privacy-focused, Core Web Vitals, real user monitoring |
| Deployment Platform | Vercel | Latest | Frontend and API hosting | Seamless Next.js integration, global CDN, preview deployments |
| Database Hosting | Supabase | Latest | Managed PostgreSQL with real-time | Built-in auth, real-time subscriptions, API generation |
| CI/CD | GitHub Actions | Latest | Automated testing and deployment | Free for open source, excellent ecosystem, workflow flexibility |
| Code Quality | ESLint + Prettier + Husky | Latest | Code formatting and linting | Consistent code style, pre-commit hooks, TypeScript support |
| Package Manager | pnpm | 8+ | Fast, disk space efficient package management | Workspace support, deterministic installs, security features |

---
