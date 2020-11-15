import Node from "./libraries/lajw/ui/Node.js"

const sliderTemplate = $({
	nodeName: "LABEL",
	className: "Slider",
	childNodes: [
		$(""),
		$({ nodeName: "BR" }),
		$({
			nodeName: "INPUT",
			type:     "range",
		}),
		$({
			nodeName: "INPUT",
			disabled: true,
		})
	]
});

export default class Slider extends Node {
	constructor(e) {
		e             = e || {};
		e.DOM         = sliderTemplate.cloneNode(true);
		super(e);
		this._knob    = this.DOM.childNodes[2];
		this._title   = this.DOM.childNodes[0];
		this._display = this.DOM.childNodes[3];
		this.change   = e.change || function () {}
		this.title    = e.title;
		this.min      = e.min || 0;
		this.max      = e.max || 100;
		this.step     = e.step || 1;
		this.value    = e.value || 50;
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
		this._knob.value    = value;
		this._display.value = value;
	}
	get value() {
		return this._knob.value;
	}
	set min(value) {
		typecheck(arguments, Number);
		this._knob.min = value;
	}
	get min() {
		return this._knob.min;
	}
	set max(value) {
		typecheck(arguments, Number);
		this._knob.max = value;
	}
	get max() {
		return this._knob.max;
	}
	set step(value) {
		typecheck(arguments, Number);
		this._knob.step = value;
	}
	get step() {
		return this._knob.step;
	}
	fadeIn() {
		let oldValue   = this.value;
		this._interval = setInterval(function () {
			if (this.value != oldValue) {
				oldValue            = this.value;
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
