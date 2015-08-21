var Node = new Class({
	// PRIVATE PROPERTIES: _children
	// 1. constructor()
	// 2. constructor(String name) - name is HTMl Node name, leaf - is this node a leaf
	// 3. constructor(HTMLDOMElement) - same as above, provide custom element
	constructor: function (e) {
		typecheck(arguments, [{
			DOM: [HTMLElement, String]
			}, undefined], typecheck.loose);
		if (e) {
			var DOM = e.DOM.substr ? document.createElement(e.DOM) : e.DOM;
			Object.defineProperty(this, "DOM", { value: DOM });
			Object.defineProperty(DOM, "_node", { value: this });
		}
	},
	// 1. string id - element's ID (for CSS)
	id: {
		get: function () {
			return this.DOM.id;
		}, set: function (value) {
			this.DOM.id = value;
		}
	},
	// 1. Node parent
	parent: {
		get: function () {
			return this._parent;
		}
	},
	height: {
		get: function () {
			return this.DOM.offsetHeight;
		}
	},
	// virtual void fadeIn(delay) - called when inserting into the tree
	fadeIn: function () { },
	// virtual void fadeOut(delay) - called when removing from the tree
	fadeOut: function () { },
	click: function () { },
	mousedown: function () { },
	mouseup: function () { }
});
// get node from existing DOM element
Node.fromDOM = function (element) {
	while(element) {
		if (element.hasOwnProperty("_node"))
			return element._node;
		element = element.parentNode;
	}
	throw new TypeError("Element does not belong to any node");
}
