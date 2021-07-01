import Node from "./Node"
import { $ } from "../Utils"

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
			className: "error",
			childNodes: [$("")]
		}),
		$({
			nodeName: "div",
			className: "description",
			childNodes: [$("")]
		}),
	]
});

export default class Textarea extends Node {
	readonly #textarea : HTMLTextAreaElement
	#oldValue : string
	change : (value : string) => void
	#errorBox : HTMLDivElement 
	#validate : (value : string) => string | undefined

	constructor(e : {
		title: string,
		description: string,
		value? : string
		change : (value : string) => void
		validate : (value : string) => string | undefined
	}) {
		super({ DOM : template.cloneNode(true) as HTMLElement });
		this.DOM.firstChild.firstChild.nodeValue = e.title;
		(this.DOM.childNodes[3] as HTMLDivElement).innerHTML = e.description;
		this.#errorBox = this.DOM.childNodes[2] as HTMLDivElement;
		this.#textarea = this.DOM.childNodes[1] as HTMLTextAreaElement;
		this.#textarea.onkeyup = this.#textarea.onchange = () => {
			if (this.#oldValue !== this.value) {
				this.#oldValue = this.value;
				this.change(this.value);
				this.#updateErrorBox();
			}
		};
		this.change = function () {};
		this.value = e.value ?? "";
		this.change = e.change;
		this.#validate = e.validate;
		this.#updateErrorBox();
	}

	// String value - text inside the input element
	get value() {
		return this.#textarea.value;
	} 
	set value(value : string) {
		this.#textarea.value = value;
		this.change(value);
	}

	#updateErrorBox() {
		const errorMessage = this.#validate(this.value);
		if (errorMessage !== undefined) {
			this.#errorBox.innerHTML = errorMessage.replace("\n", "<br>");
			this.#errorBox.classList.add("show");
		} else {
			this.#errorBox.innerHTML = "";
			this.#errorBox.classList.remove("show");
		}
	}
}
