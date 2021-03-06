import Node from "./Node"
import { $ } from "../Utils"

const template = $({
	nodeName: "DIV",
	className: "Separator",
	childNodes: [
		$({
			nodeName: "SPAN",
			className: "menuItem",
			childNodes: [$("")]
		}), $({
			nodeName: "HR"
		})
	]
});

export default class Separator extends Node {
	readonly #title : Text
	constructor(e : { title : string }) {
		super({ ...e, DOM : template.cloneNode(true) as HTMLElement });
		this.#title = this.DOM.firstChild.firstChild as Text;
		this.title = e.title;
	}
	get title() {
		return this.#title.nodeValue;
	}
	set title(value : string) {
		this.#title.nodeValue = value;
	}
	override fadeIn(delay : number) {
		this.DOM.style.animationDelay = delay + "ms";
		this.DOM.classList.add("fadeIn");
	}
}
