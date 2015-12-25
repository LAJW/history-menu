"use strict"
define(["chrome"], function(Chrome) {
const template = $({
	nodeName: "DIV",
	className: "Timer hidden",
	childNodes: [$("")]
});

return class TabButton extends Button {
   constructor(tab) {
		typecheck.loose(arguments, {
			sessionId: String,
			lastModified: [Number, undefined]
		});
		super({
			icon: "chrome://favicon/" + tab.url,
			title: tab.title,
			tooltip: tab.url
		});
		this.sessionId = tab.sessionId;
		this._timer = this.DOM.appendChild(template.cloneNode(true)).firstChild;
		if (tab.lastModified)
			this.timer = relativeTime(tab.lastModified * 1000);
	}
	mousedown(e) { /* override */
		if (e.which == 2)
			e.preventDefault();
	}
	click(e) { /*override*/
		e.preventDefault();
		Chrome.sessions.restore(this.sessionId, e.which == 2 || e.ctrlKey);
	}
	set timer(value) {
		typecheck(arguments, [String, undefined]);
		this._timer.nodeValue = value;
		this._timer.parentNode.classList.toggle("hidden", !value);
	}
	get timer() {
		return this._timer.nodeValue;
	}
};
});
