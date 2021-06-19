import Node from "./Node"
import { $ } from "../utils"

let template = $({
	nodeName: "label",
	className: "Checkbox",
	childNodes: [
		$({
			nodeName: "input",
			type: "checkbox",
		}),
		$("")
	]
});

export default class Checkbox extends Node {
	_title : Text
	_checkbox : HTMLInputElement
	change : (value : boolean) => void
	constructor(e? : {
		id? : string,
		title? : string
		checked? : boolean
		change? : (value : boolean) => void
	}) {
		e = e || {};
		super({ id : e.id, DOM : template.cloneNode(true) as HTMLElement });
		this.DOM.addEventListener("change", () => {
			this.change(this.checked);
		})
		this._checkbox = this.DOM.firstChild as HTMLInputElement;
		this._title = this.DOM.lastChild as Text;
		this.change = function () {}
		this.checked = e.checked || false;
		this.change = e.change || function () {};
		this.title = e.title || "";
	}
	get title() {
		return this._title.nodeValue;
	}
	set title(value) {
		this._title.nodeValue = value;
	}
	get checked() { 
		return this._checkbox.checked;
	}
	set checked(value) {
		this._checkbox.checked = value;
		this.change(value);
	}
}
