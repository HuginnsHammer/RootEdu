# RootEdu Android and iOS app

## Local phone test

1. Copy `.env.example` to `.env.local` and set your laptop's reachable Wi-Fi IPv4 address:

   ```dotenv
   EXPO_PUBLIC_API_URL=http://192.168.1.20:8000/api/v1
   ```

2. Start the API on the laptop:

   ```sh
   cd backend
   source .venv/bin/activate.fish
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. Install dependencies and start Expo:

   ```sh
   cd mobile
   npm install
   npx expo start --lan
   ```

4. Use a compatible Expo Go SDK 54 client to scan the QR code. A physical phone and laptop must be on the same trusted Wi-Fi. Do not expose the development API to the public internet.

## Shareable Android tester APK

A GitHub Actions debug APK artifact is produced for pull requests and retained for 14 days. For a durable share link, create and push a test tag after the desired code is merged:

```sh
git tag test-v0.1.0
git push origin test-v0.1.0
```

The `Build shareable RootEdu Android APK` workflow builds a debug-signed APK, calculates a SHA-256 checksum and attaches both files to a GitHub Release. Share the release URL with testers. Testers must enable installation from the source they use. This is a beta/debug APK, not a production-signed Play Store release.

## OTA updates

RootEdu uses `expo-updates` and Expo Updates-compatible channels. OTA can update JavaScript, navigation, styles and bundled assets. It cannot change native modules, Android permissions, native configuration or the runtime version; those changes require a new APK. The app checks on launch and the Account screen offers a manual check/restart action.

### One-time project setup

1. Create or sign in to an Expo account, then from this directory run:

   ```sh
   npx eas-cli init
   ```

2. Put the generated EAS project UUID in `.env.local` as `EXPO_PUBLIC_EAS_PROJECT_ID`. This public project ID is not a secret.
3. Generate the OTA signing key pair from the repository root:

   ```sh
   bash scripts/generate-ota-signing-key.sh
   ```

4. Commit `mobile/certs/rootedu-ota-certificate.pem`. Never commit `secrets/rootedu-ota-private-key.pem`. Back up the private key in an encrypted vault.
5. Configure GitHub Actions:
   - Secret `EXPO_TOKEN`: Expo access token for the release automation.
   - Secret `ROOTEDU_OTA_PRIVATE_KEY`: complete contents of the private PEM key.
   - Repository variable `EXPO_PUBLIC_EAS_PROJECT_ID`: EAS project UUID.
   - Repository variable `ROOTEDU_OTA_ENABLED=true`: opt in to automatic staging publication after merges to main.
   - Create GitHub environments named `staging` and `production`; configure production required reviewers.
6. Build and distribute a new APK after the public certificate is committed. Existing APKs do not contain the trust anchor and cannot verify signed updates.

**Signing plan requirement:** Expo's hosted EAS Update end-to-end code-signing feature is currently restricted to Expo Production or Enterprise plans. The release workflow deliberately requires the signing private key and matching embedded public certificate and must not be changed to publish unsigned production updates. If the project will not use an eligible EAS plan, choose and security-review a self-hosted Expo Updates Protocol server before enabling OTA; do not silently downgrade to unsigned updates.

### Release flow

- Merge a tested change to `main`: when `ROOTEDU_OTA_ENABLED=true`, CI publishes a signed update to `staging`.
- Verify on staging APKs before production.
- Run the workflow manually with `production`, a release message and an initial rollout percentage (default 10%). Configure GitHub production environment approvals.
- Monitor adoption/errors in the update service. Roll back with the EAS rollback command if a release is unhealthy.
- Increase rollout only after the staged cohort is healthy.

Runtime version policy is `appVersion`. Increment the app version and build a new APK whenever native dependencies, native configuration, permissions or the native runtime changes.

## Beta feedback email

The Feedback tab submits to the backend, which sends the report to `trialsandwins@gmail.com` using SMTP. Configure the backend environment (never the mobile app) with:

```dotenv
FEEDBACK_RECIPIENT=trialsandwins@gmail.com
FEEDBACK_SMTP_HOST=smtp.gmail.com
FEEDBACK_SMTP_PORT=587
FEEDBACK_SMTP_USERNAME=trialsandwins@gmail.com
FEEDBACK_SMTP_PASSWORD=YOUR_GOOGLE_APP_PASSWORD
FEEDBACK_SMTP_FROM=RootEdu Beta <trialsandwins@gmail.com>
```

For Gmail, use a dedicated app password where the account supports it; never use the account's normal password. Store production SMTP credentials as deployment secrets, not in GitHub source or the mobile bundle. Redis enforces a five-submission-per-hour per-client-address limit. The endpoint fails closed if Redis or SMTP is unavailable; it does not claim delivery when email was not sent.

## Current capability boundary

The mobile bootstrap is live. Student authentication, roster verification, authorized academic resources, timetable records, announcements, push notifications and production release signing remain separate workstreams. Do not collect real student credentials in this pilot shell.
