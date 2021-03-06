import ActionButton from "./ActionButton"
import { $ } from "./Utils";

const arrowTemplate = $({
	nodeName:  "DIV",
	className: "Arrow"
});

export default class DevicesButton extends ActionButton {
	#on : boolean
	constructor(e : {
		tooltip: string
		click : (e : MouseEvent) => void
	}) {
		super({...e, icon : "", title : ""});
		this.DOM.appendChild(arrowTemplate);
		this.on = false;
	}
	set on(value: boolean) {
		this.#on = value;
		this.DOM.classList.toggle("on", value);
	}
	get on() {
		return this.#on;
	}
}
