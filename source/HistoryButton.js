"use strict"

define(["./Chrome", "./TimerButton"], function(Chrome, TimerButton) {

const removeButton = $({
	nodeName: "DIV",
	className: "Remove"
});

class HistoryButton extends TimerButton {
	constructor(item) {
		typecheck.loose(arguments, [{
			tooltip: [String, undefined],
			title: [String, undefined],
			url: String,
			lastVisitTime: [Number, undefined],
			preferSelect: [Boolean, undefined]
		}, undefined]);
		if (!item.title) {
			item.tooltip = item.url;
			item.title = trimURL(item.url);
			item.tooltip = item.url;
		} else {
			item.tooltip = item.title + "\n" + item.url;
		}
		item.timer = item.lastVisitTime;
		super(item);
		this.DOM.classList.add("History");
		this.url = item.url;
		this.icon = "chrome://favicon/" + item.url;
		this.preferSelect = item.preferSelect;
		if (item.lastVisitTime) {
			this._lastModified = item.lastVisitTime;
		}
		this._remove = this.DOM.appendChild(removeButton.cloneNode(true));
		this.preferSelect = item.preferSelect;
	}
	fadeIn(e) {
		super.fadeIn(e);
		if (this._lastModified) {
			this._updateTimer();
			this._interval = setInterval(this._updateTimer.bind(this), 500);
		}
	}
	fadeOut(e) {
		super.fadeOut(e);
		clearInterval(this._interval);
	}
	mousedown(e) /*override*/ {
		if (e.which == 2)
			e.preventDefault();
	}
	click(e) { /*override*/
		e.preventDefault();
		if (e.target == this._remove) {
			Chrome.history.deleteUrl({ url: this.url });
			this.parent.remove(this);
		} else if (this.preferSelect)
			Chrome.tabs.openOrSelect(this.url, e.which == 2 || e.ctrlKey);
		else Chrome.tabs.create({
			url: this.url, 
			active: !(e.which == 2 || e.ctrlKey)
		}).then(window.close);
	}
	get url() {
		return this.DOM.href;	
	}
	set url(value) {
		this.DOM.href = value;
	}
	set highlighted(value) {
		typecheck(arguments, Boolean);
		this._highlighted = value;
		this.DOM.classList.toggle("highlighted", value);
	}
	get highlighted() {
		return this._highlighted;
	}
}

return HistoryButton;

});
