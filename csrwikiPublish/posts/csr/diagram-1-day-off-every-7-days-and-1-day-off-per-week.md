---
title: "图解验厂标准：“每7天休息1天” 和 “每周休息1天”"
slug: "diagram-1-day-off-every-7-days-and-1-day-off-per-week"
date: "2025-05-14T13:21:07"
status: "publish"
categories: ["CSR 博客"]
tags: []
---

客户验厂中，有个通用的国际惯例标准，企业要保证“每7天休息至少1天”，意思是不能连续上班7天，否则属于严重违规项。

这个标准比劳动法规定的“每周休息至少1天”，要严格的多。

因为“每周休息至少1天”，有个漏洞，它可以在第1周的周一休息，在第二周的周日休息，这样看起来仍然满足了“每周至少休息1天”。但是它违反了客户验厂标准的“每7天休息至少1天”。

下面用通俗易懂、一目了然的图表，分别用正确和错误2个示例，来演示**“每7天休息至少1天”**

  休息规则可视化 .title { text-align: center; margin-bottom: 30px; } .rule-container { margin-bottom: 40px; background-color: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 5px solid #3498db; } .calendar { display: flex; flex-wrap: wrap; border: 1px solid #ccc; margin-bottom: 20px; border-radius: 8px; overflow: hidden; } .day { width: calc(100% / 7); box-sizing: border-box; height: 50px; display: flex; align-items: center; justify-content: center; border: 1px solid #eee; position: relative; } .work { background-color: #f0f0f0; } .rest { background-color: #a7e3a7; } .number { position: absolute; top: 3px; left: 3px; font-size: 10px; color: #666; } .example-container { border: 2px solid #ddd; border-radius: 10px; padding: 15px; margin-bottom: 30px; position: relative; } .correct-example { border-color: #2ecc71; } .wrong-example { border-color: #e74c3c; } .status-badge { position: absolute; top: -15px; right: 20px; padding: 5px 15px; border-radius: 20px; font-weight: bold; color: white; } .correct-badge { background-color: #2ecc71; } .wrong-badge { background-color: #e74c3c; } .example-title { font-weight: bold; margin: 5px 0 15px 0; font-size: 1.1em; } .explanation { margin-top: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px; } .highlight { background-color: #ffcccc; } .warning { color: #cc0000; font-weight: bold; } .arrow { text-align: center; margin: 15px 0; font-size: 24px; color: #3498db; } .check-icon { color: #2ecc71; font-size: 24px; margin-right: 10px; } .wrong-icon { color: #e74c3c; font-size: 24px; margin-right: 10px; } @media (max-width: 600px) { .day { height: 40px; font-size: 12px; } }

规则说明：
-----

1.  每7天至少要有1天休息
2.  任意连续7天内必须至少有1天休息
3.  首尾休息不符合规则：如果只有第1天和第14天休息，中间12天连续工作，这违反了规则

✓ 正确

✓ 正确示例：任意连续7天内有休息

1工作

2工作

3休息

4工作

5工作

6工作

7工作

8工作

9工作

10休息

11工作

12工作

13工作

14工作

✓在这个例子中，第3天和第10天休息，确保了任意连续7天内都至少有1天休息。

✓第1-7天：包含第3天休息

✓第4-10天：包含第10天休息

✓第8-14天：包含第10天休息

✗ 错误

✗ 错误示例：第1天和第14天休息，中间12天连续工作

1休息

2工作

3工作

4工作

5工作

6工作

7工作

8工作

9工作

10工作

11工作

12工作

13工作

14休息

✗这违反了规则！

✗虽然第1天和第14天有休息，但从第2天到第13天有12天连续工作，没有休息日。

✗例如，第2-8天这7天内没有任何休息日，违反了”任意连续7天必须至少有1天休息”的规则。

✗同样，第8-14天虽然第14天休息，但因为是首尾休息，实际上第8-13这6天没有满足要求。