/**
 * 补充处理：给未收录在 allPosts 中的子页面也加上侧边栏
 * 根据文件名关键词推断分组
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// 未收录页面 → 手动分组映射
const orphanMapping = {
    'astro5-migration-guide': { group: '前端工程', icon: '🎨', color: '#ff6b6b' },
    'content-classification-design': { group: '架构与协议', icon: '🔌', color: '#00b894' },
    'frontend-state-bug-patterns': { group: '前端工程', icon: '🎨', color: '#ff6b6b' },
    'git-bash-windows-fix': { group: '开发环境', icon: '🛠', color: '#636e72' },
    'openclaw-skill-architecture': { group: 'Skill 开发', icon: '⚡', color: '#6c5ce7' },
    'powershell-scripting-guide': { group: '开发环境', icon: '🛠', color: '#636e72' },
    'rag-query-rewriting': { group: 'RAG 与检索', icon: '🔍', color: '#e67e22' },
    'react-loop-agent-control': { group: 'Agent 基础', icon: '🤖', color: '#9b59b6' },
    'search-architecture-selection': { group: 'RAG 与检索', icon: '🔍', color: '#e67e22' },
    'static-site-search-design': { group: '前端工程', icon: '🎨', color: '#ff6b6b' },
    'token-optimization-guide': { group: 'LLM 深入', icon: '🧠', color: '#e84393' },
    'tool-system-design-patterns': { group: '提示词与工具', icon: '💬', color: '#1abc9c' },
    'vercel-deployment-guide': { group: '前端工程', icon: '🎨', color: '#ff6b6b' },
    'xbrowser-cdp-debugging': { group: '开发环境', icon: '🛠', color: '#636e72' },
};

// 已收录的页面（已有侧边栏，但同组内可以包含这些遗漏页面）
// 从 index.html 的 allPosts 重建分组
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
const allPostsMatch = indexHtml.match(/const allPosts = \[([\s\S]*?)\];/);
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

// 提取 groupMeta
const groupMetaMatch = indexHtml.match(/const groupMeta = \{([\s\S]*?)\};/);
const groupMeta = {};
if (groupMetaMatch) {
    const gmRegex = /"([^"]+)":\s*\{\s*order:\s*(\d+),\s*icon:\s*"([^"]*)",\s*color:\s*"([^"]*)"/g;
    let gm;
    while ((gm = gmRegex.exec(groupMetaMatch[1])) !== null) {
        groupMeta[gm[1]] = { order: parseInt(gm[2]), icon: gm[3], color: gm[4] };
    }
}

// 按组分组
const groupMap = {};
posts.forEach(p => {
    if (!groupMap[p.group]) groupMap[p.group] = [];
    groupMap[p.group].push(p);
});
Object.values(groupMap).forEach(arr => arr.sort((a, b) => b.date.localeCompare(a.date)));

// 侧边栏 CSS（和主脚本一致）
const SIDEBAR_CSS = `
/* ===== 文章侧边栏 ===== */
.article-layout {
    display: flex;
    gap: 32px;
    align-items: flex-start;
}
.article-sidebar {
    width: 220px;
    flex-shrink: 0;
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 0;
}
.sidebar-section-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--text);
    padding: 4px 16px 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.sidebar-section-title .section-icon { font-size: 1rem; }
.sidebar-section-title .section-count {
    font-weight: 400;
    font-size: 0.75rem;
    color: var(--text-muted);
    background: var(--tag-bg);
    padding: 0 7px;
    border-radius: 10px;
    margin-left: auto;
}
.sidebar-note-item {
    display: block;
    padding: 7px 16px 7px 24px;
    font-size: 0.84rem;
    color: var(--text-muted);
    line-height: 1.45;
    transition: all 0.15s ease;
    border-left: 3px solid transparent;
    cursor: pointer;
}
.sidebar-note-item:hover {
    color: var(--text);
    background: var(--accent-soft);
}
.sidebar-note-item.active {
    color: var(--accent);
    background: var(--accent-soft);
    border-left-color: var(--accent);
    font-weight: 600;
}
.sidebar-note-item .note-date {
    font-size: 0.72rem;
    color: var(--text-muted);
    opacity: 0.7;
    margin-left: 6px;
}
.sidebar-divider {
    height: 1px;
    background: var(--border);
    margin: 8px 16px;
}
.sidebar-back {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--accent);
    cursor: pointer;
    transition: background 0.15s;
}
.sidebar-back:hover {
    background: var(--accent-soft);
}
.article-content {
    flex: 1;
    min-width: 0;
}
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

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function truncateTitle(title, maxLen) {
    if (title.length <= maxLen) return title;
    return title.slice(0, maxLen - 1) + '…';
}

