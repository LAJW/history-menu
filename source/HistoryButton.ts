import TimerButton from "./TimerButton"
import Chrome from "./Chrome"
import Parent from "./components/Parent";
import { I18n } from "./Settings";
import { removeProtocol, $, trimURL, isInBackground } from "./Utils";

const removeButton = $({
	nodeName: "A",
	className: "Remove"
});

const isOpera : boolean = /OPERA|OPR\//i.test(navigator.userAgent)

function faviconUrl(url : string) : string {
	// Workaround for Opera which does not have a "favicon" API yet
	// Source: https://forums.opera.com/topic/61672/manifest-v3-favicons-api
	if (isOpera) {
		return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32`;
	} else {
		return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;
	}
}

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
		icon : faviconUrl(item.url),
	}
	if (!item.title) {
		return { ...rewired, title : trimURL(removeProtocol(item.url)), tooltip : removeProtocol(item.url) }
	} else {
		const tooltip = `${item.originalTitle ?? item.title}\n${removeProtocol(item.url)}`;
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
	readonly #lastModified: number
	readonly #remove: HTMLElement
	readonly #interval: NodeJS.Timeout
	#highlighted: boolean
	#aux: HTMLElement
	constructor(i18n : I18n, item : HistoryButtonInfo) {
		super(sanitize(item));
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
					await chrome.history.deleteUrl({ url: this.url });
					(this.parent as Parent).remove(this);
				}
			} else if (this.preferSelect) {
				await Chrome.tabs.openOrSelect(this.url, inBackground);
				if (!inBackground) {
					window.close();
				}
			} else {
				await Chrome.tabs.openInCurrentTab(this.url, inBackground);
				if (!inBackground) {
					window.close()
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
