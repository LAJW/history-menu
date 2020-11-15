import Parent from "./Parent.js"

const template = $({
	nodeName: "DIV",
	className: "MultiButton"
});

export default class MultiButton extends Parent {
	constructor(e) {
		typecheck(arguments, [{
			children: [Array, undefined]
		}, undefined]);
		e = e || {};
		e.DOM = template.cloneNode(false);
		super(e);
	}
}
