"use strict"
var Input = (function () {
	var lockon; // globally locked on input
	window.addEventListener("keydown", function (e) {
		if (lockon)
			lockon._input.focus();
	});
	var template = $({
		nodeName: "div",
		className: "Input",
		childNodes: [
			$({
				nodeName: "input" 
			}), 
			$({
				nodeName: "div",
				className: "Cancel"
			})
		]
	});
	return new Class({
		prototype: Node,
		/* contructor({
			String value = "",
			String placeholder = "",
			Boolean lockon = false,
			Function change = function () { }
		}) */
		constructor: function (e) {
			typecheck(arguments, [{
				value: [String, undefined],
				placeholder: [String, undefined],
				lockon: [Boolean, undefined],
				change: [Function, undefined]
			}]);
			e = e || {};
			e.DOM = template.cloneNode(true);
			Node.call(this, e);
			this._input = this.DOM.firstChild;
			this._cancel = this.DOM.lastChild;
			this._input.onkeyup = this._input.onchange = function () {
				this.change(this.value);
				this._change();
			}.bind(this);
			this.change = e.change || function () {};
			this.value = e.value || "";
			this.placeholder = e.placeholder || "";
			this.lockon = e.lockon || false;
		},
		// void click(DOMEvent)
		click: function (e) {
			if (e.target == this._cancel)
				this.value = "";
			this._input.focus();
		},
		// String placeholder
		placeholder: {
			get: function () {
				return this._input.placeholder;
			},
			set: function (value) {
				typecheck(arguments, String);
				this._input.placeholder = value;
			}
		},
		// String value - text inside the input element
		value: {
			get: function () {
				return this._input.value;
			}, 
			set: function (value) {
				typecheck(arguments, String);
				this._input.value = value;
				this._change();
				this.change();
			}
		},
		// Boolean lockon - relocks globally on current element
		lockon: {
			get: function () {
				return this === lockon;
			},
			set: function (value) {
				if (value)
					lockon = this;
				else if (this.lockon)
					lockon = undefined;
			}
		},
		// void _change() private
		_change: function () {
			typecheck(arguments);
			this._cancel.classList.toggle("visible", !!this.value);
		}
	});
})();
