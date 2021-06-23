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
	_title : HTMLAnchorElement
	_empty1 : HTMLElement
	_open : boolean
	constructor(e : {
			title? : string,
			open? : boolean,
			children : UINode[]
		}) {
		const DOM = template.cloneNode(true) as HTMLElement;
		const container = DOM.lastChild as HTMLElement;
		super({ DOM, container, children : [] });
		this._title = this.DOM.firstChild as HTMLAnchorElement;
		this._empty1 = this.DOM.childNodes[1] as HTMLElement;
		this.title = e.title || "";
		this.open = e.open === undefined ? true : e.open;
		this.insert(e.children);
	}
	override insert(child : UINode | UINode[], before? : UINode) {
		super.insert(child, before);
		this._empty1.classList.add("hidden");
		this._updateStyle();
	}
	override remove(child : UINode) {
		super.remove(child);
		if (!this.children.length)
			this._empty1.classList.remove("hidden");
		this._updateStyle();
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
		return this._open;
	}
	set open(value : boolean) {
		this._open = value;
		this.DOM.classList.toggle("open", value);
		this.DOM.style.maxHeight = px(this.height);
		if (this.parent && value && this.parent instanceof Folder) {
			this.parent.open = this.parent.open;
		}
	}
	// update style after inserting new element
	_updateStyle () {
		this.open = this.open;
	}
	// folder's name
	get title() {
		return this._title.firstChild.nodeValue;
	}
	set title(value : string) {
		this._title.firstChild.nodeValue = value;
		this._title.title = value;
	}
}
