// Inject progress tracking into all knowledge/*.html files
const fs = require('fs');
const path = require('path');

const knowledgeDir = path.join(__dirname, 'knowledge');

// Get all HTML files
const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.html'));

// Note ID = filename without extension
function getNoteId(filename) {
    return filename.replace('.html', '');
}

// Progress script to inject before </body>
function getProgressScript(noteId) {
    return `
<script src="../js/progress.js"></script>
<script>
(function() {
    const NOTE_ID = '${noteId}';
    // Auto-mark as read after 5 seconds on page
    setTimeout(function() {
        if (ProgressTracker.isLoggedIn()) {
            if (!ProgressTracker.isRead(NOTE_ID)) {
                ProgressTracker.markRead(NOTE_ID);
            }
        }
    }, 5000);
})();
</script>`;
}

// CSS for read status indicator
const readBadgeCSS = `
<style>
.read-status-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #e2e8f0;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    z-index: 50;
    font-size: 0.88rem;
}
.read-status-bar .rs-btn {
    padding: 6px 18px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #fff;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.15s;
}
.read-status-bar .rs-btn:hover { border-color: #5b6abf; color: #5b6abf; }
.read-status-bar .rs-btn.rs-read { background: #5b6abf; color: #fff; border-color: #5b6abf; }
</style>`;

// Bottom bar HTML
function getReadBarHTML(noteId) {
    return `
<div class="read-status-bar" id="readStatusBar">
    <span id="readStatusText">未标记</span>
    <button class="rs-btn" id="readStatusBtn" onclick="toggleRead()">标记为已读</button>
</div>`;
}

// Bottom bar script
const readBarScript = `
<script>
const NOTE_ID_CURRENT = window.__NOTE_ID__ || '';
function toggleRead() {
    if (!ProgressTracker.isLoggedIn()) {
        alert('请先登录以同步学习进度');
        return;
    }
    if (ProgressTracker.isRead(NOTE_ID_CURRENT)) {
        ProgressTracker.markUnread(NOTE_ID_CURRENT);
    } else {
        ProgressTracker.markRead(NOTE_ID_CURRENT);
    }
    updateReadBar();
}
function updateReadBar() {
    const btn = document.getElementById('readStatusBtn');
    const text = document.getElementById('readStatusText');
    if (!btn || !text) return;
    const isRead = ProgressTracker.isRead(NOTE_ID_CURRENT);
    btn.textContent = isRead ? '取消已读' : '标记为已读';
    btn.className = 'rs-btn' + (isRead ? ' rs-read' : '');
    text.textContent = isRead ? '已读' : '未标记';
}
updateReadBar();
</script>`;

let processed = 0;
let skipped = 0;

files.forEach(file => {
    const filePath = path.join(knowledgeDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const noteId = getNoteId(file);
    
    // Skip if already injected
    if (content.includes('ProgressTracker') || content.includes('progress.js')) {
        skipped++;
        return;
    }
    
    // Add __NOTE_ID__ variable
    const noteIdScript = `<script>window.__NOTE_ID__ = '${noteId}';</script>`;
    
    // Inject CSS before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', readBadgeCSS + '\n</head>');
    }
    
    // Inject read bar before </body> (or at the end)
    if (content.includes('</body>')) {
        content = content.replace('</body>', 
            getReadBarHTML(noteId) + '\n' + 
            noteIdScript + '\n' +
            getProgressScript(noteId) + '\n' +
            readBarScript + '\n' +
            '</body>'
        );
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    processed++;
});

console.log(`Processed: ${processed}, Skipped (already had progress): ${skipped}`);
