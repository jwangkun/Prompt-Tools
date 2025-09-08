#!/usr/bin/env node

/**
 * Prompt Tools 更新功能测试脚本
 * 用于验证自动更新配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 Prompt Tools 更新配置...\n');

// 检查必要文件是否存在
const requiredFiles = [
  '.github/workflows/publish.yml',
  'src-tauri/tauri.conf.json',
  'src/updater.ts',
  'src/styles/updater.css'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 缺失`);
    allFilesExist = false;
  }
});

console.log('\n📋 检查配置内容...\n');

// 检查 Tauri 配置
try {
  const tauriConfig = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
  
  if (tauriConfig.updater) {
    console.log('✅ Tauri 更新器配置 - 已启用');
    console.log(`   - 活跃状态: ${tauriConfig.updater.active}`);
    console.log(`   - 端点数量: ${tauriConfig.updater.endpoints?.length || 0}`);
    console.log(`   - 对话框: ${tauriConfig.updater.dialog}`);
  } else {
    console.log('❌ Tauri 更新器配置 - 未找到');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ Tauri 配置文件读取失败:', error.message);
  allFilesExist = false;
}

// 检查 package.json 依赖
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@tauri-apps/plugin-updater',
    '@tauri-apps/plugin-process'
  ];
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ 依赖 ${dep} - 已安装 (${dependencies[dep]})`);
    } else {
      console.log(`❌ 依赖 ${dep} - 未安装`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ package.json 读取失败:', error.message);
  allFilesExist = false;
}

// 检查 Cargo.toml 依赖
try {
  const cargoToml = fs.readFileSync('src-tauri/Cargo.toml', 'utf8');
  
  if (cargoToml.includes('tauri-plugin-updater')) {
    console.log('✅ Rust 更新器依赖 - 已配置');
  } else {
    console.log('❌ Rust 更新器依赖 - 未配置');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ Cargo.toml 读取失败:', error.message);
  allFilesExist = false;
}

console.log('\n📝 需要配置的 GitHub Secrets:\n');
console.log('   UPGRADE_LINK_ACCESS_KEY - UpgradeLink 访问密钥');
console.log('   UPGRADE_LINK_TAURI_KEY - UpgradeLink 应用标识');
console.log('   TAURI_SIGNING_PRIVATE_KEY - Tauri 签名私钥 (可选)');
console.log('   TAURI_SIGNING_PRIVATE_KEY_PASSWORD - 签名密钥密码 (可选)');

console.log('\n🎯 下一步操作:\n');
console.log('1. 在 UpgradeLink 平台创建应用并获取密钥');
console.log('2. 在 GitHub 仓库设置中配置 Secrets');
console.log('3. 更新版本号并推送到 main 分支');
console.log('4. 观察 GitHub Actions 构建过程');
console.log('5. 测试应用的自动更新功能');

if (allFilesExist) {
  console.log('\n🎉 配置检查完成！所有必要文件和配置都已就绪。');
  process.exit(0);
} else {
  console.log('\n⚠️  配置检查发现问题，请修复后重新运行测试。');
  process.exit(1);
}