# Prompt Tools 自动更新配置指南

本文档详细说明如何为 Prompt Tools 应用配置 UpgradeLink 自动更新功能。

## 前期准备

### 1. UpgradeLink 平台配置

1. 访问 [UpgradeLink 平台](https://upgradelink.toolsetlink.com)
2. 注册账号并登录
3. 创建新的 Tauri 应用项目
4. 获取以下凭证：
   - `ACCESS_KEY`：访问密钥
   - `TAURI_KEY`：应用唯一标识
5. 在应用配置中设置 GitHub 仓库地址

### 2. GitHub 仓库配置

在 GitHub 仓库的 `Settings > Security > Secrets and variables > Actions` 中添加以下环境变量：

| Secret 名称 | 说明 | 必需 |
|------------|------|------|
| `UPGRADE_LINK_ACCESS_KEY` | UpgradeLink 平台提供的访问密钥 | ✅ |
| `UPGRADE_LINK_TAURI_KEY` | UpgradeLink 平台分配的应用唯一标识 | ✅ |
| `TAURI_SIGNING_PRIVATE_KEY` | Tauri 应用签名私钥（可选） | ❌ |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 签名私钥密码（可选） | ❌ |

## 已完成的配置

### 1. GitHub Actions 工作流

已创建 `.github/workflows/publish.yml` 文件，包含：

- **publish-tauri 作业**：
  - 跨平台构建（macOS、Linux、Windows）
  - 自动创建 GitHub Release
  - 提取应用版本号
  - 生成更新文件（latest.json）

- **upgradeLink-upload 作业**：
  - 等待构建完成
  - 将更新信息上传到 UpgradeLink 平台
  - 自动触发版本更新

### 2. Tauri 配置

已在 `src-tauri/tauri.conf.json` 中添加更新器配置：

```json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://upgradelink.toolsetlink.com/api/tauri/{{target}}/{{arch}}/{{current_version}}"
    ],
    "dialog": true,
    "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDhEQTdBQUJCNzJEOEZBNjAKUldSVGJuVnVkSEoxYzNSbFpDQnRhVzVwYzJsbmJpQndjblZpYkdsaklHdGxlVG9nT0VSQTB3UkNOekpFT0VaQk5qQUtVVmRTVkdKdVZuVnVkSEoxYzNSbFpBPT0K"
  }
}
```

### 3. 依赖包安装

已安装必要的依赖：

**前端依赖：**
- `@tauri-apps/plugin-updater`
- `@tauri-apps/plugin-process`

**后端依赖（Rust）：**
- `tauri-plugin-updater = "2"`

### 4. 更新功能实现

已实现完整的更新功能：

- **自动检查更新**：应用启动 5 秒后自动检查
- **手动检查更新**：通过按钮触发
- **更新对话框**：显示版本信息和更新日志
- **下载进度**：实时显示下载状态
- **自动重启**：更新完成后自动重启应用

### 5. 用户界面

已添加更新相关的 UI 组件：

- 更新对话框样式
- 进度显示界面
- 通知提示系统
- 响应式设计支持

## 使用流程

### 1. 发布新版本

1. 更新 `src-tauri/tauri.conf.json` 中的版本号
2. 提交代码到 `main` 分支
3. GitHub Actions 自动触发构建和发布流程
4. UpgradeLink 平台自动接收更新信息

### 2. 用户更新体验

1. **自动检查**：应用启动时自动检查更新
2. **更新提示**：发现新版本时显示更新对话框
3. **用户选择**：用户可选择立即更新或稍后更新
4. **下载安装**：自动下载并安装更新
5. **重启应用**：更新完成后自动重启

## 测试建议

### 1. 本地测试

```bash
# 构建应用
npm run tauri:build

# 测试更新功能（需要先发布一个版本）
npm run tauri:dev
```

### 2. 发布测试

1. 先发布一个初始版本（如 v0.1.0）
2. 修改版本号到 v0.1.1
3. 提交代码触发自动构建
4. 使用 v0.1.0 版本测试自动更新到 v0.1.1

## 注意事项

### 1. 版本号管理

- 确保每次发布都更新版本号
- 遵循语义化版本规范（Semantic Versioning）
- 版本号格式：`major.minor.patch`

### 2. 签名配置（可选）

如果需要代码签名：

1. 生成签名密钥
2. 配置 GitHub Secrets
3. 确保构建环境支持签名

### 3. 网络要求

- 用户需要网络连接才能检查和下载更新
- 确保 UpgradeLink 服务的可访问性
- 考虑网络超时和重试机制

### 4. 权限要求

- 应用需要写入权限来安装更新
- 某些系统可能需要管理员权限

## 故障排除

### 1. 构建失败

- 检查 GitHub Actions 日志
- 确认所有依赖已正确安装
- 验证 Rust 和 Node.js 版本兼容性

### 2. 更新检查失败

- 确认网络连接正常
- 检查 UpgradeLink 服务状态
- 验证应用配置中的端点 URL

### 3. 更新安装失败

- 检查应用权限
- 确认磁盘空间充足
- 查看应用日志获取详细错误信息

## 支持

如遇到问题，请：

1. 查看 GitHub Actions 构建日志
2. 检查 UpgradeLink 平台控制台
3. 查看应用开发者工具控制台
4. 提交 Issue 到项目仓库

---

配置完成后，您的 Prompt Tools 应用将具备完整的自动更新功能，为用户提供无缝的版本升级体验。