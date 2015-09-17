"use strict"
var Button = (function () {
	let template = $({
		nodeName: "A",
		className: "menuItem Button",
		childNodes: [$("")]
	});
	class Button extends Node {
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
	return Button;
})();
