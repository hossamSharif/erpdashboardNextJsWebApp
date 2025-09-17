# Backend Architecture

## Service Architecture

### Serverless Architecture

#### Function Organization

```
apps/api/src/
├── server/
│   ├── routers/             # tRPC routers
│   ├── services/            # Business logic services
│   ├── db/                  # Database layer
│   ├── middleware/          # API middleware
│   └── utils/               # Utility functions
├── jobs/                    # Background jobs
└── api/
    └── trpc/
```

## Database Architecture

### Data Access Layer

```typescript
// Prisma client with tenant context
export class TransactionRepository {
  constructor(
    private db: PrismaClient,
    private context: ShopContext,
  ) {}

  async create(data: Prisma.TransactionCreateInput) {
    const shopId = this.context.getShopId();
    return this.db.transaction.create({
      data: { ...data, shopId },
    });
  }
}
```

## Authentication and Authorization

### Auth Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant Auth as Auth Service
    participant DB as Database

    C->>API: Login request
    API->>Auth: Validate credentials
    Auth->>DB: Check user
    DB-->>Auth: User data
    Auth-->>API: Auth success
    API-->>C: Tokens + User data
```

---
