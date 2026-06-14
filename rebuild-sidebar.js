/**
 * 重构子页面侧边栏：两层结构
 * 上层：分组导航（当前分组展开，点击可折叠切换）
 * 下层：当前文章 h2/h3 目录（TOC 锚点跳转）
 * 
 * 同时修复：
 * - "返回首页"链接带锚点定位（#garden）
 * - 首页侧边栏点击分组时，滚动到对应位置
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ===== 从 index.html 提取数据 =====
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');

const allPostsMatch = indexHtml.match(/const allPosts = \[([\s\S]*?)\];/);
if (!allPostsMatch) { console.error('无法提取 allPosts'); process.exit(1); }

const posts = [];
const postRegex = /\{\s*source:\s*"([^"]+)",\s*group:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*date:\s*"([^"]+)",\s*desc:\s*"([^"]+)",\s*tags:\s*\[([^\]]*)\],\s*link:\s*"([^"]+)"\s*\}/g;
let m;
while ((m = postRegex.exec(allPostsMatch[1])) !== null) {
    posts.push({
        source: m[1], group: m[2], title: m[3], date: m[4],
        tags: m[5].split(',').map(t => t.trim().replace(/"/g, '')).filter(Boolean),
        link: m[7]
    });
}

// groupMeta
const groupMetaMatch = indexHtml.match(/const groupMeta = \{([\s\S]*?)\};/);
const groupMeta = {};
if (groupMetaMatch) {
    const gmRegex = /"([^"]+)":\s*\{\s*order:\s*(\d+),\s*icon:\s*"([^"]*)",\s*color:\s*"([^"]*)"/g;
    let gm;
    while ((gm = gmRegex.exec(groupMetaMatch[1])) !== null) {
        groupMeta[gm[1]] = { order: parseInt(gm[2]), icon: gm[3], color: gm[4] };
    }
}

// 按 group 分组
const groupMap = {};
posts.forEach(p => {
    if (!groupMap[p.group]) groupMap[p.group] = [];
    groupMap[p.group].push(p);
});
Object.values(groupMap).forEach(arr => arr.sort((a, b) => b.date.localeCompare(a.date)));

// 未收录页面的分组映射
const orphanMapping = {
    'astro5-migration-guide': { group: '前端工程', source: 'knowledge' },
    'content-classification-design': { group: '架构与协议', source: 'knowledge' },
    'frontend-state-bug-patterns': { group: '前端工程', source: 'knowledge' },
    'git-bash-windows-fix': { group: '开发环境', source: 'knowledge' },
    'openclaw-skill-architecture': { group: 'Skill 开发', source: 'knowledge' },
    'powershell-scripting-guide': { group: '开发环境', source: 'knowledge' },
    'rag-query-rewriting': { group: 'RAG 与检索', source: 'knowledge' },
    'react-loop-agent-control': { group: 'Agent 基础', source: 'knowledge' },
    'search-architecture-selection': { group: 'RAG 与检索', source: 'knowledge' },
    'static-site-search-design': { group: '前端工程', source: 'knowledge' },
    'token-optimization-guide': { group: 'LLM 深入', source: 'knowledge' },
    'tool-system-design-patterns': { group: '提示词与工具', source: 'knowledge' },
    'vercel-deployment-guide': { group: '前端工程', source: 'knowledge' },
    'xbrowser-cdp-debugging': { group: '开发环境', source: 'knowledge' },
};

// 补全 groupMeta 缺失的分组
const extraGroups = {
    '前端工程': { order: 50, icon: '🎨', color: '#ff6b6b' },
    '开发环境': { order: 51, icon: '🛠', color: '#636e72' },
};
Object.entries(extraGroups).forEach(([k, v]) => {
    if (!groupMeta[k]) groupMeta[k] = v;
});

console.log(`解析到 ${posts.length} 条笔记，${Object.keys(groupMeta).length} 个分组`);

// ===== 侧边栏 CSS =====
const SIDEBAR_CSS = `
/* ===== 文章侧边栏（两层结构） ===== */
.article-layout {
    display: flex;
    gap: 32px;
    align-items: flex-start;
}
.article-sidebar {
    width: 240px;
    flex-shrink: 0;
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
}
.article-sidebar::-webkit-scrollbar { width: 4px; }
.article-sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

/* 返回首页 */
.sb-back {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--accent);
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
}
.sb-back:hover { background: var(--accent-soft); }

/* 分组导航区 */
.sb-groups { border-bottom: 1px solid var(--border); }

