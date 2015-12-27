"use strict"

define(["./ActionButton"], function (ActionButton) {

return class DevicesButton extends ActionButton {
	constructor(e) {
		super(e);	
		this.DOM.appendChild($({
			nodeName: "DIV",
			className: "Arrow"
		}));
		this.on = e.on || false;
	}
	set on(value) {
		typecheck(arguments, Boolean);
		this._on = value;
		this.DOM.classList.toggle("on", value);
	}
	get on() {
		return this._on;
	}
}

});
