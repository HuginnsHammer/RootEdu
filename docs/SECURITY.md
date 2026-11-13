# Security baseline

This repository is a foundation, not a production security certification.

- Verify enrollment against an institutional roster; domain and registration prefix alone are insufficient.
- Enforce server-side RBAC and scoped authorization on every protected object. Tenant isolation and PostgreSQL RLS complement, but never replace, application authorization.
- Use adaptive password hashing, short-lived access tokens, rotated refresh tokens, revocation and device/session management.
- MFA for privileged operators; rate limits, lockout policy and security-event monitoring.
- Validate file size, extension, MIME and signature; random object keys; malware scanning; SHA-256 integrity; private storage and authorized downloads.
- Keep audit history distinct from security event telemetry.
- Secrets stay server-side. Production fails closed if required providers/configuration are missing.
- A client fingerprint is not proof of device integrity. Production attestation needs platform-backed keys and server verification.
- OTA updates must be cryptographically signed by a publisher key whose certificate is embedded in the installed APK. CI verifies that the configured private key matches the committed certificate and refuses to publish when either is missing. Never commit the private key.
- OTA runtime versions prevent JavaScript bundles from targeting incompatible native code. Native changes require a new APK. Stage releases, monitor adoption, and retain a rollback path.
- Feedback email credentials remain server-side. Feedback delivery is rate-limited through Redis and fails closed when the limiter or SMTP provider is unavailable.

Values in `.env.example` and local Compose are development-only. Authentication, storage signing, migrations, RLS, notifications and attestation are not implemented yet.
