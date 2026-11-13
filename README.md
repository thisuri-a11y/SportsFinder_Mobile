# SportFinder Mobile

A React Native mobile application built with Expo SDK 58, Expo Router, and on-device SQLite (`expo-sqlite`) to help users in Sri Lanka find sports equipment and identify local shops stocking items.

## Tech Stack

- **Framework**: React Native 0.88 with Expo SDK 58
- **Routing**: Expo Router (file-based navigation)
- **Database**: On-device SQLite (`expo-sqlite`)
- **Language**: JavaScript / JSX
- **Styling**: SportFinder Theme System

## Local database

The app opens `sportfinder.db` and runs transactional migrations before rendering
the router. Migrations are tracked with SQLite's `user_version`; the first
migration creates the districts, shops, and products tables and seeds 25 Sri
Lankan districts with fictional sample shops and equipment. Later launches keep
user edits and deletions because the seed only runs in the initial migration.

The repository functions in `src/db/repository.js` take the initialized database
as their first argument. Product prices are integer LKR cents (for example,
LKR 1,250.00 is stored as `125000`), and `available` is `1` for in stock or `0`
for out of stock.
