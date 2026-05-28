const STORAGE_KEY = "collectedEntries";

chrome.runtime.onInstalled.addListener(async () => {
  await createContextMenus();
});

chrome.runtime.onStartup.addListener(async () => {
  await createContextMenus();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) {
    return;
  }

  const normalized = normalizeText(info.selectionText);
  if (!normalized) {
    return;
  }

  if (info.menuItemId === "collect_clip") {
    await saveEntry({
      text: normalized,
      pageUrl: tab?.url || "",
      pageTitle: tab?.title || ""
    });
  }
});

async function createContextMenus() {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: "collect_clip",
    title: "收藏到英语剪藏",
    contexts: ["selection"]
  });
}

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

async function saveEntry(partial) {
  const entries = await getEntries();
  const duplicated = entries.some(
    (item) => item.text.toLowerCase() === partial.text.toLowerCase()
  );

  if (duplicated) {
    return;
  }

  const entry = {
    id: crypto.randomUUID(),
    text: partial.text,
    translation: "",
    pageUrl: partial.pageUrl,
    pageTitle: partial.pageTitle,
    favorite: false,
    createdAt: new Date().toISOString()
  };

  const nextEntries = [entry, ...entries];
  await chrome.storage.local.set({ [STORAGE_KEY]: nextEntries, lastAddedEntry: entry });
}

async function getEntries() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
}
