import Node from "./Node"
import { $ } from "../utils"

const template = $({
	nodeName: "H1",
	className: "Header",
	childNodes: [$("")]
});

export default class Header extends Node {
	constructor(e : { title : string }) {
		super({DOM : template.cloneNode(true) as HTMLElement});
		this.title = e.title;
	}
	// String title - header's text
	get title() {
		return this.DOM.firstChild.nodeValue;
	}
	set title(value : string) {
		this.DOM.firstChild.nodeValue = value;
	}
}
