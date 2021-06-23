import TimerButton from "./TimerButton"
import Chrome from "./Chrome"

interface TabButtonInfo extends chrome.tabs.Tab { 
	lastModified? : number
}

export default class TabButton extends TimerButton {
	readonly #sessionId : string
	constructor(tab : TabButtonInfo) {
		super({
			icon:   "chrome://favicon/" + tab.url,
			title:   tab.title,
			tooltip: tab.title !== tab.url
				? tab.title + "\n" + tab.url
				: tab.url,
			timer:   tab.lastModified * 1000
		});
		this.#sessionId = tab.sessionId;
	}
	override async click(e : MouseEvent) {
		if (e.button === 0 || e.button === 1) {
			e.preventDefault();
			await Chrome.sessions.restore(this.#sessionId, e.button == 1 || e.ctrlKey);
		}
	}
}
