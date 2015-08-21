var Select = (function () {
	var template = $({
		nodeName: "LABEL",
		className: "Select",
		childNodes: [
			$({
				nodeName: "SELECT",
			}),
			$("")
		]
	});
	return new Class({
		// PRIVATE: _selected, _values, _select
		prototype: Node,
		/* constructor({
			Object values,
			String title = "",
			String selected, optional
			Function change = function () { }
		}) */
		// values - map ofoptionkey/values, selected - selected key
		constructor: function (e) {
			typecheck(arguments, {
				title: [String, undefined],
				values: Object,
				selected: [String, undefined],
				change: [Function, undefined]
			});
			e.DOM = template.cloneNode(true);
			Node.call(this, e);
			this._select = this.DOM.firstChild;
			this._title = this.DOM.lastChild;
			this._select.onchange = function () {
				this.change(this.values[this.selected]);
			}.bind(this);
			this.change = e.change || function () { };
			this.values = e.values;
			this.selected = e.selected || e.values[Object.keys(e.values)[0]];
			this.title = e.title || "";
		},
		// Object values - String=>String map to be assigned to the element
		values: {
			get: function () {
				return this._values;
			},
			set: function (values) {
				typecheck(arguments, Object);
				this._values = values;
				this._select.innerHTML = "";
				for (var i in values) {
					var value = values[i];
					var option = document.createElement("option");
					option.value = i;
					option.appendChild(document.createTextNode(value));
					this._select.appendChild(option);
				}
			}
		},
		// String selected - key of selected value
		selected: {
			get: function () {
				return this._select.options[this._select.selectedIndex].value;
			},
			set: function (key) {
				typecheck(key, String);
				if (this._values[key]) {
					var options = this._select.options;
					for (var i = 0, il = options.length; i < il; i++) {
						if (options[i].value == key) {
							this._select.selectedIndex = i;
						}
					}
				} else throw new Error("Key not found");
			}
		},
		// String title - label of the select box
		title: {
			get: function () {
				this._title.nodeValue;
			},
			set: function (value) {
				typecheck(arguments, String);
				this._title.nodeValue = value;
			}
		}
	});
})();