.sb-group-header {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px 4px;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text);
    cursor: pointer;
    user-select: none;
    transition: color 0.15s;
}
.sb-group-header:hover { color: var(--accent); }
.sb-group-header .sb-collapse {
    font-size: 0.55rem;
    color: var(--text-muted);
    transition: transform 0.2s;
    width: 12px;
    flex-shrink: 0;
}
.sb-group-header .sb-collapse.collapsed { transform: rotate(-90deg); }
.sb-group-header .sb-gcount {
    margin-left: auto;
    font-size: 0.72rem;
    font-weight: 400;
    color: var(--text-muted);
    background: var(--tag-bg);
    padding: 0 6px;
    border-radius: 10px;
}

.sb-group-items { overflow: hidden; transition: max-height 0.2s ease; }
.sb-group-items.collapsed { max-height: 0 !important; }

.sb-note-link {
    display: flex;
    align-items: baseline;
    gap: 4px;
    padding: 5px 14px 5px 24px;
    font-size: 0.82rem;
    color: var(--text-muted);
    line-height: 1.4;
    transition: all 0.12s;
    border-left: 3px solid transparent;
}
.sb-note-link:hover {
    color: var(--text);
    background: var(--accent-soft);
}
.sb-note-link.active {
    color: var(--accent);
    background: var(--accent-soft);
    border-left-color: var(--accent);
    font-weight: 600;
}
.sb-note-link .sb-ndate {
    font-size: 0.68rem;
    opacity: 0.6;
    white-space: nowrap;
    margin-left: auto;
    flex-shrink: 0;
}

/* 文章目录区 */
.sb-toc {
    padding: 8px 0 12px;
}
.sb-toc-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text);
    padding: 4px 16px 8px;
    display: flex;
    align-items: center;
    gap: 5px;
}
.sb-toc-link {
    display: block;
    padding: 3px 16px 3px 24px;
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.45;
    transition: all 0.12s;
    border-left: 2px solid transparent;
}
.sb-toc-link:hover {
    color: var(--accent);
    background: var(--accent-soft);
}
.sb-toc-link.h3 {
    padding-left: 36px;
    font-size: 0.76rem;
}

.article-content {
    flex: 1;
    min-width: 0;
}

