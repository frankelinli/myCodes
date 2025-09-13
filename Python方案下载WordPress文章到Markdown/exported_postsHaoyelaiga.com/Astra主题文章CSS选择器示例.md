---
author: haoye
categories:
- 随记
date: '2025-04-17T01:13:34'
id: 47
tags: []
title: Astra主题文章CSS选择器示例
---

`.entry-content h2`、`.entry-content h3` 和 `.entry-content h4` 是 CSS 选择器，通常用于
WordPress 或其他内容管理系统中，专门为文章或页面的主要内容区域中的标题进行样式设计。以下是每个选择器的简要介绍：

  1. **`.entry-content h2`** :  
- 该选择器用于选择所有位于 `.entry-content` 类中的 `<h2>` 标题标签。  
- 通常用于为文章或页面内容中的二级标题应用特定样式（如字体大小、颜色、边距等）。

这些选择器的使用是为了确保网站内容中的标题在展示时保持一致性。通过专门选择 `.entry-content`
类中的标题，这些样式仅应用于主要内容区域，而不会影响网站其他部分的标题。

`.entry-content h2` 并不是严格意义上的父子关系，而是**后代选择器** 的关系。

  * **`.entry-content h2`** 选择器的意思是：选择位于 `.entry-content` 元素内的所有 `<h2>` 标签。

也就是说，`.entry-content` 是一个包含其他元素的容器，`<h2>` 标签是该容器内的一个子元素，或者更确切地说是**后代元素** 。无论
`<h2>` 是 `.entry-content` 的直接子元素（父子关系），还是更深层次的嵌套元素，这个选择器都会生效。

**例子：**

    
    
    <div class="entry-content">
        <h2>这是一个二级标题</h2>
        <div>
            <h2>这是另一个二级标题</h2>
        </div>
    </div>
    

在上面的例子中，无论 `<h2>` 是直接在 `.entry-content` 里面，还是在 `.entry-content`
的某个子元素里面，这个选择器都会对它们应用相同的样式。

如果你想只选择 `.entry-content` 的直接子元素中的 `<h2>`，则需要使用子选择器（`>`），如下所示：

    
    
    .entry-content > h2 {
        /* 仅应用于直接子元素中的 <h2> */
    }
    

这个选择器只会应用于 `.entry-content` 的直接子元素中的 `<h2>`，而不会影响嵌套更深的 `<h2>`。

