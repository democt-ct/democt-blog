/**
 * 注入 toggleSbGroup JS 函数到所有子页面
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const dirs = ['knowledge', 'posts', 'projects'];

const TOGGLE_SCRIPT = `<script>
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
document.querySelectorAll('.sb-group-items:not(.collapsed)').forEach(function(el) {
    el.style.maxHeight = el.scrollHeight + 'px';
});
</script>`;

let fixed = 0;

dirs.forEach(dir => {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) return;
    fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).forEach(file => {
        const fp = path.join(dirPath, file);
        let html = fs.readFileSync(fp, 'utf-8');
        
        // 已经有脚本了，跳过
        if (html.includes('function toggleSbGroup')) return;
        
        // 注入到 </body> 前
        html = html.replace('</body>', TOGGLE_SCRIPT + '\n</body>');
        fs.writeFileSync(fp, html, 'utf-8');
        fixed++;
    });
});

console.log(`✅ 注入了 ${fixed} 个页面的 toggleSbGroup 函数`);
