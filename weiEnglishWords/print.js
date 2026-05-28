const summaryText = document.getElementById("summaryText");
const printList = document.getElementById("printList");
const printNowBtn = document.getElementById("printNowBtn");

init();

printNowBtn.addEventListener("click", () => {
  window.print();
});

async function init() {
  const data = await chrome.storage.local.get("printPayload");
  const payload = data.printPayload;

  if (!payload || !Array.isArray(payload.items)) {
    summaryText.textContent = "没有可打印的数据，请回到插件弹窗先选择并导出。";
    return;
  }

  summaryText.textContent = `导出时间：${formatDate(payload.generatedAt)}，共 ${payload.items.length} 条。`;

  printList.innerHTML = "";

  payload.items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "print-item";

    const textP = document.createElement("p");
    textP.textContent = item.text;
    li.appendChild(textP);

    if (item.translation) {
      const translationP = document.createElement("p");
      translationP.className = "meta";
      translationP.textContent = `翻译：${item.translation}`;
      li.appendChild(translationP);
    }

    const metaP = document.createElement("p");
    metaP.className = "meta";
    metaP.textContent = `收藏时间 ${formatDate(item.createdAt)}${item.pageTitle ? ` · 来源 ${item.pageTitle}` : ""}`;

    li.appendChild(metaP);
    printList.appendChild(li);
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
