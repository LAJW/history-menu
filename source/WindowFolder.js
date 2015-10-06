"use strict"

var WindowFolder = (function () {
	const template = $({
		nodeName: "DIV",
		className: "Timer hidden",
		childNodes: [$("")]
	});
	class WindowFolder extends Folder {
		constructor(window) {
			typecheck.loose(arguments, {
				sessionId: String,
			});
			super();
			this.title = "Window (Number of tabs: " + window.tabs.length + ")";
			for (let tab of window.tabs) {
				this.insert(new TabButton(tab));
			}
			this._timer = this.DOM.firstChild.appendChild(template.cloneNode(true)).firstChild;
			if (window.lastModified)
				this.timer = relativeTime(window.lastModified * 1000);
		}
		click(e) { /*override*/
			e.preventDefault();
			Folder.prototype.click.call(this, e);
			if (e.which == 2 || e.ctrlKey) {
				Chrome.sessions.restore(this.sessionId, true);
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
	return WindowFolder;
})();
