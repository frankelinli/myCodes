---
id: 1140
title: Python 虚拟环境（virtual environment）
slug: Python 虚拟环境（virtual environment）
categories:
  - notes
tags: []
---

python虚拟环境是什么？有什么用处？

**Python 虚拟环境（virtual environment）= 给每个项目单独准备的一套 Python + 依赖库的“隔离小房间”**。

项目之间**互不打扰、互不打架**。

------

## 先说「不用虚拟环境会怎样」

假设你电脑上只有 **一套 Python 环境**：

- 你做项目 A
  - 需要 `Django 2.2`
- 你做项目 B
  - 需要 `Django 4.2`

你执行：

```
pip install django
```

问题来了：

- 安装 4.2 → 项目 A 可能直接崩
- 降级到 2.2 → 项目 B 又炸

这就叫：
👉 **依赖地狱（dependency hell）**

------

## 虚拟环境是怎么解决的？

### 核心思想

> **每个项目，用自己的 Python 环境**

比如：

```
project_a/
  venv/
project_b/
  venv/
```

- project_a 的 venv：
  - Python 3.8
  - Django 2.2
- project_b 的 venv：
  - Python 3.11
  - Django 4.2

它们**完全隔离**，互不影响。

------

## 虚拟环境里“到底隔离了什么”？

主要三样：

1. **pip 安装的第三方库**
   - requests
   - numpy
   - django
2. **Python 可执行路径**
3. **依赖版本**

不隔离的是：

- 操作系统
- 你的代码文件本身

------

## 一个形象但不太严谨的比喻 😄

- **系统 Python**：
  公共食堂
- **虚拟环境**：
  自己租的小厨房

你爱放辣、放糖、重口味——
都不影响别人。

------

## 最常见的虚拟环境工具（你大概率见过）

### 1️⃣ venv（官方内置，最常用）
