/**
 * 给 democt-blog 的子页面（knowledge/ 和 posts/）批量添加侧边栏
 * 侧边栏显示当前笔记同组内的其他笔记，支持快速跳转
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ===== 从 index.html 提取 allPosts 数据 =====
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');

// 提取 allPosts 数组
const allPostsMatch = indexHtml.match(/const allPosts = \[([\s\S]*?)\];/);
if (!allPostsMatch) {
    console.error('无法从 index.html 提取 allPosts 数据');
    process.exit(1);
}

// 解析每条笔记的 link, title, group, source, date, tags
const allPostsStr = allPostsMatch[1];
const posts = [];
const postRegex = /\{\s*source:\s*"([^"]+)",\s*group:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*date:\s*"([^"]+)",\s*desc:\s*"([^"]+)",\s*tags:\s*\[([^\]]*)\],\s*link:\s*"([^"]+)"\s*\}/g;
let m;
while ((m = postRegex.exec(allPostsStr)) !== null) {
    const tags = m[5].split(',').map(t => t.trim().replace(/"/g, '')).filter(Boolean);
    posts.push({
        source: m[1],
        group: m[2],
        title: m[3],
        date: m[4],
        desc: m[5],
        tags,
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

console.log(`解析到 ${posts.length} 条笔记，${Object.keys(groupMeta).length} 个分组元信息`);

// ===== 按 group 分组 =====
const groupMap = {};
posts.forEach(p => {
    if (!groupMap[p.group]) groupMap[p.group] = [];
    groupMap[p.group].push(p);
});
// 组内按日期降序
Object.values(groupMap).forEach(arr => arr.sort((a, b) => b.date.localeCompare(a.date)));

// ===== 侧边栏 CSS =====
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
.sidebar-section-title .section-icon {
    font-size: 1rem;
}
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

/* 响应式：移动端侧边栏放底部 */
@media (max-width: 900px) {
    .article-layout {
        flex-direction: column;
    }
    .article-sidebar {
        width: 100%;
        position: static;
        max-height: none;
        order: 2;
        margin-top: 32px;
    }
    .article-content {
        order: 1;
    }
}
`;

// ===== 生成侧边栏 HTML =====
function buildSidebarHtml(currentLink, currentGroup, currentSource) {
    const meta = groupMeta[currentGroup] || { icon: '📌', color: '#6366f1' };
    const groupPosts = groupMap[currentGroup] || [];

    let html = `<aside class="article-sidebar">`;

    // 返回首页
    html += `<a href="../index.html" class="sidebar-back">← 返回首页</a>`;
    html += `<div class="sidebar-divider"></div>`;

    // 当前分组标题
    html += `<div class="sidebar-section-title">`;
    html += `<span class="section-icon">${meta.icon}</span>`;
    html += `<span>${currentGroup}</span>`;
    html += `<span class="section-count">${groupPosts.length}</span>`;
    html += `</div>`;

    // 同组笔记列表
    groupPosts.forEach(p => {
        const isActive = p.link === currentLink;
        // 计算相对路径：从子页面到同组其他笔记
        const href = computeRelativePath(currentLink, p.link);
        html += `<a href="${href}" class="sidebar-note-item${isActive ? ' active' : ''}">`;
        html += escapeHtml(truncateTitle(p.title, 28));
        html += `<span class="note-date">${p.date.slice(5)}</span>`;
        html += `</a>`;
    });

    // 如果有其他相关分组（同 source），也列出
    const sameSourceGroups = Object.keys(groupMap)
        .filter(g => {
            if (g === currentGroup) return false;
            // 同 source 或相关
            const groupSource = groupMap[g][0]?.source;
            return groupSource === currentSource;
        })
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
                const href = computeRelativePath(currentLink, p.link);
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

// ===== 工具函数 =====
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function truncateTitle(title, maxLen) {
    if (title.length <= maxLen) return title;
    return title.slice(0, maxLen - 1) + '…';
}

function computeRelativePath(fromLink, toLink) {
    // fromLink: "knowledge/what-is-agent.html"
    // toLink: "knowledge/mcp-protocol.html" or "posts/query-lifecycle.html"
    // 当前页面在 knowledge/ 目录下，同级直接用文件名
    // 跨目录需要 ../posts/xxx.html

    const fromDir = path.dirname(fromLink);  // "knowledge"
    const toDir = path.dirname(toLink);       // "knowledge" or "posts"

    if (fromDir === toDir) {
        return path.basename(toLink);
    }
    // 跨目录
    return '../' + toLink;
}

// ===== 处理子页面 =====
const subDirs = ['knowledge', 'posts'];
let processedCount = 0;

subDirs.forEach(dir => {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const link = `${dir}/${file}`;  // e.g. "knowledge/what-is-agent.html"

        // 查找当前笔记在 allPosts 中的信息
        const postInfo = posts.find(p => p.link === link);
        if (!postInfo) {
            console.log(`  跳过 ${link}（未在 allPosts 中找到）`);
            return;
        }

        let html = fs.readFileSync(filePath, 'utf-8');

        // 检查是否已经有侧边栏
        if (html.includes('article-sidebar')) {
            console.log(`  跳过 ${link}（已有侧边栏）`);
            return;
        }

        // 生成侧边栏 HTML
        const sidebarHtml = buildSidebarHtml(link, postInfo.group, postInfo.source);

        // 注入 CSS
        if (!html.includes('article-layout')) {
            // 在 </head> 前注入样式
            html = html.replace('</head>', `<style>${SIDEBAR_CSS}</style>\n</head>`);
        }

        // 改造页面结构：把 article 包裹进 article-layout
        // 找到 <article> 并包裹
        const articleMatch = html.match(/(<article>[\s\S]*?<\/article>)/);
        if (articleMatch) {
            const articleContent = articleMatch[1];
            // 移除 article 标签本身，内容变成 article-content div
            const innerContent = articleContent.replace(/^<article>/, '').replace(/<\/article>$/, '');

            const newStructure = `<div class="article-layout">
