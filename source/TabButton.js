"use strict"

let template = $({
	nodeName: "DIV",
	className: "Timer",
	childNodes: [$("")]
});

function relativeTime(value) {
	typecheck(arguments, Number);
	var diff = ( Date.now() - value ) / 1000;
	if (diff < 60) {
		return "<1m";
	} else if (diff < 3600) {
		return Math.round(diff / 60) + "m";
	} else if (diff < 3600 * 24) {
		return Math.round(diff / 3600) + "h";
	} else if (diff < 3600 * 24 * 365) {
		return Math.round(diff / 3600 / 24) + "d";
	} else {
		return Math.round(diff / 3600 / 24 / 365) + "y";	
	}
}

class TabButton extends Button {
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
			this.timer = relativeTime((tab.lastModified | 0) * 1000);
		else this.timer = undefined;
	}
	click(e) { /*override*/
		e.preventDefault();
		Chrome.sessions.restore(this.sessionId, e.which == 2 || e.ctrlKey);
	}
	set timer(value) {
		typecheck(arguments, [String, undefined]);
		this._timer.nodeValue = value;
		this._timer.parentNode.style.visibility = value ? "visible" : "hidden";
	}
	get timer() {
		return this._timer.nodeValue;
	}
};

