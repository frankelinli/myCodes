const express = require('express');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
const PORT = 3000;

// 👇 你的 xlsm 文件名
const excelFile = path.join(__dirname, 'data.xlsm');

app.get('/', (req, res) => {
  try {
    const workbook = XLSX.readFile(excelFile);
    const sheetNames = workbook.SheetNames;

    let html = '<h1>所有工作表内容</h1>';

    sheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      html += `<h2>工作表：${sheetName}</h2>`;
      
      if (jsonData.length === 0) {
        html += '<p><em>空表</em></p>';
        return;
      }

      const headers = Object.keys(jsonData[0]);
      html += '<table border="1" cellspacing="0" cellpadding="5"><tr>';
      headers.forEach(h => html += `<th>${h}</th>`);
      html += '</tr>';

      jsonData.forEach(row => {
        html += '<tr>';
        headers.forEach(h => html += `<td>${row[h] || ''}</td>`);
        html += '</tr>';
      });

      html += '</table><br>';
    });

    res.send(html);

  } catch (err) {
    res.status(500).send('读取 Excel 出错: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ 打开浏览器访问 http://localhost:${PORT}`);
  // 自动打开默认浏览器
  const open = require('child_process').exec;
  const url = `http://localhost:${PORT}`;
  // Windows 下使用 start 命令
  open(`start ${url}`);
});
