# Windows 平台支持文档

## 概述

Prompt Tools 现已完全支持 Windows 平台，为 Windows 用户提供原生般的桌面体验。本文档详细介绍了 Windows 平台的支持情况、安装方法、特性和已知问题。

## 支持的 Windows 版本

- **Windows 10** (版本 1903 或更高)
- **Windows 11** (所有版本)

### 支持的架构

- **x64** (Intel/AMD 64位) - ✅ 完全支持
- **ARM64** (Windows on ARM) - ✅ 实验性支持

## 安装方式

### 1. 预编译安装包

从 [GitHub Releases](https://github.com/jwangkun/Prompt-Tools/releases/latest) 下载对应的安装包：

- **MSI 安装包**: `Prompt-Tools_x.x.x_x64_en-US.msi` (推荐)
- **NSIS 安装包**: `Prompt-Tools_x.x.x_x64-setup.exe`
- **便携版**: `Prompt-Tools_x.x.x_x64.zip`

### 2. 安装步骤

#### MSI 安装包 (推荐)
1. 下载 `.msi` 文件
2. 双击运行安装程序
3. 按照安装向导完成安装
4. 支持中英文界面选择

#### NSIS 安装包
1. 下载 `-setup.exe` 文件
2. 右键选择"以管理员身份运行"
3. 选择安装语言（支持中文和英文）
4. 按照向导完成安装

## Windows 特性支持

### ✅ 已支持的特性

- **原生窗口体验**: 完全集成 Windows 窗口管理
- **系统通知**: 支持 Windows 10/11 通知系统
- **文件关联**: 可关联 `.prompt` 文件类型
- **开始菜单集成**: 安装后自动添加到开始菜单
- **任务栏集成**: 支持任务栏图标和快捷操作
- **拖拽支持**: 支持文件拖拽导入
- **快捷键**: 支持 Ctrl 键修饰符快捷键
- **多显示器**: 完全支持多显示器环境
- **高 DPI**: 自动适配高 DPI 显示器

### 🔄 开发中的特性

- **系统托盘**: 最小化到系统托盘
- **全局快捷键**: 系统级快捷键支持
- **Windows Terminal 集成**: 与新版终端集成

### ❌ 当前不支持的特性

- **Windows 7/8**: 仅支持 Windows 10 及以上版本

## 快捷键支持

| 功能 | Windows 快捷键 | 说明 |
|------|---------------|------|
| 新建提示词 | `Ctrl + N` | 打开新建提示词对话框 |
| 搜索 | `Ctrl + F` | 聚焦到搜索框 |
| 保存 | `Ctrl + S` | 保存当前编辑的提示词 |
| 关闭窗口 | `Alt + F4` | 关闭应用程序 |
| 关闭对话框 | `Esc` | 关闭当前模态对话框 |

## 文件路径和数据存储

### 应用数据目录
```
%APPDATA%\com.jwangkun.prompt-tools\
```

### 数据库文件
```
%APPDATA%\com.jwangkun.prompt-tools\prompts.db
```

### 导出文件默认位置
```
%USERPROFILE%\Documents\
```

## 构建说明

### 开发环境要求

- **Node.js** 18 或更高版本
- **pnpm** 包管理器
- **Rust** 和 **Cargo**
- **Tauri CLI** 2.8.4 或更高版本
- **Visual Studio Build Tools** (包含 MSVC)

### 构建命令

```bash
# 开发模式
pnpm tauri:dev

# 构建 x64 版本
pnpm tauri:build:win

# 构建 ARM64 版本
pnpm tauri:build:win-arm

# 构建所有 Windows 目标
pnpm tauri build --target x86_64-pc-windows-msvc --target aarch64-pc-windows-msvc
```

### 构建输出

构建完成后，产物位于：
```
src-tauri/target/release/bundle/
├── msi/                    # MSI 安装包
├── nsis/                   # NSIS 安装包
└── zip/                    # 便携版压缩包
```

## 安装包配置

### MSI 安装包特性
- **安装模式**: 支持按用户和按机器安装
- **语言支持**: 中文简体、英文
- **卸载支持**: 完整的卸载功能
- **升级支持**: 支持原地升级

### NSIS 安装包特性
- **多语言界面**: 安装时选择语言
- **自定义安装路径**: 用户可选择安装位置
- **开始菜单快捷方式**: 自动创建
- **桌面快捷方式**: 可选创建

## 已知问题和解决方案

### 1. 安装被 Windows Defender 阻止

**问题**: Windows Defender 或其他杀毒软件可能将应用标记为可疑文件。

**解决方案**:
1. 暂时禁用实时保护
2. 将下载文件添加到白名单
3. 右键选择"仍要运行"
4. 我们正在申请代码签名证书来解决此问题

### 2. 缺少 VC++ 运行库

**问题**: 启动时提示缺少 VCRUNTIME140.dll 或类似错误。

**解决方案**:
安装 [Microsoft Visual C++ Redistributable](https://docs.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)

### 3. 高 DPI 显示问题

**问题**: 在高 DPI 显示器上界面模糊或尺寸异常。

**解决方案**:
1. 右键应用程序快捷方式
2. 选择"属性" → "兼容性"
3. 点击"更改高 DPI 设置"
4. 勾选"替代高 DPI 缩放行为"
5. 选择"应用程序"

## 性能优化

### 启动优化
- 应用启动时间: < 3 秒
- 内存占用: < 100MB
- CPU 占用: 空闲时 < 1%

### 存储优化
- 数据库自动压缩
- 支持大量提示词 (10,000+)
- 快速搜索和筛选

## 故障排除

### 应用无法启动
1. 检查 Windows 版本是否支持
2. 安装最新的 VC++ 运行库
3. 检查防火墙和杀毒软件设置
4. 尝试以管理员身份运行

### 数据丢失问题
1. 数据备份位置: `%APPDATA%\com.jwangkun.prompt-tools\`
2. 支持导出/导入功能
3. 定期备份重要数据

### 性能问题
1. 关闭不必要的后台程序
2. 检查系统资源使用情况
3. 清理系统临时文件

## 技术支持

### 反馈渠道
- **GitHub Issues**: [项目问题页面](https://github.com/jwangkun/Prompt-Tools/issues)
- **邮件支持**: [邮箱地址]
- **社区讨论**: [讨论页面]

### 日志收集
日志文件位置:
```
%APPDATA%\com.jwangkun.prompt-tools\logs\
```

提交问题时请附带相关日志文件。

## 更新日志

### v0.1.0 - Windows 支持首发版
- ✅ 完整的 Windows 10/11 支持
- ✅ MSI 和 NSIS 安装包
- ✅ 中英文界面支持
- ✅ 跨平台快捷键适配
- ✅ Windows 特有功能集成

---

*最后更新: 2025-09-07*