"use strict"
var MultiButton = (function () {
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
			e.children = e.children || [];
			e.children.forEach(function (button) {
				this.insert(button);
			}.bind(this));
		}
	}
	return MultiButton;
})();
