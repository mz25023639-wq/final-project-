# GuessPaper Flutter

Cross-platform Flutter client for the existing GuessPaper AI Next.js backend.

## Targets

- Android
- iOS
- Flutter Web

## Backend URL

For deployed builds, pass the current Next.js backend URL:

```bash
flutter build web --release --dart-define=API_BASE_URL=https://your-next-app.vercel.app
flutter build apk --release --dart-define=API_BASE_URL=https://your-next-app.vercel.app
```

For local development against the Next app:

```bash
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3000
flutter run -d android --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

## Generate platform runners

If Android/iOS/Web runner folders are missing, run this once from this folder:

```bash
flutter create . --platforms=android,ios,web
flutter pub get
```
