/**
 * generate-search-index.js
 * Scans all HTML files in projects/, posts/, knowledge/ and builds
 * a search-index.json for client-side full-text search.
 *
 * Usage: node generate-search-index.js
 */

const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const dirs = ['projects', 'posts', 'knowledge'];
const outputPath = path.join(BASE, 'search-index.json');

const index = [];

function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSection(text, section) {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(section.toLowerCase());
  if (idx === -1) return '';
  // Take ~200 chars from section onward
  const start = Math.max(0, idx);
  const end = Math.min(text.length, idx + 600);
  return text.slice(start, end).trim();
}

for (const dir of dirs) {
  const dirPath = path.join(BASE, dir);
  if (!fs.existsSync(dirPath)) continue;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const text = stripHtml(raw);
    const shortText = text.slice(0, 2000);

    // Extract title from <title> or <h1>
    const titleMatch = raw.match(/<title>([^<]+)<\/title>/) || raw.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : file.replace('.html', '');

    // Try to determine category from content or directory
    let source = dir === 'projects' ? 'project' : (dir === 'posts' ? 'project' : 'knowledge');
    if (dir === 'knowledge') source = 'knowledge';

    // Try to extract tags
    const tags = [];
    const tagSection = text.match(/(?:标签|tags|keywords)[：:]\s*([^\n。.]+)/i);
    if (tagSection) {
      tagSection[1].split(/[,，、\s]+/).forEach(t => {
        const clean = t.trim();
        if (clean && clean.length < 20) tags.push(clean);
      });
    }

    // Extract a snippet from the first meaningful content area
    let snippet = '';
    const bodyMatch = text.match(/。|\./);
    if (bodyMatch) {
      const sentences = text.split(/[。.!！\n]/).filter(s => s.trim().length > 10);
      snippet = sentences.slice(0, 3).join('。').trim().slice(0, 300);
    }
    if (!snippet) snippet = shortText.slice(0, 200);

    index.push({
      title,
      url: path.posix.join(dir, file).replace(/\\/g, '/'),
      file: path.posix.join(dir, file).replace(/\\/g, '/'),
      source,
      tags: tags.length > 0 ? tags : [],
      snippet,
      text: shortText,
      // Full text for deep search (limit to 4000 chars to keep index manageable)
      body: text.slice(0, 4000)
    });
  }
}

// Also index the data in index.html's allPosts array to cross-reference
// Add a virtual entry for the homepage
index.push({
  title: 'democt 首页 — Agent 应用开发者的数字花园',
  url: 'index.html',
  file: 'index.html',
  source: 'home',
  tags: ['Agent', '首页'],
  snippet: 'Agent 应用开发者的作品集与学习笔记。包含患者智能辅助 Agent、AI 旅行规划师、企业多专家 Agent 系统等项目。',
  text: 'Agent 应用开发者的数字花园 作品集 学习笔记',
  body: ''
});

fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), 'utf8');
console.log(`✅ 生成 search-index.json (${index.length} 条索引)`);
