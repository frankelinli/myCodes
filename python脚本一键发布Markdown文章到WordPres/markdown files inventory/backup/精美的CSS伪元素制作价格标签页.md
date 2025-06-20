这里是一个实用的价格卡片设计示例，包含多个精美的伪元素效果。价格标签是伪元素应用的经典案例。

![image-20241223124218808](https://docu-1319658309.cos.ap-guangzhou.myqcloud.com/image-20241223124218808.png)





```html
<!DOCTYPE html>
<html>
<head>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f5f7fa;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        }

        .container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 2rem;
            max-width: 1200px;
            width: 100%;
        }

        .card {
            position: relative;
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
        }

        /* 1. 精美的价格标签 */
        .price {
            position: relative;
            font-size: 1.5rem;
            color: #2d3748;
            font-weight: bold;
        }

        .price::before {
            content: '¥';
            font-size: 1rem;
            position: relative;
            top: -0.5rem;
            margin-right: 0.2rem;
        }

        .price::after {
            content: '/月';
            font-size: 0.9rem;
            color: #718096;
            margin-left: 0.2rem;
        }

        /* 2. 优雅的链接下划线 */
        .fancy-link {
            position: relative;
            color: #4a5568;
            text-decoration: none;
            font-weight: 500;
        }

        .fancy-link::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 2px;
            bottom: -2px;
            left: 0;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.3s ease;
        }

        .fancy-link:hover::after {
            transform: scaleX(1);
            transform-origin: left;
        }

        /* 3. 高级特性标记 */
        .feature {
            position: relative;
            padding-left: 1.5rem;
            margin: 0.8rem 0;
            color: #4a5568;
        }

        .feature::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 50%;
            opacity: 0.2;
        }

        .feature::after {
            content: '✓';
            position: absolute;
            left: 4px;
            top: 50%;
            transform: translateY(-50%);
            color: #4a5568;
            font-size: 0.8rem;
        }

        /* 4. 热门标签 */
        .popular {
            position: relative;
            overflow: hidden;
        }

        .popular::before {
            content: 'HOT';
            position: absolute;
            top: 20px;
            right: -24px;
            background: #ed64a6;
            color: white;
            padding: 4px 30px;
            font-size: 0.75rem;
            transform: rotate(45deg);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* 5. 分割线 */
        .divider {
            position: relative;
            margin: 1.5rem 0;
            height: 1px;
        }

        .divider::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, 
                transparent,
                rgba(0,0,0,0.1) 50%,
                transparent
            );
        }

        .btn {
            display: inline-block;
            padding: 0.8rem 1.5rem;
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: transform 0.2s ease;
        }

        .btn:hover {
            transform: translateY(-2px);
        }

    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="price">199</div>
            <div class="divider"></div>
            <div class="feature">无限存储空间</div>
            <div class="feature">实时多端同步</div>
            <div class="feature">个性化定制</div>
            <div class="divider"></div>
            <a href="#" class="fancy-link">查看详情</a>
        </div>

        <div class="card popular">
            <div class="price">299</div>
            <div class="divider"></div>
            <div class="feature">企业级支持</div>
            <div class="feature">高级数据分析</div>
            <div class="feature">专属客服服务</div>
            <div class="feature">优先级解决问题</div>
            <div class="divider"></div>
            <a href="#" class="btn">立即购买</a>
        </div>
    </div>
</body>
</html>
```

这个示例展示了5个实用的伪元素应用：

1. 价格标签：使用`::before`和`::after`添加货币符号和时间单位
2. 链接特效：渐变色下划线动画
3. 特性列表：用伪元素创建优雅的复选标记
4. 热门标签：角标设计
5. 分割线：渐变分隔符

这些效果都是实际开发中常用的，可以直接应用到实际项目中。
