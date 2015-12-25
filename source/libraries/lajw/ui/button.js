"use strict"

define(["./Node"], function (Node) {

let template = $({
	nodeName: "A",
	className: "menuItem Button",
	childNodes: [$("")]
});

return class Button extends Node {
	constructor (e) {
		typecheck(arguments, [{
			icon: [String, undefined],
			title: [String, undefined],
			tooltip: [String, undefined],
		}, undefined], typecheck.loose);
		e = e || {};
		e.DOM = template.cloneNode(true);
		super(e);
		this.title = e.title || "";
		this.icon = e.icon || "";
		this.tooltip = e.tooltip || "";
	}
	get height() {
		return 23; // HACK
	}
	fadeIn(delay) { /* override */
		typecheck(arguments, Number);
		this.DOM.style.WebkitAnimationDelay = delay + "ms";
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

});
