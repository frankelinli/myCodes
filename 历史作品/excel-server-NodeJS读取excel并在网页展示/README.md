# Excel Server 简介

这是一个基于 Node.js + Express 的简单 Web 服务，可以读取本地的 `data.xlsm` Excel 文件，并以网页形式展示所有工作表的内容。

## 功能
- 读取并展示 `data.xlsm` 文件中所有工作表的数据。
- 支持 .xlsm 文件（含宏的 Excel 文件）。
- 自动将每个工作表渲染为 HTML 表格。

## 使用方法

### 1. 安装依赖

```powershell
npm install
```

### 2. 准备 Excel 文件

将你的 `data.xlsm` 文件放在项目根目录下（与 `server.js` 同级）。

### 3. 启动服务

```powershell
node server.js
```

### 4. 访问页面

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可查看所有工作表内容。

## 依赖
- express
- xlsx

## 注意事项
- 仅支持展示表格内容，不支持编辑和保存。
- 如果 `data.xlsm` 文件不存在或格式不正确，页面会报错。

## 目录结构
```
excel-server/
├── data.xlsm         # 你的 Excel 文件
├── server.js         # 服务端代码
├── package.json      # 项目依赖
```

## License
MIT
