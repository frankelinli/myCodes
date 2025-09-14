
// 分页参数
const PAGE_SIZE = 10;
let currentPage = 1;
let totalPages = 1;
let allData = [];
function renderPage(page) {
  const content = document.getElementById('content');
  content.innerHTML = '';
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, allData.length);
  for (let i = start; i < end; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = allData[i];
    content.appendChild(card);
  }
}


function renderPagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  if (totalPages <= 1) return;
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '上一页';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; updateView(); } };
  pagination.appendChild(prevBtn);
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
      const btn = document.createElement('button');
      btn.textContent = i;
      if (i === currentPage) btn.className = 'active';
      btn.onclick = () => { currentPage = i; updateView(); };
      pagination.appendChild(btn);
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      const span = document.createElement('span');
      span.textContent = '...';
      pagination.appendChild(span);
    }
  }
  const nextBtn = document.createElement('button');
  nextBtn.textContent = '下一页';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; updateView(); } };
  pagination.appendChild(nextBtn);
}

function updateView() {
  renderPage(currentPage);
  renderPagination();
}

function render() {
  chrome.storage.local.get({collected: []}, (result) => {
    allData = result.collected || [];
    totalPages = Math.max(1, Math.ceil(allData.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    updateView();
  });
}

document.getElementById('export').onclick = function() {
  chrome.storage.local.get({collected: []}, (result) => {
    const win = window.open('', '', 'width=900,height=700');
    win.document.write('<html><head><title>英语收集本</title>');
    win.document.write('<style>body{font-family:Arial,sans-serif;padding:40px;max-width:900px;margin:auto;background:#fff;}h1{text-align:center;font-size:2.2em;margin-bottom:32px;}p{font-size:1.5em;line-height:2.2;margin-bottom:2.5em;word-break:break-word;}@media print{body{background:#fff;}}</style>');
    win.document.write('</head><body>');
    win.document.write('<h1>英语收集本</h1>');
    result.collected.forEach(item => {
      win.document.write('<p>' + item.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</p>');
    });
    win.document.write('</body></html>');
    win.print();
  });
};

document.getElementById('clear').onclick = function() {
  if (confirm('确定要清空所有已收集内容吗？')) {
    chrome.storage.local.set({collected: []}, render);
  }
};

document.addEventListener('DOMContentLoaded', render);
