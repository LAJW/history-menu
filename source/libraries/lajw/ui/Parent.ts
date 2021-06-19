import Node from "./Node"

export default class Parent extends Node {
	readonly _children : Node[]
	container : HTMLElement

	constructor(e : {
		DOM : HTMLElement | string
		id? : string
		container : HTMLElement
		children? : Node[]
	} | {
		DOM : HTMLElement
		id? : string
		container? : HTMLElement
		children? : Node[]
	}) {
		super(e);
		if (e) {
			Object.defineProperty(this, "container", 
				{value: e.container || this.DOM}
			);
			this._children = [];
			if (e.children) {
				this.insert(e.children);
			}
		}
	}
	// insert child, before other child or at the end, return it
	insert(first : Node | Node[], second : Node | undefined = undefined) {
		if (second) {
			if (first instanceof Array) {
				return this._insertManyBefore(first, second);
			} else {
				return this._insertBefore(first, second);
			}
		} else {
			if (first instanceof Array) {
				return this._appendMany(first);
			} else {
				return this._append(first);
			}
		}
	}
	_append(child : Node) { // exception safe
		typecheck(arguments, Node);
		this._validateChildCandidate(child);
		this.container.appendChild(child.DOM);
		this._children.push(child);
		child._parent = this;
		child.fadeIn(0);
		return child;
	}
	_appendMany(children : Node[]) { // not exception safe
		children.forEach((child, i) => {
			this._validateChildCandidate(child);
			this.container.appendChild(child.DOM);
			this._children.push(child);
			child._parent = this;
			child.fadeIn(Math.max(Math.min(children.length, 20) - i, 0) * 10);
		});
	}
	_insertBefore(child : Node, before : Node) { // exception safe
		typecheck(arguments, Node, Node);
		this._validateChildCandidate(child);
		this._validateChild(before);
		this.container.insertBefore(child.DOM, before.DOM);
		this._children.splice(this._children.indexOf(before), 0, child);
		child._parent = this;
		child.fadeIn(0);
		return child;
	}
	_insertManyBefore(children : Node[], before : Node) { // not exception safe
		this._validateChild(before);
		children.forEach((child, i) => {
			this._validateChildCandidate(child);
			this.container.insertBefore(child.DOM, before.DOM);
			this._children.splice(this._children.indexOf(before), 0, child);
			child._parent = this;
			child.fadeIn(Math.max(Math.min(children.length, 20) - i, 0) * 10);
		});
	}
	_validateChildCandidate(child : Node) {
		if (child.parent) {
			throw new TypeError("Child already has a parent");
		}
	}
	_validateChild(child : Node) {
		if (child.parent != this) {
			throw new TypeError("Before is not a child of this node");
		}
	}
	_empty() {
		return this._children.length == 0;
	}
	// remove child from child list, return it
	remove(child : Node) {
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
	set children(value) {
		this.clear();
		this._appendMany(value);
	}
	// remove all elemnts from this node
	clear() {
		for (const child of this.children) {
			this.remove(child)
		}
	}
}
