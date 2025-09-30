#!/usr/bin/env node
/**
 * 极简批量发布 - 基于时间戳
 * 
 * 逻辑：
 * 1. 读取 .last-publish-time 文件的时间戳
 * 2. 找出该时间之后修改的所有 Markdown 文件
 * 3. 发布这些文件
 * 4. 成功后更新时间戳为当前时间
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { publishFile } from './publish.js';

const TIMESTAMP_FILE = '.last-publish-time';

function getLastTime() {
  try {
    const content = fs.readFileSync(TIMESTAMP_FILE, 'utf8').trim();
    // 支持两种格式：ISO时间字符串或时间戳数字
    if (content.includes('T') || content.includes('-')) {
      // 将读取的时间当作北京时间处理
      const time = new Date(content + '+08:00'); // 明确指定为北京时区
      return time.getTime();
    } else {
      return parseInt(content) || 0;
    }
  } catch {
    return 0; // 首次运行
  }
}

function saveCurrentTime() {
  // 保存为北京时间格式（UTC+8）
  const now = new Date();
  const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 加8小时
  const isoString = beijingTime.toISOString().slice(0, 16); // 精确到分钟: 2025-09-21T16:00
  fs.writeFileSync(TIMESTAMP_FILE, isoString);
}

function findMarkdownFiles(dir) {
  const files = [];
  function scan(currentDir) {
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const item of items) {
        if (item.name.startsWith('.')) continue;
        const fullPath = path.join(currentDir, item.name);
        if (item.isDirectory()) {
          scan(fullPath);
        } else if (item.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      console.warn('跳过目录:', currentDir);
    }
  }
  scan(dir);
  return files;
}

function getFileTime(filePath) {
  try {
    const stats = fs.statSync(filePath);
    // 取修改时间和创建时间的较新者
    return Math.max(stats.mtime.getTime(), stats.birthtime.getTime());
  } catch {
    return 0;
  }
}

function isValidMarkdown(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.trim().startsWith('---'); // 有 front matter
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const forceAll = args.includes('--all');
  
  if (args.includes('--help')) {
    console.log(`极简批量处理工具:
  node batch_publish.js           # 处理新修改的文章（创建新文章或更新现有文章）
  node batch_publish.js --all     # 处理所有文章  
  node batch_publish.js --dry-run # 预览模式
  
原理: 基于 .last-publish-time 文件记录的时间戳`);
    return;
  }
  
  const lastTime = forceAll ? 0 : getLastTime();
  
  if (lastTime === 0) {
    console.log('首次运行或强制模式，检查所有文章');
  } else {
    console.log(`检查 ${new Date(lastTime).toLocaleString()} 之后修改的文章`);
  }
  
  // 扫描文件
  const allFiles = findMarkdownFiles('posts');
  const newFiles = [];
  
  for (const file of allFiles) {
    if (!isValidMarkdown(file)) {
      console.warn('跳过无效文件:', path.relative('posts', file));
      continue;
    }
    
    const fileTime = getFileTime(file);
    if (fileTime > lastTime) {
      newFiles.push({
        path: file,
        relativePath: path.relative('posts', file),
        time: new Date(fileTime).toLocaleString()
      });
    }
  }
  
  console.log(`\n扫描结果: ${allFiles.length} 个文件，${newFiles.length} 个需要处理`);
  
  if (newFiles.length === 0) {
    console.log('没有需要处理的文章');
    return;
  }
  
  // 显示待处理列表
  console.log('\n待处理文章:');
  newFiles.forEach((file, i) => {
    console.log(`${i + 1}. ${file.relativePath} (${file.time})`);
  });
  
  if (dryRun) {
    console.log('\n--dry-run 模式，未实际处理');
    return;
  }
  
  // 开始处理
  console.log('\n开始处理文章...');
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < newFiles.length; i++) {
    const file = newFiles[i];
    console.log(`\n[${i + 1}/${newFiles.length}] 处理中: ${file.relativePath}`);
    
    try {
      await publishFile(file.path);
      success++;
    } catch (error) {
      console.error('处理失败:', error.message);
      failed++;
    }
    
    // 简单延迟避免API限制
    if (i < newFiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n处理完成: 成功 ${success}，失败 ${failed}`);
  
  // 只有全部成功才更新时间戳
  if (failed === 0) {
    saveCurrentTime();
    console.log('已更新时间戳');
  } else {
    console.log('因为有失败的处理，时间戳未更新（下次会重试失败的文章）');
  }
}

main().catch(console.error);