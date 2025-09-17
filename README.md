# Multi-Shop Accounting ERP Dashboard

A modern, multi-tenant ERP dashboard built with Next.js 14, TypeScript, and Tailwind CSS. Supports Arabic and English with RTL layout management.

## 🏗️ Project Structure

```
multi-shop-accounting/
├── apps/
│   ├── web/          # Next.js web application
│   ├── mobile/       # React Native mobile app (future)
│   └── api/          # Backend API (future)
├── packages/
│   ├── shared/       # Shared types and utilities
│   ├── ui/           # Shared UI components
│   └── config/       # Environment configuration
├── scripts/          # Database and setup scripts
├── docs/            # Documentation
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd multi-shop-accounting
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start database services:**
   ```bash
   pnpm db:setup
   ```

4. **Start development:**
   ```bash
   pnpm dev
   ```

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build all applications |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm test` | Run tests |
| `pnpm format` | Format code with Prettier |
| `pnpm db:setup` | Initialize database services |
| `pnpm db:reset` | Reset database with fresh data |
| `pnpm commit` | Interactive commit with Commitizen |

### Database Management

- **Start services:** `pnpm db:up`
- **Stop services:** `pnpm db:down`
- **Reset data:** `pnpm db:reset`
- **Adminer UI:** http://localhost:8080

### Development URLs

- **Web App:** http://localhost:3000
- **Database UI:** http://localhost:8080
- **PostgreSQL:** postgresql://postgres:postgres@localhost:5432/multi_shop_accounting
- **Redis:** redis://localhost:6379

## 🏛️ Architecture

### Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, tRPC (future)
- **Database:** PostgreSQL 15+ with Prisma ORM (future)
- **Cache:** Redis (Upstash compatible)
- **Build:** Turborepo with pnpm workspaces
- **Code Quality:** ESLint, Prettier, Husky
- **Deployment:** Vercel (planned)

### Key Features

- ✅ **Monorepo Structure** - Turborepo with optimized builds
- ✅ **TypeScript** - End-to-end type safety
- ✅ **RTL Support** - Arabic/English localization ready
- ✅ **Modern Tooling** - ESLint, Prettier, conventional commits
- ✅ **Docker Setup** - Containerized development environment
- 🔄 **Multi-tenant** - Shop isolation (planned)
- 🔄 **Offline Support** - PWA capabilities (planned)
- 🔄 **Mobile App** - React Native (planned)

## 🌍 Internationalization

The application supports:
- **English (LTR)** - Default language
- **Arabic (RTL)** - Full RTL layout support

### Adding Translations

1. Add translations to locale files (future)
2. Use RTL utilities in Tailwind CSS
3. Test with both language directions

## 📦 Package Structure

### `apps/web`
Next.js 14 web application with App Router, TypeScript, and Tailwind CSS.

### `packages/config`
Centralized environment configuration with Zod validation.

### `packages/shared` (future)
Shared TypeScript types, utilities, and business logic.

### `packages/ui` (future)
Reusable UI components with shadcn/ui and Headless UI.

## 🧪 Testing

Testing strategy follows the testing pyramid:
- **60% Unit Tests** - Component and utility testing
- **30% Integration Tests** - API and workflow testing
- **10% E2E Tests** - Critical user journeys

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm test --filter=@multi-shop/web

# E2E tests (future)
pnpm test:e2e
```

## 🔒 Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret (32+ chars)
- `NEXT_PUBLIC_API_URL` - API base URL

### Optional
- `REDIS_URL` - Redis connection string
- `RESEND_API_KEY` - Email service API key
- `SENTRY_DSN` - Error tracking

## 🚨 Troubleshooting

### Database Issues

**PostgreSQL won't start:**
```bash
# Check if port 5432 is in use
lsof -i :5432

# Reset database
pnpm db:reset
```

**Connection refused:**
1. Ensure Docker is running
2. Check `.env.local` DATABASE_URL
3. Wait for database to be ready (30s)

### Build Issues

**TypeScript errors:**
```bash
# Check for missing dependencies
pnpm install

# Type check all packages
pnpm turbo typecheck
```

**Module resolution errors:**
1. Verify workspace dependencies in `package.json`
2. Check `tsconfig.json` path mappings
3. Restart TypeScript server in IDE

### Development Tips

1. **Use TypeScript strict mode** - Catch errors early
2. **Follow naming conventions** - See `docs/architecture/coding-standards.md`
3. **Test RTL layouts** - Use browser dev tools to toggle `dir="rtl"`
4. **Commit frequently** - Use `pnpm commit` for conventional commits

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes following coding standards
3. Test thoroughly: `pnpm test`
4. Commit with conventional format: `pnpm commit`
5. Push and create Pull Request

### Coding Standards

- Use TypeScript for all code
- Follow ESLint and Prettier rules
- Write tests for new features
- Update documentation
- Ensure Arabic/RTL compatibility

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

For development issues:
1. Check this README and troubleshooting section
2. Review documentation in `docs/` directory
3. Check existing issues and create new ones if needed

**Happy coding! 🚀**