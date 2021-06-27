import Chrome from "./Chrome"
import Folder from "./libraries/lajw/ui/Folder"
import TabButton from "./TabButton"
import { $, relativeTime } from "./libraries/lajw/utils"

const template = $({
	nodeName:  "DIV",
	className: "Timer hidden",
	childNodes: [$("")]
});

interface WindowFolderInfo extends chrome.windows.Window {
	fadeInEnabled : boolean
	lastModified : number
	open? : boolean
}

function sessionInfo(wnd : WindowFolderInfo) {
	const info = wnd.tabs.map(tab => " - " + tab.title.substr(0, 16)).join("\n")
	return `Window:\n${info}`
}

export default class WindowFolder extends Folder {
	readonly #timer : Node
	readonly #sessionId : string
	constructor(i18n : (key: string) => string, wnd : WindowFolderInfo) {
		super({
			title : `${i18n("popup_window")} (${i18n("popup_number_of_tabs")}: ${wnd.tabs.length})`,
			children : wnd.tabs.map(tab => new TabButton(tab)),
			tooltip : sessionInfo(wnd),
			fadeInEnabled : wnd.fadeInEnabled,
		});
		this.#timer = this.DOM.firstChild
			.insertBefore(template.cloneNode(true), this.DOM.firstChild.firstChild)
			.firstChild;
		if (wnd.lastModified) {
			this.timer = relativeTime(wnd.lastModified * 1000);
		}
		if (wnd.open !== undefined) {
			this.open = wnd.open;
		}
		this.#sessionId = wnd.sessionId;
	}
	override mousedown(e : MouseEvent) {
		e.preventDefault();
	}
	override click(e : MouseEvent) {
		e.preventDefault();
		if (e.button == 1 || e.button == 0 && e.ctrlKey) {
			Chrome.sessions.restore(this.#sessionId, false);
			window.close();
		} else if (e.button == 0) {
			super.click(e)
		}
	}
	set timer(value : string) {
		this.#timer.nodeValue = value;
		(this.#timer.parentNode as HTMLElement).classList.toggle("hidden", !value);
	}
	get timer() {
		return this.#timer.nodeValue;
	}
}
