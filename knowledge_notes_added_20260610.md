# 2026-06-10: 新增「知识笔记」板块

## 目标
在博客中新增一个独立的知识笔记板块，内容来源于网上的资料/教程/书籍等外部学习沉淀，与项目实战笔记区分开。

## 操作

### 1. 创建知识笔记目录
- 新建 `knowledge/` 目录，存放知识笔记 HTML

### 2. 写入 12 篇知识笔记
| 主题 | 覆盖内容 |
|------|---------|
| 什么是 Agent | 定义、与 LLM 的区别、核心能力、四种架构模式 |
| 提示词工程进阶 | 黄金结构、CoT、Few-shot、结构化输出、系统化管理 |
| RAG 架构深度解析 | 三代演进（朴素→进阶→模块化）、检索策略、分块方案 |
| Embedding 模型选型 | OpenAI/BGE/E5/M3E/text2vec 对比、维度选择 |
| 向量数据库对比 | Chroma/Qdrant/Milvus/Weaviate/Pinecone/PGVector 全对比 |
| Function Calling 原理 | 底层机制、JSON Schema、并行调用、常见陷阱 |
| MCP 协议解析 | Host-Client-Server 架构、Tools/Resources/Prompts/Sampling |
| LLM 幻觉缓解 | 五类幻觉类型、五种缓解策略 |
| AI 应用可观测性 | 四层体系（Tracing/评估/监控/调试）、工具选型 |
| Agent 安全红宝书 | 五大攻击面、注入防护、JWT 双 Token、六大设计原则 |
| 任务规划模式 | Andon/ReAct/Pipeline/Plan-then-Execute/Dynamic + DAG |
| Agent 记忆系统设计 | 四层记忆模型、窗口截断/结构化/摘要滚动/分层检索 |

### 3. 更新 index.html
- 导航栏新增「知识笔记」链接
- 首页新增知识笔记区块（位于项目笔记下方）
- 新增 `knowledgePosts` 数据数组和 `renderKnowledge()` 渲染函数
- 新增 `.section-sub` CSS 样式（各板块副标题）

## 成果
- 博客现分为三大板块：**作品集（3 个）** / **项目笔记（18 篇）** / **知识笔记（12 篇）**
- 知识笔记涵盖 Agent 开发全链路的基础知识体系
- 所有笔记可独立阅读，HTML 链接相互连通
