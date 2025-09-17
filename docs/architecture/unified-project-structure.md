# Unified Project Structure

```plaintext
multi-shop-accounting/
├── .github/                           # CI/CD workflows
│   └── workflows/
├── apps/                              # Application packages
│   ├── web/                           # Next.js web application
│   │   ├── src/
│   │   │   ├── app/                   # App Router pages
│   │   │   ├── components/            # UI components
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── lib/                   # Library configs
│   │   │   ├── services/              # Frontend services
│   │   │   ├── stores/                # Zustand stores
│   │   │   └── styles/                # Global styles
│   │   ├── public/                    # Static assets
│   │   │   ├── locales/               # i18n translation files
│   │   │   └── fonts/                 # Arabic/English fonts
│   │   └── tests/                     # Frontend tests
│   ├── mobile/                        # React Native mobile app
│   │   ├── src/
│   │   │   ├── screens/               # Mobile screens
│   │   │   ├── components/            # Mobile components
│   │   │   ├── navigation/            # Expo Router setup
│   │   │   └── services/              # Mobile services
│   │   └── assets/                    # Mobile assets
│   └── api/                           # Backend API
│       ├── src/
│       │   ├── server/                # Server code
│       │   └── jobs/                  # Background jobs
│       └── prisma/
├── packages/                          # Shared packages
│   ├── shared/                        # Shared types/utilities
│   │   ├── src/
│   │   │   ├── types/                 # TypeScript interfaces
│   │   │   ├── constants/             # Shared constants
│   │   │   ├── validators/            # Shared Zod schemas
│   │   │   └── utils/                 # Shared utilities
│   │   └── package.json
│   ├── ui/                            # Shared UI components
│   └── config/                        # Shared configuration
├── infrastructure/                    # Infrastructure as Code
├── scripts/                          # Build/deploy scripts
├── docs/                             # Documentation
│   ├── prd.md                        # Product Requirements
│   └── architecture.md               # This document
├── turbo.json                        # Turborepo config
├── package.json                      # Root package.json
└── README.md                         # Project README
```

---
