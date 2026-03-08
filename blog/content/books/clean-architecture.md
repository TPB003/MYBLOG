---
id: book-clean-architecture
slug: clean-architecture
title_zh: Clean Architecture
title_en: Clean Architecture
author_zh: Robert C. Martin
author_en: Robert C. Martin
summary_zh: 让我持续提醒自己：代码首先是长期协作文档，而不是一次性交付产物。
summary_en: A constant reminder that code is a long-term collaboration medium, not a one-time delivery.
cover: https://picsum.photos/seed/clean-architecture/600/840
updated: 2026-03-08
reading_zh: 9 分钟阅读
reading_en: 9 min read
---

# 读完之后我做的第一个改变

我停止在业务层直接依赖框架接口，先定义边界，再决定实现细节。

## 关键收获

- 依赖方向必须朝向稳定抽象
- 用例优先于技术选型
- 分层不是为了“看起来规范”，而是为了降低未来迁移成本

## 在个人项目里的落地

我把页面逻辑拆成 `core / data / features` 后，新增功能和重构都变得更可控。

<!-- EN -->

# The first change I made after reading it

I stopped coupling business logic to framework APIs directly. I define boundaries first, then implementations.

## Key takeaways

- Dependencies should point to stable abstractions
- Use-cases come before tooling preferences
- Layering is mainly for future migration safety

## What changed in this project

After splitting logic into `core / data / features`, both new features and refactors became much safer.
