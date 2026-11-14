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

`npm test` covers migrations and seeding, catalogue filters, form validation, role and ownership checks, cascading deletes, and data and session persistence.

For a local installed Android release build with its JavaScript bundle embedded (requires Android SDK and a connected device or emulator):

```sh
npx expo run:android --variant release --no-bundler
```

On macOS with Xcode, use `npx expo run:ios --configuration Release --no-bundler`. Debug launches with `npx expo start` need Metro and are not an airplane-mode check. An Expo export verifies the platform JavaScript bundle only; it does not install or launch the app.

## Local accounts and data

Use **Create buyer account** or **Create shop owner account** to register with a local username (3–32 characters) and password (at least 8 characters). Admins sign in through the same form.

| Role | Access |
| --- | --- |
| Buyer | Browse and search the full catalogue, including shops and equipment added by owners. |
| Shop owner | Browse the catalogue and use **Manage** to add, edit, or delete their own shops and equipment. |
| Admin | Browse the catalogue and use **Manage** to add, edit, or delete listings across all shops. |

A fresh installation includes three demo logins. Each uses the local demo password `SportFinderDemo1!`.

| Username | Demo role |
| --- | --- |
| `demo-buyer` | Buyer |
| `demo-owner` | Shop owner of the seeded Lion City Sports shop and its equipment |
| `demo-admin` | Admin |

The version 4 migration upgrades existing browsing accounts to buyers and keeps existing admins, passwords, sessions, and inventory. If the database already has an admin, it keeps that admin as the sign-in account rather than adding a demo admin. Existing shops remain available for admin management. New shops created by an owner are assigned to that account automatically.

The app stores data in the device-local `sportfinder.db` SQLite database. It contains the district, shop, and equipment catalogue, salted scrypt password hashes in `accounts`, and the active account ID in `local_session`. Prices are stored as integer LKR cents. Initial migrations seed sample records once; later launches do not reseed deleted or edited records. The app has no server sync, so the installed release can read and write its local data offline.

For an on-device offline check, install an Android or iOS release, stop Metro, and launch the app in airplane mode. Try signing in with each role, searching for gear, and managing a listing. Force-close the app and reopen it to check that the session and changes persist.
