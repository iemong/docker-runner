use serde::Serialize;

#[derive(Serialize)]
struct BuildDockerResponse {
    success: bool,
    message: String,
}

#[derive(Serialize)]
struct RunDockerResponse {
    success: bool,
    message: String,
}

#[derive(Serialize)]
struct StopDockerResponse {
    success: bool,
    message: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// dockerをbuildする "docker build -t furufuru-app ." をCLI実行する
#[tauri::command]
fn build_docker(filePath: &str) -> BuildDockerResponse {
    format!("build_docker: {}", filePath);
    let output = std::process::Command::new("sh")
        .arg("-c")
        .arg(format!("cd {} && docker build -t furufuru-app .", filePath))
        .output()
        .expect("Failed to execute command");

    let error_detail = String::from_utf8_lossy(&output.stderr).to_string();

    BuildDockerResponse {
        success: output.status.success(),
        message: if output.status.success() {
            "Docker buildが完了しました".to_string()
        } else {
            format!("Docker buildが失敗しました: {}", error_detail)
        }
    }
}

#[tauri::command]
fn run_docker(filePath: &str) -> RunDockerResponse {
    format!("run_docker: {}", filePath);
    let output = std::process::Command::new("sh")
        .arg("-c")
        .arg(format!("cd {} && docker run -d -p 3000:3000 furufuru-app", filePath))
        .output()
        .expect("Failed to execute command");

    let error_detail = String::from_utf8_lossy(&output.stderr).to_string();

    RunDockerResponse {
        success: output.status.success(),
        message: if output.status.success() {
            "Docker runが完了しました".to_string()
        } else {
            format!("Docker runが失敗しました: {}", error_detail)
        }
    }
}

#[tauri::command]
fn stop_docker() -> StopDockerResponse {
    format!("stop_docker");
    let output = std::process::Command::new("sh")
        .arg("-c")
        .arg("docker stop $(docker ps -q)")
        .output()
        .expect("Failed to execute command");

    let error_detail = String::from_utf8_lossy(&output.stderr).to_string();

    StopDockerResponse {
        success: output.status.success(),
        message: if output.status.success() {
            "Docker stopが完了しました".to_string()
        } else {
            format!("Docker stopが失敗しました: {}", error_detail)
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, build_docker, run_docker, stop_docker])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
