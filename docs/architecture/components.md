# Components

Major logical components/services across the fullstack with clear boundaries and responsibilities.

## Frontend Web Application

**Responsibility:** Progressive Web App serving desktop and mobile web users with Arabic-first RTL interface, offline capabilities, and real-time data synchronization.

**Key Interfaces:**
- tRPC client for type-safe API calls
- Service Worker for offline caching and background sync
- WebSocket connection for real-time notifications
- Local storage APIs (IndexedDB, localStorage)

**Dependencies:** Next.js frontend framework, tRPC client, React Query for caching, Zustand for state management

**Technology Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, PWA manifest, Service Workers

## Mobile Application

**Responsibility:** Native mobile app for iOS/Android providing offline-first experience with local SQLite storage, push notifications, and camera integration for document capture.

**Key Interfaces:**
- tRPC client with React Native adapter
- SQLite database interface for local storage
- Firebase Cloud Messaging for push notifications
- Expo APIs for device features (camera, file system)

**Dependencies:** Shared UI components, shared types package, tRPC client, sync service

**Technology Stack:** React Native with Expo, SQLite, AsyncStorage, Expo Router, React Query Native

## API Gateway & Business Logic

**Responsibility:** Centralized API layer handling authentication, authorization, business rules enforcement, and orchestration of data operations across all services.

**Key Interfaces:**
- tRPC routers exposing typed procedures
- NextAuth.js authentication endpoints
- WebSocket server for real-time subscriptions
- Background job triggers for scheduled tasks

**Dependencies:** Database models via Prisma, authentication service, notification service, sync engine

**Technology Stack:** Next.js API Routes, tRPC server, Prisma ORM, NextAuth.js, Zod validation

## Synchronization Engine

**Responsibility:** Manages offline-to-online data synchronization, conflict resolution, and enforces 24-hour mandatory sync policy with automatic retry and escalation.

**Key Interfaces:**
- Sync queue processing API
- Conflict resolution algorithms
- Sync status monitoring endpoints
- Background sync triggers

**Dependencies:** Database for transaction storage, notification service for alerts, audit logging

**Technology Stack:** TypeScript services, Prisma transactions, Redis queue for sync jobs, Last-write-wins strategy

## Notification Service

**Responsibility:** Multi-channel notification delivery system handling in-app alerts, push notifications, email communications, and scheduled reminders with escalation logic.

**Key Interfaces:**
- Notification creation and scheduling API
- Push notification gateway (FCM)
- Email service integration (Resend)
- Real-time WebSocket publisher

**Dependencies:** User preferences, Firebase Cloud Messaging, email service provider, WebSocket server

**Technology Stack:** Vercel Edge Functions, Firebase Admin SDK, Resend API, Supabase Realtime

---
