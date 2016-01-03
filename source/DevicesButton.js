"use strict"

define(["./ActionButton"], function (ActionButton) {

const arrowTemplate = $({
	nodeName:  "DIV",
	className: "Arrow"
});
class DevicesButton extends ActionButton {
	constructor(e) {
		super(e);	
		this.DOM.appendChild(arrowTemplate);
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

return DevicesButton;

});
