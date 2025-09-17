# External APIs

External service integrations required for the Multi-Shop Spare Parts Accounting application.

## Firebase Cloud Messaging (FCM) API

- **Purpose:** Deliver push notifications to mobile app users for sync reminders, daily report alerts, and escalation notifications
- **Documentation:** https://firebase.google.com/docs/cloud-messaging
- **Base URL(s):** https://fcm.googleapis.com/v1/projects/{project-id}/messages:send
- **Authentication:** OAuth 2.0 with service account credentials
- **Rate Limits:** 600,000 messages per minute per project

**Key Endpoints Used:**
- `POST /v1/projects/{project-id}/messages:send` - Send individual or batch notifications

**Integration Notes:** Device tokens stored per user, automatic retry for failed deliveries, handle token refresh on mobile app

## Resend Email API

- **Purpose:** Send transactional emails for daily reports, admin alerts, password resets, and escalation notifications
- **Documentation:** https://resend.com/docs
- **Base URL(s):** https://api.resend.com
- **Authentication:** Bearer token (API key)
- **Rate Limits:** 100 emails per day (free tier), 10,000+ per month (paid)

**Key Endpoints Used:**
- `POST /emails` - Send single transactional email

**Integration Notes:** HTML and plain text templates for Arabic/English, attachment support for PDF reports

## Currency Exchange Rate API

- **Purpose:** Fetch daily exchange rates for multi-currency display in financial reports and analytics
- **Documentation:** https://exchangerate-api.com/docs
- **Base URL(s):** https://api.exchangerate-api.com/v4/latest/{base_currency}
- **Authentication:** API key in query parameter (for paid tiers)
- **Rate Limits:** 1,500 requests per month (free), unlimited (paid)

**Key Endpoints Used:**
- `GET /v4/latest/SDG` - Get latest rates with SDG as base currency

**Integration Notes:** Daily cron job to update rates, cache rates for 24 hours, fallback to last known rates if API unavailable

---
