# Development Workflow

## Local Development Setup

### Prerequisites

```bash
# Required tools and versions
node >= 18.17.0
pnpm >= 8.0.0
docker >= 24.0.0
```

### Initial Setup

```bash
# Clone and setup
git clone https://github.com/your-org/multi-shop-accounting.git
cd multi-shop-accounting
pnpm install

# Environment setup
cp .env.example .env.local
docker-compose up -d

# Database setup
pnpm db:migrate
pnpm db:seed

# Start development
pnpm dev
```

### Development Commands

```bash
# Start all services
pnpm dev

# Run tests
pnpm test

# Database commands
pnpm db:migrate
pnpm db:studio

# Build commands
pnpm build
```

## Environment Configuration

### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/accounting
NEXTAUTH_SECRET=your-secret-key
RESEND_API_KEY=your_resend_key
FCM_SERVICE_ACCOUNT={"type":"service_account"...}
```

---
