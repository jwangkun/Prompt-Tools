# Prompt Tools: 你的专属提示词管家

<p align="center">
  <img src="./src-tauri/icons/logo.png" alt="Prompt Tools Logo" width="150">
</p>

<p align="center">
  <strong>一款开源、免费的桌面神器，旨在彻底简化你的 Prompt 管理工作流程。</strong>
  <br />
  <a href="https://github.com/jwangkun/Prompt-Tools/releases/latest"><strong>下载最新版本 »</strong></a>
  <br />
  <br />
  <a href="https://github.com/jwangkun/Prompt-Tools/issues">报告 Bug</a>
  ·
  <a href="https://github.com/jwangkun/Prompt-Tools/issues">请求功能</a>
</p>

---

嘿，各位 AI 玩家和效率达人！在这个 AI 浪潮席卷一切的时代，无论是与 ChatGPT 谈天说地，还是让 Midjourney 挥洒创意，我们都离不开一个核心的东西——**提示词（Prompt）**。

## 你的“咒语”，决定了 AI 的“魔力”

我们可以把 Prompt 想象成与 AI 沟通的“魔法咒语”。一句精心设计的咒语，能让 AI 精准地理解你的意图，产出令人惊艳的文案、代码、图片或解决方案。随着我们使用 AI 的频率越来越高，手上积累的“神级咒语”也越来越多。这些都是我们智慧和经验的结晶，是宝贵的数字资产。

但问题也随之而来...

## 你的 Prompt，是否也“无家可归”？

当你的“咒语书”越来越厚，你是否也遇到了这些令人头疼的管理痛点？

-   🤯 **杂乱无章**：Prompt 散落在备忘录、微信收藏、TXT 文档、Excel 表格里，像一盘散沙。
-   🔍 **查找困难**：急用时想不起某个关键 Prompt 放在了哪里，只能凭记忆在各个角落疯狂翻找，效率低下。
-   📂 **分类不明**：没有统一的分类和标签体系，无法系统性地整理和优化你的 Prompt 库。
-   😩 **同步不便**：在公司电脑上收藏的 Prompt，回到家里的电脑就用不了，只能通过聊天软件传来传去。

这些痛点不仅浪费了我们宝贵的时间，更限制了我们利用 AI 提升生产力的上限。是时候给你的 Prompt 安个家了！

---

## Prompt Tools：你的专属提示词管家

**Prompt Tools** 是一款强大的桌面应用程序，旨在彻底简化你的 Prompt 管理工作流程。它基于 Tauri 框架构建，为你提供快速、安全和跨平台的极致体验。

![应用截图](./image.png)

## 赞助商  

![alt text](UpgradeLink.png)

### ✨ 核心功能特性

*   ✍️ **Prompt 管理**： 像管理笔记一样，轻松创建、编辑、搜索和组织你的所有 Prompt。
*   💻 **跨平台运行**： 目前支持 macOS，未来将支持 Windows 和 Linux，提供原生般流畅的体验。
*   🚀 **轻量与高效**： 基于 Rust 和 Web 前沿技术构建，启动飞快，占用资源少，告别卡顿。
*   🔐 **本地优先，安全私密**： 你的所有数据都存储在本地计算机上，无需担心隐私泄露，数据由你一手掌控。

### 📥 下载与安装

您可以直接从 **[GitHub Releases](https://github.com/jwangkun/Prompt-Tools/releases/latest)** 页面下载最新的预编译版本。目前仅提供 macOS (Apple Silicon) 版本。

如果安装出现提示文件损坏，请执行以下命令进行修复：

```bash
xattr -d com.apple.quarantine /Applications/Prompt\ Tools.app
```

---

## 👨‍💻 面向开发者

对于喜欢钻研技术的同学，Prompt Tools 的技术栈同样令人兴奋。作为一款开源项目，你可以轻松地在本地运行或构建它。

### 🛠️ 技术栈

*   **前端:** TypeScript, Vite, React
*   **后端与核心:** Rust, Tauri
*   **数据库:** SQLite
*   **包管理器:** pnpm

### 📋 环境准备

在开始之前，请确保你的系统上已安装以下软件：

*   [Node.js](https://nodejs.org/) (推荐 v18 或更高版本)
*   [pnpm](https://pnpm.io/installation)
*   [Rust & Cargo](https://www.rust-lang.org/tools/install)
*   [Tauri 开发环境依赖](https://tauri.app/v2/guides/getting-started/prerequisites)

### 🚀 快速上手

1.  **克隆仓库:**
    ```bash
    git clone https://github.com/jwangkun/Prompt-Tools.git
    cd Prompt-Tools
    ```

2.  **安装依赖:**
    ```bash
    pnpm install
    ```

3.  **以开发模式运行:**
    ```bash
    pnpm tauri:dev
    ```

### 📦 构建应用

如果你想打包成可执行的应用程序，只需运行：

```bash
pnpm tauri:build
```

可执行文件将位于 `src-tauri/target/release/` 目录中，而完整的安装包则在 `src-tauri/target/release/bundle/` 目录下。

---

## 🤝 欢迎共建

Prompt Tools 是一个开放的开源项目，欢迎各种形式的贡献！如果你有任何绝妙的想法或建议，都可以通过提交 Pull Request 来参与项目共建。

1.  Fork 本项目
2.  创建您的新分支 (`git checkout -b feature/AmazingFeature`)
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4.  将分支推送到远程仓库 (`git push origin feature/AmazingFeature`)
5.  开启一个 Pull Request

## 📄 许可证

该项目采用 [MIT 许可证](LICENSE)。

---

## 写在最后

Prompt Tools 不仅仅是一个工具，更是一种高效的工作方式。它将帮助你把零散的智慧火花汇集成一座强大的、随用随取的知识库。

如果你也曾为 Prompt 管理而烦恼，那么这款免费、开源、安全的桌面工具绝对值得一试！

**[➡️ 点击这里，直达项目仓库，给作者一个 Star 吧！](https://github.com/jwangkun/Prompt-Tools)**