import Node from "./Node"
import { $, url } from "../Utils"

let template = $({
	nodeName: "A",
	className: "menuItem Button",
	childNodes: [$("")]
});

export default class Button extends Node {
	#icon : string

	constructor (e : {
		icon?: string
		title: string
		tooltip: string
	}) {
		super({ DOM: template.cloneNode(true) as HTMLElement });
		this.title = e.title
		if (e.icon) {
			this.icon = e.icon;
		}
		this.tooltip = e.tooltip
	}
	get height() {
		return 23; // HACK
	}
	override fadeIn(delay : number) {
		this.DOM.style.animationDelay = delay + "ms";
		this.DOM.classList.add("fadeIn");
	}
	get title() { return this.DOM.firstChild.nodeValue; }
	set title(value : string) { 
		this.DOM.firstChild.nodeValue = value;	
	}
	get icon(){ return this.#icon }
	set icon(value : string) {
		this.#icon = value;
		this.DOM.style.backgroundImage = value ? url(value) : "none";
	}
	get tooltip() { return this.DOM.title }
	set tooltip(value : string) {
		this.DOM.title = value;
	}
}
