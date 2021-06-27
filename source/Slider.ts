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
	readonly #knob : HTMLInputElement
	readonly #title : Node
	readonly #display : HTMLInputElement
	#interval : NodeJS.Timeout
	readonly #change : (value : number) => void
	constructor(e : {
		change : (value : number) => void
		title : string
		min : number
		max : number
		step : number
		value : number
	}) {
		super({...e, DOM : sliderTemplate.cloneNode(true) as HTMLElement});
		this.#knob    = this.DOM.childNodes[2] as HTMLInputElement;
		this.#title   = this.DOM.childNodes[0];
		this.#display = this.DOM.childNodes[3] as HTMLInputElement;
		this.#change   = e.change;
		this.title    = e.title;
		this.min      = e.min;
		this.max      = e.max;
		this.step     = e.step;
		this.value    = e.value;
		let oldValue   = this.value;
		this.#interval = setInterval(() => {
			if (this.value != oldValue) {
				oldValue            = this.value;
				this.#display.value = this.value.toString();
				this.#change(this.value);
			}
		}, 16);
	}
	set title(value : string) {
		this.#title.nodeValue = value;
	}
	get title() {
		return this.#title.nodeValue;
	}
	set value(value : number) {
		this.#knob.value = value.toString();
		this.#display.value = value.toString();
	}
	get value() {
		return parseInt(this.#knob.value);
	}
	set min(value : number) {
		this.#knob.min = value.toString();
	}
	get min() {
		return parseInt(this.#knob.min);
	}
	set max(value : number) {
		this.#knob.max = value.toString();
	}
	get max() {
		return parseInt(this.#knob.max);
	}
	set step(value : number) {
		this.#knob.step = value.toString();
	}
	get step() {
		return parseInt(this.#knob.step);
	}
	override fadeOut() {
		clearInterval(this.#interval);
		this.#interval = null;
	}
}
