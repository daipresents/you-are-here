chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === "install") {
    // 初回インストール時に rules.json を読み込む
    const res = await fetch(chrome.runtime.getURL("rules.json"));
    const defaultRules = await res.json();

    chrome.storage.local.set({ rules: defaultRules }, () => {
      console.log("デフォルトルールを保存しました。");
    });
  }
});
