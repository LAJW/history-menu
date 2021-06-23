import UINode from "./libraries/lajw/ui/Node"
import { $ } from "./libraries/lajw/utils";

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

export default class Slider extends UINode {
	_knob : HTMLInputElement
	_title : Node
	_display : HTMLInputElement
	_interval : NodeJS.Timeout
	change : (value : number) => void
	constructor(e : {
		change : (value : number) => void
		title : string
		min : number
		max : number
		step : number
		value : number
	}) {
		super({...e, DOM : sliderTemplate.cloneNode(true) as HTMLElement});
		this._knob    = this.DOM.childNodes[2] as HTMLInputElement;
		this._title   = this.DOM.childNodes[0];
		this._display = this.DOM.childNodes[3] as HTMLInputElement;
		this.change   = e.change;
		this.title    = e.title;
		this.min      = e.min;
		this.max      = e.max;
		this.step     = e.step;
		this.value    = e.value;
	}
	set title(value : string) {
		this._title.nodeValue = value;
	}
	get title() {
		return this._title.nodeValue;
	}
	set value(value : number) {
		this._knob.value = value.toString();
		this._display.value = value.toString();
	}
	get value() {
		return parseInt(this._knob.value);
	}
	set min(value : number) {
		this._knob.min = value.toString();
	}
	get min() {
		return parseInt(this._knob.min);
	}
	set max(value : number) {
		this._knob.max = value.toString();
	}
	get max() {
		return parseInt(this._knob.max);
	}
	set step(value : number) {
		this._knob.step = value.toString();
	}
	get step() {
		return parseInt(this._knob.step);
	}
	override fadeIn() {
		let oldValue   = this.value;
		this._interval = setInterval(() => {
			if (this.value != oldValue) {
				oldValue            = this.value;
				this._display.value = this.value.toString();
				this.change(this.value);
			}
		}, 16);
	}
	override fadeOut() {
		clearInterval(this._interval);
		this._interval = null;
	}
}