/* 响应式 */
@media (max-width: 900px) {
    .article-layout { flex-direction: column; }
    .article-sidebar {
        width: 100%;
        position: static;
        max-height: none;
        order: 2;
        margin-top: 32px;
    }
    .article-content { order: 1; }
}
`;

// ===== 生成侧边栏 HTML =====
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function truncate(t, n) {
    return t.length <= n ? t : t.slice(0, n - 1) + '…';
}
function relPath(fromLink, toLink) {
    const fromDir = path.dirname(fromLink);
    const toDir = path.dirname(toLink);
    if (fromDir === toDir) return path.basename(toLink);
    return '../' + toLink;
}

function buildSidebarHtml(currentLink, currentGroup, currentSource, tocItems) {
    const meta = groupMeta[currentGroup] || { icon: '📌', color: '#6366f1' };
    const groupPosts = groupMap[currentGroup] || [];

    // 收集同 source 的所有分组
    const allGroups = Object.keys(groupMap)
        .filter(g => groupMap[g][0]?.source === currentSource)
        .sort((a, b) => (groupMeta[a]?.order ?? 99) - (groupMeta[b]?.order ?? 99));

    let html = `<aside class="article-sidebar">`;

    // 返回首页 — 带锚点定位到知识花园
    html += `<a href="../index.html#garden" class="sb-back">← 返回首页</a>`;

    // ===== 分组导航 =====
    html += `<div class="sb-groups">`;

    allGroups.forEach(g => {
        const gm = groupMeta[g] || { icon: '📌', color: '#6366f1' };
        const gPosts = groupMap[g];
        const isCurrent = g === currentGroup;

        // 分组标题
        html += `<div class="sb-group-header" onclick="this.nextElementSibling.classList.toggle('collapsed');this.querySelector('.sb-collapse').classList.toggle('collapsed')">`;
        html += `<span class="sb-collapse${isCurrent ? '' : ' collapsed'}">▼</span>`;
        html += `<span>${gm.icon} ${g}</span>`;
        html += `<span class="sb-gcount">${gPosts.length}</span>`;
        html += `</div>`;

        // 笔记列表（当前分组展开，其他折叠）
        const maxH = gPosts.length * 32 + 8;
        html += `<div class="sb-group-items${isCurrent ? '' : ' collapsed'}" style="max-height:${isCurrent ? maxH : 0}px">`;

        gPosts.forEach(p => {
            const isActive = p.link === currentLink;
            const href = relPath(currentLink, p.link);
            html += `<a href="${href}" class="sb-note-link${isActive ? ' active' : ''}">`;
            html += `<span>${escapeHtml(truncate(p.title, 24))}</span>`;
            html += `<span class="sb-ndate">${p.date.slice(5)}</span>`;
            html += `</a>`;
        });

        html += `</div>`;
    });

    html += `</div>`;

    // ===== 文章目录 (TOC) =====
    if (tocItems.length > 0) {
        html += `<div class="sb-toc">`;
        html += `<div class="sb-toc-title">📑 本页目录</div>`;
        tocItems.forEach(item => {
            html += `<a href="#${item.id}" class="sb-toc-link${item.level === 3 ? ' h3' : ''}">${escapeHtml(item.text)}</a>`;
        });
        html += `</div>`;
    }

    html += `</aside>`;
    return html;
}

// ===== 从 HTML 中提取 h2/h3 标题生成 TOC =====
function extractToc(html) {
    const toc = [];
    const headingRegex = /<(h[23])[^>]*>(.*?)<\/\1>/gi;
    let match;
    let h2Count = 0;
    let h3Count = 0;

    while ((match = headingRegex.exec(html)) !== null) {
        const tag = match[1]; // h2 or h3
        const text = match[2].replace(/<[^>]+>/g, '').trim(); // 去掉内部标签
        if (!text) continue;

        const id = tag === 'h2' ? `section-${h2Count++}` : `subsection-${h3Count++}`;
        toc.push({ level: parseInt(tag[1]), text, id });
    }

    return toc;
}

// ===== 给 h2/h3 添加 id 锚点 =====
function addHeadingIds(html, tocItems) {
    let h2Idx = 0, h3Idx = 0;
    return html.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
        const plainText = content.replace(/<[^>]+>/g, '').trim();
        const tocItem = tocItems.find(t => t.text === plainText);
        if (!tocItem) return match;
        return `<${tag}${attrs} id="${tocItem.id}">${content}</${tag}>`;
    });
}

// ===== 处理子页面 =====
const subDirs = ['knowledge', 'posts'];
let processedCount = 0;
let totalTocItems = 0;

subDirs.forEach(dir => {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const link = `${dir}/${file}`;

        // 查找笔记信息
        let postInfo = posts.find(p => p.link === link);
        let currentGroup, currentSource;

        if (postInfo) {
            currentGroup = postInfo.group;
            currentSource = postInfo.source;
        } else if (orphanMapping[file.replace('.html', '')]) {
            const mapping = orphanMapping[file.replace('.html', '')];
            currentGroup = mapping.group;
            currentSource = mapping.source;
        } else {
            console.log(`  跳过 ${link}（无法确定分组）`);
            return;
        }

        let html = fs.readFileSync(filePath, 'utf-8');

        // 提取 TOC（在改造结构之前）
        // 先拿到 article 内的内容
        const articleMatch = html.match(/<article>([\s\S]*?)<\/article>/);
        if (!articleMatch) {
            console.log(`  跳过 ${link}（无 article 标签）`);
            return;
        }

        const tocItems = extractToc(articleMatch[1]);
        totalTocItems += tocItems.length;

        // 给标题加 id
        html = addHeadingIds(html, tocItems);

        // 移除已有的旧侧边栏结构（如果存在）
        // 情况1: 已有 article-layout 结构
        html = html.replace(/<div class="article-layout">[\s\S]*?<aside class="article-sidebar">[\s\S]*?<\/aside>\s*<div class="article-content">\s*<article>/, '<article>');
        html = html.replace(/<\/article>\s*<\/div>\s*<\/div>/, '</article>');

        // 情况2: 旧的侧边栏样式
        html = html.replace(/<style>[\s\S]*?\/\* ===== 文章侧边栏[\s\S]*?<\/style>/, '');

        // 移除旧的内联容器宽度覆盖
        html = html.replace(/\.container\s*\{\s*--max-width:\s*1080px;\s*max-width:\s*1080px;\s*\}\s*/g, '');

        // 注入新的 CSS
        html = html.replace('</head>', `<style>${SIDEBAR_CSS}\n.container { --max-width: 1100px; max-width: 1100px; }\n</style>\n</head>`);

        // 生成侧边栏
        const sidebarHtml = buildSidebarHtml(link, currentGroup, currentSource, tocItems);

        // 包裹 article 到新结构
        const newArticleMatch = html.match(/(<article>[\s\S]*?<\/article>)/);
        if (newArticleMatch) {
            const innerContent = newArticleMatch[1];
            const newStructure = `<div class="article-layout">\n${sidebarHtml}\n<div class="article-content">\n${innerContent}\n</div>\n</div>`;
            html = html.replace(newArticleMatch[0], newStructure);
        }

        // 简化面包屑
        html = html.replace(
            /<nav class="breadcrumb"><a href="\.\.\/index\.html">← 返回首页<\/a>\s*\/\s*([^<]*)<\/nav>/,
            '<nav class="breadcrumb"><a href="../index.html#garden">首页</a> / $1</nav>'
        );

        fs.writeFileSync(filePath, html, 'utf-8');
        processedCount++;
        console.log(`  ✅ ${link} — 组: ${currentGroup}，目录 ${tocItems.length} 项`);
    });
});

// ===== 处理 projects/ 目录 =====
const projectsDir = path.join(ROOT, 'projects');
if (fs.existsSync(projectsDir)) {
    const projectDataMatch = indexHtml.match(/const projects = \[([\s\S]*?)\];/);
    const projectsList = [];
    if (projectDataMatch) {
        const pRegex = /\{\s*title:\s*"([^"]+)",[\s\S]*?link:\s*"([^"]+)"\s*\}/g;
        let pm;
        while ((pm = pRegex.exec(projectDataMatch[1])) !== null) {
            projectsList.push({ title: pm[1], link: pm[2] });
        }
    }

    const projectFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.html'));

    projectFiles.forEach(file => {
        const filePath = path.join(projectsDir, file);
        const link = `projects/${file}`;

        let html = fs.readFileSync(filePath, 'utf-8');

        const articleMatch = html.match(/<article>([\s\S]*?)<\/article>/);
        if (!articleMatch) return;

        const tocItems = extractToc(articleMatch[1]);
        totalTocItems += tocItems.length;
        html = addHeadingIds(html, tocItems);

        // 移除旧结构
        html = html.replace(/<div class="article-layout">[\s\S]*?<aside class="article-sidebar">[\s\S]*?<\/aside>\s*<div class="article-content">\s*<article>/, '<article>');
        html = html.replace(/<\/article>\s*<\/div>\s*<\/div>/, '</article>');
        html = html.replace(/<style>[\s\S]*?\/\* ===== 文章侧边栏[\s\S]*?<\/style>/, '');
        html = html.replace(/\.container\s*\{\s*--max-width:\s*1080px;\s*max-width:\s*1080px;\s*\}\s*/g, '');

        html = html.replace('</head>', `<style>${SIDEBAR_CSS}\n.container { --max-width: 1100px; max-width: 1100px; }\n</style>\n</head>`);

        // 项目页侧边栏
        let sidebarHtml = `<aside class="article-sidebar">`;
        sidebarHtml += `<a href="../index.html#projects" class="sb-back">← 返回首页</a>`;
        sidebarHtml += `<div class="sb-groups">`;
        sidebarHtml += `<div class="sb-group-header" onclick="this.nextElementSibling.classList.toggle('collapsed');this.querySelector('.sb-collapse').classList.toggle('collapsed')">`;
        sidebarHtml += `<span class="sb-collapse">▼</span>`;
        sidebarHtml += `<span>🗂 作品集</span>`;
        sidebarHtml += `<span class="sb-gcount">${projectsList.length}</span>`;
        sidebarHtml += `</div>`;
        const maxH = projectsList.length * 32 + 8;
        sidebarHtml += `<div class="sb-group-items" style="max-height:${maxH}px">`;
        projectsList.forEach(p => {
            const isActive = p.link === link;
            const href = path.basename(p.link);
            sidebarHtml += `<a href="${href}" class="sb-note-link${isActive ? ' active' : ''}">`;
            sidebarHtml += `<span>${escapeHtml(truncate(p.title, 24))}</span>`;
            sidebarHtml += `</a>`;
        });
        sidebarHtml += `</div></div>`;

        if (tocItems.length > 0) {
            sidebarHtml += `<div class="sb-toc">`;
            sidebarHtml += `<div class="sb-toc-title">📑 本页目录</div>`;
            tocItems.forEach(item => {
                sidebarHtml += `<a href="#${item.id}" class="sb-toc-link${item.level === 3 ? ' h3' : ''}">${escapeHtml(item.text)}</a>`;
            });
            sidebarHtml += `</div>`;
        }

        sidebarHtml += `</aside>`;

        const newArticleMatch = html.match(/(<article>[\s\S]*?<\/article>)/);
        if (newArticleMatch) {
            const newStructure = `<div class="article-layout">\n${sidebarHtml}\n<div class="article-content">\n${newArticleMatch[1]}\n</div>\n</div>`;
            html = html.replace(newArticleMatch[0], newStructure);
        }

        html = html.replace(
            /<nav class="breadcrumb"><a href="\.\.\/index\.html">← 返回首页<\/a>\s*\/\s*([^<]*)<\/nav>/,
            '<nav class="breadcrumb"><a href="../index.html#projects">首页</a> / $1</nav>'
        );

        fs.writeFileSync(filePath, html, 'utf-8');
        processedCount++;
        console.log(`  ✅ ${link} — 项目页，目录 ${tocItems.length} 项`);
    });
}

console.log(`\n🎉 完成！共处理 ${processedCount} 个子页面，生成 ${totalTocItems} 个目录项`);
