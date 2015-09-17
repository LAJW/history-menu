"use strict"
class Layer extends Parent {
	constructor(e) {
		typecheck(arguments, [{
			visible: [Boolean, undefined]
			}, undefined]);
		e = e || {};
		e.DOM = "DIV";
		super(e);
		this.DOM.classList.add("Layer");
		this.visible = e.visible === undefined ? true : e.visible;
	}
	// bool visible - is this layer visible
	get visible() {
		return this._visible;
	}
	set visible(value) {
		typecheck(arguments, Boolean);
		this._visible = value;
		this.DOM.classList.toggle("visible", value);
	}
}
