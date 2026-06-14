---
title: "Tool Calling 实践中的几个坑"
date: 2026-05-28
tags: ["LLM", "Tool Use", "经验"]
---

在 Agent 应用中，Tool Calling 是核心能力。实践中踩过的几个坑：

## 1. 参数幻觉

LLM 有时候会造出 API 规范里不存在的参数。解决方案：用 JSON Schema 严格约束，并在 tool 调用前做参数校验。

## 2. 并行调用超载

部分模型支持并行 tool call，但大量并行可能导致上下文爆炸。建议限制单轮最大 tool call 数量。

## 3. 循环陷阱

Agent 可能在同一个 tool 上反复循环。引入「去重缓存」和「最大重试次数」来兜底。

## 4. 错误恢复

Tool 失败后的恢复策略很重要，推荐 ReAct 式的 self-correct 模式。
