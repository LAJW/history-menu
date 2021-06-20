import Node from "./Node"
import { $ } from "../utils"

// locked on Input - when you type sometihng, automatically focus this
// input node
let lockon : Input;

window.addEventListener("keydown", function (e) {
	if (lockon)
		lockon._input.focus();
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
	_input : HTMLInputElement
	_cancel : HTMLElement
	_oldValue : string
	change : (value : string) => void

	constructor(e : {
		id? : string
		value? : string
		placeholder? : string
		lockon? : boolean
		change? : (value : string) => void
	} = {}) {
		super({ DOM : template.cloneNode(true) as HTMLElement });
		this._input = this.DOM.firstChild as HTMLInputElement;
		this._cancel = this.DOM.lastChild as HTMLElement;
		this._input.onkeyup = this._input.onchange = () => {
			if (this._oldValue == this.value)
				return;
			this._oldValue = this.value;
			this.change(this.value);
			this._toggleClearButton();
		};
		this.change = function () {};
		this.value = e.value || "";
		this.change = e.change || function () {};
		this.placeholder = e.placeholder || "";
		this.lockon = e.lockon || false;
	}

	override click(e : MouseEvent) {
		if (e.target == this._cancel)
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
		this._toggleClearButton();
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

	// private void _toggleClearButton(void) - toggle "X" button
	_toggleClearButton() {
		this._cancel.classList.toggle("visible", !!this.value);
	}
}
