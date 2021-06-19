import Node from "./Node"
import { $ } from "../utils"

const template = $({
	nodeName: "LABEL",
	className: "Select",
	childNodes: [
		$({
			nodeName: "SELECT",
		}),
		$("")
	]
});

export default class Select extends Node {
	_title : Text
	_values : { [key: string]: string }
	_select : HTMLSelectElement
	change : (value : string) => void
	constructor(e : {
			title : string
			values : { [key: string]: string }
			selected : string
			change : (value : string) => void
		}) {
		super({DOM : template.cloneNode(true) as HTMLElement});
		this._select = this.DOM.firstChild as HTMLSelectElement;
		this._title = this.DOM.lastChild as Text;
		this._select.onchange = () => {
			this.change(this.values[this.selected]);
		}
		this.change = e.change || function () { };
		this.values = e.values;
		this.selected = e.selected || Object.keys(e.values)[0];
		this.title = e.title || "";
	}
	// Object values - String=>String map to be assigned to the element
	get values() {
		return this._values;
	}
	set values(values) {
		this._values = values;
		this._select.innerHTML = "";
		for (let i in values) {
			let value = values[i];
			let option = document.createElement("option");
			option.value = i;
			option.appendChild(document.createTextNode(value));
			this._select.appendChild(option);
		}
	}
	// String selected - key of selected value
	get selected() {
		return this._select.options[this._select.selectedIndex].value;
	}
	set selected(key : string) {
		if (this._values[key]) {
			let options = this._select.options;
			for (let i = 0, il = options.length; i < il; i++) {
				if (options[i].value == key) {
					this._select.selectedIndex = i;
				}
			}
		} else throw new Error("Key not found");
	}
	// String title - text label of the Select node
	get title() {
		return this._title.nodeValue;
	}
	set title(value : string) {
		this._title.nodeValue = value;
	}
	// value - currently selected value
	get value() {
		return this.values[this.selected];
	}
}
