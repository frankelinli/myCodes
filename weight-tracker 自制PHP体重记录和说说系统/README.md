# Weight Tracker 自制PHP体重记录和说说系统

## 简介
本项目是一个基于PHP的体重记录和说说系统，支持体重数据的录入、展示及体重变化趋势图表。

## 技术结构说明
- 前端：
  - 使用原生HTML、CSS和JavaScript实现页面交互与样式。
  - `bmi-module.js`、`weight-chart.js` 负责前端逻辑，如BMI计算、体重趋势图表绘制（可选用Chart.js等库，当前为原生实现）。
  - `bmi-module.css`、`weight-chart.css`、`weight-tracker.css` 提供各模块样式。
- 后端：
  - 基于PHP实现，核心逻辑在 `weight-tracker-app.php` 和 `bmi-module.php`。
  - 负责处理体重数据的录入、存储（如使用文件或数据库）、读取与展示。
- 数据存储：
  - 可采用本地文件（如CSV、TXT）或简单数据库（如SQLite、MySQL），具体实现请参考PHP代码。本项目使用json

## 文件结构
- `weight-tracker-app.php`：主应用入口文件。
- `bmi-module.php`、`bmi-module.js`、`bmi-module.css`：BMI计算与展示模块。
- `weight-chart.js`、`weight-chart.css`：体重变化图表模块。
- `weight-tracker.css`：主样式文件。

## 使用方法
1. 将所有文件上传至支持PHP的服务器。
2. 访问 `weight-tracker-app.php` 进行体重记录和查看。

## 依赖
- PHP 7.0 及以上
- 推荐使用现代浏览器访问

## 许可
仅供个人学习与交流使用。
