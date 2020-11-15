import Chrome from "./Chrome.js"
import Folder from "./libraries/lajw/ui/Folder.js"
import TabButton from "./TabButton.js"

const template = $({
	nodeName:  "DIV",
	className: "Timer hidden",
	childNodes: [$("")]
});

export default class WindowFolder extends Folder {
	constructor(wnd) {
		typecheck.loose(arguments, {
			sessionId: String,
		});
		super();
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
	mousedown(e) { /* override */
		e.preventDefault();
	}
	click(e) { /*override*/
		e.preventDefault();
		if (e.which == 2 || e.ctrlKey) {
			Chrome.sessions.restore(this.sessionId, true);
		} else {
			Folder.prototype.click.call(this, e);
		}
	}
	set timer(value) {
		typecheck(arguments, [String, undefined]);
		this._timer.nodeValue = value;
		this._timer.parentNode.classList.toggle("hidden", !value);
	}
	get timer() {
		return this._timer.nodeValue;
	}
}
