# Prompt Tools API 接口文档

## 📋 目录
1. [API 概述](#1-api-概述)
2. [数据模型](#2-数据模型)
3. [提示词管理接口](#3-提示词管理接口)
4. [搜索和筛选接口](#4-搜索和筛选接口)
5. [版本管理接口](#5-版本管理接口)
6. [数据管理接口](#6-数据管理接口)
7. [设置管理接口](#7-设置管理接口)
8. [错误处理](#8-错误处理)
9. [使用示例](#9-使用示例)

## 1. API 概述

### 1.1 技术架构
Prompt Tools 使用 Tauri 框架构建，前端通过 `@tauri-apps/api` 调用后端 Rust 函数。所有 API 都是异步函数，返回 Promise 对象。

### 1.2 调用方式
```typescript
import { invoke } from '@tauri-apps/api/core';

// 基本调用格式
const result = await invoke('command_name', { param1: value1, param2: value2 });
```

### 1.3 通用响应格式
- **成功**: 返回具体数据或 `void`
- **失败**: 抛出包含错误信息的字符串异常

### 1.4 API 分类
- **基础 CRUD**: 提示词的增删改查
- **搜索筛选**: 搜索、分类、标签筛选
- **版本管理**: 版本历史、回滚
- **数据管理**: 导入导出、备份恢复
- **设置管理**: 应用配置管理

## 2. 数据模型

### 2.1 核心数据结构

#### 2.1.1 Prompt - 提示词对象
```typescript
interface Prompt {
  id: number;                    // 唯一标识符
  name: string;                  // 提示词名称
  source: string | null;         // 来源信息
  notes: string | null;          // 备注信息
  tags: string[];                // 标签数组
  pinned: boolean;               // 是否置顶
  content: string;               // 提示词内容
  version: string;               // 当前版本号
  created_at: string;            // 创建时间 (ISO 8601)
  updated_at: string;            // 更新时间 (ISO 8601)
  current_version_id: number | null; // 当前版本ID
}
```

#### 2.1.2 Version - 版本对象
```typescript
interface Version {
  id: number;                    // 版本ID
  prompt_id: number;             // 关联的提示词ID
  version: string;               // 版本号 (如 "1.0.0")
  content: string;               // 版本内容
  created_at: string;            // 创建时间
  parent_version_id: number | null; // 父版本ID
}
```

#### 2.1.3 请求对象

**CreatePromptRequest - 创建提示词请求**
```typescript
interface CreatePromptRequest {
  name: string;                  // 必填：提示词名称
  source?: string;               // 可选：来源信息
  notes?: string;                // 可选：备注信息
  tags: string[];                // 标签数组
  content: string;               // 必填：提示词内容
}
```

**UpdatePromptRequest - 更新提示词请求**
```typescript
interface UpdatePromptRequest {
  name: string;                  // 提示词名称
  source?: string;               // 来源信息
  notes?: string;                // 备注信息
  tags: string[];                // 标签数组
  content: string;               // 提示词内容
  save_as_version?: boolean;     // 是否保存为新版本
  version_type?: 'patch' | 'minor' | 'major'; // 版本类型
}
```

#### 2.1.4 响应对象

**SearchResult - 搜索结果**
```typescript
interface SearchResult {
  prompts: Prompt[];             // 匹配的提示词列表
  total: number;                 // 总数量
  tags: string[];                // 所有可用标签
  sources: string[];             // 所有可用来源
}
```

**ExportData - 导出数据**
```typescript
interface ExportData {
  prompts: PromptWithVersions[]; // 包含版本的提示词列表
  settings: Record<string, string>; // 应用设置
  export_time: string;           // 导出时间
}

interface PromptWithVersions extends Omit<Prompt, 'content' | 'version'> {
  versions: Version[];           // 版本历史
}
```

## 3. 提示词管理接口

### 3.1 获取所有提示词

**接口名称**: `get_all_prompts`

**描述**: 获取所有提示词列表，按置顶状态和更新时间排序

**参数**: 无

**返回值**: `Promise<Prompt[]>`

**示例**:
```typescript
try {
  const prompts = await invoke('get_all_prompts');
  console.log('提示词列表:', prompts);
} catch (error) {
  console.error('获取失败:', error);
}
```

**排序规则**:
1. 置顶的提示词在前
2. 按更新时间倒序排列

### 3.2 创建提示词

**接口名称**: `create_prompt`

**描述**: 创建新的提示词

**参数**:
- `name: string` - 提示词名称 (必填)
- `source?: string` - 来源信息 (可选)
- `notes?: string` - 备注信息 (可选)
- `tags: string[]` - 标签数组
- `content: string` - 提示词内容 (必填)

**返回值**: `Promise<number>` - 新创建的提示词ID

**示例**:
```typescript
try {
  const id = await invoke('create_prompt', {
    name: '专业邮件助手',
    source: 'ChatGPT官方',
    notes: '适用于商务邮件撰写',
    tags: ['工作', '邮件', '商务'],
    content: '你是一位专业的邮件撰写助手...'
  });
  console.log('创建成功，ID:', id);
} catch (error) {
  console.error('创建失败:', error);
}
```

**验证规则**:
- 名称不能为空，长度不超过200字符
- 内容不能为空，长度不超过50000字符
- 标签长度不超过50字符

### 3.3 更新提示词

**接口名称**: `update_prompt`

**描述**: 更新现有提示词

**参数**:
- `id: number` - 提示词ID (必填)
- `name: string` - 提示词名称 (必填)
- `source?: string` - 来源信息 (可选)
- `notes?: string` - 备注信息 (可选)
- `tags: string[]` - 标签数组
- `content: string` - 提示词内容 (必填)
- `save_as_version?: boolean` - 是否保存为新版本 (默认 false)
- `version_type?: string` - 版本类型：'patch' | 'minor' | 'major' (默认 'patch')

**返回值**: `Promise<void>`

**示例**:
```typescript
try {
  await invoke('update_prompt', {
    id: 1,
    name: '更新后的名称',
    source: '新来源',
    notes: '更新的备注',
    tags: ['新标签', '工作'],
    content: '更新后的内容...',
    save_as_version: true,
    version_type: 'minor'
  });
  console.log('更新成功');
} catch (error) {
  console.error('更新失败:', error);
}
```

**版本管理**:
- `save_as_version: false`: 直接覆盖当前内容
- `save_as_version: true`: 创建新版本，保留历史

### 3.4 删除提示词

**接口名称**: `delete_prompt`

**描述**: 删除指定提示词及其所有版本历史

**参数**:
- `id: number` - 提示词ID

**返回值**: `Promise<void>`

**示例**:
```typescript
try {
  await invoke('delete_prompt', { id: 1 });
  console.log('删除成功');
} catch (error) {
  console.error('删除失败:', error);
}
```

**注意事项**:
- 删除操作不可逆
- 会同时删除所有相关版本历史
- 使用事务确保数据一致性

### 3.5 切换置顶状态

**接口名称**: `toggle_pin`

**描述**: 切换提示词的置顶状态

**参数**:
- `id: number` - 提示词ID

**返回值**: `Promise<void>`

**示例**:
```typescript
try {
  await invoke('toggle_pin', { id: 1 });
  console.log('置顶状态切换成功');
} catch (error) {
  console.error('操作失败:', error);
}
```

## 4. 搜索和筛选接口

### 4.1 搜索提示词

**接口名称**: `search_prompts`

**描述**: 根据关键词、标签、来源搜索提示词

**参数**:
- `query: string` - 搜索关键词 (搜索名称、内容、标签、备注)
- `tags: string[]` - 标签筛选条件
- `sources: string[]` - 来源筛选条件

**返回值**: `Promise<SearchResult>`

**示例**:
```typescript
try {
  const result = await invoke('search_prompts', {
    query: '邮件',
    tags: ['工作', '商务'],
    sources: ['ChatGPT官方']
  });
  
  console.log('搜索结果:', result.prompts);
  console.log('总数:', result.total);
  console.log('可用标签:', result.tags);
  console.log('可用来源:', result.sources);
} catch (error) {
  console.error('搜索失败:', error);
}
```

**搜索逻辑**:
- 关键词搜索：模糊匹配名称、内容、标签、备注
- 标签筛选：OR 逻辑（包含任一标签）
- 来源筛选：OR 逻辑（匹配任一来源）
- 多条件：AND 逻辑（同时满足）

### 4.2 获取所有标签

**接口名称**: `get_all_tags`

**描述**: 获取系统中所有使用过的标签

**参数**: 无

**返回值**: `Promise<string[]>` - 标签列表（按字母顺序排序）

**示例**:
```typescript
try {
  const tags = await invoke('get_all_tags');
  console.log('所有标签:', tags);
} catch (error) {
  console.error('获取标签失败:', error);
}
```

### 4.3 获取所有来源

**接口名称**: `get_all_sources`

**描述**: 获取系统中所有使用过的来源

**参数**: 无

**返回值**: `Promise<string[]>` - 来源列表（按字母顺序排序）

**示例**:
```typescript
try {
  const sources = await invoke('get_all_sources');
  console.log('所有来源:', sources);
} catch (error) {
  console.error('获取来源失败:', error);
}
```

### 4.4 获取分类统计

**接口名称**: `get_category_counts`

**描述**: 获取各个分类的提示词数量统计

**参数**: 无

**返回值**: `Promise<Record<string, number>>` - 分类名称到数量的映射

**示例**:
```typescript
try {
  const counts = await invoke('get_category_counts');
  console.log('分类统计:', counts);
  // 输出：{ work: 5, business: 3, tools: 2, ... }
} catch (error) {
  console.error('获取统计失败:', error);
}
```

**支持的分类**:
- `work`: 工作相关
- `business`: 商业相关
- `tools`: 工具类
- `language`: 语言相关
- `office`: 办公相关
- `general`: 通用
- `writing`: 写作相关
- `programming`: 编程相关
- `emotion`: 情感相关
- `education`: 教育相关
- `creative`: 创意相关
- `academic`: 学术相关
- `design`: 设计相关
- `tech`: 技术相关
- `entertainment`: 娱乐相关

### 4.5 按分类获取提示词

**接口名称**: `get_prompts_by_category`

**描述**: 获取指定分类下的所有提示词

**参数**:
- `category: string` - 分类名称

**返回值**: `Promise<Prompt[]>`

**示例**:
```typescript
try {
  const prompts = await invoke('get_prompts_by_category', {
    category: 'work'
  });
  console.log('工作分类提示词:', prompts);
} catch (error) {
  console.error('获取分类提示词失败:', error);
}
```

## 5. 版本管理接口

### 5.1 获取版本历史

**接口名称**: `get_prompt_versions`

**描述**: 获取指定提示词的所有版本历史

**参数**:
- `prompt_id: number` - 提示词ID

**返回值**: `Promise<Version[]>` - 版本列表（按创建时间倒序）

**示例**:
```typescript
try {
  const versions = await invoke('get_prompt_versions', {
    promptId: 1
  });
  console.log('版本历史:', versions);
} catch (error) {
  console.error('获取版本历史失败:', error);
}
```

### 5.2 回滚到指定版本

**接口名称**: `rollback_to_version`

**描述**: 将提示词回滚到指定版本

**参数**:
- `prompt_id: number` - 提示词ID
- `version_id: number` - 目标版本ID
- `version_type: string` - 新版本类型：'patch' | 'minor' | 'major'

**返回值**: `Promise<void>`

**示例**:
```typescript
try {
  await invoke('rollback_to_version', {
    promptId: 1,
    versionId: 5,
    versionType: 'patch'
  });
  console.log('回滚成功');
} catch (error) {
  console.error('回滚失败:', error);
}
```

**回滚机制**:
1. 获取目标版本的内容
2. 基于目标版本创建新版本
3. 更新当前版本指针
4. 保持完整的版本链

## 6. 数据管理接口

### 6.1 导出数据

**接口名称**: `export_data`

**描述**: 导出所有提示词数据和设置

**参数**: 无

**返回值**: `Promise<ExportData>`

**示例**:
```typescript
try {
  const exportData = await invoke('export_data');
  console.log('导出数据:', exportData);
  
  // 可以进一步处理，如保存到文件
  const jsonString = JSON.stringify(exportData, null, 2);
  // 保存到文件的逻辑...
} catch (error) {
  console.error('导出失败:', error);
}
```

### 6.2 导出到文件

**接口名称**: `export_data_to_file`

**描述**: 直接将数据导出到指定文件

**参数**:
- `file_path: string` - 目标文件路径

**返回值**: `Promise<void>`

**示例**:
```typescript
try {
  await invoke('export_data_to_file', {
    filePath: '/Users/username/Desktop/prompts_backup.json'
  });
  console.log('导出到文件成功');
} catch (error) {
  console.error('导出到文件失败:', error);
}
```

**注意事项**:
- 确保目标路径有写入权限
- 文件将以 UTF-8 编码保存
- 建议使用 .json 扩展名

### 6.3 导入数据

**接口名称**: `import_data`

**描述**: 导入提示词数据

**参数**:
- `data: ExportData` - 要导入的数据

**返回值**: `Promise<void>`

**示例**:
```typescript
try {
  const importData = {
    prompts: [/* 提示词数据 */],
    settings: { /* 设置数据 */ },
    export_time: '2023-12-01T10:00:00Z'
  };
  
  await invoke('import_data', { data: importData });
  console.log('导入成功');
} catch (error) {
  console.error('导入失败:', error);
}
```

**导入行为**:
- 清空现有数据
- 导入新数据
- 保持数据完整性
- 使用事务确保原子性

## 7. 设置管理接口

### 7.1 获取设置

**接口名称**: `get_setting`

**描述**: 获取指定设置项的值

**参数**:
- `key: string` - 设置键名

**返回值**: `Promise<string | null>` - 设置值，不存在则返回 null

**示例**:
```typescript
try {
  const threshold = await invoke('get_setting', {
    key: 'version_cleanup_threshold'
  });
  console.log('版本清理阈值:', threshold);
} catch (error) {
  console.error('获取设置失败:', error);
}
```

### 7.2 设置配置

**接口名称**: `set_setting`

**描述**: 设置指定配置项的值

**参数**:
- `key: string` - 设置键名
- `value: string` - 设置值

**返回值**: `Promise<void>`

**示例**:
```typescript
try {
  await invoke('set_setting', {
    key: 'version_cleanup_threshold',
    value: '300'
  });
  console.log('设置保存成功');
} catch (error) {
  console.error('设置保存失败:', error);
}
```

**常用设置项**:
- `version_cleanup_threshold`: 版本清理阈值（默认200）
- `theme`: 主题设置 ('light' | 'dark')
- `view_mode`: 视图模式 ('grid' | 'list')

## 8. 错误处理

### 8.1 错误类型

#### 8.1.1 数据库错误
```typescript
// 示例错误信息
"Database error: no such table: prompts"
"Database error: UNIQUE constraint failed: prompts.id"
```

#### 8.1.2 验证错误
```typescript
// 示例错误信息
"Failed to create prompt: 提示词名称不能为空"
"Failed to update prompt: 提示词内容长度不能超过50000字符"
```

#### 8.1.3 文件操作错误
```typescript
// 示例错误信息
"Failed to export data: Permission denied"
"Failed to import data: Invalid JSON format"
```

### 8.2 错误处理最佳实践

#### 8.2.1 统一错误处理
```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  errorMessage: string = '操作失败'
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    showNotification(`${errorMessage}: ${error}`, 'error');
    return null;
  }
}

// 使用示例
const prompts = await handleApiCall(
  () => invoke('get_all_prompts'),
  '获取提示词列表失败'
);
```

#### 8.2.2 错误重试机制
```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retry failed');
}
```

## 9. 使用示例

### 9.1 完整的 CRUD 操作

```typescript
import { invoke } from '@tauri-apps/api/core';

class PromptService {
  // 获取所有提示词
  async getAllPrompts(): Promise<Prompt[]> {
    return await invoke('get_all_prompts');
  }

  // 创建提示词
  async createPrompt(data: CreatePromptRequest): Promise<number> {
    return await invoke('create_prompt', data);
  }

  // 更新提示词
  async updatePrompt(id: number, data: UpdatePromptRequest): Promise<void> {
    return await invoke('update_prompt', { id, ...data });
  }

  // 删除提示词
  async deletePrompt(id: number): Promise<void> {
    return await invoke('delete_prompt', { id });
  }

  // 搜索提示词
  async searchPrompts(
    query: string,
    tags: string[] = [],
    sources: string[] = []
  ): Promise<SearchResult> {
    return await invoke('search_prompts', { query, tags, sources });
  }
}
```

### 9.2 版本管理示例

```typescript
class VersionService {
  // 获取版本历史
  async getVersionHistory(promptId: number): Promise<Version[]> {
    return await invoke('get_prompt_versions', { promptId });
  }

  // 创建新版本（通过更新）
  async createVersion(
    id: number,
    content: string,
    versionType: 'patch' | 'minor' | 'major' = 'patch'
  ): Promise<void> {
    const prompt = await this.getPromptById(id);
    if (!prompt) throw new Error('提示词不存在');

    return await invoke('update_prompt', {
      id,
      name: prompt.name,
      source: prompt.source,
      notes: prompt.notes,
      tags: prompt.tags,
      content,
      save_as_version: true,
      version_type: versionType
    });
  }

  // 回滚版本
  async rollbackVersion(
    promptId: number,
    versionId: number,
    versionType: string = 'patch'
  ): Promise<void> {
    return await invoke('rollback_to_version', {
      promptId,
      versionId,
      versionType
    });
  }
}
```

### 9.3 数据管理示例

```typescript
class DataService {
  // 导出所有数据
  async exportAllData(): Promise<ExportData> {
    return await invoke('export_data');
  }

  // 导出到文件
  async exportToFile(filePath: string): Promise<void> {
    return await invoke('export_data_to_file', { filePath });
  }

  // 从文件导入
  async importFromFile(file: File): Promise<void> {
    const text = await file.text();
    const data = JSON.parse(text);
    return await invoke('import_data', { data });
  }

  // 备份数据
  async backupData(): Promise<string> {
    const data = await this.exportAllData();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `prompt-tools-backup-${timestamp}.json`;
    
    // 使用 Tauri 的文件 API 保存
    const { save } = await import('@tauri-apps/plugin-dialog');
    const filePath = await save({
      defaultPath: filename,
      filters: [{
        name: 'JSON Files',
        extensions: ['json']
      }]
    });
    
    if (filePath) {
      await this.exportToFile(filePath);
      return filePath;
    }
    
    throw new Error('用户取消了保存操作');
  }
}
```

### 9.4 设置管理示例

```typescript
class SettingsService {
  // 获取版本清理阈值
  async getVersionCleanupThreshold(): Promise<number> {
    const value = await invoke('get_setting', { 
      key: 'version_cleanup_threshold' 
    });
    return value ? parseInt(value) : 200;
  }

  // 设置版本清理阈值
  async setVersionCleanupThreshold(threshold: number): Promise<void> {
    return await invoke('set_setting', {
      key: 'version_cleanup_threshold',
      value: threshold.toString()
    });
  }

  // 获取主题设置
  async getTheme(): Promise<'light' | 'dark'> {
    const theme = await invoke('get_setting', { key: 'theme' });
    return (theme as 'light' | 'dark') || 'light';
  }

  // 设置主题
  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    return await invoke('set_setting', {
      key: 'theme',
      value: theme
    });
  }
}
```

### 9.5 完整应用示例

```typescript
class PromptToolsApp {
  private promptService = new PromptService();
  private versionService = new VersionService();
  private dataService = new DataService();
  private settingsService = new SettingsService();

  async initialize(): Promise<void> {
    try {
      // 加载提示词
      const prompts = await this.promptService.getAllPrompts();
      this.renderPrompts(prompts);

      // 加载设置
      const theme = await this.settingsService.getTheme();
      this.applyTheme(theme);

      console.log('应用初始化完成');
    } catch (error) {
      console.error('初始化失败:', error);
    }
  }

  async createPrompt(data: CreatePromptRequest): Promise<void> {
    try {
      const id = await this.promptService.createPrompt(data);
      console.log('创建成功，ID:', id);
      
      // 重新加载列表
      await this.refreshPrompts();
    } catch (error) {
      console.error('创建失败:', error);
      throw error;
    }
  }

  async searchPrompts(query: string): Promise<void> {
    try {
      const result = await this.promptService.searchPrompts(query);
      this.renderPrompts(result.prompts);
      console.log(`找到 ${result.total} 个结果`);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  }

  private async refreshPrompts(): Promise<void> {
    const prompts = await this.promptService.getAllPrompts();
    this.renderPrompts(prompts);
  }

  private renderPrompts(prompts: Prompt[]): void {
    // 渲染提示词列表的逻辑
    console.log('渲染提示词列表:', prompts.length);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    // 应用主题的逻辑
    document.body.className = `theme-${theme}`;
  }
}

// 使用示例
const app = new PromptToolsApp();
app.initialize();
```

---

## 📝 更新日志

### v0.1.0 (当前版本)
- ✅ 完整的 CRUD API
- ✅ 搜索和筛选功能
- ✅ 版本管理系统
- ✅ 数据导入导出
- ✅ 设置管理

### 未来版本计划
- 🔄 批量操作 API
- 🔄 高级搜索功能
- 🔄 模板管理 API
- 🔄 统计分析 API

---

**注意**: 本文档描述的是 Prompt Tools v0.1.0 的 API 接口。随着版本更新，部分接口可能会有变化，请以最新版本的文档为准。