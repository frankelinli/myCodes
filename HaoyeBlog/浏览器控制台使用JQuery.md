---
title: 浏览器控制台使用JQuery
slug: 浏览器控制台使用JQuery
categories:
  - notes
tags: []
---



我在浏览器的调试端窗口可以使用jquery来测试某一个网站吗？

完全可以！你在浏览器的 **开发者工具（DevTools）控制台）** 就可以直接运行 jQuery 来测试网页，但有几个前提条件和注意事项。下面我详细说明。

------

### 1️⃣ 前提条件：网页是否加载了 jQuery

- **网页已经引入 jQuery**

  - 在控制台直接使用 `$()` 或 `jQuery()` 就可以操作页面元素。

  - 例子：

    ```
    $('p').css('color', 'red'); // 所有 <p> 文字变红
    ```

- **网页没有引入 jQuery**

  - 你需要先临时在控制台加载 jQuery。

  - 方法：

    ```js
    var script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.6.4.min.js"; // 最新稳定版本
    script.onload = function() {
        console.log('jQuery loaded:', $.fn.jquery);
    };
    document.head.appendChild(script);
    ```

  - 加载完成后，就可以直接用 `$()` 或 `jQuery()` 操作网页了。

总结：
 ✅ **控制台可以直接测试 jQuery，只要网页本身有 jQuery 或你手动引入即可。**
 ✅ **可以操作元素、修改样式、模拟事件，非常适合调试和实验。**

---

太好了，我帮你整理了一个 **完整的 50+ jQuery 控制台测试合集**，按照 **入门 → 中级 → 高级** 分级，让你在浏览器控制台里直接复制、粘贴、测试，非常适合学习和体验。

------

# **🟢 入门篇（基础选择器 & 样式修改）**

```
// 1. 改变所有段落文字颜色
$('p').css('color', 'red');

// 2. 改变 id="btn" 背景颜色
$('#btn').css('background', 'yellow');

// 3. 隐藏 class="menu"
$('.menu').hide();

// 4. 显示所有 div
$('div').show();

// 5. 修改所有标题字体
$('h1,h2,h3').css('font-family','Arial');

// 6. 第一个 li 加粗
$('li:first').css('font-weight','bold');

// 7. 最后一个 li 文字变绿
$('li:last').css('color','green');

// 8. 所有 a 标签新窗口打开
$('a').attr('target','_blank');

// 9. 所有图片 alt 属性修改
$('img').attr('alt','测试图片');

// 10. 所有 div 添加边框
$('div').css('border','1px solid #333');
```

------

# **🟡 中级篇（DOM 增删 & 事件操作）**

```
// 11. 尾部添加 div
$('body').append('<div class="test">测试div</div>');

// 12. 开头添加 div
$('body').prepend('<div class="test2">开头div</div>');

// 13. 删除指定 div
$('.test').remove();

// 14. 清空指定 div 内容
$('.test2').empty();

// 15. 第二个 li 后插入新 li
$('li').eq(1).after('<li>插入li</li>');

// 16. 第一个 li 前插入新 li
$('li').eq(0).before('<li>前面插入li</li>');

// 17. 按钮点击触发事件
$('#btn').click();

// 18. 给按钮绑定点击事件
$('#btn').on('click', ()=>alert('点击了'));

// 19. 鼠标移入段落变蓝，移出变黑
$('p').hover(
    ()=>$(this).css('color','blue'),
    ()=>$(this).css('color','black')
);

// 20. 输入框聚焦打印信息
$('input').focus(()=>console.log('聚焦了'));
$('input').blur(()=>console.log('失焦了'));
```

------

# **🟠 动画效果篇**

```
// 21. 段落渐隐 1 秒
$('p').fadeOut(1000);

// 22. 段落渐显 1 秒
$('p').fadeIn(1000);

// 23. div 上滑隐藏
$('div').slideUp(500);

// 24. div 下滑显示
$('div').slideDown(500);

// 25. div 上下滑切换
$('div').slideToggle(500);

// 26. div 动画改变尺寸
$('div').animate({width:'300px',height:'100px'},1000);

// 27. div 淡入淡出循环
$('div').fadeOut(500).fadeIn(500);

// 28. 段落逐个淡入
$('p').each((i,el)=>$(el).delay(i*200).fadeIn(500));
```

------

# **🔵 遍历 & 过滤篇**

```
// 29. 遍历 li 输出序号和文字
$('li').each((i,el)=>console.log(i, $(el).text()));

// 30. 文字含“测试”的段落变橙色
$('p').filter(':contains("测试")').css('color','orange');

// 31. 除了 keep class 的 div 隐藏
$('div').not('.keep').hide();

// 32. 第三个 li 背景粉色
$('li').eq(2).css('background','pink');

// 33. 偶数 li 背景 #eee
$('ul li:even').css('background','#eee');

// 34. 奇数 li 背景 #ccc
$('ul li:odd').css('background','#ccc');

// 35. 包含“测试”的 div 添加红色边框
$('div:contains("测试")').css('border','1px solid red');
```

------

# **🟣 表单操作篇**

```
// 36. 设置 input 值
$('input').val('Hello');

// 37. 获取 input 值
console.log($('input').val());

// 38. 设置 select 选项
$('select').val('option2');

// 39. 选中所有 checkbox
$('input[type=checkbox]').prop('checked', true);

// 40. 取消所有 radio 选择
$('input[type=radio]').prop('checked', false);

// 41. 清空输入框
$('input').val('');

// 42. 聚焦第一个 input
$('input').first().focus();
```

------

# **⚪ 类 & 属性操作篇**

```
// 43. 添加 class
$('p').addClass('highlight');

// 44. 移除 class
$('p').removeClass('highlight');

// 45. 切换 class
$('p').toggleClass('highlight');

// 46. 改图片 src
$('img').attr('src','https://via.placeholder.com/100');

// 47. 改图片 title
$('img').prop('title','提示信息');

// 48. 隐藏带 class test 的元素
$('.test').hide();

// 49. 改 div 内容为粗体文字
$('div').html('<b>加粗文字</b>');

// 50. 在段落前追加文字
$('p').prepend('<i>开头追加</i>');

// 51. 在段落后追加文字
$('p').append(' <i>尾部追加</i>');
```

------

# **🔥 综合练习篇（50+ 实用组合）**

```
// 52. 遍历 div 并加边框和序号
$('div').each((i,el)=>{
    $(el).css('border','1px dashed green').append('<span>序号'+i+'</span>');
});

// 53. 按钮点击切换段落显示
$('button').on('click', ()=>{
    $('p').fadeToggle(500);
});

// 54. li hover 高亮
$('ul li').hover(
    function(){ $(this).css('background','yellow'); },
    function(){ $(this).css('background',''); }
);

// 55. 动态添加按钮点击事件
$('body').append('<button id="btn2">点击我</button>');
$('#btn2').click(()=>alert('新按钮被点击！'));
```

------

💡 **使用方法**

1. 打开任意网页 → 开发者工具 → Console（控制台）。
2. 粘贴一条或多条代码，按回车。
3. 观察页面变化，尝试修改参数、选择器和样式。
4. 你会发现 **jQuery 的选择器 + 方法组合非常强大**。
