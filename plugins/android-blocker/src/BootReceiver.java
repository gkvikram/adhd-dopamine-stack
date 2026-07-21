package com.yourname.inertiashield;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d("InertiaBoot", "Phone rebooted! Waking up focus engine guard tracking parameters.");

            // Fires an explicit intent to kickstart your tracking engine layer instantly
            Intent serviceIntent = new Intent(context, AndroidBlockerService.class);
            context.startService(serviceIntent);
        }
    }
}
