// src/utils/inAppUpdate.ts
import { Platform } from 'react-native'
import SpInAppUpdates, {
    IAUUpdateKind,
    StartUpdateOptions,
    IAUInstallStatus,
} from 'sp-react-native-in-app-updates'
import DeviceInfo from 'react-native-device-info'

const inAppUpdates = new SpInAppUpdates(false) // false for production

export type UpdateCheckInfo = {
    shouldUpdate: boolean
    availableVersion?: string
    // pass through raw result if needed
    raw?: any
}

/**
 * Only checks if Play has an update available.
 * Does not start any update flow.
 */
export async function checkForUpdateInfo() {
    if (Platform.OS !== 'android') return { shouldUpdate: false }

    try {
        const curVersion = DeviceInfo.getVersion()

        const result = await inAppUpdates.checkNeedsUpdate({
            curVersion,
        })

        return {
            shouldUpdate: result.shouldUpdate,
            availableVersion: result?.storeVersion,
            raw: result,
        }
    } catch (e) {
        console.warn('in-app update check failed', e)
        return { shouldUpdate: false }
    }
}

/**
 * Starts IMMEDIATE update flow and returns an object describing the attempt.
 * The function adds a status listener and removes it on terminal state.
 */
export async function startImmediateUpdate() {
    if (Platform.OS !== 'android') {
        return { started: false, reason: 'not_android' }
    }

    try {
        const updateOptions: StartUpdateOptions = {
            updateType: IAUUpdateKind.IMMEDIATE,
        }

        return new Promise<{ started: boolean; error?: any }>(async resolve => {
            const listener = (status: any) => {
                console.log('in-app update status', status)

                // If downloaded call installUpdate. For IMMEDIATE Play normally handles UI,
                // but calling installUpdate is safe.
                if (status.status === IAUInstallStatus.DOWNLOADED) {
                    try {
                        inAppUpdates.installUpdate()
                    } catch (e) {
                        console.warn('installUpdate failed', e)
                    }
                    try {
                        inAppUpdates.removeStatusUpdateListener(listener)
                    } catch (e) { }
                }

                // Terminal statuses: INSTALLED, CANCELED, FAILED
                if (
                    status.status === IAUInstallStatus.INSTALLED ||
                    status.status === IAUInstallStatus.CANCELED ||
                    status.status === IAUInstallStatus.FAILED
                ) {
                    try {
                        inAppUpdates.removeStatusUpdateListener(listener)
                    } catch (e) { }
                }
            }

            inAppUpdates.addStatusUpdateListener(listener)

            try {
                await inAppUpdates.startUpdate(updateOptions)
                resolve({ started: true })
            } catch (error) {
                // cleanup listener if startUpdate fails
                try {
                    inAppUpdates.removeStatusUpdateListener(listener)
                } catch (e) { }
                console.warn('startImmediateUpdate failed', error)
                resolve({ started: false, error })
            }
        })
    } catch (error) {
        console.warn('startImmediateUpdate top-level error', error)
        return { started: false, error }
    }
}
