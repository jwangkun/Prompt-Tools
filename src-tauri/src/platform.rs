use serde::{Deserialize, Serialize};
use std::env;

/// 平台信息结构体
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformInfo {
    pub os: String,
    pub arch: String,
    pub is_windows: bool,
    pub is_macos: bool,
    pub is_linux: bool,
    pub app_data_dir: Option<String>,
    pub documents_dir: Option<String>,
    pub downloads_dir: Option<String>,
    pub desktop_dir: Option<String>,
}

impl PlatformInfo {
    /// 获取当前平台信息
    pub fn current() -> Self {
        let os = env::consts::OS.to_string();
        let arch = env::consts::ARCH.to_string();
        
        let is_windows = os == "windows";
        let is_macos = os == "macos";
        let is_linux = os == "linux";
        
        // 获取用户目录
        let app_data_dir = dirs::config_dir().map(|p| p.to_string_lossy().to_string());
        let documents_dir = dirs::document_dir().map(|p| p.to_string_lossy().to_string());
        let downloads_dir = dirs::download_dir().map(|p| p.to_string_lossy().to_string());
        let desktop_dir = dirs::desktop_dir().map(|p| p.to_string_lossy().to_string());
        
        Self {
            os,
            arch,
            is_windows,
            is_macos,
            is_linux,
            app_data_dir,
            documents_dir,
            downloads_dir,
            desktop_dir,
        }
    }
    
    /// 获取平台显示名称
    pub fn get_display_name(&self) -> String {
        match self.os.as_str() {
            "windows" => "Windows".to_string(),
            "macos" => "macOS".to_string(),
            "linux" => "Linux".to_string(),
            other => other.to_string(),
        }
    }
    
    /// 获取平台修饰键名称
    pub fn get_modifier_key_name(&self) -> String {
        if self.is_macos {
            "Cmd".to_string()
        } else {
            "Ctrl".to_string()
        }
    }
    
    /// 获取路径分隔符
    pub fn get_path_separator(&self) -> char {
        if self.is_windows {
            '\\'
        } else {
            '/'
        }
    }
    
    /// 检查平台是否受支持
    pub fn is_supported(&self) -> bool {
        self.is_windows || self.is_macos || self.is_linux
    }
}



/// 跨平台工具函数
pub struct PlatformUtils;

impl PlatformUtils {
    /// 获取平台特定的换行符
    pub fn line_ending() -> &'static str {
        if cfg!(windows) {
            "\r\n"
        } else {
            "\n"
        }
    }
    
    /// 获取平台特定的路径分隔符
    pub fn path_separator() -> char {
        std::path::MAIN_SEPARATOR
    }
    
    /// 规范化文件路径（跨平台）
    pub fn normalize_path(path: &str) -> String {
        path.replace('\\', "/").replace("//", "/")
    }
    
    /// 获取默认的数据库文件路径
    pub fn get_default_db_path() -> Option<String> {
        if let Some(app_data) = dirs::config_dir() {
            let db_path = app_data.join("prompt-tools").join("database.db");
            Some(db_path.to_string_lossy().to_string())
        } else {
            None
        }
    }
    
    /// 获取默认的导出文件路径
    pub fn get_default_export_path(filename: &str) -> Option<String> {
        if let Some(documents) = dirs::document_dir() {
            let export_path = documents.join(filename);
            Some(export_path.to_string_lossy().to_string())
        } else {
            None
        }
    }
    
    /// 检查是否为有效的文件路径
    pub fn is_valid_path(path: &str) -> bool {
        use std::path::Path;
        Path::new(path).is_absolute() || Path::new(path).is_relative()
    }
    
    /// 创建目录（如果不存在）
    pub fn ensure_dir_exists(path: &str) -> Result<(), std::io::Error> {
        use std::fs;
        use std::path::Path;
        
        let path = Path::new(path);
        if !path.exists() {
            fs::create_dir_all(path)?;
        }
        Ok(())
    }
    
    /// 获取平台特定的快捷键修饰符
    pub fn get_modifier_key() -> &'static str {
        if cfg!(target_os = "macos") {
            "Cmd"
        } else {
            "Ctrl"
        }
    }
    
    /// 获取平台特定的快捷键说明
    pub fn get_shortcut_description(action: &str) -> String {
        let modifier = Self::get_modifier_key();
        match action {
            "new" => format!("{} + N", modifier),
            "save" => format!("{} + S", modifier),
            "search" => format!("{} + F", modifier),
            "quit" => {
                if cfg!(target_os = "macos") {
                    format!("{} + Q", modifier)
                } else {
                    "Alt + F4".to_string()
                }
            },
            _ => String::new(),
        }
    }
}

/// 平台特定的功能检查
pub struct FeatureCheck;

impl FeatureCheck {
    /// 检查是否支持文件关联
    pub fn supports_file_association() -> bool {
        cfg!(windows) || cfg!(target_os = "macos")
    }
    
    /// 检查是否支持系统托盘
    pub fn supports_system_tray() -> bool {
        cfg!(windows) || cfg!(target_os = "macos") || cfg!(target_os = "linux")
    }
    
    /// 检查是否支持全局快捷键
    pub fn supports_global_shortcuts() -> bool {
        cfg!(windows) || cfg!(target_os = "macos")
    }
    
    /// 检查是否支持通知
    pub fn supports_notifications() -> bool {
        true // 所有平台都支持基本通知
    }
    
    /// 检查是否支持拖拽文件
    pub fn supports_file_drop() -> bool {
        true // Tauri 在所有平台都支持
    }
}