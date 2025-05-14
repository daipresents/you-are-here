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

  const banner = document.createElement("div");
  banner.id = "you-are-here-banner";
  banner.className = "you-are-here-banner";
  banner.style.setProperty("--banner-color", color);

  banner.textContent = `「${name}」にアクセス中`;

  // スタイル定義
  const style = document.createElement("style");
  style.textContent = `
    .you-are-here-banner {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background-color: var(--banner-color, red);
      color: white;
      text-align: center;
      padding: 8px;
      font-weight: bold;
      z-index: 9999;
      animation: blink 2.5s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(banner);
}