function buildOrphanSidebarHtml(fileName, groupInfo) {
    const meta = groupMeta[groupInfo.group] || { icon: groupInfo.icon, color: groupInfo.color };
    const groupPosts = groupMap[groupInfo.group] || [];

    let html = `<aside class="article-sidebar">`;
    html += `<a href="../index.html" class="sidebar-back">← 返回首页</a>`;
    html += `<div class="sidebar-divider"></div>`;

    // 当前分组
    html += `<div class="sidebar-section-title">`;
    html += `<span class="section-icon">${meta.icon || groupInfo.icon}</span>`;
    html += `<span>${groupInfo.group}</span>`;
    html += `<span class="section-count">${groupPosts.length + 1}</span>`;
    html += `</div>`;

    // 当前页面（高亮）
    html += `<div class="sidebar-note-item active">${fileName.replace(/-/g, ' ')}<span class="note-date">—</span></div>`;

    // 同组其他笔记
    groupPosts.forEach(p => {
        const href = p.link.replace('knowledge/', '').replace('posts/', '');
        html += `<a href="${href}" class="sidebar-note-item">`;
        html += escapeHtml(truncateTitle(p.title, 28));
        html += `<span class="note-date">${p.date.slice(5)}</span>`;
        html += `</a>`;
    });

    // 同 source 的其他分组
    const currentSource = groupPosts[0]?.source || 'knowledge';
    const sameSourceGroups = Object.keys(groupMap)
        .filter(g => g !== groupInfo.group && groupMap[g][0]?.source === currentSource)
        .sort((a, b) => (groupMeta[a]?.order ?? 99) - (groupMeta[b]?.order ?? 99));

    if (sameSourceGroups.length > 0) {
        html += `<div class="sidebar-divider"></div>`;
        sameSourceGroups.forEach(g => {
            const gm = groupMeta[g] || { icon: '📌', color: '#6366f1' };
            const gPosts = groupMap[g];
            html += `<div class="sidebar-section-title">`;
            html += `<span class="section-icon">${gm.icon}</span>`;
            html += `<span>${g}</span>`;
            html += `<span class="section-count">${gPosts.length}</span>`;
            html += `</div>`;
            gPosts.slice(0, 5).forEach(p => {
                const href = p.link.replace('knowledge/', '').replace('posts/', '');
                html += `<a href="${href}" class="sidebar-note-item">`;
                html += escapeHtml(truncateTitle(p.title, 28));
                html += `<span class="note-date">${p.date.slice(5)}</span>`;
                html += `</a>`;
            });
            if (gPosts.length > 5) {
                html += `<div class="sidebar-note-item" style="font-size:0.78rem;opacity:0.6;cursor:default;padding-left:24px;">还有 ${gPosts.length - 5} 篇...</div>`;
            }
        });
    }

    html += `</aside>`;
    return html;
}

// 处理每个遗漏页面
let processedCount = 0;

Object.entries(orphanMapping).forEach(([fileName, groupInfo]) => {
    const filePath = path.join(ROOT, 'knowledge', `${fileName}.html`);

    if (!fs.existsSync(filePath)) {
        console.log(`  跳过 ${fileName}（文件不存在）`);
        return;
    }

    let html = fs.readFileSync(filePath, 'utf-8');

    // 检查是否已有侧边栏
    if (html.includes('article-sidebar')) {
        console.log(`  跳过 ${fileName}（已有侧边栏）`);
        return;
    }

    const sidebarHtml = buildOrphanSidebarHtml(fileName, groupInfo);

    // 注入 CSS
    if (!html.includes('article-layout')) {
        html = html.replace('</head>', `<style>${SIDEBAR_CSS}</style>\n</head>`);
    }

    // 改造结构
    const articleMatch = html.match(/(<article>[\s\S]*?<\/article>)/);
    if (articleMatch) {
        const innerContent = articleMatch[1].replace(/^<article>/, '').replace(/<\/article>$/, '');
        const newStructure = `<div class="article-layout">
${sidebarHtml}
<div class="article-content">
<article>${innerContent}</article>
</div>
</div>`;
        html = html.replace(articleMatch[0], newStructure);
    }

    // 加宽 container
    if (!html.includes('--max-width: 1080px')) {
        html = html.replace('</style>', `.container { --max-width: 1080px; max-width: 1080px; }\n</style>`);
    }

    // 简化面包屑
    html = html.replace(
        /<nav class="breadcrumb"><a href="\.\.\/index\.html">← 返回首页<\/a>\s*\/\s*([^<]*)<\/nav>/,
        '<nav class="breadcrumb"><a href="../index.html">首页</a> / $1</nav>'
    );

    fs.writeFileSync(filePath, html, 'utf-8');
    processedCount++;
    console.log(`  ✅ knowledge/${fileName}.html — 组: ${groupInfo.group}`);
});

console.log(`\n🎉 补充完成！共处理 ${processedCount} 个遗漏页面`);
