use std::sync::{Arc, Mutex};

use llama_rs::{InferenceSession, Model, Vocabulary};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ExecutionError {
    #[error("the operation was cancelled by the user")]
    OperationCancelled,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CurrentAction {
    None,
    LoadingModel,
    WaitingForTask,
    RunningInference,
}

pub struct AppState {
    pub action: Arc<Mutex<CurrentAction>>,
    pub requested_cancel: Arc<Mutex<bool>>,

    pub model: Arc<Mutex<Option<Model>>>,
    pub vocabulary: Arc<Mutex<Option<Vocabulary>>>,
    pub session: Arc<Mutex<Option<InferenceSession>>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            action: Arc::new(Mutex::new(CurrentAction::None)),
            requested_cancel: Arc::new(Mutex::new(false)),

            model: Arc::new(Mutex::new(None)),
            vocabulary: Arc::new(Mutex::new(None)),
            session: Arc::new(Mutex::new(None)),
        }
    }
}

unsafe impl Send for AppState {}
unsafe impl Sync for AppState {}
