"use strict"

// remove ftp|http|https://(www). from url
function trimURL(url) {
	typecheck(arguments, String);	
	url = url.substr(url.indexOf("://") + 3);
	if (url.substr(0,4) == "www.")
		url = url.substr(4);
	return url;
}

class TabButton extends Button {
   constructor(tab) {
   		typecheck.loose(arguments, {
			sessionId: String,
		});
		super({
			icon: "chrome://favicon/" + tab.url,
			title: tab.title,
			tooltip: tab.url
		});
		this.sessionId = tab.sessionId;
	}
	click(e) { /*override*/
		e.preventDefault();
		Chrome.sessions.restore(this.sessionId, e.which == 2);
	}
};

class WindowFolder extends Folder {
	constructor(window) {
   		typecheck(arguments, {
			sessionId: String,
		});
		Folder.call(this, window);
		this.title = "Window (Number of tabs: " + window.tabs.length + ")";
		let self = this;
		window.tabs.forEach(function (tab) {
			self.insert(TabButton.create(tab));
		});
	}
	click(e) { /*override*/
		e.preventDefault();
		Folder.click(this, e);
		Chrome.sessions.restore(this.sessionId, e.which == 2);
	}
}

class HistoryButton extends Button {
	constructor(item) {
		if (!item.title) {
			item.tooltip = item.url;
			item.url = trim(item.url);
			item.tooltip = item.url;
		} else {
			item.tooltip = item.title + "\n" + item.url;
		}
		super(item);
		this.url = item.url;
		this.icon = "chrome://favicon/" + item.url;
	}
	click(e) { /*override*/
		e.preventDefault();
		Chrome.tabs.openOrSelect(this.url, true);
	}
	get url() {
		return this.DOM.href;	
	}
	set url(value) {
		this.DOM.href = value;
	}
}

Promise.all([
	Root.ready(),
	Chrome.sessions.getRecent({
		maxResults: 10
	}),
	Chrome.history.search({
		text: "", 
		startTime: Date.now() - 1000 * 3600 * 24 * 30, 
		endTime: Date.now(),
		maxResults: 10
	}),
	Chrome.storage.local.get(),
	Chrome.storage.sync.get()
]).then(function (arr) {
	(function (root, sessions, history, storage, local) {
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
					}
				}),
				new Button({
					title: "Other Devices",
					icon: "icons/next.png"
				}),
				new Button({
					title: "All History",
					icon: "icons/history-19.png"
				}),
				new Button({
					title: "Settings",
					icon: "icons/options.png"
				})
			]
		}));
	}).apply(this, arr);
});
