---
title: "企业多专家 Agent 系统"
tech: ["Python", "ReAct", "Chroma", "BM25", "DeepSeek", "FastAPI", "SSE"]
date: 2026-05
dir: Agent-3
---

## 项目定位

基于自研 ReAct 引擎 + Orchestrator 调度的多专家 RAG Agent 系统。3 个领域专家（HR / IT / 法务）各自拥有独立知识库和工具集，支持跨域串行编排。

## 核心能力

- **多专家架构**：HR Agent（人事制度/考勤/薪酬）、IT Agent（设备/网络/工单）、法务 Agent（合规/合同/数据保护）
- **三级路由引擎**：寒暄识别 → 关键词匹配 → LLM 路由 → 兜底 fallback
- **自研 ReAct 循环**：不依赖 LangGraph / CrewAI / AutoGen
- **混合检索**：Chroma 向量召回 + BM25 关键词检索 + RRF 融合 + BGE Reranker 重排序
- **跨域 Handoff**：支持 Agent 间串行上下文交割
- **SSE 实时推送**：前端流式展示 Agent 思考过程
- **操作卡片渲染**：对话驱动的交互组件（工单、审批、设备报修等）

## 技术栈

| 组件 | 技术 |
|------|------|
| Agent 框架 | 自研 ReAct + Orchestrator |
| LLM | DeepSeek / SenseNova (OpenAI 兼容) |
| 向量库 | Chroma (PersistentClient) |
| 关键词检索 | BM25 (rank-bm25 + jieba) |
| 融合策略 | RRF (k=60) |
| 重排序 | BAAI/bge-reranker-base |
| 分块 | RecursiveCharacterTextSplitter |
| API 框架 | FastAPI + SSE |
| 前端 | 纯 HTML/CSS/JS |
| 项目配置 | Poetry |

## 项目目录

`D:\zhuomian\agent\Agent-3`
