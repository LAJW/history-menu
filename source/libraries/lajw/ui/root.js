"use strict"
var Root = (function () {
	var root, Root = new Class({
		prototype: Parent,
		constructor: function () {
			if (root)
				throw new Error("Root already exists");
			Parent.call(this, {DOM: document.body});
			['click', 'mousedown', 'mouseup'].forEach(function (eventName) {
				document.body.addEventListener(eventName, function (e) {
					Node.fromDOM(e.target)[eventName](e);
				});
			});
		},
		setTheme: function (platform, animate) {
			typecheck(arguments, ["Windows", "Ubuntu", undefined], Boolean);
			this.DOM.classList.add(platform);
			if (animate)
				this.DOM.classList.add("animate");
		}
	});
	return {
		ready: function () {
			return new Promise(function (resolve) {
				function callback() {
					resolve(root = root || new Root);
				}
				if (document.body) 
					setTimeout(callback, 0);
				else window.addEventListener("load", callback);
			});
		}
	}
})();
