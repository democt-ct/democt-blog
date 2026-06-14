# 博客搭建：democt 个人主页 (v2)

## 操作
- 在 `D:\zhuomian\QClaw\democt-blog\` 搭建了 "democt" 个人博客/作品集页面
- 从 `D:\zhuomian\agent\Agent-1/2/3` 的 docs 提取内容填充
- 所有卡片已改为可点击链接，指向独立详情页

## 三个项目
| 项目 | 目录 | 核心 |
|------|------|------|
| 患者智能辅助 Agent | Agent-1 | FastAPI + MCP + 四层记忆 + 混合RAG + 安全机制 |
| AI 旅行规划师 | Agent-2 | FastAPI + 高德POI + 路径规划 + 地点清洗 |
| 企业多专家 Agent 系统 | Agent-3 | 自研ReAct + Chroma/BM25 + Skills层 + 审批/工单FSM |

## 博客结构
```
democt-blog/
├── index.html                    ← 首页（10篇笔记 + 3个项目，全部可点击）
├── assets/common.css
├── projects/
│   ├── patient-agent.html/md     ← 含四层记忆架构图 + 三层安全防线设计
│   ├── travel-planner.html/md    ← 含 POI 解析 Pipeline + 地点清洗规则
│   └── enterprise-agent-system.html/md ← 含架构分层图 + 路由流程 + Handoff 机制
└── posts/ (10篇)
    ├── skills-layer-design.html        # Skills 层设计思维
    ├── ticket-fsm-approval-engine.html # 工单状态机 + 审批引擎
    ├── hybrid-rag-practice.html        # 混合检索实践
    ├── patient-allergy-safety.html     # 过敏安全机制
    ├── amap-poi-pipeline.html          # 高德 POI 接入
    ├── agent-security-practice.html    # 安全优化清单
    ├── tool-calling-best-practices.html
    ├── agent-design-patterns.html
    ├── langgraph-state-management.html
    └── self-react-vs-langgraph.html
```
