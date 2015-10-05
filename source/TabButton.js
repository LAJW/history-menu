"use strict"

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
		Chrome.sessions.restore(this.sessionId, e.which == 2 || e.ctrlKey);
	}
};

