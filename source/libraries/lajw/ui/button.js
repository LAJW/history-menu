"use strict"
var Button = (function () {
	var template = $({
		nodeName: "A",
		className: "menuItem Button",
		childNodes: [$("")]
	});
	return new Class({
		prototype: Node,
		/* constructor({
			String icon = "",
			String tooltip = "",
			String title = ""
		}) */
		constructor: function (e) {
			typecheck(arguments, [{
				icon: [String, undefined],
				title: [String, undefined],
				tooltip: [String, undefined],
			}, undefined], typecheck.loose);
			e = e || {};
			e.DOM = template.cloneNode(true);
			Node.call(this, e);
			this.title = e.title || "";
			this.icon = e.icon || "";
			this.tooltip = e.tooltip || "";
		},
		// String title
		title: {
			get: function () { return this.DOM.firstChild.nodeValue; },
			set: function (value) { 
				typecheck(arguments, String);
				this.DOM.firstChild.nodeValue = value;	
			}
		},
		// String icon - icon URL
		icon: {
			get: function () { return this._icon },
			set: function (value) {
				typecheck(arguments, String);
				this._icon = value;
				this.DOM.style.backgroundImage = value ? url(value) : "none";
			}
		},
		// String tooltop
		tooltip: {
			get: function () { return this.DOM.title },
			set: function (value) {
				typecheck(arguments, String);
				this.DOM.tooltip = value;
			}
		},
		// void fadeIn (delay) - fadeIn animation
		fadeIn: function (delay) {
			typecheck(arguments, Number);
			this.DOM.style.WebkitAnimationDelay = delay + "ms";
			this.DOM.classList.add("fadeIn");
		},
		fadeOut: function (delay) {
			typecheck(arguments, Number);
			this.DOM.style.WebkitAnimationDelay = delay + "ms";
			this.DOM.classList.add("fadeOut");
		}
	})
})();
