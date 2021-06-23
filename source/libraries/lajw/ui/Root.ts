import Parent from "./Parent"
import Node from "./Node"

let root : Root; 
export default class Root extends Parent {
	_width : number
	_height : number
	constructor() {
		if (root)
			throw new Error("Root already exists");
		super({DOM: document.body, children : []});
		document.body.addEventListener("click", e => Node.fromDOM(e.target as HTMLElement).click(e))
		document.body.addEventListener("mouseup", e => Node.fromDOM(e.target as HTMLElement).mouseup(e))
		document.body.addEventListener("mousedown", e => Node.fromDOM(e.target as HTMLElement).mousedown(e))
		document.body.addEventListener("auxclick", e => Node.fromDOM(e.target as HTMLElement).click(e));
	}
	setTheme(platform? : string, animate? : boolean) {
		if (platform)
			this.DOM.classList.add(platform);
		if (animate)
			this.DOM.classList.add("animate");
	}
	get width() {
		return this._width;
	}
	set width(value : number) {
		this.DOM.style.width = value + "px";
		this._width = value;
	}
	get height() {
		return this._height;
	}
	set height(value : number) {
		this.DOM.style.height = value + "px";
		this._height = value;
	}
	static ready() : Promise<Root> {
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
