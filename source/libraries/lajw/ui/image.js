var Image = (function () {
	var template = $({
		nodeName: "IMG"
	});
	return new Class({
		prototype: Node,
		/* constructor ({
			src = "",
			alt = "",
		}) */
		constructor: function (e) {
			typecheck(arguments, [{
				src: [String, undefined],
				alt: [String, undefined]
			}, undefined]);
			e = e || {};
			e.DOM = template.cloneNode(false);
			Node.call(this, e);
			this.src = e.src || "";
			this.alt = e.alt || "";
		},
		// String src
		src: {
			get: function () {
				return this.DOM.src;
			}, 
			set: function (value) {
				typecheck(arguments, String);
				this.DOM.src = value;
			}
		},
		// String alt
		alt: {
			get: function () {
				return this.DOM.alt;
			},
			set: function (value) {
				typecheck(arguments, String);
				this.DOM.alt = value;
			}
		}
	});
})();
