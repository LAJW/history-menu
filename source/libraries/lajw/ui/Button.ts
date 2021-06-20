import Node from "./Node"
import { $, url } from "../utils"

let template = $({
	nodeName: "A",
	className: "menuItem Button",
	childNodes: [$("")]
});

export default class Button extends Node {
	_icon : string

	constructor (e : {
		icon?: string
		title?: string
		tooltip?: string
	}) {
		super({ DOM: template.cloneNode(true) as HTMLElement });
		this.title = e.title || "";
		this.icon = e.icon || "";
		this.tooltip = e.tooltip || "";
	}
	get height() {
		return 23; // HACK
	}
	override fadeIn(delay : number) {
		typecheck(arguments, Number);
		this.DOM.style.animationDelay = delay + "ms";
		this.DOM.classList.add("fadeIn");
	}
	get title() { return this.DOM.firstChild.nodeValue; }
	set title(value) { 
		typecheck(arguments, String);
		this.DOM.firstChild.nodeValue = value;	
	}
	get icon(){ return this._icon }
	set icon(value) {
		typecheck(arguments, String);
		this._icon = value;
		this.DOM.style.backgroundImage = value ? url(value) : "none";
	}
	get tooltip() { return this.DOM.title }
	set tooltip(value) {
		typecheck(arguments, String);
		this.DOM.title = value;
	}
}
