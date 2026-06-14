---
title: "LangGraph 状态管理深入理解"
date: 2026-06-05
tags: ["LangGraph", "Python", "状态管理"]
---

LangGraph 的状态管理是其核心设计，理解以下几个概念对写复杂 Agent 很重要：

## State 的类型

- **TypedDict State** — 最常用，类型安全
- **Dataclass State** — 适合复杂状态
- **Pydantic State** — 带验证

## Reducer 机制

LangGraph 通过 reducer 处理节点间的状态冲突。默认是覆盖（override），但可以自定义：

```python
def custom_reducer(a, b):
    return {**a, **b}
```

## 持久化

用 Checkpointer 实现状态持久化，支持断点续跑和人工干预。
