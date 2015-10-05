"use strict"

class HistoryButton extends Button {
	constructor(item) {
		if (!item.title) {
			item.tooltip = item.url;
			item.url = trimURL(item.url);
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
