const urlInput = document.getElementById("url");
const nameInput = document.getElementById("name");
const colorInput = document.getElementById("color");
const addBtn = document.getElementById("addRule");
const rulesList = document.getElementById("rulesList");
const MAX_RULES = 15;

// エラーメッセージ表示用要素を追加
const errorMsg = document.createElement("span");
errorMsg.id = "errorMsg";
errorMsg.style.color = "red";
errorMsg.style.marginLeft = "10px";
errorMsg.style.fontWeight = "bold";
addBtn.parentNode.insertBefore(errorMsg, addBtn.nextSibling);

// エクスポート・インポート用メッセージ表示要素を作成
const exportMsg = document.createElement("div");
exportMsg.id = "exportMsg";
exportMsg.style.color = "green";
exportMsg.style.fontWeight = "bold";
exportMsg.style.marginBottom = "8px";
exportMsg.style.display = "none";

const importMsg = document.createElement("div");
importMsg.id = "importMsg";
importMsg.style.color = "green";
importMsg.style.fontWeight = "bold";
importMsg.style.marginBottom = "8px";
importMsg.style.display = "none";

// エクスポート見出しの下に挿入
const exportHeading = document.querySelector('h3:nth-of-type(3)');
exportHeading.parentNode.insertBefore(exportMsg, exportHeading.nextSibling);

// インポート見出しの下に挿入
const importHeading = document.querySelector('h3:nth-of-type(4)');
importHeading.parentNode.insertBefore(importMsg, importHeading.nextSibling);

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = "inline";
}

function clearError() {
  errorMsg.textContent = "";
  errorMsg.style.display = "none";
}

function showExportMsg(message, isError = false) {
  exportMsg.textContent = message;
  exportMsg.style.color = isError ? "red" : "green";
  exportMsg.style.display = "block";
  setTimeout(() => { exportMsg.style.display = "none"; }, 2000);
}

function showImportMsg(message, isError = false) {
  importMsg.textContent = message;
  importMsg.style.color = isError ? "red" : "green";
  importMsg.style.display = "block";
  setTimeout(() => { importMsg.style.display = "none"; }, 2000);
}

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
  clearError();
  const url = urlInput.value.trim();
  const name = nameInput.value.trim();
  const color = colorInput.value;

  if (!url || !name) return;

  chrome.storage.local.get("rules", (data) => {
    const rules = data.rules || [];
    if (rules.length >= MAX_RULES) {
      showError(`登録できませんでした。URLは最大${MAX_RULES}件まで登録できます。`);
      return;
    }
    rules.push({ url, name, color });
    chrome.storage.local.set({ rules }, () => {
      urlInput.value = "";
      nameInput.value = "";
      loadRules();
      clearError();
    });
  });
});

document.addEventListener("DOMContentLoaded", loadRules);

// エクスポート
document.getElementById("exportRules").addEventListener("click", () => {
  chrome.storage.local.get("rules", (data) => {
    try {
      const rules = data.rules || [];
      const blob = new Blob([JSON.stringify(rules, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "you-are-here-rules.json";
      a.click();
      URL.revokeObjectURL(url);
      showExportMsg("ルールをエクスポートしました");
    } catch (e) {
      showExportMsg("エクスポートに失敗しました", true);
    }
  });
});

// インポート
document.getElementById("importRules").addEventListener("click", () => {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) {
    showImportMsg("ファイルを選択してください。", true);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const importedRules = JSON.parse(reader.result);
      if (!Array.isArray(importedRules)) throw new Error("不正な形式");

      if (importedRules.length > MAX_RULES) {
        showImportMsg(`最大${MAX_RULES}件までインポートできます。`, true);
        return;
      }

      chrome.storage.local.set({ rules: importedRules }, () => {
        loadRules();
        showImportMsg("ルールをインポートしました");
      });
    } catch (e) {
      showImportMsg("無効なJSONファイルです。", true);
    }
  };
  reader.readAsText(file);
});
