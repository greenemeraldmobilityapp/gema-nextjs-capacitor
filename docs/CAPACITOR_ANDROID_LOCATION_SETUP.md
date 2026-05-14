# Capacitor Android — Geolocation Permission Setup

> **Context:** GEMA uses `leaflet.locatecontrol` for user location accuracy on the vendor map (`VendorMap.tsx`).  
> This plugin calls the browser [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) (`navigator.geolocation.getCurrentPosition` / `watchPosition`), which requires explicit permission on Android.

---

## 1. Generate Android Platform

If you haven't already, add the Android platform:

```bash
npx cap add android
```

This creates the `android/` directory with the native Android project.

---

## 2. Add Location Permission to Android Manifest

Open `android/app/src/main/AndroidManifest.xml` and add **both** permissions **before** the `<application>` tag:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

| Permission | Purpose |
|---|---|
| `ACCESS_FINE_LOCATION` | GPS-level accuracy (recommended for locate control) |
| `ACCESS_COARSE_LOCATION` | Fallback when GPS is unavailable (WiFi/cell triangulation) |

---

## 3. Sync to Android

After modifying `AndroidManifest.xml`, sync the Capacitor configuration:

```bash
npx cap sync android
```

---

## 4. Runtime Permission Request (optional but recommended)

For Android 6.0+ (API 23+), location permissions must be requested **at runtime**, not just declared in the manifest.

`leaflet.locatecontrol` handles this automatically — when the user clicks the locate button, the browser will prompt for location access.

However, if you want **custom handling** (e.g. graceful denial messaging), you can extend the native layer:

### Option A: Use `@capacitor/geolocation` plugin (recommended)

```bash
npm install @capacitor/geolocation
npx cap sync
```

```ts
import { Geolocation } from '@capacitor/geolocation';

// Check permission status
const permit = await Geolocation.checkPermissions();

// Request if needed
if (permit.location !== 'granted') {
  const result = await Geolocation.requestPermissions();
}
```

### Option B: Handle denial in VendorMap

The `LocateControl` already shows a visual cue when location access is denied.  
No additional code needed in most cases.

---

## 5. Testing on Android

```bash
npx cap run android
```

Or open Android Studio:

```bash
npx cap open android
```

Then:
- Click the **locate button** (crosshair icon) on the map
- Grant location permission when the system dialog appears
- The map should center on your current position with an accuracy circle

---

## 6. Notes

- `leaflet.locatecontrol` with `enableHighAccuracy: true` requests GPS — slightly more battery usage but better accuracy
- On first launch, Android may show the permission prompt **only once** if denied. Reset via:  
  **Settings → Apps → GEMA → Permissions → Location → Allow all the time**
- The `showCompass: true` option adds a compass heading indicator when the device is moving
