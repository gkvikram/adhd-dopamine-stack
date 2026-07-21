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

    useEffect(() => {
        checkInitialState();
    }, []);

    const checkInitialState = async () => {
        try {
            // 1. Check if the user completed the onboarding permission sequence
            const permissionStatus = await AsyncStorage.getItem('@accessibility_granted');
            if (permissionStatus === 'true') {
                setHasPermission(true);
            }

            // 2. Fallback check to ensure the phone didn't wake up in a forced lock state
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
        await AsyncStorage.setItem('@is_shield_locked', 'false');
        setIsLockedDown(false);
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

    // Master State Machine Routing
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121214" />

            {!hasPermission ? (
                <OnboardingPermissionScreen onPermissionGranted={handlePermissionSuccess} />
            ) : isLockedDown ? (
                <BlockerScreen onUnlockSuccess={handleUnlockSuccess} />
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
