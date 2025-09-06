import './styles.css';
import { invoke } from '@tauri-apps/api/core';

// 应用状态
let currentPrompts: any[] = [];
let isGridView = true;

// 应用初始化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Prompt Tools 启动中...');
  
  // 初始化键盘快捷键
  initKeyboardShortcuts();
  
  // 绑定事件
  bindEvents();
  
  // 加载数据
  await loadPrompts();
  
  // 初始化主题
  initTheme();
});

// 绑定事件监听器
function bindEvents() {
  // 搜索功能
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  // 分类导航
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', handleCategoryClick);
  });
  
  // 工具栏按钮
  document.getElementById('createBtn')?.addEventListener('click', () => openModal());
  document.getElementById('importBtn')?.addEventListener('click', handleImport);
  document.getElementById('exportBtn')?.addEventListener('click', handleExport);
  document.getElementById('importBestBtn')?.addEventListener('click', handleImportBest);
  document.getElementById('viewToggle')?.addEventListener('click', toggleView);
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('settingsBtn')?.addEventListener('click', openSettings);
  
  // 优化提示词按钮
  document.getElementById('optimizePromptBtn')?.addEventListener('click', optimizePrompt);
  
  // 模态框
  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  document.getElementById('cancelBtn')?.addEventListener('click', closeModal);
  document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
  document.getElementById('promptForm')?.addEventListener('submit', handleFormSubmit);
  
  // 详情页面模态框
  document.getElementById('closeDetailModal')?.addEventListener('click', closeDetailModal);
  document.querySelector('#detailModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDetailModal();
  });
}

// 加载提示词
async function loadPrompts() {
  try {
    const prompts = await invoke('get_all_prompts');
    currentPrompts = prompts as any[];
    console.log('加载的提示词:', currentPrompts);
    renderPrompts(currentPrompts);
    updateCategoryCounts();
  } catch (error) {
    console.error('加载提示词失败:', error);
    currentPrompts = [];
    renderPrompts([]);
  }
}

