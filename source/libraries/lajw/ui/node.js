"use strict"

define([], function () {

class Node {
	constructor(e) {
		typecheck(arguments, [{
			DOM: [HTMLElement, String],
			id: [String, undefined]
			}, undefined], typecheck.loose);
		if (e) {
			let DOM = e.DOM.substr ? document.createElement(e.DOM) : e.DOM;
			Object.defineProperty(this, "DOM", { value: DOM });
			Object.defineProperty(DOM, "_node", { value: this });
			if (e.id) this.id = e.id;
		}
	}
	get id() {
		return this.DOM.id;
	}
	set id(value) {
		this.DOM.id = value;
	}
	get parent() {
		return this._parent;
	}
	get height() {
		return this.DOM.offsetHeight;
	}
	// virtual void fadeIn(delay) - called when inserting into the tree
	fadeIn(delay) { }
	// virtual void fadeOut(delay) - called when removing from the tree
	fadeOut(delay) { }
	click() { }
	mousedown() { }
	mouseup() { }
	// get Node from existing DOM Element
	static fromDOM(element) {
		while(element) {
			if (element.hasOwnProperty("_node"))
				return element._node;
			element = element.parentNode;
		}
		throw new TypeError("Element does not belong to any node");
	}
}

return Node;

});
