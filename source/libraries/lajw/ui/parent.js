var Parent = new Class({
	prototype: Node,
	// constructor({optional Element container, Element DOM})
	constructor: function (e) {
		typecheck(arguments,
			[{
				container: [Element, undefined]
			}, undefined], typecheck.loose
		);
		Node.apply(this, arguments);
		if (e) {
			Object.defineProperty(this, "container", 
				{value: e.container || this.DOM}
			);
			this._children = [];
		}
	},
	// Node insert(ChildT child, ChildT before) - insert child, before other child or at the end, return it
	insert: function (child, before) {
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
	},
	// void remove(Node child)
	remove: function (child) {
		typecheck(arguments, Node);
		if (this.children.indexOf(child) < 0)
			throw new TypeError("Node is not a child of this parent");
		this._children.splice(this._children.indexOf(child), 1);
		child._parent = undefined;
		child.fadeOut(0);
		setTimeout(function () {
			this.DOM.removeChild(child.DOM);	
		}.bind(this), 150);
		return child;
	},
	// (Array<Node> | undefined) children - returns array of children of this node, or undefined if this is a leaf
	children: {
		get: function () {
			return this._children.slice();
		}
	},
	// void clear() - remove all elemnts from this node
	clear: function () {
		var self = this;
		this._children.forEach(function (child) {
			child._parent = undefined;
		});
		this._children = [];
		this.container.innerHTML = "";
	}
});
	
