"use strict"
var Separator = (function () {
	const template = $({
		nodeName: "DIV",
		className: "Separator",
		childNodes: [
			$({
				nodeName: "SPAN",
				className: "menuItem",
				childNodes: [$("")]
			}), $({
				nodeName: "HR"
			})
		]
	});
	class Separator extends Node {
		// PRIVATE: _title
		constructor(e) {
			e = e || {};
			e.DOM = template.cloneNode(true);
			super(e);
			this._title = this.DOM.firstChild.firstChild;
			this.title = e.title || "";
		}
		get title() {
			return this._title.nodeValue;
		}
		set title(value) {
			typecheck(arguments, String);
			this._title.nodeValue = value;
		}
		fadeIn(delay) { // override
			typecheck(arguments, Number);
			this.DOM.style.WebkitAnimationDelay = delay + "ms";
			this.DOM.classList.add("fadeIn");
		}
	}
	return Separator;
})();
