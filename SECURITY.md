# Security Policy for Innovision

This document summarizes important security practices, immediate remediation items, and where to find/submit security issues. It's intended for contributors and maintainers.

## Scope
- Web application (Next.js), Firebase backend, third-party integrations (Razorpay, Brevo, Gemini/OpenAI), and developer tooling.

## Quick remediation (high priority)
- Verify Firebase tokens and session cookies server-side using Firebase Admin SDK.
- Do not store raw ID tokens in cookies; use `createSessionCookie()` to create server-managed session cookies.
- Sanitize all user-provided Markdown/HTML before rendering (use `rehype-sanitize` or an equivalent sanitizer).
- Move secrets (private keys, API keys) out of plain `.env` and into a secrets manager in production.
- Add security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

## Secrets & environment
- Never commit real secrets. Keep `.env` files in `.gitignore`.
- Use a secret manager (GCP Secret Manager / AWS Secrets Manager / Azure Key Vault) for production creds.
- Rotate keys regularly and revoke on compromise.
- Store `FIREBASE_PRIVATE_KEY` and other sensitive credentials in a secret store rather than a plaintext env file.

## Authentication & session management
- Verify tokens server-side for every request that requires authentication using Firebase Admin (`getAuth().verifyIdToken()` or `getAuth().verifySessionCookie()`).
- Prefer session cookies created by `createSessionCookie()` for server sessions; set `HttpOnly`, `Secure`, and `SameSite` attributes.
- Revoke session cookies/tokens on logout or suspicious activity.

## Authorization
- Implement server-side authorization checks and role-based access control for privileged endpoints (payment, ingestion, admin).
- Enforce least privilege in Firestore and Storage rules.

## Input handling & XSS
- Sanitize and validate user input, especially Markdown and any HTML-like content.
- Use `rehype-sanitize` or `DOMPurify` to clean HTML output before rendering.

## Uploads & ingestion
- Validate file types and sizes; scan uploads for malware when possible.
- Use Storage rules to restrict access; prefer signed URLs for direct downloads.

## Third-party integrations
- Keep third-party keys in secret manager; use restricted API keys and verify webhook signatures (e.g. Razorpay). 

## Headers & transport
- Enforce TLS across the site; set HSTS in production.
- Apply CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`.

## Dependencies & supply chain
- Enable dependency scanning (Dependabot, Snyk) and run `npm audit` in CI.
- Pin critical dependencies where appropriate.

## Monitoring & incident response
- Log auth events and admin actions (avoid logging secrets).
- Provide a contact for security issues and an incident response playbook.

## Contributing & disclosure
- If you find a security issue, create a private report to the maintainers (add contact email here) rather than opening a public issue.

---
Contributors: please review and expand this file with project-specific policies and contact details before production deployments.
