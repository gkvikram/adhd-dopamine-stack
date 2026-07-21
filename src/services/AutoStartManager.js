import { Platform } from 'react-native';

let AutoStartModule = null;
if (Platform.OS === 'android') {
    // Gracefully load the package only on Android targets
    AutoStartModule = require('@brighthustle/react-native-auto-start').default;
}

/**
 * Directs the user to their phone's native hardware management 
 * submenus to authorize persistent background execution tasks.
 */
export const openDeviceAutoStartSettings = () => {
    if (Platform.OS !== 'android' || !AutoStartModule) return;

    try {
        // Triggers the library's system permission redirection engine
        AutoStartModule.navigateToAutoStart();
    } catch (error) {
        console.error("Failed to direct intent to custom OEM auto-start panel: ", error);
    }
};
