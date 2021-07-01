import Node from "./Node"

export default class Parent extends Node {
	readonly #children : Node[]
	container : HTMLElement
	readonly #fadeInEnabled : boolean

	constructor(e : {
		DOM : HTMLElement
		container? : HTMLElement
		children : Node[]
		fadeInEnabled : boolean
	}) {
		super(e);
		Object.defineProperty(this, "container", 
			{value: e.container || this.DOM}
		);
		this.#children = [];
		this.#fadeInEnabled = e.fadeInEnabled;
		if (e.children.length) {
			this.insert(e.children);
		}
	}
	// insert child, before other child or at the end, return it
	insert(first : Node | Node[], second : Node | undefined = undefined) {
		if (second) {
			if (first instanceof Array) {
				return this.#insertManyBefore(first, second);
			} else {
				return this.#insertBefore(first, second);
			}
		} else {
			if (first instanceof Array) {
				return this.#appendMany(first);
			} else {
				return this.#append(first);
			}
		}
	}
	#append(child : Node) { // exception safe
		this.#validateChildCandidate(child);
		this.container.appendChild(child.DOM);
		this.#children.push(child);
		child._parent = this;
		if (this.#fadeInEnabled) {
			child.fadeIn(0);
		}
		return child;
	}
	#appendMany(children : Node[]) { // not exception safe
		children.forEach((child, i) => {
			this.#validateChildCandidate(child);
			this.container.appendChild(child.DOM);
			this.#children.push(child);
			child._parent = this;
			if (this.#fadeInEnabled) {
				child.fadeIn(Math.max(Math.min(children.length, 20) - i, 0) * 10);
			}
		});
	}
	#insertBefore(child : Node, before : Node) { // exception safe
		this.#validateChildCandidate(child);
		this.#validateChild(before);
		this.container.insertBefore(child.DOM, before.DOM);
		this.#children.splice(this.#children.indexOf(before), 0, child);
		child._parent = this;
		if (this.#fadeInEnabled) {
			child.fadeIn(0);
		}
		return child;
	}
	#insertManyBefore(children : Node[], before : Node) { // not exception safe
		this.#validateChild(before);
		children.forEach((child, i) => {
			this.#validateChildCandidate(child);
			this.container.insertBefore(child.DOM, before.DOM);
			this.#children.splice(this.#children.indexOf(before), 0, child);
			child._parent = this;
			child.fadeIn(Math.max(Math.min(children.length, 20) - i, 0) * 10);
		});
	}
	#validateChildCandidate(child : Node) {
		if (child.parent) {
			throw new TypeError("Child already has a parent");
		}
	}
	#validateChild(child : Node) {
		if (child.parent != this) {
			throw new TypeError("Before is not a child of this node");
		}
	}
	#empty() {
		return this.#children.length == 0;
	}
	// remove child from child list, return it
	remove(child : Node) {
		try {
			this.container.removeChild(child.DOM);
		} catch (e) {
			throw new TypeError("Node is not a child of this parent");
		}
		this.#children.splice(this.#children.indexOf(child), 1);
		child._parent = undefined;
		child.fadeOut(0);
		return child;
	}
	// Array<Node> children - unassignable, unchangeable array of children
	get children() {
		return this.#children.slice();
	}
	set children(value) {
		this.clear();
		this.#appendMany(value);
	}
	// remove all elemnts from this node
	clear() {
		for (const child of this.children) {
			this.remove(child)
		}
	}
}
