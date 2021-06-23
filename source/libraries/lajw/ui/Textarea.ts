import Node from "./Node"
import { $ } from "../utils"

const template = $({
	nodeName: "div",
	className: "Textarea",
	childNodes: [
		$({ nodeName: "Textarea" })
	]
});

export default class Textarea extends Node {
	readonly #textarea : HTMLTextAreaElement
	#oldValue : string
	change : (value : string) => void

	constructor(e : {
		value? : string
		change : (value : string) => void
	}) {
		super({ DOM : template.cloneNode(true) as HTMLElement });
		this.#textarea = this.DOM.firstChild as HTMLTextAreaElement;
		this.#textarea.onkeyup = this.#textarea.onchange = () => {
			if (this.#oldValue !== this.value) {
				this.#oldValue = this.value;
				this.change(this.value);
			}
		};
		this.change = function () {};
		this.value = e.value ?? "";
		this.change = e.change;
	}

	// String value - text inside the input element
	get value() {
		return this.#textarea.value;
	} 
	set value(value : string) {
		this.#textarea.value = value;
		this.change(value);
	}
}
