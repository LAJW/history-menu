import Node from "./Node.ts"

const template = $({
	nodeName: "H1",
	className: "Header",
	childNodes: [$("")]
});

export default class Header extends Node {
	constructor(e) {
		typecheck(arguments, [{
			title: [String, undefined]
		}, undefined]);
		e = e || {};
		e.DOM = template.cloneNode(true);
		super(e);
		this.title = e.title || "";
	}
	// String title - header's text
	get title() {
		return this.DOM.firstChild.nodeValue;
	}
	set title(value) {
		typecheck(arguments, String);
		this.DOM.firstChild.nodeValue = value;
	}
}
