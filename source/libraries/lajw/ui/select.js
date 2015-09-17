"use strict"

var Select = (function () {
	const template = $({
		nodeName: "LABEL",
		className: "Select",
		childNodes: [
			$({
				nodeName: "SELECT",
			}),
			$("")
		]
	});
	class Select extends Node {
		// PRIVATE: _selected, _values, _select
		constructor(e) {
			typecheck(arguments, {
				title: [String, undefined],
				values: Object,
				selected: [String, undefined],
				change: [Function, undefined]
			});
			e.DOM = template.cloneNode(true);
			super(e);
			this._select = this.DOM.firstChild;
			this._title = this.DOM.lastChild;
			this._select.onchange = function () {
				this.change(this.values[this.selected]);
			}.bind(this);
			this.change = e.change || function () { };
			this.values = e.values;
			this.selected = e.selected || Object.keys(e.values)[0];
			this.title = e.title || "";
		}
		// Object values - String=>String map to be assigned to the element
		get values() {
			return this._values;
		}
		set values(values) {
			typecheck(arguments, Object);
			this._values = values;
			this._select.innerHTML = "";
			for (let i in values) {
				let value = values[i];
				let option = document.createElement("option");
				option.value = i;
				option.appendChild(document.createTextNode(value));
				this._select.appendChild(option);
			}
		}
		// String selected - key of selected value
		get selected() {
			return this._select.options[this._select.selectedIndex].value;
		}
		set selected(key) {
			typecheck(arguments, String);
			if (this._values[key]) {
				let options = this._select.options;
				for (let i = 0, il = options.length; i < il; i++) {
					if (options[i].value == key) {
						this._select.selectedIndex = i;
					}
				}
			} else throw new Error("Key not found");
		}
		// String title - text label of the Select node
		get title() {
			this._title.nodeValue;
		}
		set title(value) {
			typecheck(arguments, String);
			this._title.nodeValue = value;
		}
		// value - currently selected value
		get value() {
			return this.values[this.selected];
		}
	}
	return Select;
})();

