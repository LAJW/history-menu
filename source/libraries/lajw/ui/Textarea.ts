import Node from "./Node"
import { $ } from "../utils"

const template = $({
	nodeName: "div",
	className: "Textarea",
	childNodes: [
		$({
			nodeName: "label",
			childNodes: [$("")]
		}),
		$({ nodeName: "Textarea" }),
		$({
			nodeName: "div",
			childNodes: [$("")]
		}),
	]
});

export default class Textarea extends Node {
	readonly #textarea : HTMLTextAreaElement
	#oldValue : string
	change : (value : string) => void

	constructor(e : {
		title: string,
		description: string,
		value? : string
		change : (value : string) => void
	}) {
		super({ DOM : template.cloneNode(true) as HTMLElement });
		this.DOM.firstChild.firstChild.nodeValue = e.title;
		this.DOM.lastChild.firstChild.nodeValue = e.description;
		this.#textarea = this.DOM.childNodes[1] as HTMLTextAreaElement;
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