${sidebarHtml}
<div class="article-content">
<article>${innerContent}</article>
</div>
</div>`;

            html = html.replace(articleMatch[0], newStructure);
        }

        // 加宽 container 的 max-width（如果用了 common.css 的 820px，需要覆盖）
        // 在 <style> 中追加
        if (!html.includes('--max-width: 1080px')) {
            html = html.replace('</style>', `.container { --max-width: 1080px; max-width: 1080px; }\n</style>`);
        }

        // 移除面包屑中的 "← 返回首页"（侧边栏已有），改为更简洁的面包屑
        html = html.replace(
            /<nav class="breadcrumb"><a href="\.\.\/index\.html">← 返回首页<\/a>\s*\/\s*([^<]*)<\/nav>/,
            '<nav class="breadcrumb"><a href="../index.html">首页</a> / $1</nav>'
        );

        fs.writeFileSync(filePath, html, 'utf-8');
        processedCount++;
        console.log(`  ✅ ${link} — 组: ${postInfo.group}`);
    });
});

// ===== 处理 projects/ 目录 =====
const projectsDir = path.join(ROOT, 'projects');
if (fs.existsSync(projectsDir)) {
    const projectFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.html'));

    // 从 index.html 的 projects 数组获取项目信息
    const projectDataMatch = indexHtml.match(/const projects = \[([\s\S]*?)\];/);
    const projectsList = [];
    if (projectDataMatch) {
        const pRegex = /\{\s*title:\s*"([^"]+)",[\s\S]*?link:\s*"([^"]+)"\s*\}/g;
        let pm;
        while ((pm = pRegex.exec(projectDataMatch[1])) !== null) {
            projectsList.push({ title: pm[1], link: pm[2] });
        }
    }

    projectFiles.forEach(file => {
        const filePath = path.join(projectsDir, file);
        const link = `projects/${file}`;

        let html = fs.readFileSync(filePath, 'utf-8');

        if (html.includes('article-sidebar')) {
            console.log(`  跳过 ${link}（已有侧边栏）`);
            return;
        }

        // 项目页侧边栏：列出所有项目
        let sidebarHtml = `<aside class="article-sidebar">`;
        sidebarHtml += `<a href="../index.html" class="sidebar-back">← 返回首页</a>`;
        sidebarHtml += `<div class="sidebar-divider"></div>`;
        sidebarHtml += `<div class="sidebar-section-title">`;
        sidebarHtml += `<span class="section-icon">🗂</span>`;
        sidebarHtml += `<span>作品集</span>`;
        sidebarHtml += `<span class="section-count">${projectsList.length}</span>`;
        sidebarHtml += `</div>`;

        projectsList.forEach(p => {
            const isActive = p.link === link;
            const href = path.basename(p.link);
            sidebarHtml += `<a href="${href}" class="sidebar-note-item${isActive ? ' active' : ''}">`;
            sidebarHtml += escapeHtml(truncateTitle(p.title, 28));
            sidebarHtml += `</a>`;
        });

        sidebarHtml += `</aside>`;

        // 注入 CSS
        if (!html.includes('article-layout')) {
            html = html.replace('</head>', `<style>${SIDEBAR_CSS}</style>\n</head>`);
        }

        // 改造结构
        const articleMatch = html.match(/(<article>[\s\S]*?<\/article>)/);
        if (articleMatch) {
            const articleContent = articleMatch[1];
            const innerContent = articleContent.replace(/^<article>/, '').replace(/<\/article>$/, '');

            const newStructure = `<div class="article-layout">
${sidebarHtml}
<div class="article-content">
<article>${innerContent}</article>
</div>
</div>`;

            html = html.replace(articleMatch[0], newStructure);
        }

        if (!html.includes('--max-width: 1080px')) {
            html = html.replace('</style>', `.container { --max-width: 1080px; max-width: 1080px; }\n</style>`);
        }

        html = html.replace(
            /<nav class="breadcrumb"><a href="\.\.\/index\.html">← 返回首页<\/a>\s*\/\s*([^<]*)<\/nav>/,
            '<nav class="breadcrumb"><a href="../index.html">首页</a> / $1</nav>'
        );

        fs.writeFileSync(filePath, html, 'utf-8');
        processedCount++;
        console.log(`  ✅ ${link} — 项目页`);
    });
}

console.log(`\n🎉 完成！共处理 ${processedCount} 个子页面`);
