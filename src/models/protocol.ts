/**
 * Various settings to use for the inference process of the model.
 * These are passed to the backend when starting a new inference
 */
export interface InferenceParameters {
  repeat_last_n: number;
  max_token_count: number | null;
  batch_size: number;
  top_k: number;
  top_p: number;
  repeat_penalty: number;
  temp: number;
}

/**
 * Starting values for the inference parameters.
 */
export const defaultInferenceParameters: InferenceParameters = {
  repeat_last_n: 64,
  max_token_count: null,
  batch_size: 8,
  top_k: 40,
  top_p: 0.95,
  repeat_penalty: 1.3,
  temp: 0.8,
};

/**
 * Data received in an event from the backend when a new inference
 * token is generated.
 */
export interface OnInferenceTokenPayload {
  token: string;
}

/**
 * Data received in an event from the backend when the loading of
 * a model has progressed.
 */
export interface OnModelLoadProgressPayload {
  progress: number;
  message: string;
}
