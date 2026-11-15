import { resolveLocale } from "@t3tools/client-runtime/locales";
import type * as Electron from "electron";

export type DesktopLocale = "en" | "zh-TW";
type DesktopTextParams = Readonly<Record<string, string | number>>;
export type DesktopTranslate = (english: string, params?: DesktopTextParams) => string;

// Mirrors apps/web/gt.config.json, so a saved web-only language keeps the shell in English.
const CLIENT_LOCALES = ["en", "de", "es", "fr", "ja", "ko", "pt-BR", "ru", "zh", "zh-TW"];

const ZH_TW: Readonly<Record<string, string>> = {
  // Application menu
  "About {app}": "關於 {app}",
  "Hide {app}": "隱藏 {app}",
  "Quit {app}": "結束 {app}",
  "Check for Updates...": "檢查更新…",
  "Settings...": "設定…",
  File: "檔案",
  "Close Developer Tools": "關閉開發者工具",
  "Close Window": "關閉視窗",
  Edit: "編輯",
  "Paste as Text": "以純文字貼上",
  Speech: "語音",
  View: "顯示方式",
  Reload: "重新載入",
  "Force Reload": "強制重新載入",
  "Toggle Developer Tools": "顯示或隱藏開發者工具",
  "Actual Size": "實際大小",
  "Zoom In": "放大",
  "Zoom Out": "縮小",
  // Update check dialogs
  "You're up to date!": "已是最新版本！",
  "T3 Code {version} is currently the newest version available.":
    "T3 Code {version} 是目前可用的最新版本。",
  OK: "好",
  "Update check failed": "檢查更新失敗",
  "Could not check for updates.": "無法檢查更新。",
  "An unknown error occurred. Please try again later.": "發生未知錯誤，請稍後再試。",
  "Updates unavailable": "無法更新",
  "Automatic updates are not available right now.": "目前無法使用自動更新。",
  // Context menu
  "No suggestions": "沒有建議",
  "Copy Link": "複製連結",
  "Copy Email Address": "複製電子郵件地址",
  "Copy Image": "複製圖片",
  // File dialogs
  Images: "圖片",
  "Desktop config": "桌面設定檔",
  // Startup recovery window
  "T3 Code could not start": "T3 Code 無法啟動",
  "Checking for a newer version…": "正在檢查是否有新版本…",
  "Version {version} is available. It can contain a fix.": "已有版本 {version}，其中可能包含修正。",
  "Update to {version}": "更新至 {version}",
  "Downloading {version}. T3 Code restarts when the download is done.":
    "正在下載 {version}。下載完成後 T3 Code 會重新啟動。",
  "Downloading {version} ({percent}%). T3 Code restarts when the download is done.":
    "正在下載 {version}（{percent}%）。下載完成後 T3 Code 會重新啟動。",
  "Version {version} started correctly on this computer. Download it and install it to go back.":
    "版本 {version} 曾在這台電腦上正常啟動。下載並安裝該版本即可退回。",
  "Download {version}": "下載 {version}",
  "Get a different version from the releases page.": "從發行版本頁面取得其他版本。",
  "Open releases": "開啟發行版本頁面",
  "Your organization's managed policy stopped T3 Code from starting. Send the details below to your IT administrator.":
    "你的組織所設定的受管理政策讓 T3 Code 無法啟動。請將下方的詳細資訊傳送給 IT 管理員。",
  "Copy details": "複製詳細資訊",
  Quit: "結束",
  "The server wrote no output.": "伺服器沒有輸出任何內容。",
  "Version {version}. T3 Code tries again in the background. Logs: {logDir}":
    "版本 {version}。T3 Code 會在背景重試。記錄檔：{logDir}",
  // Startup error boxes
  "T3 Code failed to start": "T3 Code 啟動失敗",
  "WSL backend is still unavailable": "WSL 後端仍無法使用",
  "{reason}\n\nT3 Code will use the Windows backend for this launch and retry WSL the next time the app starts.":
    "{reason}\n\n本次啟動 T3 Code 會使用 Windows 後端，並在下次啟動應用程式時重試 WSL。",
  "WSL backend couldn't start": "WSL 後端無法啟動",
  "{reason}\n\nFalling back to the Windows backend so T3 Code can open. Re-enable the WSL backend from Settings > Sharing & access once the WSL distro is fixed.":
    "{reason}\n\n已改用 Windows 後端，讓 T3 Code 可以開啟。修正 WSL 發行版後，請從「設定 > 分享與存取」重新啟用 WSL 後端。",
  "This T3 home is unavailable": "無法使用此 T3 主資料夾",
  "Another T3 Code server, such as the background service, is using this data directory, or an older background service is set up for it. Stop that server or try `t3 update`. If the older launcher cannot update, run `t3 service uninstall` and optionally reinstall with `t3 service install` from a current CLI. Use `npx t3@latest` if `t3` is missing or outdated, and pass `--base-dir` with the service's T3 home to each command. Then reopen T3 Code. You can also set a separate T3CODE_HOME and pair with the running server.":
    "另一個 T3 Code 伺服器（例如背景服務）正在使用此資料目錄，或已有較舊的背景服務設定使用它。請停止該伺服器，或嘗試執行 `t3 update`。若較舊的啟動器無法更新，請執行 `t3 service uninstall`，並視需要以目前版本的 CLI 執行 `t3 service install` 重新安裝。若缺少 `t3` 或版本過舊，請改用 `npx t3@latest`，並在每個指令中以 `--base-dir` 傳入該服務的 T3 主資料夾。接著重新開啟 T3 Code。你也可以另外設定 T3CODE_HOME，並與執行中的伺服器配對。",
  "The T3 Code background service": "T3 Code 背景服務",
  "Another T3 Code server (for example `t3 serve`, or one started over SSH)":
    "另一個 T3 Code 伺服器（例如 `t3 serve`，或透過 SSH 啟動的伺服器）",
  ", version {version}": "，版本 {version}",
  "Stop it with `t3 service uninstall`, passing `--base-dir` with this T3 home":
    "請以 `t3 service uninstall` 停止它，並以 `--base-dir` 傳入此 T3 主資料夾",
  "If a T3 Code app on another machine started it over SSH, that app restarts it: remove or disconnect that SSH environment there, or quit that app. Then stop the server":
    "若是另一台機器上的 T3 Code 透過 SSH 啟動了它，該應用程式會將它重新啟動：請在該機器上移除或中斷該 SSH 環境，或結束該應用程式。接著停止伺服器",
  "{kind} is using this T3 home (PID {pid}, port {port}{version}). {stop}, and reopen T3 Code. You can also set a separate T3CODE_HOME and pair with the running server.":
    "{kind}正在使用此 T3 主資料夾（PID {pid}，連接埠 {port}{version}）。{stop}，然後重新開啟 T3 Code。你也可以另外設定 T3CODE_HOME，並與執行中的伺服器配對。",
  // In-app browser prompts
  Open: "開啟",
  Cancel: "取消",
  Allow: "允許",
  Block: "封鎖",
  "Open this {protocol} link?": "要開啟這個 {protocol} 連結嗎？",
  "A page in the browser wants to open another application:\n\n{url}":
    "瀏覽器中的網頁想要開啟另一個應用程式：\n\n{url}",
  "{origin} wants to see text and images copied to the clipboard":
    "{origin} 想要查看已複製到剪貼簿的文字和圖片",
  "Trust and Remember": "信任並記住",
  "{host} has an untrusted certificate": "{host} 的憑證不受信任",
  "No trusted authority issued this certificate.": "此憑證並非由受信任的憑證授權單位簽發。",
  "This certificate is not for this address.": "此憑證不適用於這個位址。",
  "This certificate has expired or is not valid yet.": "此憑證已過期或尚未生效。",
  "Issued to: {name}": "簽發對象：{name}",
  "Issued by: {name}": "簽發者：{name}",
  "Valid: {start} – {end}": "有效期間：{start} – {end}",
  "Fingerprint: {fingerprint}": "指紋：{fingerprint}",
  "Trust it only if you know this certificate belongs to the site. Clearing this browser profile's cookies forgets it.":
    "請只在確定此憑證屬於該網站時才信任它。清除此瀏覽器設定檔的 Cookie 會忘記這項信任。",
  "Could not trust the certificate for {host}": "無法信任 {host} 的憑證",
  "T3 Code could not save this approval, so the page stays blocked. Check that the disk is not full and its data folder is writable, then try again.":
    "T3 Code 無法儲存這項核准，因此網頁仍會被封鎖。請確認磁碟未滿且資料資料夾可寫入，然後再試一次。",
  "Choose a passkey": "選擇通行密鑰",
  "Unnamed passkey": "未命名的通行密鑰",
  // macOS permission helper
  "Screen Recording": "螢幕錄製",
  Accessibility: "輔助使用",
  "Full Disk Access": "完整磁碟取用權限",
  "Set up {permission}": "設定「{permission}」",
  "Close permission helper": "關閉權限小幫手",
  "↑ Drag T3 Code into the list above": "↑ 將 T3 Code 拖曳到上方的列表中",
  "Drag T3 Code to System Settings, or click to reveal in Finder":
    "將 T3 Code 拖曳到「系統設定」，或按一下以在 Finder 中顯示",
};

