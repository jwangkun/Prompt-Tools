import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

// 更新按钮状态
function updateCheckButton(state: 'idle' | 'checking' | 'has-update'): void {
  const checkBtn = document.getElementById('checkUpdateBtn');
  if (!checkBtn) return;
  
  checkBtn.classList.remove('checking', 'has-update');
  
  switch (state) {
    case 'checking':
      checkBtn.classList.add('checking');
      checkBtn.setAttribute('title', '正在检查更新...');
      break;
    case 'has-update':
      checkBtn.classList.add('has-update');
      checkBtn.setAttribute('title', '发现新版本！点击更新');
      break;
    case 'idle':
    default:
      checkBtn.setAttribute('title', '检查更新');
      break;
  }
}

// 检查更新的函数
export async function checkForUpdates(showNoUpdateMessage = false): Promise<void> {
  try {
    console.log('正在检查更新...');
    updateCheckButton('checking');
    
    const update = await check();
    
    if (update?.available) {
      console.log('发现新版本:', update.version);
      console.log('更新日志:', update.body);
      updateCheckButton('has-update');
      
      // 显示更新确认对话框
      const shouldUpdate = await showUpdateDialog(update.version, update.body || '');
      
      if (shouldUpdate) {
        console.log('开始下载更新...');
        
        // 显示下载进度
        showUpdateProgress();
        
        // 下载并安装更新
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              console.log('开始下载更新');
              updateProgressText('正在下载更新...');
              break;
            case 'Progress':
              // 简化进度显示，避免类型错误
              console.log('下载进度更新');
              updateProgressText('正在下载更新...');
              break;
            case 'Finished':
              console.log('更新下载完成');
              updateProgressText('更新下载完成，准备重启应用...');
              break;
          }
        });
        
        console.log('更新安装完成，准备重启应用');
        
        // 重启应用
        setTimeout(async () => {
          await relaunch();
        }, 1000);
      }
    } else {
      console.log('当前已是最新版本');
      updateCheckButton('idle');
      if (showNoUpdateMessage) {
        showNotification('当前已是最新版本', 'info');
      }
    }
  } catch (error) {
    console.error('检查更新失败:', error);
    updateCheckButton('idle');
    if (showNoUpdateMessage) {
      showNotification('检查更新失败: ' + (error as any).message, 'error');
    }
  }
}

// 显示更新对话框
function showUpdateDialog(version: string, body: string): Promise<boolean> {
  return new Promise((resolve) => {
    const updateModal = document.createElement('div');
    updateModal.className = 'overlay update-modal';
    updateModal.innerHTML = `
      <div class="update-container">
        <div class="update-header">
          <div class="update-icon">
            <i class="fas fa-download"></i>
          </div>
          <div class="update-title">发现新版本</div>
          <div class="update-version">v${version}</div>
        </div>
        <div class="update-content">
          <div class="update-body">${body || '修复了一些问题并改进了性能'}</div>
        </div>
        <div class="update-actions">
          <button class="btn btn-secondary" id="updateLater">
            <i class="fas fa-clock"></i>稍后更新
          </button>
          <button class="btn btn-primary" id="updateNow">
            <i class="fas fa-download"></i>立即更新
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(updateModal);
    
    const laterBtn = updateModal.querySelector('#updateLater') as HTMLButtonElement;
    const nowBtn = updateModal.querySelector('#updateNow') as HTMLButtonElement;
    
    const cleanup = () => {
      if (document.body.contains(updateModal)) {
        document.body.removeChild(updateModal);
      }
    };
    
    laterBtn.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });
    
    nowBtn.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });
    
    // 点击遮罩层关闭
    updateModal.addEventListener('click', (e) => {
      if (e.target === updateModal) {
        cleanup();
        resolve(false);
      }
    });
  });
}

// 显示更新进度
function showUpdateProgress(): void {
  const progressModal = document.createElement('div');
  progressModal.className = 'overlay update-progress-modal';
  progressModal.id = 'updateProgressModal';
  progressModal.innerHTML = `
    <div class="update-progress-container">
      <div class="update-progress-header">
        <div class="update-progress-icon">
          <i class="fas fa-download"></i>
        </div>
        <div class="update-progress-title">正在更新应用</div>
      </div>
      <div class="update-progress-content">
        <div class="progress-bar-container">
          <div class="progress-bar" id="updateProgressBar"></div>
        </div>
        <div class="progress-text" id="updateProgressText">准备下载...</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(progressModal);
}

// 更新进度条
function updateProgressBar(progress: number): void {
  const progressBar = document.getElementById('updateProgressBar');
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}

// 更新进度文本
function updateProgressText(text: string): void {
  const progressText = document.getElementById('updateProgressText');
  if (progressText) {
    progressText.textContent = text;
  }
}

// 显示通知（复用主应用的通知函数）
function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 300px;
    word-wrap: break-word;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;
  
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#10b981';
      break;
    case 'error':
      notification.style.backgroundColor = '#ef4444';
      break;
    case 'info':
    default:
      notification.style.backgroundColor = '#3b82f6';
      break;
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, 3000);
}

// 自动检查更新（应用启动时调用）
export async function autoCheckForUpdates(): Promise<void> {
  // 延迟5秒后检查更新，避免影响应用启动
  setTimeout(() => {
    checkForUpdates(false);
  }, 5000);
}