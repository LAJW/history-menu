var Layer = new Class({
	prototype: Parent,
	// 1. constructor()
	constructor: function (e) {
		typecheck(arguments, [{
			visible: [Boolean, undefined]
			}, undefined]);
		e = e || {};
		e.DOM = "DIV";
		Parent.call(this, e);
		this.DOM.classList.add("Layer");
		this.visible = e.visible || false;
	},
	// bool visible - is this layer visible
	visible: {
		get: function () {
			return this._visible;
		},
		set: function (value) {
			typecheck(arguments, Boolean);
			if (value)
				this.DOM.classList.add("visible");
			else this.DOM.classList.remove("visible");
		}
	}
});
