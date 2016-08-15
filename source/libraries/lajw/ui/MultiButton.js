"use strict"

define(["./Parent"], function (Parent) {

const template = $({
	nodeName: "DIV",
	className: "MultiButton"
});

class MultiButton extends Parent {
	constructor(e) {
		typecheck(arguments, [{
			children: [Array, undefined]
		}, undefined]);
		e = e || {};
		e.DOM = template.cloneNode(false);
		super(e);
	}
}

return MultiButton;

});
