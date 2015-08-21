var Header = (function () {
	var template = $({
		nodeName: "H1",
		className: "Header",
		childNodes: [$("")]
	});
	return new Class({
		prototype: Node,
		/* constructor({
			String title = ""
		}) */
		constructor: function (e) {
			typecheck(arguments, [{
				title: [String, undefined]
			}, undefined]);
			e = e || {};
			e.DOM = template.cloneNode(true);
			Node.call(this, e);
			this.title = e.title || "";
		},
		// String title
		title: {
			get: function () {
				return this.DOM.firstChild.value;
			},
			set: function (value) {
				typecheck(arguments, String);
				this.DOM.firstChild.nodeValue = value;
			}
		}
	});
})();
