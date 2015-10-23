"use strict"

// Read-only settings server 
function getSettings() {
	return Promise.all([
		Chrome.storage.local.get(),
		Chrome.storage.sync.get()
	]).then(function (storages) {
		let local = storages[0];
		let sync = storages[1];
		if (local.local)
			return local;
		else return sync;
	});
}

getSettings({icon: "granite"}).then(function (settings) {
	chrome.browserAction.setIcon({path: "icons/history-19-" + settings.icon + ".png"});
});

console.log("stuf");