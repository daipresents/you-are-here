const urlInput = document.getElementById("url");
const nameInput = document.getElementById("name");
const colorInput = document.getElementById("color");
const colorHexInput = document.getElementById("color-hex");
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
const exportHeading = document.querySelector('h3:nth-of-type(4)');
exportHeading.parentNode.insertBefore(exportMsg, exportHeading.nextSibling);

// インポート見出しの下に挿入
const importHeading = document.querySelector('h3:nth-of-type(5)');
importHeading.parentNode.insertBefore(importMsg, importHeading.nextSibling);

function i18nReplace() {
  // テキストノード
  document.querySelectorAll('.i18n').forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = chrome.i18n.getMessage(key);
  });
  // placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (key) el.placeholder = chrome.i18n.getMessage(key);
  });
}
document.addEventListener('DOMContentLoaded', i18nReplace);

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
    let rules = data.rules || [];
    // 名前の昇順でソート
    rules = rules.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    rulesList.innerHTML = "";
    rules.forEach((rule, index) => {
      const div = document.createElement("div");
      div.className = "rule";
      div.innerHTML = `
        <strong>${rule.name}</strong><br>
        URL: ${rule.url}<br>
        ${chrome.i18n.getMessage("colorLabel")}: <span style="color:${rule.color}">${rule.color}</span><br>
        <button data-index="${index}" class="edit-btn">${chrome.i18n.getMessage("editButton")}</button>
        <button data-index="${index}" class="i18n" data-i18n="deleteButton">${chrome.i18n.getMessage("deleteButton")}</button>
      `;
      rulesList.appendChild(div);

      // 削除ボタン
      div.querySelector(".i18n[data-i18n='deleteButton']").addEventListener("click", () => {
        rules.splice(index, 1);
        chrome.storage.local.set({ rules }, loadRules);
      });

      // 編集ボタン
      div.querySelector(".edit-btn").addEventListener("click", () => {
        // 編集用フォーム（追加と同じデザイン）に切り替え
        div.innerHTML = `
          <input type="text" value="${rule.url}" style="width: 100%; margin: 5px 0;" class="edit-url" placeholder="URL" />
          <input type="text" value="${rule.name}" style="width: 100%; margin: 5px 0;" class="edit-name" placeholder="名前" />
          <input type="color" class="edit-color" value="${rule.color}" />
          <input type="text" class="edit-color-hex" value="${rule.color}" maxlength="7" style="width: 90px; margin-left: 8px;" />
          <button class="save-btn">${chrome.i18n.getMessage("saveButton")}</button>
          <button class="cancel-btn">${chrome.i18n.getMessage("cancelButton")}</button>
        `;
        // カラーピッカーとHEX欄の連動
        const editColorInput = div.querySelector(".edit-color");
        const editColorHexInput = div.querySelector(".edit-color-hex");
        editColorInput.addEventListener("input", () => {
          editColorHexInput.value = editColorInput.value;
        });
        editColorHexInput.addEventListener("input", () => {
          let val = editColorHexInput.value;
          if (isValidHexColor(val)) {
            editColorInput.value = val;
          }
        });
        // 保存ボタン
        div.querySelector(".save-btn").addEventListener("click", () => {
          const newUrl = div.querySelector(".edit-url").value.trim();
          const newName = div.querySelector(".edit-name").value.trim();
          const newColor = div.querySelector(".edit-color").value;
          if (!newName || !newUrl) return;
          rules[index] = { name: newName, url: newUrl, color: newColor };
          chrome.storage.local.set({ rules }, loadRules);
        });
        // キャンセルボタン
        div.querySelector(".cancel-btn").addEventListener("click", () => {
          loadRules();
        });
      });
    });
  });
}

addBtn.addEventListener("click", () => {
  clearError();
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();
  const color = colorInput.value;

  if (!url || !name) return;

  chrome.storage.local.get("rules", (data) => {
    const rules = data.rules || [];
    if (rules.length >= MAX_RULES) {
      showError(chrome.i18n.getMessage("maxRules", [MAX_RULES]));
      return;
    }
    rules.push({ url, name, color });
    chrome.storage.local.set({ rules }, () => {
      urlInput.value = "";
      nameInput.value = "";
      loadRules();
      showError(chrome.i18n.getMessage("ruleAdded", [name]));
      setTimeout(clearError, 2000); // 2秒後に消す
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  loadRules();
  document.querySelectorAll('.i18n').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = chrome.i18n.getMessage(key);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // 初期値の反映
  chrome.storage.local.get("bannerPosition", (data) => {
    const pos = data.bannerPosition || "right";
    const radios = document.querySelectorAll('input[name="bannerPosition"]');
    radios.forEach(radio => {
      radio.checked = (radio.value === pos);
    });
  });

  // 保存ボタン
  document.getElementById('saveBannerPosition').addEventListener('click', () => {
    const selected = document.querySelector('input[name="bannerPosition"]:checked').value;
    chrome.storage.local.set({ bannerPosition: selected }, () => {
      const msg = document.getElementById('bannerPositionMsg');
      msg.textContent = chrome.i18n.getMessage("saved") || "保存しました";
      msg.style.display = "inline";
      setTimeout(() => { msg.style.display = "none"; }, 1500);

      // 元の画面（拡張機能のポップアップを開いているタブ）をリロード
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });
});

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
      showExportMsg(chrome.i18n.getMessage("ruleExported"));
    } catch (e) {
      showExportMsg(chrome.i18n.getMessage("invalidJson"), true);
    }
  });
});

// インポート
document.getElementById("importRules").addEventListener("click", () => {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) {
    showImportMsg(chrome.i18n.getMessage("selectFile"), true);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const importedRules = JSON.parse(reader.result);
      if (!Array.isArray(importedRules)) throw new Error("不正な形式");

      if (importedRules.length > MAX_RULES) {
        showImportMsg(chrome.i18n.getMessage("maxImportRules", [MAX_RULES]), true);
        return;
      }

      chrome.storage.local.set({ rules: importedRules }, () => {
        loadRules();
        showImportMsg(chrome.i18n.getMessage("ruleImported"));
      });
    } catch (e) {
      showImportMsg(chrome.i18n.getMessage("invalidJson"), true);
    }
  };
  reader.readAsText(file);
});

colorInput.addEventListener("input", () => {
  colorHexInput.value = colorInput.value;
});

// HEXカラーコードのバリデーション共通関数
function isValidHexColor(val) {
  return /^#([0-9a-fA-F]{6})$/.test(val);
}

colorHexInput.addEventListener("input", () => {
  let val = colorHexInput.value;
  if (isValidHexColor(val)) {
    colorInput.value = val;
  }
});
