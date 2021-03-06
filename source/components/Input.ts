import Node from "./Node"
import { $ } from "../Utils"

// locked on Input - when you type sometihng, automatically focus this
// input node
let lockon : Input;

window.addEventListener("keydown", () => {
	if (lockon) {
		lockon._input.focus();
	}
});

const template = $({
	nodeName: "div",
	className: "Input",
	childNodes: [
		$({
			nodeName: "input" 
		}), 
		$({
			nodeName: "div",
			className: "Cancel"
		})
	]
});

export default class Input extends Node {
	readonly _input : HTMLInputElement
	readonly #cancel : HTMLElement
	#oldValue : string
	change : (value : string) => void

	constructor(e : {
		value? : string
		placeholder : string
		lockon : boolean
		change : (value : string) => void
	}) {
		super({ DOM : template.cloneNode(true) as HTMLElement });
		this._input = this.DOM.firstChild as HTMLInputElement;
		this.#cancel = this.DOM.lastChild as HTMLElement;
		this._input.onkeydown = e => {
			if (this.value !== "" && e.key === "Escape") {
				e.preventDefault();
				this.value = "";
				this.change(this.value);
			}
		}
		this._input.onkeyup = this._input.onchange = () => {
			if (this.#oldValue === this.value)
				return;
			this.#oldValue = this.value;
			this.change(this.value);
			this.#toggleClearButton();
		};
		this.change = function () {};
		this.value = e.value ?? "";
		this.change = e.change;
		this.placeholder = e.placeholder;
		this.lockon = e.lockon;
	}

	override click(e : MouseEvent) {
		if (e.target == this.#cancel)
			this.value = "";
		this._input.focus();
	}

	// String placeholder - text displayed in the empty input
	get placeholder() {
		return this._input.placeholder;
	}
	set placeholder(value : string) {
		this._input.placeholder = value;
	}

	// String value - text inside the input element
	get value() {
		return this._input.value;
	} 
	set value(value : string) {
		this._input.value = value;
		this.#toggleClearButton();
		this.change(value);
	}

	// select Input to be locked on 
	static lockon(input : Input) {
		lockon = input;
	}

	// Boolean lockon - autofocus this element when you type something
	get lockon() {
		return this === lockon;
	}
	set lockon(value : boolean) {
		if (value)
			lockon = this;
		else if (this.lockon)
			lockon = undefined;
	}

	// private void #toggleClearButton(void) - toggle "X" button
	#toggleClearButton() {
		this.#cancel.classList.toggle("visible", !!this.value);
	}
}
