# Verified attendance foundation

RootEdu attendance is designed around three independent evidence layers:

1. Device binding — one active Ed25519 public key per student and institution. The private key belongs on the phone and must be generated/used by Android Keystore with biometric authentication required for each signing operation. The API stores only the public key.
2. Ephemeral session challenge — six-digit HMAC-SHA256 code changes every six seconds. A ±1 step tolerance accommodates small clock drift. A separate session-bound room token is also HMAC-derived.
3. Signed check-in — the device signs a canonical payload containing session, student, device, nonce, rolling code and room token. The API verifies the signature, session window, cohort, device binding and replay constraints before inserting the receipt.

## Important assurance limits

- The API uses PostgreSQL now() for the attendance window.
- BLE RSSI greater than -75 dBm is a configurable heuristic, not proof of location. Body position, handset radios and room geometry affect it.
- Ultrasonic audio can be attenuated by walls but is not guaranteed to be blocked, and some phone/laptop speaker-microphone combinations cannot reliably use 18–20 kHz. Do not treat it as a cryptographic boundary.
- The current server-side provider contract includes DevelopmentAttestationProvider and MockProximityProvider, both explicitly DEV ONLY. Production Android Play Integrity validation and Android Keystore key-attestation verification are not implemented yet.
- The current route expects trusted authentication middleware to populate request.state.identity with sub, institution_id, cohort_id, device_id and role. RootEdu's institutional authentication/roster integration is not yet complete; the endpoint intentionally returns 401 without this server-authenticated identity. Never accept these values from request JSON.
- Lecturer session creation and projection credentials must be connected to the authenticated timetable/teaching-assignment model before a lecturer UI is enabled. The service layer creates sessions, but no unverified timetable-slot authorization is inferred.
- Offline mode may cache a signed receipt after successful server verification. It must not create an offline "present" record without server verification; queued offline attempts are pending, not attendance.

## Database

Migration 0002_verified_attendance creates user_devices with a partial unique index enforcing one active device per student/institution, attendance_sessions with a server-controlled window and cohort scope, and attendance_checkins with unique session/student and nonce constraints. All three tables have forced row-level security.

Apply after the existing tenant foundation with alembic upgrade head.
