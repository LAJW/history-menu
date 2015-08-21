var Separator = (function () {
	var template = $({
		nodeName: "DIV",
		className: "Separator",
		childNodes: [
			$({
				nodeName: "SPAN",
				className: "menuItem",
				childNodes: [$("")]
			}),
			$({
				nodeName: "HR"
			})
		]
	});
	return new Class({
		// PRIVATE: _title
		prototype: Node,
		/* constructor({
			String title = "",
		}) */
		constructor: function (e) {
			e = e || {};
			e.DOM = template.cloneNode(true);
			Node.call(this, e);
			this._title = this.DOM.firstChild.firstChild;
			this.title = e.title || "";
		},
		title: {
			get: function () {
				return this._title.nodeValue;
			},
			set: function (value) {
				this._title.nodeValue = value;
			}
		},
		// 1. void fadeIn(delay) - fadein animation
		fadeIn: function (delay) {
			typecheck(arguments, Number);
			this.DOM.style.WebkitAnimationDelay = delay + "ms";
			this.DOM.classList.add("fadeIn");
		}
	})
})();
