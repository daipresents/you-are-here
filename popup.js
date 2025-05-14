const urlInput = document.getElementById("url");
const nameInput = document.getElementById("name");
const colorInput = document.getElementById("color");
const addBtn = document.getElementById("addRule");
const rulesList = document.getElementById("rulesList");

function loadRules() {
  chrome.storage.local.get("rules", (data) => {
    const rules = data.rules || [];
    rulesList.innerHTML = "";
    rules.forEach((rule, index) => {
      const div = document.createElement("div");
      div.className = "rule";
      div.innerHTML = `
        <strong>${rule.name}</strong><br>
        URL: ${rule.url}<br>
        色: <span style="color:${rule.color}">${rule.color}</span><br>
        <button data-index="${index}">削除</button>
      `;
      rulesList.appendChild(div);

      div.querySelector("button").addEventListener("click", () => {
        rules.splice(index, 1);
        chrome.storage.local.set({ rules }, loadRules);
      });
    });
  });
}

addBtn.addEventListener("click", () => {
  const url = urlInput.value.trim();
  const name = nameInput.value.trim();
  const color = colorInput.value;

  if (!url || !name) return;

  chrome.storage.local.get("rules", (data) => {
    const rules = data.rules || [];
    if (rules.length >= 5) {
      alert("最大5件までです。");
      return;
    }
    rules.push({ url, name, color });
    chrome.storage.local.set({ rules }, () => {
      urlInput.value = "";
      nameInput.value = "";
      loadRules();
    });
  });
});

document.addEventListener("DOMContentLoaded", loadRules);

// エクスポート
document.getElementById("exportRules").addEventListener("click", () => {
  chrome.storage.local.get("rules", (data) => {
    const rules = data.rules || [];
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "you-are-here-rules.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

// インポート
document.getElementById("importRules").addEventListener("click", () => {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) {
    alert("ファイルを選択してください。");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const importedRules = JSON.parse(reader.result);
      if (!Array.isArray(importedRules)) throw new Error("不正な形式");

      if (importedRules.length > 5) {
        alert("最大5件までインポートできます。");
        return;
      }

      chrome.storage.local.set({ rules: importedRules }, loadRules);
    } catch (e) {
      alert("無効なJSONファイルです。");
    }
  };
  reader.readAsText(file);
});
