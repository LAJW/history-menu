import Node from "./Node"
import { $ } from "../utils"

let template = $({
	nodeName: "label",
	className: "Checkbox",
	childNodes: [
		$({
			nodeName: "input",
			type: "checkbox",
		}),
		$("")
	]
});

export default class Checkbox extends Node {
	#title : Text
	readonly #checkbox : HTMLInputElement
	readonly #change : (value : boolean) => void
	constructor(e : {
		title : string
		checked : boolean
		change : (value : boolean) => void
	}) {
		super({ DOM : template.cloneNode(true) as HTMLElement });
		this.DOM.addEventListener("change", () => {
			this.#change(this.checked);
		})
		this.#checkbox = this.DOM.firstChild as HTMLInputElement;
		this.#title = this.DOM.lastChild as Text;
		this.#change = function () {}
		this.checked = e.checked;
		this.#change = e.change;
		this.title = e.title;
	}
	get title() {
		return this.#title.nodeValue;
	}
	set title(value) {
		this.#title.nodeValue = value;
	}
	get checked() { 
		return this.#checkbox.checked;
	}
	set checked(value) {
		this.#checkbox.checked = value;
		this.#change(value);
	}
}
