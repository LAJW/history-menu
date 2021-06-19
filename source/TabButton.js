import TimerButton from "./TimerButton"
import Chrome from "./Chrome.js"

export default class TabButton extends TimerButton {
   constructor(tab) {
		typecheck.loose(arguments, {
			sessionId:    String,
			lastModified: [Number, undefined]
		});
		super({
			icon:   "chrome://favicon/" + tab.url,
			title:   tab.title,
			tooltip: tab.title !== tab.url
				? tab.title + "\n" + tab.url
				: tab.url,
			timer:   tab.lastModified * 1000
		});
		this.sessionId = tab.sessionId;
	}
	async click(e) { /*override*/
		if (e.button === 0 || e.button === 1) {
			e.preventDefault();
			await Chrome.sessions.restore(this.sessionId, e.button == 1 || e.ctrlKey);
			await Chrome.tabs.update()
		}
	}
}
