chrome.storage.local.get("rules", (data) => {
  const rules = data.rules || [];
  const currentUrl = window.location.href;

  for (const rule of rules) {
    if (currentUrl.includes(rule.url)) {
      showBanner(rule.name, rule.color);
      break;
    }
  }
});

function showBanner(name, color) {
  const banner = document.createElement("div");
  banner.className = "access-banner";
  banner.style.backgroundColor = color;
  banner.textContent = `「${name}」にアクセス中`;

  document.body.appendChild(banner);
}
