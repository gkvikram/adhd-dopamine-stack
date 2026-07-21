import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from 'react-native';

export default function SettingsScreen({ onTriggerTestLock }) {
    const [isServiceEnabled, setIsServiceEnabled] = useState(true);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>InertiaShield Dashboard</Text>
            <Text style={styles.subtitle}>Manage your transition interruption schedules</Text>

            <View style={styles.statusCard}>
                <View>
                    <Text style={styles.cardTitle}>Background Guard Status</Text>
                    <Text style={styles.cardDesc}>
                        {isServiceEnabled ? "🟢 Actively monitoring targets" : "🔴 Shield suspended"}
                    </Text>
                </View>
                <Switch
                    value={isServiceEnabled}
                    onValueChange={setIsServiceEnabled}
                    trackColor={{ false: '#3F3F46', true: '#0284C7' }}
                    thumbColor={isServiceEnabled ? '#38BDF8' : '#A1A1AA'}
                />
            </View>

            <Text style={styles.sectionHeader}>Active Target Shields</Text>
            <View style={styles.listContainer}>
                <View style={styles.listItem}><Text style={styles.itemText}>📸 Instagram</Text><Text style={styles.activeTag}>Blocked</Text></View>
                <View style={styles.listItem}><Text style={styles.itemText}>🎵 TikTok</Text><Text style={styles.activeTag}>Blocked</Text></View>
                <View style={styles.listItem}><Text style={styles.itemText}>🐦 X / Twitter</Text><Text style={styles.activeTag}>Blocked</Text></View>
            </View>

            <Text style={styles.sectionHeader}>Developer Debug Tools</Text>
            <TouchableOpacity style={styles.dangerButton} onPress={onTriggerTestLock}>
                <Text style={styles.dangerButtonText}>⚠️ FORCE SIMULATE TRANSITION LOCK</Text>
            </TouchableOpacity>
            <Text style={styles.helpText}>
                Tapping this instantly locks down your interface. You will need to physically point your camera at your sink to restore view access.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121214' },
    content: { padding: 24 },
    title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    subtitle: { color: '#71717A', fontSize: 14, marginBottom: 24 },
    statusCard: { backgroundColor: '#1A1A1E', borderRadius: 12, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: '#2A2A32' },
    cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    cardDesc: { color: '#A1A1AA', fontSize: 13, marginTop: 2 },
    sectionHeader: { color: '#38BDF8', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    listContainer: { backgroundColor: '#1A1A1E', borderRadius: 12, overflow: 'hidden', marginBottom: 32 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A32' },
    itemText: { color: '#E4E4E7', fontSize: 14 },
    activeTag: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
    dangerButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444', marginBottom: 8 },
    dangerButtonText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
    helpText: { color: '#71717A', fontSize: 11, textAlign: 'center', lineHeight: 16 }
});
