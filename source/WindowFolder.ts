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
	lastModified : number
	open? : boolean
}

export default class WindowFolder extends Folder {
	_timer : Node
	sessionId : string
	constructor(wnd : WindowFolderInfo) {
		super({ children : [] });
		this._timer = this.DOM.firstChild
			.appendChild(template.cloneNode(true))
			.firstChild;
		this.title  = "Window (Number of tabs: " + wnd.tabs.length + ")";
		for (const tab of wnd.tabs) {
			this.insert(new TabButton(tab));
		}
		if (wnd.lastModified) {
			this.timer = relativeTime(wnd.lastModified * 1000);
		}
		if (wnd.open !== undefined) {
			this.open = wnd.open;
		}
		this.sessionId = wnd.sessionId;
	}
	override mousedown(e : MouseEvent) {
		e.preventDefault();
	}
	override click(e : MouseEvent) {
		e.preventDefault();
		if (e.button == 0) {
			super.click(e)
		} else if (e.button == 1 || e.ctrlKey) {
			Chrome.sessions.restore(this.sessionId, true);
		}
	}
	set timer(value : string) {
		this._timer.nodeValue = value;
		(this._timer.parentNode as HTMLElement).classList.toggle("hidden", !value);
	}
	get timer() {
		return this._timer.nodeValue;
	}
}
