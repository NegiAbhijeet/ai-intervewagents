package com.aiinterviewagents;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Base64;
import android.content.Context;
import android.net.Uri;
import android.database.Cursor;
import android.provider.OpenableColumns;
import java.io.OutputStream;
import java.io.IOException;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class MediaStoreModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public MediaStoreModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "MediaStoreModule";
    }

    @ReactMethod
    public void savePdfToDownloads(String base64Content, String filename, Promise promise) {
        try {
            byte[] fileBytes = Base64.decode(base64Content, Base64.DEFAULT);

            Context ctx = getReactApplicationContext();
            ContentResolver resolver = ctx.getContentResolver();

            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
            values.put(MediaStore.Downloads.MIME_TYPE, "application/pdf");

            // For API 29+ allow relative path if desired (optional)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // optional: put relative path under Downloads folder
                values.put(MediaStore.Downloads.RELATIVE_PATH, "Download");
            }

            Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) {
                promise.reject("E_MEDIASTORE", "Failed to create MediaStore entry");
                return;
            }

            OutputStream out = null;
            try {
                out = resolver.openOutputStream(uri);
                if (out == null) {
                    promise.reject("E_MEDIASTORE", "Unable to open output stream");
                    return;
                }
                out.write(fileBytes);
                out.flush();
            } finally {
                if (out != null) {
                    out.close();
                }
            }

            // Return the public URI as string
            promise.resolve(uri.toString());
        } catch (IOException e) {
            promise.reject("E_IO", e.getMessage());
        } catch (IllegalArgumentException e) {
            promise.reject("E_DECODE", e.getMessage());
        } catch (Exception e) {
            promise.reject("E_UNKNOWN", e.getMessage());
        }
    }
}
