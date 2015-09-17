"use strict"
class Parent extends Node {
	constructor(e) {
		typecheck(arguments,
			[{
				container: [Element, undefined],
				children: [Array, undefined]
			}, undefined], typecheck.loose
		);
		super(e);
		if (e) {
			Object.defineProperty(this, "container", 
				{value: e.container || this.DOM}
			);
			this._children = [];
			if (e.children)
				for (let child of e.children) 
					this.insert(child);
		}
	}
	// insert child, before other child or at the end, return it
	insert(child, before) {
		typecheck(arguments, Node, [Node, undefined]);
		if (child.parent)
			throw new TypeError("child already has a parent");
		try {
			this.container.insertBefore(child.DOM, before ? before.DOM : null);
		} catch (e) {
			throw new TypeError("before does not belong to parent") 
		}
		if (before)
			this._children.splice(this._children.indexOf(before), 0, child);
		else this._children.push(child);
		child.fadeIn(0);
		child._parent = this;
		return child;
	}
	// remove child from child list, return it
	remove(child) {
		typecheck(arguments, Node);
		try {
			this.container.removeChild(child.DOM);
		} catch (e) {
			throw new TypeError("Node is not a child of this parent");
		}
		this._children.splice(this._children.indexOf(child), 1);
		child._parent = undefined;
		child.fadeOut(0);
		return child;
	}
	// Array<Node> children - unassignable, unchangeable array of children
	get children() {
		return this._children.slice();
	}
	// void clear() - remove all elemnts from this node
	clear() {
		this._children.forEach(function (child) {
			child._parent = undefined;
		});
		this._children = [];
		this.container.innerHTML = "";
	}
}
