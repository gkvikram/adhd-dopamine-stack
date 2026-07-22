import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let modelPromise = null;
let isTfReady = false;

// Broaden target dictionary matching common bathroom spatial markers
const BATHROOM_ANCHORS = new Set(['sink', 'toilet', 'bowl', 'bottle', 'cup', 'toothbrush']);

export const initModel = async () => {
  if (!isTfReady) {
    try {
      await tf.ready();
      await tf.setBackend('cpu');
      console.log("[TensorEngine] Backend successfully configured to: ", tf.getBackend());
      isTfReady = true;
    } catch (backendError) {
      console.error("[TensorEngine] Failed to establish backend system: ", backendError);
      isTfReady = true;
    }
  }

  if (!modelPromise) {
    console.log("[TensorEngine] Downloading COCO-SSD Model patterns...");
    modelPromise = cocoSsd.load({ base: 'lite_mobilenet_v2' });
  }
  return modelPromise;
};

export const verifyObjectInFrame = async (customFrameTensor) => {
  const model = await initModel();
  if (!customFrameTensor) return false;

  console.log("[TensorEngine] Running object detection on snapshot frame...");
  const predictions = await model.detect(customFrameTensor);

  // Log every object discovered out to your terminal logs for easy visibility
  console.log("[TensorEngine] Objects detected in viewfinder:",
    predictions.map(p => `${p.class} (${Math.round(p.score * 100)}%)`).join(', ') || "None"
  );

  // Cross-reference any prediction that passes a reasonable 40% threshold match
  const matched = predictions.some(
    prediction => BATHROOM_ANCHORS.has(prediction.class) && prediction.score > 0.40
  );

  return matched;
};
