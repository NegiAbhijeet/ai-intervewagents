import remoteConfig from '@react-native-firebase/remote-config';

export async function initRemoteConfig() {
    await remoteConfig().setDefaults({
        paywall_trigger: 'before_interview',
    });

    await remoteConfig().fetchAndActivate();
}

export function getPaywallTrigger() {
    return remoteConfig().getValue('paywall_trigger').asString();
}