use llama_rs::{LoadProgress, OutputToken};
use log::{error, info, warn};
use rand::SeedableRng;

use crate::{
    app_state::{AppState, CurrentAction, ExecutionError},
    protocol::{InferenceParameters, OnInferenceTokenPayload, OnModelLoadProgressPayload},
    utils::build_prompt_from_instruction,
};

const NUM_CTX_TOKENS: i32 = 512;
const REPEAT_LAST_N: usize = 64;

/// Sets the window of the caller to be visible.
/// This is used to show the window after the app has been launched, since
/// the window is initially hidden to prevent white flashes.
#[tauri::command]
pub fn show_window(window: tauri::Window) {
    window.show().unwrap();
}

/// Sets the `requested_cancel` flag to true, which will cause the currently
/// running inference to be cancelled. (this does not guarantee that the
/// inference will be cancelled, but it will be cancelled if it is safe to do so)
#[tauri::command]
pub fn request_cancel(state: tauri::State<AppState>) {
    *state.requested_cancel.lock().unwrap() = true;
}

#[tauri::command]
pub async fn load_model(
    state: tauri::State<'_, AppState>,
    window: tauri::Window,
    path: &str,
) -> Result<(), String> {
    info!("requested to load model from path: {}", path);

    // Check if state.action is not LoadingModel:
    let mut current_action = state.action.lock().unwrap();
    if *current_action == CurrentAction::RunningInference {
        warn!("cannot load model while action is {:?}", *current_action);
        return Err("cannot load model while inference is running".to_string());
    }

    // Signal that we are loading a model, so that other commands cannot be run.
    *current_action = CurrentAction::LoadingModel;

    let mut progress = 0;

    // Perform the actual loading routine.
    let res = llama_rs::Model::load(path, NUM_CTX_TOKENS, |p| {
        let message = match p {
            LoadProgress::HyperparametersLoaded(hp) => {
                format!("hyperparameters loaded: {:?}", hp)
            }
            LoadProgress::BadToken { index } => {
                format!("bad token at index: {}", index)
            }
            LoadProgress::ContextSize { bytes } => {
                format!("context size: {} bytes", bytes)
            }
            LoadProgress::MemorySize { bytes, n_mem } => {
                format!("memory size loaded: {} bytes, {} mems", bytes, n_mem)
            }
            LoadProgress::PartTensorLoaded {
                current_tensor,
                tensor_count,
                ..
            } => {
                window
                    .emit(
                        "on_model_load_progress",
                        OnModelLoadProgressPayload {
                            progress: ((current_tensor as f32 / tensor_count as f32) * 100.0) as i8,
                            message: "todo change".to_string(),
                        },
                    )
                    .unwrap();

                format!("tensor loaded: {} / {}", current_tensor, tensor_count)
            }
            LoadProgress::PartLoading {
                current_part,
                total_parts,
                ..
            } => {
                format!("loading part: {} / {}", current_part, total_parts)
            }
            LoadProgress::PartLoaded {
                byte_size,
                tensor_count,
                ..
            } => {
                format!("loaded part: {} x {}", byte_size, tensor_count)
            }
        };
    });

    if let Ok(data) = res {
        *state.model.lock().unwrap() = Some(data.0);
        *state.vocabulary.lock().unwrap() = Some(data.1);
    } else {
        error!("model has failed to load!");
    }

    // TEST START SESSION TODO MOVE

    state.model.lock().unwrap().as_ref().map(|model| {
        *state.session.lock().unwrap() = Some(model.start_session(REPEAT_LAST_N));
    });

    // The model has finished loading (or failed to load), signal it!
    *current_action = CurrentAction::WaitingForTask;

    Ok(())
}

#[tauri::command]
pub async fn run_inference(
    state: tauri::State<'_, AppState>,
    window: tauri::Window,
    prompt: &str,
    params: InferenceParameters,
) -> Result<(), String> {
    info!("requested inference with params: {:#?}", params);

    // Only allow execution of this function while the program is in WaitingForTask state.
    let mut current_action = state.action.lock().unwrap();
    if *current_action != CurrentAction::WaitingForTask {
        warn!("inference cannot run now: {:?}", current_action);
        return Err("inference cannot run now".to_string());
    }

    let model = state.model.lock().unwrap();
    if model.is_none() {
        error!("inference cannot run: model has not been loaded!");
        return Err("inference cannot run: model has not been loaded!".to_string());
    }

    let vocabulary = state.vocabulary.lock().unwrap();
    if vocabulary.is_none() {
        error!("inference cannot run: vocabulary has not been loaded!");
        return Err("inference cannot run: vocabulary has not been loaded!".to_string());
    }

    /*let mut model = match state.model.as_ref().lock().unwrap() {
        Some(model) => model,
        None => {
            error!("model has not been loaded, inference cannot run!");
            return Err(());
        }
    };

    let vocabulary = match state.vocabulary.lock().unwrap().as_ref() {
        Some(vocabulary) => vocabulary,
        None => {
            error!("vocabulary has not been loaded, inference cannot run!");
            return Err(());
        }
    };*/

    *current_action = CurrentAction::RunningInference;

    // Convert the parameters received in the call to the llama-rs format.
    let inference_params = params.to_llama();

    // Create a new RNG for the inference.
    let mut rng = rand::rngs::StdRng::from_entropy();

    // Sets the requested cancel flag to false.
    // This flag is used to cancel the inference, but may be set
    // before the inference has started, so we reset it here.
    *state.requested_cancel.lock().unwrap() = false;

    if let Some(session) = state.session.lock().unwrap().as_mut() {
        info!("feeding prompt to session");
        let final_prompt = build_prompt_from_instruction(prompt);
        if let Err(err) = session.feed_prompt::<ExecutionError>(
            model.as_ref().unwrap(),
            vocabulary.as_ref().unwrap(),
            &inference_params,
            &final_prompt,
            |_| {
                // If the requested cancel flag is set, return an error to stop the inference.
                if *state.requested_cancel.lock().unwrap() {
                    info!("requested cancellation, aborting inference feed");
                    Err(ExecutionError::OperationCancelled)
                } else {
                    Ok(())
                }
            },
        ) {
            *current_action = CurrentAction::WaitingForTask;
            error!("inference cannot run: {:?}", err);
            return Err("inference feed failed".to_string());
        }

        // Run the inference for the previously fed prompt, passing the tokens to the frontend
        // with the on_inference_token event.
        // We don't need to specify the prompt here, since it has already been fed to the session.
        info!("running inference for the previously fed prompt");
        session.inference_with_prompt::<ExecutionError>(
            model.as_ref().unwrap(),
            vocabulary.as_ref().unwrap(),
            &inference_params,
            "",
            params.max_token_count,
            &mut rng,
            |t| {
                if let OutputToken::Token(token) = t {
                    // Send the token to the frontend, which will add it to the message
                    // being composed.
                    window
                        .emit(
                            "on_inference_token",
                            OnInferenceTokenPayload {
                                token: token.to_string(),
                            },
                        )
                        .unwrap();
                }

                // If the requested cancel flag is set, return an error to stop the inference.
                if *state.requested_cancel.lock().unwrap() {
                    warn!("requested cancellation, aborting inference");
                    return Err(ExecutionError::OperationCancelled);
                }

                Ok(())
            },
        );
    } else {
        *current_action = CurrentAction::WaitingForTask;
        error!("inference cannot run: session does not exist!");
        return Err("inference cannot run: session does not exist!".to_string());
    }

    // The inference has finished, signal it!
    *current_action = CurrentAction::WaitingForTask;
    Ok(())
}
