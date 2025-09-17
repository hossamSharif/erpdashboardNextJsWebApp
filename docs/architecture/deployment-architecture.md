# Deployment Architecture

## Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel Edge Network
- **Build Command:** `pnpm build:web`
- **Output Directory:** `apps/web/.next`

**Backend Deployment:**
- **Platform:** Vercel Serverless Functions
- **Build Command:** `pnpm build:api`
- **Deployment Method:** Automatic with frontend

**Mobile Deployment:**
- **Platform:** Expo EAS Build
- **Distribution:** App Store / Google Play

## CI/CD Pipeline

```yaml
# .github/workflows/deploy-production.yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run tests
        run: pnpm test:ci
      - name: Build applications
        run: pnpm build

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Environments

| Environment | Frontend URL | Backend URL | Purpose |
|------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Local development |
| Staging | https://staging.accounting.app | https://staging.accounting.app/api | Pre-production testing |
| Production | https://accounting.app | https://accounting.app/api | Live environment |

---
