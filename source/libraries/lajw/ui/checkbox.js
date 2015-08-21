var Checkbox = (function () {
	var template = $({
		nodeName: "label",
		className: "checkbox",
		childNodes: [
			$({
				nodeName: "input",
				type: "checkbox",
			}),
			$("")
		],
		onchange: function (e) {
			var self = Node.fromDOM(e.target);
			self.change(self.checked);
		}
	});
	return new Class({
		// Function checked
		// PRIVATE: _title, _checkbox
		prototype: Node,
		/* constructor({
			String title = "",
			Boolean checked = false,
			Function change = function () { }
		}) */
		constructor: function (e) {
			typecheck(arguments, [{
				title: [String, undefined],
				checked: [Boolean, undefined],
				change: [Function, undefined]
				}, undefined]);
			e = e || {};
			e.DOM = template.cloneNode(true);
			Node.call(this, e);
			this._checkbox = this.DOM.firstChild;
			this._title = this.DOM.lastChild;
			this.change = e.change || function () {}
			this.checked = e.checked || false;
			this.title = e.title || "";
		},
		// String title
		title: {
			get: function () {
				return this._title.nodeValue;
			},
			set: function (value) {
				typecheck(arguments, String);
				this._title.nodeValue = value;
			}
		},
		// String checked
		checked: {
			get: function () { 
				return this._checkbox.checked;
			},
			set: function (value) {
				typecheck(arguments, Boolean);
				this._checkbox.checked = value;
			}
		}
	})
})();
