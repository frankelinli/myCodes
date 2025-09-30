# Markdown 渲染演示

> 本页用于测试：目录（TOC）、SEO 元数据、GFM（表格/任务列表）、代码高亮、链接锚点等。

## 链接与段落

- 普通文本与一个[链接](https://example.com)
- 自动为标题生成 slug 和锚点（在标题右侧会有 `#`）

## GFM 表格

| 语言 | 类型 | 备注 |
| --- | --- | --- |
| JavaScript | 动态 | 前端/Node.js |
| TypeScript | 静态 | JS 的超集 |
| Python | 动态 | 数据科学/后端 |

## 任务列表

- [x] TOC 目录
- [x] GFM 支持
- [x] 代码高亮
- [ ] 更多扩展插件

## 代码高亮

```js
// 一个示例函数
function greet(name) {
  const msg = `Hello, ${name}!`;
  console.log(msg);
  return msg;
}

greet('世界');
```

```python
def fib(n):
    a, b = 0, 1
    while a < n:
        print(a)
        a, b = b, a + b

fib(50)
```

## 更深的标题层级

### 小节 A

#### 小节 A-1

##### 小节 A-1-1

## 结束

感谢试用！
