"use strict"

define(["./Node"], function (_Node) {

const template = $({
	nodeName: "IMG"
});

class Image extends _Node {
	constructor(e) {
		typecheck(arguments, [{
			src: [String, undefined],
			alt: [String, undefined]
		}, undefined]);
		e = e || {};
		e.DOM = template.cloneNode(false);
		super(e);
		this.src = e.src || "";
		this.alt = e.alt || "";
	}
	// String src - path to the image file 
	get src() {
		return this._src;
	} 
	set src(value) {
		typecheck(arguments, String);
		this._src = value;
		this.DOM.src = value;
	}
	// String alt - alternative text of the image
	get alt() {
		return this.DOM.alt;
	}
	set alt(value) {
		typecheck(arguments, String);
		this.DOM.alt = value;
	}
}

return Image;

});
