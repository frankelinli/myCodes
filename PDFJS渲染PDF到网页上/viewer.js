pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

let pdfDoc = null;
let currentPage = 1;

pdfjsLib.getDocument('khfw.pdf').promise.then(pdf => {
    pdfDoc = pdf;
    document.getElementById('pageNum').max = pdf.numPages;
    document.getElementById('status').textContent = `PDF 已加载，共 ${pdf.numPages} 页`;
    renderPage(1);
}).catch(err => {
    document.getElementById('status').textContent = '❌ 加载失败: ' + err.message;
});

async function renderPage(pageNum) {
    if (!pdfDoc || pageNum < 1 || pageNum > pdfDoc.numPages) return;
    
    currentPage = pageNum;
    document.getElementById('pageNum').value = pageNum;
    document.getElementById('status').textContent = `正在加载第 ${pageNum} 页...`;

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    
    const container = document.getElementById('container');
    container.innerHTML = '';
    
    const pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.appendChild(canvas);
    
    const numDiv = document.createElement('div');
    numDiv.className = 'page-num';
    numDiv.textContent = `第 ${pageNum} 页，共 ${pdfDoc.numPages} 页`;
    pageDiv.appendChild(numDiv);
    
    container.appendChild(pageDiv);
    document.getElementById('status').textContent = `第 ${pageNum} 页，共 ${pdfDoc.numPages} 页`;
}

function prevPage() {
    if (currentPage > 1) renderPage(currentPage - 1);
}

function nextPage() {
    if (pdfDoc && currentPage < pdfDoc.numPages) renderPage(currentPage + 1);
}

function goToPage() {
    const pageNum = parseInt(document.getElementById('pageNum').value);
    if (pdfDoc && pageNum >= 1 && pageNum <= pdfDoc.numPages) {
        renderPage(pageNum);
    }
}