// 渲染提示词列表
function renderPrompts(prompts: any[]) {
  const promptList = document.getElementById('promptList');
  if (!promptList) return;
  
  if (prompts.length === 0) {
    promptList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-magic"></i>
        <h3>暂无提示词</h3>
        <p>点击"创建提示词"开始添加您的第一个提示词</p>
        <button class="btn btn-primary" onclick="document.getElementById('createBtn').click()">
          <i class="fas fa-plus"></i>
          创建提示词
        </button>
      </div>
    `;
    return;
  }
  
  promptList.innerHTML = prompts.map(prompt => `
    <div class="prompt-card" data-id="${prompt.id}" onclick="showPromptDetail(${prompt.id})">
      ${prompt.pinned ? '<div class="pin-indicator"><i class="fas fa-thumbtack"></i></div>' : ''}
      
      <div class="card-header">
        <h3 class="card-title">${prompt.name}</h3>
        <div class="card-actions">
          <button class="btn btn-icon" onclick="event.stopPropagation(); togglePin(${prompt.id})" title="${prompt.pinned ? '取消置顶' : '置顶'}">
            <i class="fas fa-thumbtack ${prompt.pinned ? 'pinned' : ''}"></i>
          </button>
          <button class="btn btn-icon" onclick="event.stopPropagation(); copyPrompt(${prompt.id})" title="复制">
            <i class="fas fa-copy"></i>
          </button>
          <button class="btn btn-icon" onclick="event.stopPropagation(); editPrompt(${prompt.id})" title="编辑">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-icon" onclick="event.stopPropagation(); deletePrompt(${prompt.id})" title="删除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="card-meta">
        ${prompt.source ? `
          <div class="meta-item">
            <i class="fas fa-link"></i>
            <span>${prompt.source}</span>
          </div>
        ` : ''}
        <div class="meta-item">
          <i class="fas fa-clock"></i>
          <span>${formatDate(prompt.updated_at)}</span>
        </div>
      </div>
      
      ${prompt.tags && prompt.tags.length > 0 ? `
        <div class="card-tags">
          ${prompt.tags.map((tag: string) => 
            `<span class="tag">${tag}</span>`
          ).join('')}
        </div>
      ` : ''}
      
      <div class="card-content">
        ${prompt.content.length > 200 ? prompt.content.substring(0, 200) + '...' : prompt.content}
      </div>
      
      ${prompt.notes ? `
        <div class="card-notes">
          <i class="fas fa-sticky-note"></i>
          <span>${prompt.notes}</span>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// 创建分类项目 (暂未使用)
/*
function createCategoryItem(category: string, displayName: string, count: number, isActive: boolean): HTMLElement {
  const item = document.createElement('div');
  item.className = `nav-item ${isActive ? 'active' : ''}`;
  item.setAttribute('data-category', category);
  item.innerHTML = `
    <span class="nav-text">${displayName}</span>
    <span class="count">${count}</span>
  `;
  item.addEventListener('click', handleCategoryClick);
  return item;
}
*/

// 更新分类计数
async function updateCategoryCounts() {
  try {
    // 获取分类统计数据
    const categoryStats = await invoke('get_category_counts') as Record<string, number>;
    
    // 更新"全部"分类的计数
    const allNavItem = document.querySelector('[data-category="all"] .count');
    if (allNavItem) {
      allNavItem.textContent = currentPrompts.length.toString();
    }
    
    // 更新"精选"分类的计数（置顶的提示词）
    const featuredCount = currentPrompts.filter(prompt => prompt.pinned).length;
    const featuredNavItem = document.querySelector('[data-category="featured"] .count');
    if (featuredNavItem) {
      featuredNavItem.textContent = featuredCount.toString();
    }
    
    // 更新现有分类的计数
    const allNavItems = document.querySelectorAll('.nav-item[data-category]');
    allNavItems.forEach(item => {
      const category = item.getAttribute('data-category');
      if (category && category !== 'all' && category !== 'featured') {
        const countElement = item.querySelector('.count');
        if (countElement) {
          const count = categoryStats[category] || 0;
          countElement.textContent = count.toString();
          // 显示所有分类，即使计数为0
          (item as HTMLElement).style.display = 'flex';
        }
      }
    });
    
    console.log('分类统计更新完成:', categoryStats);
  } catch (error) {
    console.error('获取分类统计失败:', error);
    // 如果获取失败，至少更新"全部"分类
    const allNavItem = document.querySelector('[data-category="all"] .count');
    if (allNavItem) {
      allNavItem.textContent = currentPrompts.length.toString();
    }
    
    // 同时更新"精选"分类
    const featuredCount = currentPrompts.filter(prompt => prompt.pinned).length;
    const featuredNavItem = document.querySelector('[data-category="featured"] .count');
    if (featuredNavItem) {
      featuredNavItem.textContent = featuredCount.toString();
    }
  }
}

// 处理搜索
function handleSearch(e: Event) {
  const query = (e.target as HTMLInputElement).value.toLowerCase();
  const filteredPrompts = currentPrompts.filter(prompt => 
    prompt.name.toLowerCase().includes(query) ||
    prompt.content.toLowerCase().includes(query) ||
    (prompt.tags && prompt.tags.some((tag: string) => tag.toLowerCase().includes(query)))
  );
  renderPrompts(filteredPrompts);
}

// 处理分类点击
async function handleCategoryClick(e: Event) {
  const item = e.currentTarget as HTMLElement;
  const category = item.getAttribute('data-category');
  
  console.log('点击分类:', category);
  
  // 更新活跃状态
  document.querySelectorAll('.nav-item').forEach(nav => {
    nav.classList.remove('active');
  });
  item.classList.add('active');
  
  // currentCategory = category || 'all'; // 已移除未使用的变量
  
  try {
    let filteredPrompts = currentPrompts;
    
    if (category === 'all') {
      // 显示所有提示词
      filteredPrompts = currentPrompts;
    } else if (category === 'featured') {
      // 显示置顶的提示词
      filteredPrompts = currentPrompts.filter(prompt => prompt.pinned);
    } else {
      // 根据分类映射筛选
      const categoryMappings: Record<string, string[]> = {
        'work': ['职业', '工作', '职场', 'career', 'job'],
        'business': ['商业', '商务', 'business', 'marketing', '销售'],
        'tools': ['工具', 'tool', '效率', 'productivity'],
        'language': ['语言', '翻译', 'language', 'translate', '英语'],
        'office': ['办公', 'office', '文档', 'excel', 'ppt'],
        'general': ['通用', 'general', '日常', '常用'],
        'writing': ['写作', '文案', 'writing', 'content', '创作'],
        'programming': ['编程', '代码', 'programming', 'code', '开发'],
        'emotion': ['情感', '心理', 'emotion', '情绪'],
        'education': ['教育', '学习', 'education', 'teaching', '培训'],
        'creative': ['创意', '创新', 'creative', '设计思维'],
        'academic': ['学术', '研究', 'academic', '论文'],
        'design': ['设计', 'UI', 'UX', 'design', '视觉'],
        'tech': ['技术', '科技', 'tech', 'AI', '人工智能'],
        'entertainment': ['娱乐', '游戏', 'entertainment', 'fun']
      };
      
      const keywords = categoryMappings[category as string] || [];
      filteredPrompts = currentPrompts.filter(prompt => {
        if (!prompt.tags || prompt.tags.length === 0) return false;
        
        return prompt.tags.some((tag: string) => {
          const tagLower = tag.toLowerCase();
          return keywords.some((keyword: string) => 
            tagLower.includes(keyword.toLowerCase()) || 
            keyword.toLowerCase().includes(tagLower)
          );
        });
      });
    }
    
    console.log('筛选后的提示词数量:', filteredPrompts.length);
    renderPrompts(filteredPrompts);
  } catch (error) {
    console.error('筛选提示词失败:', error);
    renderPrompts(currentPrompts);
  }
}

// 打开模态框
function openModal(prompt?: any) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('promptForm') as HTMLFormElement;
  
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  
  if (prompt) {
    if (modalTitle) modalTitle.textContent = '编辑提示词';
    fillForm(prompt);
  } else {
    if (modalTitle) modalTitle.textContent = '创建提示词';
    if (form) form.reset();
  }
}

// 关闭模态框
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// 填充表单
function fillForm(prompt: any) {
  const nameInput = document.getElementById('name') as HTMLInputElement;
  const sourceInput = document.getElementById('source') as HTMLInputElement;
  const tagsInput = document.getElementById('tags') as HTMLInputElement;
  const contentInput = document.getElementById('content') as HTMLTextAreaElement;
  const notesInput = document.getElementById('notes') as HTMLTextAreaElement;
  
  if (nameInput) nameInput.value = prompt.name || '';
  if (sourceInput) sourceInput.value = prompt.source || '';
  if (tagsInput) tagsInput.value = prompt.tags ? prompt.tags.join(', ') : '';
  if (contentInput) contentInput.value = prompt.content || '';
  if (notesInput) notesInput.value = prompt.notes || '';
}

// 处理表单提交
async function handleFormSubmit(e: Event) {
  e.preventDefault();
  
  const formData = new FormData(e.target as HTMLFormElement);
  const name = formData.get('name') as string;
  const source = formData.get('source') as string;
  const tags = formData.get('tags') as string;
  const content = formData.get('content') as string;
  const notes = formData.get('notes') as string;
  
  try {
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    await invoke('create_prompt', {
      name,
      source: source || null,
      notes: notes || null,
      tags: tagsArray,
      content
    });
    
    showNotification('提示词创建成功！', 'success');
    closeModal();
    await loadPrompts();
  } catch (error) {
    console.error('创建失败:', error);
    showNotification('创建失败: ' + error, 'error');
  }
}

// 显示提示词详情页面
function showPromptDetail(id: number) {
  const prompt = currentPrompts.find(p => p.id === id);
  if (!prompt) return;
  
  const detailModal = document.getElementById('detailModal');
  const detailName = document.getElementById('detailName');
  const detailSource = document.getElementById('detailSource');
  const detailSourceItem = document.getElementById('detailSourceItem');
  const detailUpdatedAt = document.getElementById('detailUpdatedAt');
  const detailTags = document.getElementById('detailTags');
  const detailTagsContainer = document.getElementById('detailTagsContainer');
  const detailContent = document.getElementById('detailContent');
  const detailNotes = document.getElementById('detailNotes');
  const detailNotesContainer = document.getElementById('detailNotesContainer');
  const detailPinBtn = document.getElementById('detailPinBtn');
  const detailPinText = document.getElementById('detailPinText');
  
  if (!detailModal) return;
  
  // 填充详情信息
  if (detailName) detailName.textContent = prompt.name;
  if (detailSource) detailSource.textContent = prompt.source || '';
  if (detailUpdatedAt) detailUpdatedAt.textContent = formatDate(prompt.updated_at);
  if (detailContent) detailContent.textContent = prompt.content;
  if (detailNotes) detailNotes.textContent = prompt.notes || '';
  
  // 处理来源显示
  if (detailSourceItem) {
    detailSourceItem.style.display = prompt.source ? 'flex' : 'none';
  }
  
  // 处理标签显示
  if (detailTags && detailTagsContainer) {
    if (prompt.tags && prompt.tags.length > 0) {
      detailTags.innerHTML = prompt.tags.map((tag: string) => 
        `<span class="tag">${tag}</span>`
      ).join('');
      detailTagsContainer.style.display = 'block';
    } else {
      detailTagsContainer.style.display = 'none';
    }
  }
  
  // 处理备注显示
  if (detailNotesContainer) {
    detailNotesContainer.style.display = prompt.notes ? 'block' : 'none';
  }
  
  // 更新置顶按钮状态
  if (detailPinText) {
    detailPinText.textContent = prompt.pinned ? '取消置顶' : '置顶';
  }
  if (detailPinBtn) {
    detailPinBtn.className = prompt.pinned ? 'btn btn-outline pinned' : 'btn btn-outline';
  }
  
  // 绑定详情页面的按钮事件
  const detailCopyBtn = document.getElementById('detailCopyBtn');
  const detailEditBtn = document.getElementById('detailEditBtn');
  
  if (detailCopyBtn) {
    detailCopyBtn.onclick = () => (window as any).copyPrompt(prompt.id);
  }
  
  if (detailEditBtn) {
    detailEditBtn.onclick = () => {
      closeDetailModal();
      (window as any).editPrompt(prompt.id);
    };
  }
  
  if (detailPinBtn) {
    detailPinBtn.onclick = async () => {
      await (window as any).togglePin(prompt.id);
      // 更新详情页面的置顶状态
      const updatedPrompt = currentPrompts.find(p => p.id === id);
      if (updatedPrompt && detailPinText) {
        detailPinText.textContent = updatedPrompt.pinned ? '取消置顶' : '置顶';
        detailPinBtn.className = updatedPrompt.pinned ? 'btn btn-outline pinned' : 'btn btn-outline';
      }
    };
  }
  
  // 显示模态框
  detailModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// 关闭详情页面模态框
function closeDetailModal() {
  const detailModal = document.getElementById('detailModal');
  if (detailModal) {
    detailModal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// 全局函数 - 确保这些函数在全局作用域中可用
(window as any).showPromptDetail = showPromptDetail;

(window as any).copyPrompt = async (id: number) => {
  try {
    const prompt = currentPrompts.find(p => p.id === id);
    if (prompt) {
      await navigator.clipboard.writeText(prompt.content);
      showNotification('已复制到剪贴板', 'success');
    }
  } catch (error) {
    console.error('复制失败:', error);
    showNotification('复制失败', 'error');
  }
};

(window as any).editPrompt = (id: number) => {
  const prompt = currentPrompts.find(p => p.id === id);
  if (prompt) {
    openModal(prompt);
  }
};

(window as any).deletePrompt = async (id: number) => {
  console.log('删除提示词:', id, '类型:', typeof id); // 调试日志
  
  // 使用自定义确认对话框
  const confirmed = await showConfirmDialog('确定要删除这个提示词吗？');
  console.log('用户确认结果:', confirmed); // 调试日志
  
  if (confirmed) {
    try {
      console.log('开始删除提示词:', id); // 调试日志
      const result = await invoke('delete_prompt', { id });
      console.log('删除操作返回结果:', result);
      showNotification('删除成功', 'success');
      await loadPrompts(); // 重新加载列表
    } catch (error) {
      console.error('删除失败:', error);
      console.error('错误详情:', JSON.stringify(error));
      showNotification('删除失败: ' + error, 'error');
    }
  } else {
    console.log('用户取消了删除操作');
  }
};

(window as any).togglePin = async (id: number) => {
  try {
    await invoke('toggle_pin', { id });
    await loadPrompts();
  } catch (error) {
    console.error('置顶操作失败:', error);
    showNotification('操作失败', 'error');
  }
};

// 导入导出功能
async function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    try {
      console.log('开始导入文件:', file.name);
      
      const text = await file.text();
      const importData = JSON.parse(text);
      
      // 验证导入数据格式
      if (!importData.prompts || !Array.isArray(importData.prompts)) {
        throw new Error('无效的文件格式：缺少 prompts 数组');
      }
      
      console.log(`准备导入 ${importData.prompts.length} 个提示词`);
      
      // 显示导入确认
      const confirmed = await showConfirmDialog(
        `确定要导入 ${importData.prompts.length} 个提示词吗？这将添加到现有的提示词中。`
      );
      
      if (!confirmed) {
        showNotification('导入已取消', 'info');
        return;
      }
      
      // 调用后端导入函数
      await invoke('import_data', { data: importData });
      
      // 重新加载数据
      await loadPrompts();
      
      console.log(`导入完成: ${importData.prompts.length} 个提示词`);
      showNotification(`导入成功！共导入 ${importData.prompts.length} 个提示词`, 'success');
      
    } catch (error) {
      console.error('导入失败:', error);
      showNotification('导入失败: ' + ((error as any)?.message || error), 'error');
    }
  };
  input.click();
}

async function handleExport() {
  try {
    console.log('开始导出提示词...');
    
    // 动态导入 Tauri API
    const { save } = await import('@tauri-apps/plugin-dialog') as any;
    
    // 生成默认文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const defaultFilename = `prompt-tools-export-${timestamp}.json`;
    
    // 打开保存文件对话框
    const filePath = await save({
      defaultPath: defaultFilename,
      filters: [{
        name: 'JSON文件',
        extensions: ['json']
      }]
    });
    
    // 如果用户取消了对话框
    if (!filePath) {
      showNotification('导出已取消', 'info');
      return;
    }
    
    console.log('用户选择的保存路径:', filePath);
    
    // 调用后端函数直接保存到指定路径
    await invoke('export_data_to_file', { filePath });
    
    // 获取导出数据以显示统计信息
    const exportData = await invoke('export_data') as any;
    
    console.log(`导出完成: ${filePath}`);
    showNotification(`成功导出 ${exportData.prompts?.length || 0} 个提示词到 ${filePath}`, 'success');
    
  } catch (error: any) {
    console.error('导出失败:', error);
    showNotification('导出失败: ' + (error?.message || error), 'error');
  }
}

async function handleImportBest() {
  showNotification('精选提示词导入功能开发中...', 'info');
}

// 视图切换
function toggleView() {
  const promptList = document.getElementById('promptList');
  const viewToggle = document.getElementById('viewToggle');
  
  if (promptList && viewToggle) {
    isGridView = !isGridView;
    
    if (isGridView) {
      promptList.classList.remove('list-view');
      viewToggle.innerHTML = '<i class="fas fa-list"></i>';
    } else {
      promptList.classList.add('list-view');
      viewToggle.innerHTML = '<i class="fas fa-th"></i>';
    }
  }
}

// 主题切换
function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  
  if (body.classList.contains('theme-light')) {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', 'light');
  }
}

// 初始化主题
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  
  if (savedTheme === 'dark') {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// 设置面板
function openSettings() {
  showNotification('设置功能开发中...', 'info');
}

// 键盘快捷键
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: 新建提示词
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openModal();
    }
    
    // Ctrl/Cmd + F: 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    
    // Escape: 关闭模态框
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal');
      const detailModal = document.getElementById('detailModal');
      
      if (detailModal && detailModal.classList.contains('show')) {
        closeDetailModal();
      } else if (modal && modal.classList.contains('show')) {
        closeModal();
      }
    }
  });
}

// 工具函数
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
}

// 自定义确认对话框
function showConfirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    // 创建确认对话框HTML，使用现有样式
    const confirmModal = document.createElement('div');
    confirmModal.className = 'overlay confirm-modal';
    confirmModal.innerHTML = `
      <div class="confirm-container">
        <div class="confirm-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="confirm-content">
          <div class="confirm-title">确认操作</div>
          <div class="confirm-message">${message}</div>
        </div>
        <div class="confirm-actions">
          <button class="btn btn-secondary" id="confirmCancel">
            <i class="fas fa-times"></i>取消
          </button>
          <button class="btn btn-danger" id="confirmOk">
            <i class="fas fa-check"></i>确定
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    // 添加事件监听器
    const cancelBtn = confirmModal.querySelector('#confirmCancel') as HTMLButtonElement;
    const okBtn = confirmModal.querySelector('#confirmOk') as HTMLButtonElement;
    
    const cleanup = () => {
      if (document.body.contains(confirmModal)) {
        document.body.removeChild(confirmModal);
      }
    };
    
    cancelBtn.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });
    
    okBtn.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });
    
    // 点击遮罩层取消
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        cleanup();
        resolve(false);
      }
    });
    
    // ESC键取消
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
        document.removeEventListener('keydown', handleKeydown);
        resolve(false);
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
  });
}

