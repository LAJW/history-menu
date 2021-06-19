import Node from "./Node.ts"

// locked on Input - when you type sometihng, automatically focus this
// input node
let lockon;

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

	constructor(e) {
		typecheck(arguments, [{
			value: [String, undefined],
			placeholder: [String, undefined],
			lockon: [Boolean, undefined],
			change: [Function, undefined]
		}, undefined]);
		e = e || {};
		e.DOM = template.cloneNode(true);
		super(e);
		this._input = this.DOM.firstChild;
		this._cancel = this.DOM.lastChild;
		this._input.onkeyup = this._input.onchange = function () {
			if (this._oldValue == this.value)
				return;
			this._oldValue = this.value;
			this.change(this.value);
			this._toggleClearButton();
		}.bind(this);
		this.change = function () {};
		this.value = e.value || "";
		this.change = e.change || function () {};
		this.placeholder = e.placeholder || "";
		this.lockon = e.lockon || false;
	}

	click(e) { // override
		if (e.target == this._cancel)
			this.value = "";
		this._input.focus();
	}

	// String placeholder - text displayed in the empty input
	get placeholder() {
		return this._input.placeholder;
	}
	set placeholder(value) {
		typecheck(arguments, String);
		this._input.placeholder = value;
	}

	// String value - text inside the input element
	get value() {
		return this._input.value;
	} 
	set value(value) {
		typecheck(arguments, String);
		this._input.value = value;
		this._toggleClearButton();
		this.change();
	}

	// select Input to be locked on 
	static lockon(input) {
		typecheck(arguments, Input);
		lockon = input;
	}

	// Boolean lockon - autofocus this element when you type something
	get lockon() {
		return this === lockon;
	}
	set lockon(value) {
		typecheck(arguments, Boolean);
		if (value)
			lockon = this;
		else if (this.lockon)
			lockon = undefined;
	}

	// private void _toggleClearButton(void) - toggle "X" button
	_toggleClearButton() {
		typecheck(arguments);
		this._cancel.classList.toggle("visible", !!this.value);
	}
}
