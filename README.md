# Little Bull Story Corner

React Native + TypeScript reading companion with React Navigation.

## Run

```sh
npm install
npm start
npm run ios
```

For Android, start an emulator or connect a device, then run `npm run android`.
After installing native packages, run `pod install` from `ios` using a compatible Ruby/CocoaPods installation.
If port 8081 is used by another project, start Metro with `npm start -- --port 8082` and run the app with the matching `--port 8082` option.

## Features

- Four-second WebView splash animation and first-launch onboarding.
- Personal library with local image uploads, collections, search, genres, ratings, notes and page progress.
- Pages-per-day, finish-date and reading-time calculators with saved results and native sharing.
- Reading sessions with local illustrated scenes, synthesized ambient audio, goals, pause/resume, timestamped notes and session history.
- The supplied 120 literary terms and 35 matching tasks, with timed quizzes and saved best scores.
- A local pass-the-phone game for two to four user-named teams, configurable rounds and turn duration, shuffled supplied words, skips, scores and rankings.
- AsyncStorage persistence. No sample books, reading sessions, saved calculations or team names are inserted.

Timers pause when the app leaves the foreground. Ambient sound is generated locally in a WebView; it does not download audio. Book cover photos are copied into local persistent data. All bundled illustrations come from `src/assets`.

## Structure

- `src/assets`: supplied illustrations and asset references
- `src/components`: shared controls, layouts, sheets and ambient audio
- `src/data`: supplied dictionary, quiz tasks and game words
- `src/navigation`: typed stack and bottom-tab navigation
- `src/screens`: library, calculators, reading, learning and game flows
- `src/store`: data models, hydration and persistence
- `src/utils`: calculations, randomization and pause-aware clock

## Checks

```sh
npx tsc --noEmit
npm test -- --runInBand
npm run lint
```

The tests cover imported content integrity, date boundaries, reading-time calculations, fresh and restored storage, and timer pause/resume/reset behavior.
