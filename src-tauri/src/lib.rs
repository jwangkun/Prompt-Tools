mod database;
mod platform;

use database::{Database, CreatePromptRequest, UpdatePromptRequest, Prompt, Version, ExportData, SearchResult};
use platform::PlatformInfo;
use tauri::Manager;

// Tauri命令
#[tauri::command]
async fn get_platform_info() -> Result<serde_json::Value, String> {
    let platform = PlatformInfo::current();
    
    let info = serde_json::json!({
        "os": platform.os,
        "isWindows": platform.is_windows,
        "isMacOS": platform.is_macos,
        "isLinux": platform.is_linux,
        "displayName": platform.get_display_name(),
        "modifierKey": platform.get_modifier_key_name(),
        "pathSeparator": platform.get_path_separator().to_string(),
        "isSupported": platform.is_supported()
    });
    
    Ok(info)
}

#[tauri::command]
async fn get_all_prompts(app_handle: tauri::AppHandle) -> Result<Vec<Prompt>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.get_all_prompts().map_err(|e| format!("Failed to get prompts: {}", e))
}

#[tauri::command]
async fn search_prompts(
    app_handle: tauri::AppHandle, 
    query: String, 
    tags: Vec<String>, 
    sources: Vec<String>
) -> Result<SearchResult, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.search_prompts(&query, &tags, &sources).map_err(|e| format!("Failed to search prompts: {}", e))
}

#[tauri::command]
async fn create_prompt(
    app_handle: tauri::AppHandle, 
    name: String, 
    source: Option<String>, 
    notes: Option<String>, 
    tags: Vec<String>, 
    content: String
) -> Result<i64, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    let req = CreatePromptRequest {
        name,
        source,
        notes,
        tags,
        content,
    };
    
    db.create_prompt(req).map_err(|e| format!("Failed to create prompt: {}", e))
}

#[tauri::command]
async fn update_prompt(
    app_handle: tauri::AppHandle, 
    id: i64, 
    name: String, 
    source: Option<String>, 
    notes: Option<String>, 
    tags: Vec<String>, 
    content: String,
    save_as_version: Option<bool>,
    version_type: Option<String>
) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    let req = UpdatePromptRequest {
        name,
        source,
        notes,
        tags,
        content,
        save_as_version: save_as_version.unwrap_or(false),
        version_type: version_type.unwrap_or_else(|| "patch".to_string()),
    };
    
    db.update_prompt(id, req).map_err(|e| format!("Failed to update prompt: {}", e))
}

#[tauri::command]
async fn delete_prompt(app_handle: tauri::AppHandle, id: i64) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.delete_prompt(id).map_err(|e| format!("Failed to delete prompt: {}", e))
}

#[tauri::command]
async fn toggle_pin(app_handle: tauri::AppHandle, id: i64) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.toggle_pin(id).map_err(|e| format!("Failed to toggle pin: {}", e))
}

#[tauri::command]
async fn get_prompt_versions(app_handle: tauri::AppHandle, prompt_id: i64) -> Result<Vec<Version>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.get_prompt_versions(prompt_id).map_err(|e| format!("Failed to get versions: {}", e))
}

#[tauri::command]
async fn rollback_to_version(
    app_handle: tauri::AppHandle, 
    prompt_id: i64, 
    version_id: i64, 
    version_type: String
) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.rollback_to_version(prompt_id, version_id, version_type)
        .map_err(|e| format!("Failed to rollback: {}", e))
}

#[tauri::command]
async fn export_data(app_handle: tauri::AppHandle) -> Result<ExportData, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.export_data().map_err(|e| format!("Failed to export data: {}", e))
}

#[tauri::command]
async fn export_data_to_file(app_handle: tauri::AppHandle, file_path: String) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;

    let export_data = db.export_data().map_err(|e| format!("Failed to export data: {}", e))?;
    
    let json_str = serde_json::to_string_pretty(&export_data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;
    
    std::fs::write(&file_path, json_str)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn import_data(app_handle: tauri::AppHandle, data: ExportData) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.import_data(data).map_err(|e| format!("Failed to import data: {}", e))
}

#[tauri::command]
async fn get_setting(app_handle: tauri::AppHandle, key: String) -> Result<Option<String>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.get_setting(&key).map_err(|e| format!("Failed to get setting: {}", e))
}

#[tauri::command]
async fn set_setting(app_handle: tauri::AppHandle, key: String, value: String) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.set_setting(&key, &value).map_err(|e| format!("Failed to set setting: {}", e))
}

#[tauri::command]
async fn get_all_tags(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.get_all_tags().map_err(|e| format!("Failed to get tags: {}", e))
}

#[tauri::command]
async fn get_all_sources(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;
    
    db.get_all_sources().map_err(|e| format!("Failed to get sources: {}", e))
}

#[tauri::command]
async fn get_category_counts(app_handle: tauri::AppHandle) -> Result<std::collections::HashMap<String, i32>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;

    db.get_category_counts().map_err(|e| format!("Failed to get category counts: {}", e))
}

#[tauri::command]
async fn get_prompts_by_category(app_handle: tauri::AppHandle, category: String) -> Result<Vec<Prompt>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let db_path = app_dir.join("prompts.db");
    let db = Database::new(db_path).map_err(|e| format!("Database error: {}", e))?;

    db.get_prompts_by_category(&category).map_err(|e| format!("Failed to get prompts by category: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_platform_info,
            get_all_prompts,
            search_prompts,
            create_prompt,
            update_prompt,
            delete_prompt,
            toggle_pin,
            get_prompt_versions,
            rollback_to_version,
            export_data,
            export_data_to_file,
            import_data,
            get_setting,
            set_setting,
            get_all_tags,
            get_all_sources,
            get_category_counts,
            get_prompts_by_category
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}