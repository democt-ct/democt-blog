# 模型信息修正记录

## 时间
2026-06-10

## 原因
博客中患者智能辅助 Agent 的模型描述使用了被注释掉的旧配置（本地 Ollama + Qwen2.5-14b），与实际运行的 API 配置不符。

## 实际配置（从配置文件核实）

| 项目 | 文本模型 | 图片模型 | 来源 |
|---|---|---|---|
| Agent-1（患者助手） | DeepSeek V4 Flash（API） | Qwen3-VL-30B-A3B-Instruct（ModelScope API） | `local_settings.py` |
| Agent-2（旅行规划师） | DeepSeek-V3.2（ModelScope API） | — | `fastapi/.env` |
| Agent-3（企业系统） | DeepSeek V4 Flash（API） | — | `.env` |

## 修正文件
- `projects/patient-agent.html` — 技术标签 + 模型表
- `projects/patient-agent.md` — Markdown 源文件
- `index.html` — 项目卡片 tech 数组
- `projects/travel-planner.html` — 模型表补充具体模型名
