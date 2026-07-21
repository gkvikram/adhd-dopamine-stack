package com.yourname.inertiashield;

import android.accessibilityservice.AccessibilityService;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import androidx.core.app.NotificationCompat;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class AndroidBlockerService extends AccessibilityService {
    private static final String TAG = "InertiaBlocker";
    private static final String CHANNEL_ID = "InertiaShield_Guard_Channel";
    private static final int NOTIFICATION_ID = 9912;

    private final Set<String> blockedPackages = new HashSet<>(Arrays.asList(
            "com.instagram.android",
            "com.zhiliaoapp.musically",
            "com.facebook.katana",
            "com.twitter.android"));

    public static boolean isShieldActive = false;

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        Log.d(TAG, "Accessibility Service Connected. Elevating to Foreground Service Status.");
        startPersistentForeground();
    }

    private void startPersistentForeground() {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        // Create Notification Channel for Android Oreo and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "InertiaShield Guard Active",
                    NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Keeps the ADHD routine guard running persistently.");
            if (manager != null)
                manager.createNotificationChannel(channel);
        }

        // Build the un-dismissible system notification icon
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("InertiaShield Focus Guard is ON")
                .setContentText("Protecting you from distraction loops.")
                .setSmallIcon(android.R.drawable.ic_lock_idle_lock) // Native lock icon resource placeholder
                .setOngoing(true) // Makes it non-dismissible by sliding
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();

        // Magic line: Tells Android OS this service cannot be killed under low memory
        startForeground(NOTIFICATION_ID, notification);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (!isShieldActive)
            return;

        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            CharSequence packageNameChar = event.getPackageName();
            if (packageNameChar == null)
                return;

            String currentPackage = packageNameChar.toString();

            if (blockedPackages.contains(currentPackage)) {
                Log.d(TAG, "Intercepting entry attempt to: " + currentPackage);

                Intent redirectIntent = new Intent(this, MainActivity.class);
                redirectIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(redirectIntent);
            }
        }
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Accessibility Interrupted.");
    }
}
