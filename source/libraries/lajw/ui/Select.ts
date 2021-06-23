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
	readonly #title : Text
	readonly #select : HTMLSelectElement
	#values : { [key: string]: string }
	readonly #change : (value : string) => void
	constructor(e : {
			title : string
			values : { [key: string]: string }
			selected : string
			change : (value : string) => void
		}) {
		super({DOM : template.cloneNode(true) as HTMLElement});
		this.#select = this.DOM.firstChild as HTMLSelectElement;
		this.#title = this.DOM.lastChild as Text;
		this.#select.onchange = () => {
			this.#change(this.values[this.selected]);
		}
		this.#change = e.change;
		this.values = e.values;
		this.selected = e.selected;
		this.title = e.title;
	}
	// Object values - String=>String map to be assigned to the element
	get values() {
		return this.#values;
	}
	set values(values) {
		this.#values = values;
		this.#select.innerHTML = "";
		for (let i in values) {
			let value = values[i];
			let option = document.createElement("option");
			option.value = i;
			option.appendChild(document.createTextNode(value));
			this.#select.appendChild(option);
		}
	}
	// String selected - key of selected value
	get selected() {
		return this.#select.options[this.#select.selectedIndex].value;
	}
	set selected(key : string) {
		if (this.#values[key]) {
			let options = this.#select.options;
			for (let i = 0, il = options.length; i < il; i++) {
				if (options[i].value == key) {
					this.#select.selectedIndex = i;
				}
			}
		} else throw new Error("Key not found");
	}
	// String title - text label of the Select node
	get title() {
		return this.#title.nodeValue;
	}
	set title(value : string) {
		this.#title.nodeValue = value;
	}
	// value - currently selected value
	get value() {
		return this.values[this.selected];
	}
}
