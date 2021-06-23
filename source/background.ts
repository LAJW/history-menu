import Chrome from "./Chrome"

Chrome.settings.getReadOnly({
	icon: "granite"
}).then(({icon}) => chrome.browserAction.setIcon({
	path: `icons/history-19-${icon}.png`
}));