// Electron labels these roles in English, so a translated menu sets them explicitly.
const ZH_TW_MENU_ROLES: Partial<
  Record<NonNullable<Electron.MenuItemConstructorOptions["role"]>, string>
> = {
  services: "服務",
  hideOthers: "隱藏其他項目",
  unhide: "全部顯示",
  quit: "結束",
  undo: "復原",
  redo: "重做",
  cut: "剪下",
  copy: "複製",
  paste: "貼上",
  delete: "刪除",
  selectAll: "全選",
  startSpeaking: "開始朗讀",
  stopSpeaking: "停止朗讀",
  togglefullscreen: "切換全螢幕",
  windowMenu: "視窗",
  minimize: "最小化",
  zoom: "縮放",
  front: "全部移到最前面",
  help: "說明",
};

/** Same rules as the web client: the saved language, else the first supported system language. */
export function resolveDesktopLocale(
  language: string,
  systemLanguages: ReadonlyArray<string>,
): DesktopLocale {
  return resolveLocale(language, systemLanguages, CLIENT_LOCALES, "en") === "zh-TW"
    ? "zh-TW"
    : "en";
}

const interpolate = (template: string, params: DesktopTextParams | undefined) =>
  params === undefined
    ? template
    : template.replace(/\{(\w+)\}/g, (match, name: string) =>
        Object.hasOwn(params, name) ? String(params[name]) : match,
      );

export const desktopTranslator =
  (locale: DesktopLocale): DesktopTranslate =>
  (english, params) =>
    interpolate((locale === "zh-TW" ? ZH_TW[english] : undefined) ?? english, params);

/** Labels role items that would otherwise show Electron's English defaults. */
export function labelMenuRoles(
  template: readonly Electron.MenuItemConstructorOptions[],
  locale: DesktopLocale,
): Electron.MenuItemConstructorOptions[] {
  return template.map((item) => {
    const roleLabel =
      locale === "zh-TW" && item.label === undefined && item.role !== undefined
        ? ZH_TW_MENU_ROLES[item.role]
        : undefined;
    return {
      ...item,
      ...(roleLabel === undefined ? {} : { label: roleLabel }),
      ...(Array.isArray(item.submenu) ? { submenu: labelMenuRoles(item.submenu, locale) } : {}),
    };
  });
}
