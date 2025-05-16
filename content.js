// 現在のURLを取得
const currentUrl = window.location.href;

// 保存されたルールを取得してチェック
chrome.storage.local.get("rules", (data) => {
  const rules = data.rules || [];

  for (const rule of rules) {
    if (currentUrl.includes(rule.url)) {
      showBanner(rule.name, rule.color);
      break;
    }
  }
});

// バナーを表示する関数
function showBanner(name, color) {
  if (document.getElementById("you-are-here-banner")) return; // 重複防止

  // 設定からバナー位置を取得
  chrome.storage.local.get("bannerPosition", (data) => {
    const position = data.bannerPosition || "right"; // デフォルトは右側

    const banner = document.createElement("div");
    banner.id = "you-are-here-banner";
    banner.className = `you-are-here-banner ${position}`;
    banner.style.setProperty("--banner-color", color);

    if (position === "top") {
      banner.innerHTML = `<span style="white-space: nowrap;">${chrome.i18n.getMessage("accessing", [name])}</span>`;
    } else {
      banner.innerHTML = `<span style="display: inline-block; transform: rotate(-90deg); white-space: nowrap;">${chrome.i18n.getMessage("accessing", [name])}</span>`;
    }

    document.body.appendChild(banner);
  });
}
