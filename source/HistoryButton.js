"use strict"

var HistoryButton = (function () {
	const template = $({
		nodeName: "DIV",
		className: "Timer hidden",
		childNodes: [$("")]
	});
	const removeButton = $({
		nodeName: "DIV",
		className: "Remove"
	});
	class HistoryButton extends Button {
		constructor(item) {
			if (!item.title) {
				item.tooltip = item.url;
				item.title = trimURL(item.url);
				item.tooltip = item.url;
			} else {
				item.tooltip = item.title + "\n" + item.url;
			}
			super(item);
			this.DOM.classList.add("History");
			this.url = item.url;
			this.icon = "chrome://favicon/" + item.url;
			this._timer = this.DOM.appendChild(template.cloneNode(true)).firstChild;
			if (item.lastVisitTime)
				this.timer = relativeTime(item.lastVisitTime);
			this._remove = this.DOM.appendChild(removeButton.cloneNode(true));
		}
		click(e) { /*override*/
			e.preventDefault();
			if (e.target == this._remove) {
				Chrome.history.deleteUrl({url: this.url});
				this.parent.remove(this);
			} else Chrome.tabs.openOrSelect(this.url, e.which == 2 || e.ctrlKey);
		}
		get url() {
			return this.DOM.href;	
		}
		set url(value) {
			this.DOM.href = value;
		}
		get timer() {
			return this._timer.nodeValue;
		}
		set timer(value) {
			typecheck(arguments, String);
			this._timer.nodeValue = value;
			this._timer.parentNode.classList.toggle("hidden", !value);
		}
	}
	return HistoryButton;
})();
