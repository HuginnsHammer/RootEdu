# RootEdu Android and iOS app

## Quick test with Expo Go

1. Install Node.js LTS and the project dependencies:

   ```sh
   cd mobile
   npm install
   ```

2. Find the laptop's LAN IPv4 address (the phone and laptop must be on the same Wi-Fi):

   ```sh
   ip -4 -brief address
   ```

3. Create `.env.local` in this directory. Replace the example address with the laptop's reachable LAN address:

   ```dotenv
   EXPO_PUBLIC_API_URL=http://192.168.1.20:8000/api/v1
   ```

   Do not use `127.0.0.1` or `localhost` on a physical phone; those addresses refer to the phone itself.

4. In another terminal, start the API from the repository root:

   ```sh
   cd backend
   source .venv/bin/activate.fish
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. Start Expo:

   ```sh
   cd mobile
   npx expo start --lan
   ```

6. Install Expo Go on the phone, scan the QR code, and open RootEdu. The Home screen should show whether the real backend is reachable and load the configured MUST pilot programmes.

If the phone cannot reach the API, check the laptop firewall and ensure both devices are on the same trusted network. Do not expose the development API directly to the public internet.

## Installable Android APK

An internal APK profile is configured in `eas.json`:

```sh
cd mobile
npx eas-cli build --platform android --profile preview
```

This requires an Expo account and a configured EAS project. The resulting APK is a development/pilot build, not a production release.

## Current capability boundary

The app currently connects to the real public mobile bootstrap endpoint. Student authentication, authorized academic records, document delivery, timetable data and announcements are not implemented yet. The UI must not be used to enter real student credentials until the authentication flow is delivered.
