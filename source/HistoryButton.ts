import TimerButton from "./TimerButton"
import Parent from "./components/Parent";
import {I18n, SelectBehavior} from "./Settings";
import { removeProtocol, $, trimURL, isInBackground } from "./Utils";
import {Model} from "./models/Model";

const removeButton = $({
	nodeName: "A",
	className: "Remove"
});

function sanitize(item : {
	model : Model
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
		icon : item.model.favicons.forUrl(item.url),
	}
	if (!item.title) {
		return { ...rewired, title : trimURL(removeProtocol(item.url)), tooltip : removeProtocol(item.url) }
	} else {
		const tooltip = `${item.originalTitle ?? item.title}\n${removeProtocol(item.url)}`;
		return { ...rewired, title : item.title, tooltip }
	}
}

interface HistoryButtonInfo extends chrome.history.HistoryItem {
	model : Model
	preferSelect? : SelectBehavior
	originalTitle? : string
	aux? : string
}

export default class HistoryButton extends TimerButton {
	preferSelect: SelectBehavior
	readonly #lastModified: number
	readonly #remove: HTMLElement
	readonly #interval: NodeJS.Timeout
	#highlighted: boolean
	#aux: HTMLElement
	#model: Model
	constructor(i18n : I18n, item : HistoryButtonInfo) {
		super(sanitize(item));
		this.#model = item.model;
		this.DOM.classList.add("History");
		this.url          = item.url ?? "";
		this.preferSelect = item.preferSelect ?? false;
		if (item.lastVisitTime) {
			this.#lastModified = item.lastVisitTime;
		}
		this.#remove = this.DOM.appendChild(removeButton.cloneNode(true)) as HTMLAnchorElement;
		this.#remove.title = i18n("remove");
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
			const inBackground = isInBackground(e)
			if (e.target == this.#remove) {
				if (e.button === 0) {
					await this.#model.history.deleteUrl(this.url);
					(this.parent as Parent).remove(this);
				}
			} else if (this.preferSelect === "alwaysOpenInNewTab") {
				await this.#model.tabs.openInNewTab(this.url, inBackground);
				if (!inBackground) {
					this.#model.browser.closeWindow();
				}
			} else if (this.preferSelect) {
				await this.#model.tabs.openOrSelect(this.url, inBackground);
				if (!inBackground) {
					this.#model.browser.closeWindow();
				}
			} else {
				await this.#model.tabs.openInCurrentTab(this.url, inBackground);
				if (!inBackground) {
					this.#model.browser.closeWindow();
				}
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
