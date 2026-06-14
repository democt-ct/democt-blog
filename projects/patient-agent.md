---
title: "患者智能辅助 Agent"
tech: ["Python", "FastAPI", "MCP", "ChromaDB", "RAG", "DeepSeek API"]
date: 2026-05
dir: Agent-1
---

## 项目定位

患者侧智能辅助 Agent 原型系统，覆盖诊前、诊中、诊后场景。

## 核心能力

- **数据层**：患者主档、病历、就诊记录的存储与查询
- **MCP 工具层**：自研 MCP Server，暴露身份验证、病历查询、就诊记录等工具
- **记忆系统**：四层架构
  - 事实层：患者主档、病历、关键事件
  - 短期工作记忆：当前意图、主题、目标
  - 长期摘要记忆：用户画像、业务画像、偏好
  - 知识记忆：知识块切片 + ChromaDB 向量召回
- **混合 RAG**：向量召回 + 关键词补召回 + 元数据过滤 + 排序融合
- **图文问答**：支持图片理解能力
- **语音播报**：Kokoro TTS

## 技术栈

| 组件 | 技术 |
|------|------|
| 后端框架 | FastAPI |
| 数据库 | SQLite + SQLAlchemy |
| 向量库 | ChromaDB |
| 向量模型 | BAAI/bge-small-zh-v1.5 |
| 文本模型 | DeepSeek V4 Flash（API） |
| 图片模型 | Qwen3-VL-30B-A3B-Instruct（API） |
| 工具层 | 自研 MCP Server |
| 前端 | 单页测试页面 |

## 项目目录

`D:\zhuomian\agent\Agent-1`
