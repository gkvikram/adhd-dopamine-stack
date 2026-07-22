import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import { verifyObjectInFrame, initModel } from '../services/tensorModel';

export default function BlockerScreen({ onUnlockSuccess }) {
      const [permission, requestPermission] = useCameraPermissions();
      const [isEngineReady, setIsEngineReady] = useState(false);

      const cameraRef = useRef(null);
      const isLoopRunning = useRef(false);
      const totalFramesProcessed = useRef(0);

      useEffect(() => {
            async function bootSequence() {
                  await requestPermission();
                  try {
                        await initModel(); // Initialize local CPU tensor configurations
                        setIsEngineReady(true);
                  } catch (err) {
                        console.error("Initialization exception: ", err);
                  }
            }
            bootSequence();

            return () => {
                  isLoopRunning.current = false; // Teardown safeguard trigger
            };
      }, []);

      const startCaptureLoop = () => {
            if (!isLoopRunning.current && isEngineReady) {
                  isLoopRunning.current = true;
                  console.log("[BlockerScreen] Camera mounted and active. Starting detection pipeline...");
                  // Wrap in an immediate frame trigger loop
                  setTimeout(processFrameCycle, 1500);
            }
      };

      const processFrameCycle = async () => {
            // 1. Hard break if the UI has unmounted or unlocked
            if (!isLoopRunning.current || !cameraRef.current) {
                  console.log("[CaptureEngine] Thread loop stopped clean.");
                  return;
            }

            try {
                  totalFramesProcessed.current += 1;
                  console.log(`[CaptureEngine] Starting processing cycle for Frame #${totalFramesProcessed.current}`);

                  // 2. Capture a highly optimized thumbnail image snapshot
                  const photo = await cameraRef.current.takePictureAsync({
                        quality: 0.05,        // Downscale quality aggressively to lighten the CPU load
                        base64: true,
                        exif: false,
                        skipProcessing: true, // Bypass native software image correction filters
                        additionalOptions: {
                              width: 224,        // Match exact input image size shape for mobile model nets
                              height: 224
                        }
                  });

                  if (photo && photo.base64) {
                        // 3. Transform base64 payload into internal image array tensor map structures
                        const rawImageData = tf.util.encodeString(photo.base64, 'base64');
                        const imageTensor = decodeJpeg(rawImageData);

                        // 4. Pass computation tracking off to your tensor analytics helper
                        const isVerified = await verifyObjectInFrame(imageTensor);
                        imageTensor.dispose(); // CRITICAL: Free RAM memory allocations instantly to avoid phone crashes

                        if (isVerified) {
                              isLoopRunning.current = false;
                              console.log("[UnlockTrigger] Target match validated. Transitioning UI panels...");
                              onUnlockSuccess();
                              return;
                        }
                  } else {
                        console.warn("[CaptureEngine] Camera returned an empty or invalid base64 image data string.");
                  }
            } catch (error) {
                  console.error("[CaptureEngine] Error or memory drop in cycle loop: ", error);
            }

            // 5. THE RESILIENT HEALING HOOK: 
            // Always schedule the next step, even if the previous step crashed or dropped a frame.
            if (isLoopRunning.current) {
                  setTimeout(processFrameCycle, 2000); // 2-second breathing room gives the JS thread time to process UI updates
            }
      };

      if (!permission || !isEngineReady) {
            return (
                  <View style={styles.container}>
                        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 250 }} />
                        <Text style={styles.loadingText}>Initializing Lens Module...</Text>
                  </View>
            );
      }

      if (!permission.granted) return <View style={styles.container}><Text style={styles.errorText}>Camera access required to unlock.</Text></View>;

      return (
            <View style={styles.container}>
                  <View style={styles.overlay}>
                        <Text style={styles.title}>⚠️ INERTIA SHIELD ACTIVE</Text>
                        <Text style={styles.subtitle}>Show your camera a bathroom sink, cup, or counter accessory.</Text>
                  </View>

                  <CameraView
                        style={styles.camera}
                        facing="back"
                        ref={cameraRef}
                        onCameraReady={startCaptureLoop}
                  />

                  <TouchableOpacity style={styles.bypassBtn} onPress={onUnlockSuccess}>
                        <Text style={styles.bypassText}>Bypass for Debug Mode</Text>
                  </TouchableOpacity>
            </View>
      );
}

const styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: '#121214' },
      camera: { flex: 1 },
      loadingText: { color: '#71717A', textAlign: 'center', marginTop: 16, fontSize: 13 },
      errorText: { color: '#EF4444', textAlign: 'center', marginTop: 100, padding: 20 },
      overlay: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.85)', padding: 16, borderRadius: 12 },
      title: { color: '#FF3B30', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
      subtitle: { color: '#FFF', fontSize: 12, textAlign: 'center', lineHeight: 16 },
      bypassBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#27272A', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, zIndex: 20 },
      bypassText: { color: '#A1A1AA', fontSize: 12, fontWeight: 'bold' }
});
