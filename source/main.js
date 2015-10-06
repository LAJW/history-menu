"use strict"

Object.defineProperty(Function.prototype, "create", {
	get: function () {
		let self = this;
		return function (a, b, c, d, e, f, g, h) {
			return new self(a, b, c, d, e, f, g, h)
		}
	}
})

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
	Chrome.sessions.getRecent()
		.then(function (sessions) {
			return sessions.map(function (session) {
				let bit = session.tab || session.window;
				bit.lastModified = session.lastModified;
				if (session.tab)
					return new TabButton(bit);
				else return new WindowFolder(bit);
			});
		}),
	Chrome.sessions.getDevices()
		.then(function (devices) {
			return devices.map(DeviceFolder.create);
		}),
	Chrome.history.search({
		text: "", 
		startTime: Date.now() - 1000 * 3600 * 24 * 30, 
		endTime: Date.now(),
		maxResults: 10
	}).then(function (results) {
		return results.map(HistoryButton.create);
	}),
	Chrome.storage.local.get(),
	Chrome.storage.sync.get(),
]).then(function (arr) {
	(function (root, sessions, devices, history, storage, local) {
		root.setTheme("Ubuntu", true);
		let mainLayer = root.insert(new Layer({children: [].concat(
			[new Separator({title: "Recently Closed"})],
			sessions,
			[new Separator({title: "Recently Visited"})],
			history
		)}));
		
		let deviceLayer = root.insert(new Layer({
			visible: false,
			children: devices
		}));
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
						searchLayer.visible = false;
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
