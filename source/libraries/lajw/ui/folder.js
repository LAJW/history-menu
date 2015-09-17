"use strict"

var Folder = (function () {
	let template = $({
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

	class Folder extends Parent {
		// PRIVATE PROPERTIES: _open, _empty, _title, _interval, _hover
		constructor(e) {
			typecheck(arguments, [{
				open: [Boolean, undefined],
			}, undefined], typecheck.loose);
			e = e || {};
			e.DOM = template.cloneNode(true);
			e.container = e.DOM.lastChild;
			super(e);
			this._title = this.DOM.firstChild;
			this._empty = this.DOM.childNodes[1];
			this.title = e.title || "";
			this.open = e.open === undefined ? true : e.open;
		}
		insert(child, before) { // override
			Parent.prototype.insert.apply(this, arguments);
			this._empty.classList.add("hidden");
			this._updateStyle();
		}
		remove(child) { // override
			Parent.prototype.remove.apply(this, arguments);
			if (!empty)
				this._empty.classList.add("hidden");
			this._updateStyle();
		}
		fadeIn(delay) { // override
			typecheck(arguments, Number);
			this.DOM.style.WebkitAnimationDelay = delay + "ms";
			this.DOM.classList.add("fadeIn");
		}
		click (e) { // override
			this.open = !this.open;
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
		set open(value) {
			typecheck(arguments, Boolean);
			this._open = value;
			this.DOM.classList.toggle("open", value);
			this.DOM.style.maxHeight = px(this.height);
			if (this.parent && value)
				this.parent.open = this.parent.open;
		}
		// update style after inserting new element
		_updateStyle () {
			this.open = this.open;
		}
		// folder's name
		get title() {
			return this._title.firstChild.nodeValue;
		}
		set title(value) {
			typecheck(arguments, String);
			this._title.firstChild.nodeValue = value;
			this._title.title = value;
		}
	}
	return Folder;
})();
