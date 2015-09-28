"use strict"

class TabButton extends Button {
   constructor(tab) {
		super({
			icon: "chrome://favicon/" + tab.url,
			title: tab.title,
			tooltip: tab.url
		});
		this.sessionId = tab.sessionId;
	}
	click(e) {
		e.preventDefault();
		Chrome.sessions.restore(this.sessionId, e.which == 2);
	}
};

class WindowFolder extends Folder {
	constructor(window) {
		Folder.call(this, window);
		this.title = "Window (Number of tabs: " + window.tabs.length + ")";
		let self = this;
		window.tabs.forEach(function (tab) {
			self.insert(TabButton.create(tab));
		});
	}
}

class HistoryButton extends Button {
	constructor(item) {
		super(item);
		this.url = item.url;
	}
	click(e) { /*override*/
		
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
		root.insert(new Separator({title: "Recently Closed"}));
		for (let session of sessions) {
			let bit = session.tab || session.window;
			bit.sessionId = session.sessionId;
			if (session.tab)
				root.insert(new TabButton(bit));
			if (session.window)
				root.insert(new TabButton(bit));
		}
		root.insert(new Separator({title: "Separator"}));
		for (let item of history) {
			root.insert(new HistoryButton(item));		
		}
	}).apply(this, arr);
});

Root.ready().then(function (root) {
	root.setTheme("Ubuntu", true);
});

