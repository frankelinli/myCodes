/**
 * AI 摘要生成模块
 * 提供文章摘要的自动生成和插入功能
 */

import fs from 'fs';

/**
 * 调用 DeepSeek API 生成文章摘要
 * @param {string} content - 文章内容
 * @returns {Promise<string|null>} 生成的摘要或null
 */
export async function generateSummary(content) {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  if (!DEEPSEEK_API_KEY) {
    console.warn('[WARN] 未配置 DEEPSEEK_API_KEY，跳过摘要生成');
    return null;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的文章摘要生成助手。请为用户提供的文章生成简洁的摘要，字数控制在120字以内。'
          },
          {
            role: 'user',
            content: `请为以下文章生成120字以内的摘要：\n\n${content.slice(0, 3000)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[WARN] DeepSeek API 调用失败: ${response.status} ${errorText}`);
      return null;
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();
    
    if (process.env.DEBUG_PUBLISH) {
      console.log('[DEBUG] 生成摘要:', summary);
    }
    
    return summary;
  } catch (error) {
    console.warn('[WARN] 生成摘要失败:', error.message);
    return null;
  }
}

/**
 * 将摘要插入到 Markdown 文件中（frontmatter 之后的第一行）
 * @param {string} mdPath - Markdown 文件路径
 * @param {string} summary - 要插入的摘要
 */
export async function insertSummaryToMarkdown(mdPath, summary) {
  if (!summary) return;

  try {
    const raw = fs.readFileSync(mdPath, 'utf8');
    
    // 匹配 frontmatter
    const frontmatterMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    if (!frontmatterMatch) {
      console.warn('[WARN] 未找到 frontmatter，跳过摘要插入');
      return;
    }

    const frontmatterEnd = frontmatterMatch[0].length;
    const afterFrontmatter = raw.slice(frontmatterEnd);
    
    // 检查是否已经有摘要了（避免重复插入）
    const lines = afterFrontmatter.split(/\r?\n/);
    const firstNonEmptyLineIndex = lines.findIndex(line => line.trim().length > 0);
    
    if (firstNonEmptyLineIndex >= 0) {
      const firstLine = lines[firstNonEmptyLineIndex].trim();
      // 如果第一行看起来像是摘要（长度合理且包含中文字符），跳过插入
      if (firstLine.length > 30 && firstLine.length < 300 && /[\u4e00-\u9fa5]/.test(firstLine)) {
        if (process.env.DEBUG_PUBLISH) {
          console.log('[DEBUG] 检测到可能已存在摘要，跳过插入');
        }
        return;
      }
    }
    
    // 在 frontmatter 后插入摘要
    const newContent = raw.slice(0, frontmatterEnd) + 
                       '\n' + summary + '\n\n' +
                       afterFrontmatter.replace(/^\s*/, ''); // 移除开头的空白

    fs.writeFileSync(mdPath, newContent, 'utf8');
    if (process.env.DEBUG_PUBLISH) {
      console.log('[DEBUG] 已将摘要插入到 Markdown 文件');
    }
  } catch (error) {
    console.warn('[WARN] 插入摘要失败:', error.message);
  }
}

/**
 * 处理文章摘要生成的完整流程
 * @param {string} mdPath - Markdown 文件路径
 * @param {string} content - 文章内容
 * @returns {Promise<boolean>} 是否成功处理
 */
export async function processSummary(mdPath, content) {
  try {
    const summary = await generateSummary(content);
    if (summary) {
      await insertSummaryToMarkdown(mdPath, summary);
      if (process.env.DEBUG_PUBLISH) {
        console.log('[DEBUG] 摘要生成并插入成功');
      }
      return true;
    }
    return false;
  } catch (error) {
    console.warn('[WARN] 摘要生成过程失败:', error.message);
    return false;
  }
}