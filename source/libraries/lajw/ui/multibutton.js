var MultiButton = (function () {
	var template = $({
		nodeName: "DIV",
		className: "MultiButton"
	});
	return new Class({
		prototype: Parent,
		/* constructor({
			children: children
		}) */
		constructor: function (e) {
			typecheck(arguments, [{
				children: [Array, undefined]
			}, undefined]);
			e = e || {};
			e.DOM = template.cloneNode(false);
			e.children = e.children || [];
			Parent.call(this, e);
			e.children.forEach(function (button) {
				this.insert(button);
			}.bind(this));
		}
	});
})();
