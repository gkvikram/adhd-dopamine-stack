import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screen Declarations
import OnboardingPermissionScreen from './src/screens/OnboardingPermissionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BlockerScreen from './src/screens/BlockerScreen';

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);
    const [isLockedDown, setIsLockedDown] = useState(false);
    const [isUnmountingCamera, setIsUnmountingCamera] = useState(false);

    useEffect(() => {
        checkInitialState();
    }, []);

    const checkInitialState = async () => {
        try {
            const permissionStatus = await AsyncStorage.getItem('@accessibility_granted');
            if (permissionStatus === 'true') {
                setHasPermission(true);
            }

            const lockState = await AsyncStorage.getItem('@is_shield_locked');
            if (lockState === 'true') {
                setIsLockedDown(true);
            }
        } catch (e) {
            console.error("Failed to load initial storage configuration states", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermissionSuccess = async () => {
        await AsyncStorage.setItem('@accessibility_granted', 'true');
        setHasPermission(true);
    };

    const handleUnlockSuccess = async () => {
        console.log("[AppRouter] Initiating lock teardown safeguard pipeline...");

        // 1. Instantly write to disk storage so the phone knows it's unlocked if it restarts
        await AsyncStorage.setItem('@is_shield_locked', 'false');

        // 2. Turn on a light loading guard. This forces BlockerScreen to stop taking pictures
        setIsUnmountingCamera(true);

        // 3. Give the hardware camera engine exactly 350ms to turn off the lens and release frame cache memory
        setTimeout(() => {
            setIsLockedDown(false);
            setIsUnmountingCamera(false);
            console.log("[AppRouter] Transition complete. Settings screen mounted cleanly.");
        }, 350);
    };

    const triggerManualLockTest = async () => {
        await AsyncStorage.setItem('@is_shield_locked', 'true');
        setIsLockedDown(true);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#38BDF8" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121214" />

            {!hasPermission ? (
                <OnboardingPermissionScreen onPermissionGranted={handlePermissionSuccess} />
            ) : isLockedDown ? (
                isUnmountingCamera ? (
                    // Temporary transition state that stops camera hooks while the screen changes
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#38BDF8" />
                    </View>
                ) : (
                    <BlockerScreen onUnlockSuccess={handleUnlockSuccess} />
                )
            ) : (
                <SettingsScreen onTriggerTestLock={triggerManualLockTest} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121214',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#121214',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
