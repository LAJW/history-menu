"use strict"
var Root = (function () {
	let root; 
	class Root extends Parent {
		constructor() {
			if (root)
				throw new Error("Root already exists");
			super({DOM: document.body});
			['click', 'mousedown', 'mouseup'].forEach(function (eventName) {
				document.body.addEventListener(eventName, function (e) {
					Node.fromDOM(e.target)[eventName](e);
				});
			});
		}
		setTheme(platform, animate) {
			typecheck(arguments, ["Windows", "Ubuntu", undefined], Boolean);
			this.DOM.classList.add(platform);
			if (animate)
				this.DOM.classList.add("animate");
		}
		static ready() {
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
	return Root;
})();
