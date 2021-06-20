import ActionButton from "./ActionButton"
import { $ } from "./libraries/lajw/utils";

const arrowTemplate = $({
	nodeName:  "DIV",
	className: "Arrow"
});

export default class DevicesButton extends ActionButton {
	_on : boolean
	constructor(e : {
		icon?: string
		title?: string
		tooltip?: string
		click : (e : MouseEvent) => void
		on? : boolean
	}) {
		super(e);
		this.DOM.appendChild(arrowTemplate);
		this.on = e.on || false;
	}
	set on(value: boolean) {
		this._on = value;
		this.DOM.classList.toggle("on", value);
	}
	get on() {
		return this._on;
	}
}
