# VEYRA Security Policy

## About This Policy

VEYRA is currently a working prototype for the Smart India Hackathon 2026.

The application handles user accounts, worker applications, service requests, bookings, location information and cooperative administration. Because these features involve different levels of access, security in VEYRA is primarily based on separating identities, permissions and data access rather than relying on the frontend alone.

This document describes the security approach used in the prototype and the areas that require additional hardening before a production deployment.

---

## 1. Authentication and Account Roles

VEYRA uses Supabase Authentication for account authentication.

An authenticated account is associated with a profile and a role. The intended roles are:

- `user` — household/customer functionality
- `worker` — verified service-worker functionality
- `admin` — cooperative administration

Selecting a role in the interface must never be treated as proof that the account actually has that role.

The server/database must determine what an authenticated account is allowed to access.

For example, selecting **Worker** in the interface must not turn an ordinary customer account into a worker account.

---

## 2. Worker Verification

Worker access is deliberately different from normal user registration.

A person who wants to provide services submits a worker application containing information such as:

- Name
- Contact information
- City and PIN code
- Service category
- Skills
- Experience

The application is stored separately from the verified worker record.

The intended flow is:

```text
Worker application
        ↓
Cooperative review
        ↓
Approved / Rejected
        ↓
Verified worker access
