"use strict"

define(["./TimerButton", "./Chrome"], function (TimerButton, Chrome) {

class TabButton extends TimerButton {
   constructor(tab) {
		typecheck.loose(arguments, {
			sessionId: String,
			lastModified: [Number, undefined]
		});
		super({
			icon: "chrome://favicon/" + tab.url,
			title: tab.title,
			tooltip: tab.url,
			timer: tab.lastModified * 1000
		});
		this.sessionId = tab.sessionId;
	}
	mousedown(e) { /* override */
		if (e.which == 2)
			e.preventDefault();
	}
	click(e) { /*override*/
		e.preventDefault();
		Chrome.sessions.restore(this.sessionId, e.which == 2 || e.ctrlKey);
	}
};

return TabButton;

});
