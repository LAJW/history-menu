"use strict"

// remove ftp|http|https://(www). from url
function trimURL(url) {
	typecheck(arguments, String);	
	url = url.substr(url.indexOf("://") + 3);
	if (url.substr(0,4) == "www.")
		url = url.substr(4);
	return url;
}

Promise.all([
	Root.ready(),
	Chrome.sessions.getRecent(),
	Chrome.sessions.getDevices(),
	Chrome.history.search({
		text: "", 
		startTime: Date.now() - 1000 * 3600 * 24 * 30, 
		endTime: Date.now(),
		maxResults: 10
	}),
	Chrome.storage.local.get(),
	Chrome.storage.sync.get(),
]).then(function (arr) {
	(function (root, sessions, devices, history, storage, local) {
		root.setTheme("Ubuntu", true);
		let mainLayer = root.insert(new Layer);
		mainLayer.insert(new Separator({title: "Recently Closed"}));
		for (let session of sessions) {
			let bit = session.tab || session.window;
			bit.lastModified = session.lastModified;
			if (session.tab)
				mainLayer.insert(new TabButton(bit));
			if (session.window)
				mainLayer.insert(new TabButton(bit));
		}
		mainLayer.insert(new Separator({title: "Recently Visited"}));

		for (let item of history) {
			mainLayer.insert(new HistoryButton(item));		
		}
		
		let deviceLayer = root.insert(new Layer({
			visible: false
		}));
		for (let device of devices) {
			deviceLayer.insert(new DeviceFolder(device));
		}
		let searchLayer = root.insert(new Layer({
			visible: false,
			children: [
				new Separator({title: "Search Results"})
			]
		}));
		root.insert(new MultiButton({
			children: [
				new Input({
					placeholder: "Search History...",
					lockon: true,
					change: function (input) {
						searchLayer.visible = !!this.value;
						deviceLayer.visible = false;
					}
				}),
				new ActionButton({
					tooltip: "Other Devices",
					icon: "icons/next.png",
					click: function (e) {
						deviceLayer.visible = !deviceLayer.visible;
					}
				}),
				new ActionButton({
					tooltip: "All History",
					icon: "icons/history-19.png",
					click: function (e) {
						Chrome.tabs.openOrSelect("chrome://history/", false);
					}
				}),
				new ActionButton({
					tooltip: "Settings",
					icon: "icons/options.png",
					click: function (e) {
						Chrome.tabs.openOrSelect("./options.html", false);
					}
				})
			]
		}));
	}).apply(this, arr);
});
