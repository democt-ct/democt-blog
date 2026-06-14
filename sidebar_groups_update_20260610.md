# 侧边栏分组列表 & 排序优化

**时间**: 2026-06-10 22:40

## 背景
用户反馈侧边栏没有更新（仍显示旧标签列表），且要求知识笔记在上、项目笔记在下。

## 改动

### 侧边栏重构
- `activeFilter` 扩展为 `{ source, group, tag }`，新增 `group` 维度筛选
- `buildSidebar()` 重写：每个 source 下显示分组列表（含图标+计数）而不是标签
- 分组按 `groupMeta.order` 排序输出
- 点击分组项 → 设置 `activeFilter.group` → 重新渲染花园
- 点击「全部」→ 清除 group 筛选
- 知识笔记（📚）在侧边栏上方，项目笔记（📝）在下方

### renderGarden 更新
- 新增 `activeFilter.group` 筛选逻辑
- 筛选分组时，内容区域仍保留分组 header 展示

### CSS 补充
- `.sidebar-item.group-item` + `.group-item-icon` 样式
- 保持移动端响应式兼容

### 部署
- Git commit `53bc292`
- Vercel 已推送到 `https://313070.xyz`
