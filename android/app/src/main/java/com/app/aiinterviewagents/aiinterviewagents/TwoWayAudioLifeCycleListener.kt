package com.app.aiinterviewagents

import android.app.Activity
import android.app.Application
import android.os.Bundle

class TwoWayAudioLifecycleCallbacks : Application.ActivityLifecycleCallbacks {

    override fun onActivityPaused(activity: Activity) {
        // Pause playback when app is backgrounded
        TwoWayAudioModule.pausePlayback()
    }

    override fun onActivityResumed(activity: Activity) {
        // Resume playback when app comes to foreground
        TwoWayAudioModule.resumePlayback()
    }

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
    override fun onActivityStarted(activity: Activity) {}
    override fun onActivityStopped(activity: Activity) {}
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
    override fun onActivityDestroyed(activity: Activity) {}
}
