/// Various settings to use for the inference process of the model.
/// These are passed to the backend when starting a new inference
#[derive(Clone, Debug, serde::Deserialize)]
pub struct InferenceParameters {
    pub repeat_last_n: usize, // Move session creation to here?
    pub max_token_count: Option<usize>,
    pub batch_size: usize,
    pub top_k: usize,
    pub top_p: f32,
    pub repeat_penalty: f32,
    pub temp: f32,
}

impl InferenceParameters {
    /// Converts the parameters to a llama_rs::InferenceParameters instance
    /// that can be used to launch an inference.
    pub fn to_llama(&self) -> llama_rs::InferenceParameters {
        // If it has at least 2 threads, subtract 1 to leave one free thread.
        // I have noticed that if all threads are used, the inference is a lot slower.
        let mut threads = num_cpus::get() as i32;
        // TODO: test with -2 threads: it was even faster. it's prob due to the fact that I am running it
        // on a BIG/LITTLE architecture with 2 weak cores.
        threads = if threads > 2 { threads - 2 } else { threads };

        llama_rs::InferenceParameters {
            n_threads: threads,
            n_batch: self.batch_size,
            top_k: self.top_k,
            top_p: self.top_p,
            repeat_penalty: self.repeat_penalty,
            temp: self.temp,
        }
    }
}

/// Data sent to the frontend when a new inference token is generated.
#[derive(Clone, serde::Serialize)]
pub struct OnInferenceTokenPayload {
    /// The token that was generated. This is not the full response, but only the token.
    pub token: String,
}

/// Data sent to the frontend when the loading of a model has progressed.
#[derive(Clone, serde::Serialize)]
pub struct OnModelLoadProgressPayload {
    pub progress: i8,
    pub message: String,
}
