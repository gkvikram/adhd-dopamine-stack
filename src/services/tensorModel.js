import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let modelPromise = null;

export const initModel = async () => {
  if (!modelPromise) {
    // Wait for the native hardware acceleration engine to wake up
    await tf.ready();
    modelPromise = cocoSsd.load({ base: 'lite_mobilenet_v2' });
  }
  return modelPromise;
};

export const verifyObjectInFrame = async (customFrameTensor, targetLabel = 'sink') => {
  const model = await initModel();

  // Feed the camera pixel snapshot into the machine learning framework
  const predictions = await model.detect(customFrameTensor);

  // Check if any recognized item crosses a 60% accuracy threshold
  const matched = predictions.some(
    prediction => prediction.class === targetLabel && prediction.score > 0.60
  );

  return matched;
};
