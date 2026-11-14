# SportFinder Mobile (JavaScript / JSX)

Run all commands from this repository root. This checkout has no `mobile-jsx/` subdirectory. Screens and layouts use `.jsx`; app logic uses JavaScript (`.js`). The database tests use Node's built-in SQLite module and require Node 22.13 or newer.

## Launch and checks

```sh
npm install
npm run lint
npx expo install --check
npx expo-doctor
npm test
npx expo export --platform android
npx expo export --platform ios
npx expo start
```

`npm test` reruns the SQLite integration tests for migrations/seeding, product filters, validation, admin-only writes, cascading deletes, and data/session persistence after reopening the database.

For a local installed Android release build with its JavaScript bundle embedded (requires Android SDK and a connected device or emulator):

```sh
npx expo run:android --variant release --no-bundler
```

On macOS with Xcode, use `npx expo run:ios --configuration Release --no-bundler`. Debug launches with `npx expo start` need Metro and are not an airplane-mode check. An Expo export verifies the platform JavaScript bundle only; it does not install or launch the app.

## Local accounts and data

On first launch, choose **Set up the admin** and create a local username (3–32 characters) and password (at least 8 characters). The admin can add shops and equipment from **Manage**. To create a browsing account, sign out and choose **Create user account** on the login screen.

The app stores data in the device-local `sportfinder.db` SQLite database. It contains the district, shop, and equipment catalogue, salted scrypt password hashes in `accounts`, and the active account ID in `local_session`. Prices are stored as integer LKR cents. Initial migrations seed sample records once; later launches do not reseed deleted or edited records. The app has no server sync, so the installed release can read and write its local data offline.

## Verification status

- **Features completed:** local sign-in, browsing screens, admin-only shop/equipment management, local SQLite persistence, and shared query refresh after writes.
- **Checks passed:** `npm run lint`; `npx expo install --check`; `npx expo-doctor` (20/20); `npm test` (6 tests); Android and iOS `expo export` bundles.
- **Devices or emulators used:** none. Checks ran on Windows with Node v24.13.1; `adb` is unavailable and iOS builds require macOS/Xcode.
- **Still pending:** install a bundled release on Android and iOS, stop Metro, cold-start and exercise sign-in/search/admin writes in airplane mode, force-close/reopen and verify saved edits and deletions on-device, and test the `tel:` action on a phone-capable device with a number you control.
