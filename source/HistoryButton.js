import TimerButton from "./TimerButton.js"
import Chrome from "./Chrome.js"

const removeButton = $({
	nodeName: "DIV",
	className: "Remove"
});

export default class HistoryButton extends TimerButton {
	constructor(item) {
		typecheck.loose(arguments, [{
			tooltip:       [String, undefined],
			title:         [String, undefined],
			url:           String,
			lastVisitTime: [Number, undefined],
			preferSelect:  [Boolean, undefined]
		}, undefined]);
		if (!item.title) {
			item.tooltip = item.url;
			item.title   = trimURL(item.url);
			item.tooltip = item.url;
		} else {
			item.tooltip = item.title + "\n" + item.url;
		}
		item.timer        = item.lastVisitTime;
		super(item);
		this.DOM.classList.add("History");
		this.url          = item.url;
		this.icon         = "chrome://favicon/" + item.url;
		this.preferSelect = item.preferSelect;
		if (item.lastVisitTime) {
			this._lastModified = item.lastVisitTime;
		}
		this._remove      = this.DOM.appendChild(removeButton.cloneNode(true));
		this.preferSelect = item.preferSelect;
	}
	fadeIn(e) { /* override */
		super.fadeIn(e);
		if (this._lastModified) {
			this._updateTimer();
			this._interval = setInterval(this._updateTimer.bind(this), 500);
		}
	}
	fadeOut(e) { /* override */
		super.fadeOut(e);
		clearInterval(this._interval);
	}
	async click(e) { /*override*/
		if (e.button === 0 || e.button === 1) {
			e.preventDefault();
			if (e.target == this._remove) {
				if (e.button === 0) {
					Chrome.history.deleteUrl({ url: this.url });
					this.parent.remove(this);
				}
			} else if (this.preferSelect) {
				await Chrome.tabs.openOrSelect(this.url, e.button === 1 || e.ctrlKey);
				if (e.button === 0) {
					window.close();
				}
			} else {
				await Chrome.tabs.create({
					url:    this.url, 
					active: !(e.button === 1 || e.ctrlKey)
				})
				window.close()
			}
		}
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
