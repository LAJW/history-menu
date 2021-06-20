import TimerButton from "./TimerButton"
import Chrome from "./Chrome"
import { $, trimURL } from "./libraries/lajw/utils"
import Parent from "./libraries/lajw/ui/Parent";

const removeButton = $({
	nodeName: "DIV",
	className: "Remove"
});

function sanitize(item : {
	title?: string
	url?: string
	lastVisitTime?: number
}) {
	if (!item.url) {
		console.warn("Missing URL in HistoryItem")
	}
	const url = item.url ?? ""
	const rewired = {
		url,
		timer : item.lastVisitTime,
		icon : "chrome://favicon/" + item.url,
	}
	if (!item.title) {
		return { ...rewired, title : trimURL(item.url), tooltip : item.url }
	} else {
		return { ...rewired, title : item.title, tooltip : item.title + "\n" + item.url }
	}
}

interface HistoryButtonInfo extends chrome.history.HistoryItem {
	preferSelect? : boolean
}

export default class HistoryButton extends TimerButton {
	preferSelect: boolean
	_lastModified: number
	_remove: Node
	_interval: NodeJS.Timeout
	_highlighted: boolean
	constructor(item : HistoryButtonInfo) {
		super(sanitize(item));
		this.DOM.classList.add("History");
		this.url          = item.url ?? "";
		this.preferSelect = item.preferSelect ?? false;
		if (item.lastVisitTime) {
			this._lastModified = item.lastVisitTime;
		}
		this._remove      = this.DOM.appendChild(removeButton.cloneNode(true));
	}
	override fadeIn(e : number) {
		super.fadeIn(e);
		if (this._lastModified) {
			this._updateTimer();
			this._interval = setInterval(this._updateTimer.bind(this), 500);
		}
	}
	override fadeOut(e : number) {
		super.fadeOut(e);
		clearInterval(this._interval);
	}
	override async click(e : MouseEvent) {
		if (e.button === 0 || e.button === 1) {
			e.preventDefault();
			if (e.target == this._remove) {
				if (e.button === 0) {
					Chrome.history.deleteUrl({ url: this.url });
					(this.parent as Parent).remove(this);
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
		return (this.DOM as HTMLAnchorElement).href;
	}
	set url(value : string) {
		(this.DOM as HTMLAnchorElement).href = value;
	}
	set highlighted(value : boolean) {
		this._highlighted = value;
		this.DOM.classList.toggle("highlighted", value);
	}
	get highlighted() {
		return this._highlighted;
	}
}
