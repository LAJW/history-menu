export default class UINode {
	readonly DOM: HTMLElement
	_parent? : UINode

	constructor(e : { DOM: HTMLElement }) {
		Object.defineProperty(this, "DOM", { value: e.DOM });
		Object.defineProperty(e.DOM, "_node", { value: this });
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
