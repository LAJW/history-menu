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
	originalTitle?: string
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
		const tooltip =
			(item.originalTitle && item.originalTitle != item.title)
			? `${item.title} (${item.originalTitle})\n${item.url}` 
			: `${item.title}\n${item.url}`;
		return { ...rewired, title : item.title, tooltip }
	}
}

interface HistoryButtonInfo extends chrome.history.HistoryItem {
	preferSelect? : boolean
	originalTitle? : string
	aux? : string
}

export default class HistoryButton extends TimerButton {
	preferSelect: boolean
	#lastModified: number
	#remove: Node
	#interval: NodeJS.Timeout
	#highlighted: boolean
	#aux: HTMLElement
	constructor(item : HistoryButtonInfo) {
		super(sanitize(item));
		this.DOM.classList.add("History");
		this.url          = item.url ?? "";
		this.preferSelect = item.preferSelect ?? false;
		if (item.lastVisitTime) {
			this.#lastModified = item.lastVisitTime;
		}
		this.#remove = this.DOM.appendChild(removeButton.cloneNode(true));
		this.#aux = this.DOM.appendChild(document.createElement("i"));
		if (item.aux) {
			this.#aux.style.color = "#aaa";
			this.#aux.appendChild(document.createTextNode(" " + item.aux));
		}
		if (this.#lastModified) {
			this.updateTimer();
			this.#interval = setInterval(this.updateTimer.bind(this), 500);
		}
	}
	override fadeOut(e : number) {
		super.fadeOut(e);
		clearInterval(this.#interval);
	}
	override async click(e : MouseEvent) {
		if (e.button === 0 || e.button === 1) {
			e.preventDefault();
			if (e.target == this.#remove) {
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
		this.#highlighted = value;
		this.DOM.classList.toggle("highlighted", value);
	}
	get highlighted() {
		return this.#highlighted;
	}
}
