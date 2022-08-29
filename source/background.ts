import Chrome from "./Chrome"

chrome.runtime.onStartup.addListener(Chrome.theme.updateIcon)
chrome.runtime.onInstalled.addListener(Chrome.theme.updateIcon)
