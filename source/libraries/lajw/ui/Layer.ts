import Node from "./Node"
import Parent from "./Parent"
import { $ } from "../utils"

const template = $({
	nodeName : "DIV",
	className : "Layer"
})

export default class Layer extends Parent {
	#visible : boolean
	constructor({visible, children} : { visible? : boolean, children : Node[] }) {
		super({ children, DOM : template.cloneNode(true) as HTMLElement });
		this.visible = visible ?? true;
	}
	// bool visible - is this layer visible
	get visible() {
		return this.#visible;
	}
	set visible(value : boolean) {
		this.#visible = value;
		this.DOM.classList.toggle("visible", value);
	}
}
