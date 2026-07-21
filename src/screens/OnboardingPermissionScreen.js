import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking, Platform } from 'react-native';
import { openDeviceAutoStartSettings } from '../services/AutoStartManager';

export default function OnboardingPermissionScreen({ onPermissionGranted }) {

    const handleCompleteSetup = () => {
        if (Platform.OS === 'android') {
            // Step 1: Fire the custom npm AutoStart module bridge
            openDeviceAutoStartSettings();

            // Step 2: Route straight into Android's core accessibility permissions dashboard
            setTimeout(() => {
                Linking.openSettings('android.settings.ACCESSIBILITY_SETTINGS');
            }, 2000);
        }
        onPermissionGranted();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>🛡️</Text>
            <Text style={styles.title}>Bulletproof Focus Shield</Text>
            <Text style={styles.subtitle}>We use two layers of protection to ensure your routine never fails.</Text>

            <View style={styles.card}>
                <Text style={styles.cardHeader}>🛡️ Layer 1: Foreground Guard</Text>
                <Text style={styles.cardText}>Creates a persistent system notification so Android never quietly shuts down your shield helper loops.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardHeader}>⚡ Layer 2: Auto-Start Whitelist</Text>
                <Text style={styles.cardText}>Gives your phone authorization to restart your focus loops immediately if your phone reboots.</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleCompleteSetup}>
                <Text style={styles.buttonText}>ACTIVATE BULLETPROOF SHIELD</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121214', padding: 24, justifyContent: 'center' },
    icon: { fontSize: 64, textAlign: 'center', marginBottom: 12 },
    title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
    subtitle: { color: '#A1A1AA', fontSize: 13, textAlign: 'center', marginVertical: 16, lineHeight: 20 },
    card: { backgroundColor: '#1A1A1E', borderRadius: 12, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A32' },
    cardHeader: { color: '#38BDF8', fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
    cardText: { color: '#E4E4E7', fontSize: 13, lineHeight: 18 },
    button: { backgroundColor: '#38BDF8', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
    buttonText: { color: '#09090B', fontWeight: 'bold', fontSize: 16 }
});