function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info', options: { center?: boolean, persistent?: boolean } = {}) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // 根据是否居中显示来设置不同的样式
  if (options.center) {
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 20px 30px;
      border-radius: 12px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 400px;
      word-wrap: break-word;
      transition: all 0.3s ease;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(10px);
      font-size: 16px;
      text-align: center;
    `;
  } else {
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
  }
  
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
  
  // 如果不是持久化通知，3秒后自动消失
  if (!options.persistent) {
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0';
        if (options.center) {
          notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
        } else {
          notification.style.transform = 'translateX(100%)';
        }
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }
  
  return notification; // 返回通知元素，以便后续手动移除
}

// 优化提示词功能
async function optimizePrompt() {
  const contentTextarea = document.getElementById('content') as HTMLTextAreaElement;
  const optimizeBtn = document.getElementById('optimizePromptBtn') as HTMLButtonElement;
  
  if (!contentTextarea || !contentTextarea.value.trim()) {
    showNotification('请先输入提示词内容', 'error');
    return;
  }
  
  const originalContent = contentTextarea.value;
  
  // 显示加载状态
  const originalBtnContent = optimizeBtn.innerHTML;
  optimizeBtn.disabled = true;
  optimizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  
  // 显示居中的持久化通知
  const loadingNotification = showNotification('正在优化提示词...', 'info', { center: true, persistent: true });
  
  try {
    const optimizedContent = await callZhipuAI(originalContent);
    
    // 移除加载通知
    if (document.body.contains(loadingNotification)) {
      loadingNotification.style.opacity = '0';
      loadingNotification.style.transform = 'translate(-50%, -50%) scale(0.9)';
      setTimeout(() => {
        if (document.body.contains(loadingNotification)) {
          document.body.removeChild(loadingNotification);
        }
      }, 300);
    }
    
    if (optimizedContent && optimizedContent.trim() !== originalContent.trim()) {
      contentTextarea.value = optimizedContent;
      showNotification('提示词优化完成！', 'success');
      
      // 更新token计数
      const event = new Event('input');
      contentTextarea.dispatchEvent(event);
    } else {
      showNotification('优化失败，请稍后重试', 'error');
    }
  } catch (error) {
    console.error('优化提示词失败:', error);
    
    // 移除加载通知
    if (document.body.contains(loadingNotification)) {
      loadingNotification.style.opacity = '0';
      loadingNotification.style.transform = 'translate(-50%, -50%) scale(0.9)';
      setTimeout(() => {
        if (document.body.contains(loadingNotification)) {
          document.body.removeChild(loadingNotification);
        }
      }, 300);
    }
    
    showNotification('优化失败: ' + (error as any).message, 'error');
  } finally {
    // 恢复按钮状态
    optimizeBtn.disabled = false;
    optimizeBtn.innerHTML = originalBtnContent;
  }
}



// 调用智谱AI API
async function callZhipuAI(prompt: string): Promise<string> {
  try {
    // 直接使用API密钥
    const API_KEY = '7645eea5905a4c8b9d668e3e5330b33a.EFzS4nMaR1Ggj60T';
    const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  
  const requestBody = {
    model: 'glm-4.5-flash',
    messages: [
      {
        role: 'system',
        content: `# 角色 (Role)
你是一位专业的提示词生成专家，擅长运用RTF结构化框架优化提示词。

# 任务 (Task)
根据用户提供的原始提示词，生成一套优化后的中文提示词。

## 要求 (Requirements)
1. 严格按照RTF（Role-Task-Format）结构化框架重构提示词
2. 遵循奥卡姆剃刀原理，确保提示词精简高效，去除所有冗余指令
3. 应用金字塔原理组织指令，确保逻辑清晰、层次分明
4. 在生成行为建议时，参考福格行为模型（B=MAT），确保建议具有可执行性

## 实现目标 (Objectives)
优化后的提示词应能够：
1. 角色定义更加明确和专业
2. 任务描述更加清晰和具体
3. 格式要求更加规范和易执行
4. 整体结构更加合理和高效
5. 能够获得更好的AI响应效果

# 格式 (Format)
1. 使用Markdown格式输出完整的RTF框架提示词
2. 包含明确的Role定义、Task说明和Format要求
3. 提供必要的实现细节和约束条件
4. 直接返回优化后的提示词，不要添加额外的解释`
      },
      {
        role: 'user',
        content: `请优化以下提示词：\n\n${prompt}`
      }
    ],
    temperature: 0.6,
    stream: false
  };
  
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API响应错误:', response.status, response.statusText, errorText);
      throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API响应数据:', data);
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else {
      console.error('API返回数据格式错误:', data);
      throw new Error('API返回数据格式错误');
    }
  } catch (error) {
    console.error('调用智谱AI API失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('调用智谱AI API时发生未知错误');
  }
}