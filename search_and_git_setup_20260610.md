# democt-blog 搜索功能 & Git 初始化

**时间**: 2026-06-10 22:30

## 目标
为 democt-blog（https://313070.xyz）添加：
1. 站内全站搜索功能（跨所有笔记正文）
2. Git 初始化并配置 Vercel 自动部署基础设施

## 实现方案

### 搜索功能
- **Fuse.js**（v7.0.0, CDN 加载）：客户端模糊搜索，支持拼写容错、权重排序、相近词匹配
- **search-index.json**：`generate-search-index.js` 自动生成，扫描 projects/posts/knowledge 下所有 HTML，剥离标签提取纯文本
- **搜索权重**：title(3) > tags(2) > snippet(1.5) > text(1) > body(0.8)，threshold=0.45
- **降级方案**：search-index.json 加载失败时退回到 JS 内联数据（allPosts）的元数据搜索
- **搜索栏**：圆形胶囊居中 + 聚焦光晕动画，结果区带徽标 + 关键词高亮
- **交互**：搜索时隐藏作品集/花园区域，ESC 清除，✕ 按钮清除

### Git
- **仓库**: democt-blog.git（local, master）
- **排除**: add-domain.js, get-vercel-token.js, *.md（保留 README.md）
- **Commit**: v1.0，40 files, 3764 insertions

### Vercel 部署
- 重新部署成功，7s 构建完成
- 自动绑定 `https://313070.xyz`
- `vercel.json` 清理弃用字段（name, public → 移除）

## 文件
- `D:\zhuomian\QClaw\democt-blog\generate-search-index.js` — 搜索索引生成脚本
- `D:\zhuomian\QClaw\democt-blog\search-index.json` — 生成的索引（34 条）
- `D:\zhuomian\QClaw\democt-blog\.gitignore` — 忽略规则
