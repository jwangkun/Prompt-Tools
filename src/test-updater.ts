// 测试更新功能 - 仅用于开发环境
export function testUpdateFlow(): void {
  console.log('🧪 启动更新功能测试...');
  
  // 模拟发现新版本
  setTimeout(() => {
    console.log('📦 模拟发现新版本 v0.2.0');
    showTestUpdateDialog();
  }, 2000);
}

function showTestUpdateDialog(): void {
  const updateModal = document.createElement('div');
  updateModal.className = 'overlay update-modal';
  updateModal.innerHTML = `
    <div class="update-container">
      <div class="update-header">
        <div class="update-icon">
          <i class="fas fa-download"></i>
        </div>
        <div class="update-title">发现新版本 (测试)</div>
        <div class="update-version">v0.2.0</div>
      </div>
      <div class="update-content">
        <div class="update-body">
          🧪 这是一个测试更新对话框
          
          新功能：
          • 添加了手动检查更新功能
          • 优化了用户界面
          • 修复了一些已知问题
          
          注意：这只是一个演示，不会真正更新应用。
        </div>
      </div>
      <div class="update-actions">
        <button class="btn btn-secondary" id="testUpdateLater">
          <i class="fas fa-clock"></i>稍后更新
        </button>
        <button class="btn btn-primary" id="testUpdateNow">
          <i class="fas fa-download"></i>模拟更新
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(updateModal);
  
  const laterBtn = updateModal.querySelector('#testUpdateLater') as HTMLButtonElement;
  const nowBtn = updateModal.querySelector('#testUpdateNow') as HTMLButtonElement;
  
  const cleanup = () => {
    if (document.body.contains(updateModal)) {
      document.body.removeChild(updateModal);
    }
  };
  
  laterBtn.addEventListener('click', () => {
    cleanup();
    showTestNotification('更新已推迟', 'info');
  });
  
  nowBtn.addEventListener('click', () => {
    cleanup();
    showTestUpdateProgress();
  });
  
  updateModal.addEventListener('click', (e) => {
    if (e.target === updateModal) {
      cleanup();
    }
  });
}

function showTestUpdateProgress(): void {
  const progressModal = document.createElement('div');
  progressModal.className = 'overlay update-progress-modal';
  progressModal.innerHTML = `
    <div class="update-progress-container">
      <div class="update-progress-header">
        <div class="update-progress-icon">
          <i class="fas fa-download"></i>
        </div>
        <div class="update-progress-title">模拟更新中...</div>
      </div>
      <div class="update-progress-content">
        <div class="progress-bar-container">
          <div class="progress-bar" id="testProgressBar"></div>
        </div>
        <div class="progress-text" id="testProgressText">准备下载...</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(progressModal);
  
  let progress = 0;
  const progressBar = document.getElementById('testProgressBar');
  const progressText = document.getElementById('testProgressText');
  
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 100) progress = 100;
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
      if (progress < 30) {
        progressText.textContent = '正在下载更新...';
      } else if (progress < 70) {
        progressText.textContent = '正在验证文件...';
      } else if (progress < 95) {
        progressText.textContent = '正在安装更新...';
      } else {
        progressText.textContent = '更新完成！';
      }
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        if (document.body.contains(progressModal)) {
          document.body.removeChild(progressModal);
        }
        showTestNotification('🎉 模拟更新完成！在真实环境中，应用会自动重启。', 'success');
      }, 1000);
    }
  }, 200);
}

function showTestNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
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
    max-width: 350px;
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
  }, 5000);
}