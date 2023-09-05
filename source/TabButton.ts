import TimerButton from "./TimerButton"
import Chrome from "./Chrome"
import { isInBackground, removeProtocol } from "./Utils";
import {ISessions} from "./models/Sessions";

export interface TabButtonInfo {
	title: string
	originalTitle: string
	url: string
	lastModified? : number
	sessionId: string
	sessions: ISessions
}

export default class TabButton extends TimerButton {
	readonly #sessionId : string
	readonly #sessions : ISessions
	constructor(tab : TabButtonInfo) {
		super({
			icon :   `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(tab.url)}&size=32`,
			title:   tab.title,
			tooltip: tab.originalTitle !== tab.url
				? `${tab.originalTitle}\n${removeProtocol(tab.url)}`
				: removeProtocol(tab.url),
			timer:   tab.lastModified * 1000
		});
		this.#sessions = tab.sessions
		this.#sessionId = tab.sessionId;
		(this.DOM as HTMLAnchorElement).href = tab.url;
	}
	override async click(e : MouseEvent) {
		if (e.button === 0 || e.button === 1) {
			e.preventDefault();
			await this.#sessions.restore(this.#sessionId, isInBackground(e));
		}
	}
}
