import Node from "./Node"
import Parent from "./Parent"
import { $ } from "../utils"

const template = $({
	nodeName : "DIV",
	className : "Layer"
})

export default class Layer extends Parent {
	_visible : boolean
	constructor(e : {
			id? : string
			visible? : boolean
			children? : Node[]
		} = {}) {
		super({ ...e, DOM : template.cloneNode(true) as HTMLElement });
		this.visible = e.visible === undefined ? true : e.visible;
	}
	// bool visible - is this layer visible
	get visible() {
		return this._visible;
	}
	set visible(value : boolean) {
		this._visible = value;
		this.DOM.classList.toggle("visible", value);
	}
}
