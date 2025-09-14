chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "collect_english",
    title: "收集到英语本",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "collect_english" && info.selectionText) {
    chrome.storage.local.get({collected: []}, (result) => {
      const collected = result.collected;
      collected.push(info.selectionText);
      chrome.storage.local.set({collected});
    });
  }
});
