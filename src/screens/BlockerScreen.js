import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { verifyObjectInFrame } from '../services/tensorModel';

const TensorCamera = cameraWithTensors(Camera);

export default function BlockerScreen({ onUnlockSuccess }) {
  const [hasPermission, setHasPermission] = useState(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCameraStream = (images) => {
    const loop = async () => {
      if (isProcessing.current) return;

      const nextImageTensor = images.next().value;
      if (!nextImageTensor) return;

      isProcessing.current = true;

      try {
        const isVerified = await verifyObjectInFrame(nextImageTensor, 'sink');

        if (isVerified) {
          Alert.alert("Verified!", "Inertia broken. Your phone is now unlocked.");
          onUnlockSuccess();
        }
      } catch (error) {
        console.error("Tensor Execution Error: ", error);
      } finally {
        nextImageTensor.dispose();
        isProcessing.current = false;
        setTimeout(loop, 1000);
      }
    };
    loop();
  };

  if (hasPermission === null) return <View style={styles.container}><Text style={styles.loadingText}>Loading Camera View...</Text></View>;
  if (hasPermission === false) return <View style={styles.container}><Text style={styles.errorText}>Camera access required to unlock.</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.title}>⚠️ INERTIA SHIELD ACTIVE</Text>
        <Text style={styles.subtitle}>Point your camera at your bathroom sink to unlock your device.</Text>
      </View>
      <TensorCamera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onReady={handleCameraStream}
        autorender={true}
      />

      {/* Fallback Bypass for Testing on Mock Simulators */}
      <TouchableOpacity style={styles.bypassBtn} onPress={onUnlockSuccess}>
        <Text style={styles.bypassText}>Bypass for Debug Mode</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  loadingText: { color: '#FFF', textAlign: 'center', marginTop: 100 },
  errorText: { color: '#EF4444', textAlign: 'center', marginTop: 100, padding: 20 },
  overlay: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.85)', padding: 20, borderRadius: 12 },
  title: { color: '#FF3B30', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subtitle: { color: '#FFF', fontSize: 13, textAlign: 'center' },
  bypassBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#27272A', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  bypassText: { color: '#A1A1AA', fontSize: 12, fontWeight: 'bold' }
});
