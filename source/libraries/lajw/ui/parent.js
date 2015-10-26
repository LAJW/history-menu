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
				this.insert(e.children);
		}
	}
	// insert child, before other child or at the end, return it
	insert(child, before) {
		typecheck(arguments, 
			[Node, Array],
			[Node, undefined]
		);
		let beforeIndex;
		if (before) {
			beforeIndex = this._children.indexOf(before);
			if (before.parent !== this || beforeIndex < 0) 
				throw new TypeError("before does not belong to this parent");
		}
		// insert many
		if (child instanceof Array) {
			for (let c of child) 
				if (child.parent)
					throw new TypeError("one of the children already has a parent");

			for (let i = 0, n = child.length; i < n; i++) {
				let c = child[i];
				c._parent = this;
				this.container.insertBefore(c.DOM, before ? before.DOM : null);
				c.fadeIn(Math.max(Math.min(n, 20) - i, 0) * 10);
			}
			let beforeChildren = this._children.slice(0, beforeIndex);
			let afterChildren = this._children.slice(beforeIndex);
			this._children = beforeChildren.concat(child, afterChildren);
		// insert one
		} else {
			if (child.parent)
				throw new TypeError("child already has a parent");
			this.container.insertBefore(child.DOM, before ? before.DOM : null);
			if (before)
				this._children.splice(beforeIndex, 0, child);
			else this._children.push(child);
			child.fadeIn(0);
			child._parent = this;
		}
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
			this.remove(child);
		}.bind(this));
	}
}
