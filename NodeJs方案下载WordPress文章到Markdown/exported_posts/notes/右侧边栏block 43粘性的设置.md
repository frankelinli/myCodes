---
id: 23
title: 右侧边栏block 43粘性的设置
slug: '%e5%8f%b3%e4%be%a7%e8%be%b9%e6%a0%8fblock-43%e7%b2%98%e6%80%a7%e7%9a%84%e8%ae%be%e7%bd%ae'
date: '2025-04-17T01:02:20'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e5%8f%b3%e4%be%a7%e8%be%b9%e6%a0%8fblock-43%e7%b2%98%e6%80%a7%e7%9a%84%e8%ae%be%e7%bd%ae/
---

要实现当滚动到 block-43 时才启用 sticky 效果，如果要使用纯CSS实现，可以利用CSS的position: sticky和父元素的特性。以下是修改后的CSS：

亲测可用；非常完美。

“\`css\
.sidebar-main {\
position: relative;\
height: 100%;\
}

# block-46 {

position: relative;\
}

# block-43 {

position: sticky;\
top: 40px;\
max-height: calc(100vh – 40px);\
overflow-y: auto;\
padding: 10px;\
font-size: 0.9rem;\
border-left: 1px solid #dddddd;\
}

# toc {

margin: 0;\
padding: 0;\
list-style-type: none;\
}\
“\`

为何要父元素也一起设置？为父元素设置定位有两个重要原因：

`css
.sidebar-main {
position: relative; /* 创建定位上下文 */
height: 100%; /* 确保有足够高度让子元素滚动 */
}`

1. 创建定位上下文：

2. position: sticky 的元素需要参照最近的具有滚动机制的祖先元素

3. 设置父元素 position: relative 可以创建一个新的定位上下文

4. 这样 sticky 元素就会在这个父容器内滚动，而不是相对于视口或其他容器

5. 确保滚动空间：

6. 如果父元素没有足够的高度，sticky 元素可能无法正常工作

7. 设置 height: 100% 确保父容器有足够的高度来容纳滚动内容

如果不设置父元素的这些属性，sticky 效果可能会：\
– 无法找到正确的滚动参照物\
– 在错误的位置停止粘附\
– 完全不起作用

此方法为纯CSS。记得Astra设置里不要开启“启用置顶侧边栏”，否则与代码的CSS方案，就冲突了。

![image-20241220232139172](https://docu-1319658309.cos.ap-guangzhou.myqcloud.com/image-20241220232139172.png)
