#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::error;
use thiserror::Error;

use crate::app_state::AppState;

mod app_state;
mod commands;
mod protocol;
mod utils;

fn main() {
    env_logger::builder()
        .filter_level(log::LevelFilter::Debug)
        .parse_default_env()
        .init();

    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            commands::show_window,
            commands::request_cancel,
            commands::load_model,
            commands::run_inference,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
