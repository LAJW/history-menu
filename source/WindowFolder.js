"use strict"

class WindowFolder extends Folder {
	constructor(window) {
   		typecheck.loose(arguments, {
			sessionId: String,
		});
		super();
		this.title = "Window (Number of tabs: " + window.tabs.length + ")";
		for (let tab of window.tabs) {
			this.insert(new TabButton(tab));
		}
	}
	click(e) { /*override*/
		e.preventDefault();
		Folder.prototype.click.call(this, e);
		if (e.which == 2) {
			Chrome.sessions.restore(this.sessionId, true);
		}
	}
}
