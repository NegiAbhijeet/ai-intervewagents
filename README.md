# README.md

### Generate release keystore

Run this command in your project root:

```
keytool -genkeypair -v -keystore ./android/app/MYAPP_UPLOAD_STORE_FILE -storepass MYAPP_UPLOAD_STORE_PASSWORD -keypass MYAPP_UPLOAD_KEY_PASSWORD -alias MYAPP_UPLOAD_KEY_ALIAS -keyalg RSA -keysize 2048 -validity 10000
```

### Set environment variables in gradle.proprties

```
MYAPP_UPLOAD_STORE_FILE=release.keystore
MYAPP_UPLOAD_KEY_ALIAS=auring
MYAPP_UPLOAD_STORE_PASSWORD=auring
MYAPP_UPLOAD_KEY_PASSWORD=auring
```

### Fix FIS_AUTH_ERROR

If you get `FIS_AUTH_ERROR`, open `google-services.json`. If multiple `current_key` entries exist in `api_keys`, keep only one and remove the others.

### boxShadow
boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",