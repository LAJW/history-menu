export default class UINode {
	readonly DOM: HTMLElement
	_parent : UINode | undefined

	constructor(e : {
		DOM: HTMLElement | string
		id?: string
	}) {
		if (e) {
			const DOM = typeof e.DOM === "string" ? document.createElement(e.DOM) : e.DOM as HTMLElement;
			Object.defineProperty(this, "DOM", { value: DOM });
			Object.defineProperty(DOM, "_node", { value: this });
			if (e.id) {
				this.id = e.id;
			}
		}
	}
	get id() {
		return this.DOM.id;
	}
	set id(value) {
		this.DOM.id = value;
	}
	get parent() {
		return this._parent;
	}
	get height() {
		return this.DOM.offsetHeight;
	}
	fadeIn(delay : number) : void { }
	fadeOut(delay : number) : void { }
	click(e : MouseEvent) { }
	mousedown(e : MouseEvent) { }
	mouseup(e : MouseEvent) { }

	// get Node from existing DOM Element
	static fromDOM(element : HTMLElement) : UINode {
		let cur : Node | undefined = element
		while(cur) {
			if (cur.hasOwnProperty("_node")) {
				return (cur as any)._node;
			}
			cur = cur.parentNode;
		}
		throw new TypeError("Element does not belong to any node");
	}
}
