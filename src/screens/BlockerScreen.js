import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { verifyObjectInFrame } from '../services/tensorModel';

/**
 *  * 1. Functional Bridge Component using forwardRef
  */
const ExpoCameraFunctionalBridge = forwardRef((props, ref) => {
  const { type, ...restProps } = props;
  const facingMode = type === 'front' ? 'front' : 'back';

  return (
    <CameraView
      {...restProps}
      ref={ref}
      facing={facingMode}
    />
  );
});

ExpoCameraFunctionalBridge.Constants = {
  Type: {
    back: 'back',
    front: 'front'
  }
};

/**
 * 2. Wrap our functional bridge with the tensor engine HOC
  */
const TensorCamera = cameraWithTensors(ExpoCameraFunctionalBridge);

 
export default function BlockerScreen({ onUnlockSuccess }) {
  const [permission, requestPermission] = useCameraPermissions();
  const isProcessing = useRef(false);

  useEffect(() => {
    requestPermission();
  }, []);

  const handleCameraStream = (images) => {
    const loop = async () => {
      const nextImageTensor = images.next().value;
      if (!nextImageTensor) {
        setTimeout(loop, 1000);
        return;
      }


      if (isProcessing.current) {
        nextImageTensor.dispose();
        return;
      }

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

  if (!permission) return <View style={styles.container}><Text style={styles.loadingText}>Loading Camera View...</Text></View>;
  if (!permission.granted) return <View style={styles.container}><Text style={styles.errorText}>Camera access required to unlock.</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.title}>⚠️ INERTIA SHIELD ACTIVE</Text>
        <Text style={styles.subtitle}>Point your camera at your bathroom sink to unlock your device.</Text>
      </View>
      <TensorCamera
        style={styles.camera}
        type={ExpoCameraFunctionalBridge.Constants.Type.back}
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
