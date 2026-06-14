---
title: "Agent 应用的几种设计模式"
date: 2026-06-08
tags: ["Agent", "架构设计", "最佳实践"]
---

在实际开发 Agent 应用的过程中，总结了几个常见的设计模式：

## 1. ReAct Loop

Thought → Action → Observation 循环。适合单步工具调用场景。

## 2. Plan-then-Execute

先规划再执行，适合复杂任务拆解。用 LLM 生成执行计划，再用专门执行器逐个步骤完成。

## 3. Multi-Agent Debate

多个 Agent 各扮演不同角色，通过辩论达成共识。适合需要多角度分析的决策场景。

## 4. Supervisor + Workers

一个 Supervisor Agent 调度多个 Worker Agent，适合流水线式任务处理。
