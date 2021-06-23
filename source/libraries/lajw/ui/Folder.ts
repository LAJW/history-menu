import UINode from "./Node"
import Parent from "./Parent"
import { $, px } from "../utils"

const template = $({
	nodeName: "DIV",
	className: "Folder",
	childNodes: [$({
		nodeName: "A",
		className: "menuItem title",
		childNodes: [$("")]
	}), $({
		nodeName: "DIV",
		className: "menuItem empty",
		childNodes: [$("(empty)")]
	}), $({
		nodeName: "DIV",
		className: "children"
	})]
});

// PRIVATE PROPERTIES: _open, #empty, _title, _interval, _hover
export default class Folder extends Parent {
	readonly #empty : HTMLElement
	#title : HTMLAnchorElement
	#open : boolean
	constructor(e : {
			title : string,
			open? : boolean,
			children : UINode[]
		}) {
		super((() => {
			const DOM = template.cloneNode(true) as HTMLElement;
			const container = DOM.lastChild as HTMLElement;
			return { DOM, container, children : new Array<UINode>() }
		})());
		this.#title = this.DOM.firstChild as HTMLAnchorElement;
		this.#empty = this.DOM.childNodes[1] as HTMLElement;
		this.title = e.title;
		this.open = e.open ?? true;
		this.insert(e.children);
	}
	override insert(child : UINode | UINode[], before? : UINode) {
		super.insert(child, before);
		this.#empty.classList.add("hidden");
		this.#updateStyle();
	}
	override remove(child : UINode) {
		super.remove(child);
		if (!this.children.length)
			this.#empty.classList.remove("hidden");
		this.#updateStyle();
		return child
	}
	override fadeIn(delay : number) {
		this.DOM.style.animationDelay = delay + "ms";
		this.DOM.classList.add("fadeIn");
	}
	override click (e : MouseEvent) {
		e.preventDefault()
		if (e.button == 0) {
			this.open = !this.open;
		}
	}
	get height() {
		let height = 23; // HACK
		if (this.open)
			return height + (this.children.reduce(function (prev, child) {
				return prev + child.height;
			}, 0) || height)
		else return height;
	}
	// bool open - is this folder open
	get open() {
		return this.#open;
	}
	set open(value : boolean) {
		this.#open = value;
		this.DOM.classList.toggle("open", value);
		this.DOM.style.maxHeight = px(this.height);
		if (this.parent && value && this.parent instanceof Folder) {
			this.parent.open = this.parent.open;
		}
	}
	// update style after inserting new element
	#updateStyle () {
		this.open = this.open;
	}
	// folder's name
	get title() {
		return this.#title.firstChild.nodeValue;
	}
	set title(value : string) {
		this.#title.firstChild.nodeValue = value;
		this.#title.title = value;
	}
}
