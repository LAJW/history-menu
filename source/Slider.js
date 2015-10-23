"use strict"

class Slider extends Node {
	constructor(e) {
		e = e || {};
		e.DOM = $({
			nodeName: "LABEL",
			className: "Slider",
			childNodes: [
				$({
					nodeName: "INPUT",
					type: "range",
					min: e.min || 0,
					max: e.max || 100,
					step: e.step || 1,
					value: e.value || 50
				}),
				$({
					nodeName: "INPUT",
					disabled: true,
					value: e.value || 50
				}),
				$(e.title || "")
			]
		});
		super(e);
		this._knob = this.DOM.firstChild;
		this._title = this.DOM.lastChild;
		this._display = this.DOM.childNodes[1];
		this.change = e.change || function () {}
	}
	set title(value) {
		typecheck(arguments, String);
		this._title.nodeValue = value;
	}
	get title() {
		return this._title.nodeValue;
	}
	set value(value) {
		typecheck(arguments, Number);
		this._knob.value = value;
	}
	get value() {
		return this._knob.value;
	}
	fadeIn() {
		let oldValue = this.value;
		this._interval = setInterval(function () {
			if (this.value != oldValue) {
				oldValue = this.value;
				this._display.value = this.value;
				this.change(this.value);
			}
		}.bind(this), 16);
	}
	fadeOut() {
		clearInterval(this._interval);
		this._interval = null;
	}
}
