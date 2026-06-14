/**
 * 精确修复 v2：移除所有 sb-group-items 上的内联 max-height style
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const dirs = ['knowledge', 'posts', 'projects'];
let fixed = 0;

dirs.forEach(dir => {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) return;
    fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).forEach(file => {
        const fp = path.join(dirPath, file);
        let html = fs.readFileSync(fp, 'utf-8');
        if (!html.includes('sb-group-items')) return;

        const before = html;
        // 匹配各种情况：
        // <div class="sb-group-items" style="max-height:296px">
        // <div class="sb-group-items collapsed" style="max-height:0px">
        html = html.replace(/(<div class="sb-group-items[^"]*")\s+style="max-height:\d+px"/g, '$1');

        if (html !== before) {
            fs.writeFileSync(fp, html, 'utf-8');
            fixed++;
        }
    });
});

console.log(`✅ 清理了 ${fixed} 个页面的内联 max-height`);
