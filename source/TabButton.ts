import TimerButton from "./TimerButton"
import Chrome from "./Chrome"
import { removeProtocol } from "./Utils";

interface TabButtonInfo extends chrome.tabs.Tab { 
	lastModified? : number
	originalTitle?: string
}

export default class TabButton extends TimerButton {
	readonly #sessionId : string
	constructor(tab : TabButtonInfo) {
		super({
			icon:   `chrome://favicon/${tab.url}`,
			title:   tab.title,
			tooltip: tab.originalTitle !== tab.url
				? `${tab.originalTitle}\n${removeProtocol(tab.url)}`
				: removeProtocol(tab.url),
			timer:   tab.lastModified * 1000
		});
		this.#sessionId = tab.sessionId;
		(this.DOM as HTMLAnchorElement).href = tab.url;
	}
	override async click(e : MouseEvent) {
		if (e.button === 0 || e.button === 1) {
			e.preventDefault();
			await Chrome.sessions.restore(this.#sessionId, e.button == 1 || e.ctrlKey);
		}
	}
}
