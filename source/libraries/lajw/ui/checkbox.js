"use strict"

var Checkbox = (function () {
	let template = $({
		nodeName: "label",
		className: "Checkbox",
		childNodes: [
			$({
				nodeName: "input",
				type: "checkbox",
			}),
			$("")
		]
	});
	class Checkbox extends Node {
		// PRIVATE: _title, _checkbox
		constructor(e) {
			typecheck(arguments, [{
				title: [String, undefined],
				checked: [Boolean, undefined],
				change: [Function, undefined]
				}, undefined]);
			e = e || {};
			e.DOM = template.cloneNode(true);
			super(e);
			e.DOM.onchange = function () {
				this.change(this.checked);
			}.bind(this);
			this._checkbox = this.DOM.firstChild;
			this._title = this.DOM.lastChild;
			this.change = function () {}
			this.checked = e.checked || false;
			this.change = e.change || function () {}
			this.title = e.title || "";
		}
		get title() {
			return this._title.nodeValue;
		}
		set title(value) {
			typecheck(arguments, String);
			this._title.nodeValue = value;
		}
		get checked() { 
			return this._checkbox.checked;
		}
		set checked(value) {
			typecheck(arguments, Boolean);
			this._checkbox.checked = value;
			this.change(value);
		}
	}
	return Checkbox;
})();
