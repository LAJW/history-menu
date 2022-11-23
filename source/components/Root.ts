import Parent from "./Parent"
import Node from "./Node"

let root : Root; 
export default class Root extends Parent {
	#width : number
	#height : number
	constructor() {
		super({DOM: document.getElementById("root") || document.body, children : [], fadeInEnabled: false});
		if (root)
			throw new Error("Root already exists");
		document.body.addEventListener("click", e => Node.fromDOM(e.target as HTMLElement).click(e))
		document.body.addEventListener("mouseup", e => Node.fromDOM(e.target as HTMLElement).mouseup(e))
		document.body.addEventListener("mousedown", e => Node.fromDOM(e.target as HTMLElement).mousedown(e))
		document.body.addEventListener("auxclick", e => Node.fromDOM(e.target as HTMLElement).click(e));
	}
	setTheme(platform : string, animate : boolean, darkModeEnabled : boolean) {
		if (darkModeEnabled) {
			document.body.classList.add("darkMode")
		}
		if (platform)
			this.DOM.classList.add(platform);
		if (animate)
			this.DOM.classList.add("animate");
	}
	get width() {
		return this.#width;
	}
	set width(value : number) {
		this.DOM.style.width = value + "px";
		this.#width = value;
	}
	get height() {
		return this.#height;
	}
	set height(value : number) {
		this.DOM.style.height = value + "px";
		this.#height = value;
	}
	static ready() : Promise<Root> {
		return new Promise(resolve => {
			function callback() {
				resolve(root = root || new Root);
			}
			if (document.body) 
				setTimeout(callback, 0);
			else window.addEventListener("DOMContentLoaded", callback);
		});
	}
}
