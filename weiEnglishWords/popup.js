const STORAGE_KEY = "collectedEntries";

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const randomBtn = document.getElementById("randomBtn");
const exportJsonBtn = document.getElementById("exportJsonBtn");
const printBtn = document.getElementById("printBtn");
const reviewBox = document.getElementById("reviewBox");
const countText = document.getElementById("countText");
const entryList = document.getElementById("entryList");
const entryTemplate = document.getElementById("entryTemplate");

let entries = [];

init();

async function init() {
  entries = await getEntries();
  render();
}

searchInput.addEventListener("input", render);
filterType.addEventListener("change", render);

randomBtn.addEventListener("click", () => {
  const list = getFilteredEntries();
  if (list.length === 0) {
    reviewBox.textContent = "没有可复习内容。";
    return;
  }

  const randomItem = list[Math.floor(Math.random() * list.length)];
  reviewBox.textContent = randomItem.translation
    ? `复习：${randomItem.text}\n翻译：${randomItem.translation}`
    : `复习：${randomItem.text}`;
});

exportJsonBtn.addEventListener("click", () => {
  const payload = JSON.stringify(entries, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `english-collector-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

printBtn.addEventListener("click", async () => {
  const list = getFilteredEntries();
  await chrome.storage.local.set({
    printPayload: {
      generatedAt: new Date().toISOString(),
      items: list
    }
  });

  chrome.tabs.create({ url: chrome.runtime.getURL("print.html") });
});

entryList.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const itemEl = target.closest(".entry-item");
  if (!itemEl) {
    return;
  }

  const id = itemEl.dataset.id;
  if (!id) {
    return;
  }

  if (target.classList.contains("favorite-btn")) {
    entries = entries.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item));
    await setEntries(entries);
    render();
  }

  if (target.classList.contains("delete-btn")) {
    entries = entries.filter((item) => item.id !== id);
    await setEntries(entries);
    render();
  }

  if (target.classList.contains("save-translation-btn")) {
    const translationInput = itemEl.querySelector(".translation-input");
    if (!(translationInput instanceof HTMLTextAreaElement)) {
      return;
    }

    const translation = normalizeText(translationInput.value);
    entries = entries.map((item) => (item.id === id ? { ...item, translation } : item));
    await setEntries(entries);
    render();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[STORAGE_KEY]) {
    entries = Array.isArray(changes[STORAGE_KEY].newValue) ? changes[STORAGE_KEY].newValue : [];
    render();
  }
});

function render() {
  const list = getFilteredEntries();
  countText.textContent = `共 ${entries.length} 条，当前显示 ${list.length} 条`;

  entryList.innerHTML = "";

  list.forEach((entry) => {
    const node = entryTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.id = entry.id;
    node.querySelector(".entry-text").textContent = entry.text;
    node.querySelector(".translation-input").value = entry.translation || "";
    node.querySelector(".entry-meta").textContent = `${formatDate(entry.createdAt)}${
      entry.pageTitle ? ` · 来源 ${entry.pageTitle}` : ""
    }`;

    const favoriteBtn = node.querySelector(".favorite-btn");
    favoriteBtn.textContent = entry.favorite ? "★" : "☆";
    favoriteBtn.classList.toggle("active", entry.favorite);

    entryList.appendChild(node);
  });
}

function getFilteredEntries() {
  const keyword = normalizeText(searchInput.value).toLowerCase();
  const mode = filterType.value;

  return entries.filter((item) => {
    if (mode === "favorite" && !item.favorite) {
      return false;
    }

    if (keyword && !item.text.toLowerCase().includes(keyword)) {
      return false;
    }

    return true;
  });
}

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

async function getEntries() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
}

async function setEntries(nextEntries) {
  await chrome.storage.local.set({ [STORAGE_KEY]: nextEntries });
}
