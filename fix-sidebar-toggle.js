/**
 * 修复侧边栏分组折叠展开问题
 * 问题：collapsed class 切换时 max-height 被 inline style 覆盖，导致无法展开
 * 修复：改用 JS 动态计算 scrollHeight 设置展开高度
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// 需要处理的目录
const dirs = ['knowledge', 'posts', 'projects'];

let fixedCount = 0;

dirs.forEach(dir => {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let html = fs.readFileSync(filePath, 'utf-8');

        if (!html.includes('sb-group-items')) return;

        // 1. 移除 sb-group-items 上的内联 max-height style（让 CSS class 控制生效）
        //    当前：<div class="sb-group-items collapsed" style="max-height:0px">
        //    或 ：<div class="sb-group-items" style="max-height:296px">
        //    改为：<div class="sb-group-items collapsed"> 或 <div class="sb-group-items">
        html = html.replace(/(<div class="sb-group-items(?: collapsed)?)\s*style="max-height:[^"]*"/g, '$1');

        // 2. 更新 CSS：collapsed 时 max-height: 0 + overflow: hidden，非 collapsed 时用一个大 max-height
        const oldCollapsedCss = `.sb-group-items { overflow: hidden; transition: max-height 0.2s ease; }
.sb-group-items.collapsed { max-height: 0 !important; }`;

        // 替换已有的 sb-group-items CSS
        html = html.replace(
            /\.sb-group-items \{ overflow: hidden; transition: max-height 0\.2s ease; \}\s*\.sb-group-items\.collapsed \{ max-height: 0 !important; \}/,
            `.sb-group-items { overflow: hidden; transition: max-height 0.25s ease; }
.sb-group-items.collapsed { max-height: 0; }`
        );

        // 3. 替换 onclick 为更可靠的 JS
        //    旧的：onclick="this.nextElementSibling.classList.toggle('collapsed');this.querySelector('.sb-collapse').classList.toggle('collapsed')"
        //    新的：用一个全局函数，计算实际 scrollHeight
        const oldOnclick = /onclick="this\.nextElementSibling\.classList\.toggle\('collapsed'\);this\.querySelector\('\.sb-collapse'\)\.classList\.toggle\('collapsed'\)"/g;
        const newOnclick = `onclick="toggleSbGroup(this)"`;

        html = html.replace(oldOnclick, newOnclick);

        // 4. 注入 toggleSbGroup 函数（在 </body> 前）
        if (!html.includes('toggleSbGroup')) {
            const toggleScript = `<script>
function toggleSbGroup(header) {
    const items = header.nextElementSibling;
    const icon = header.querySelector('.sb-collapse');
    if (items.classList.contains('collapsed')) {
        items.classList.remove('collapsed');
        items.style.maxHeight = items.scrollHeight + 'px';
        if (icon) icon.classList.remove('collapsed');
    } else {
        items.classList.add('collapsed');
        items.style.maxHeight = '0';
        if (icon) icon.classList.add('collapsed');
    }
}
// 页面加载后，给当前展开的分组设置正确的 max-height
document.querySelectorAll('.sb-group-items:not(.collapsed)').forEach(function(el) {
    el.style.maxHeight = el.scrollHeight + 'px';
});
</script>`;

            html = html.replace('</body>', toggleScript + '\n</body>');
        }

        fs.writeFileSync(filePath, html, 'utf-8');
        fixedCount++;
    });
});

console.log(`✅ 修复了 ${fixedCount} 个页面的侧边栏折叠展开问题`);
