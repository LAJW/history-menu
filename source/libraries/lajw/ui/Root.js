import Parent from "./Parent.js"
import Node from "./Node.js"

let root; 
export default class Root extends Parent {
	constructor() {
		if (root)
			throw new Error("Root already exists");
		super({DOM: document.body});
		['click', 'mousedown', 'mouseup'].forEach(function (eventName) {
			document.body.addEventListener(eventName, function (e) {
				Node.fromDOM(e.target)[eventName](e);
			});
		});
		document.body.addEventListener("auxclick", e => Node.fromDOM(e.target).click(e));
	}
	setTheme(platform, animate) {
		typecheck(arguments, String, Boolean);
		if (platform)
			this.DOM.classList.add(platform);
		if (animate)
			this.DOM.classList.add("animate");
	}
	get width() {
		return this._width;
	}
	set width(value) {
		typecheck(arguments, Number);
		this.DOM.style.width = value + "px";
		this._width = value;
	}
	get height() {
		return this._height;
	}
	set height(value) {
		typecheck(arguments, Number);
		this.DOM.style.height = value + "px";
		this._height = value;
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
