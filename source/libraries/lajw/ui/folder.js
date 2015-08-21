var Folder = (function () {
	var template = $({
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

	return new Class({
		// PRIVATE PROPERTIES: _open, _empty, _title, _interval, _hover
		prototype: Parent,
		/* constructor({
			String title = "",
			Boolean open = false,
		}) */
		constructor: function (e) {
			typecheck(arguments, [{
				open: [Boolean, undefined],
			}, undefined], typecheck.loose);
			e = e || {};
			e.DOM = template.cloneNode(true);
			e.container = e.DOM.lastChild;
			Parent.call(this, e);
			this._title = this.DOM.firstChild;
			this._empty = this.DOM.childNodes[1];
			this.title = e.title || "";
			this.open = e.open || false;
		},
		// Node insert(Node child, optional Node before);
		// returns inserted child
		insert: function (child, before) {
			Parent.prototype.insert.apply(this, arguments);
			this._empty.classList.add("hidden");
			this.open = this.open;
		},
		// Node remove(Node child)
		// returns removed child
		remove: function (child) {
			Parent.prototype.remove.apply(this, arguments);
			if (!empty)
				this._empty.classList.add("hidden");
			this.open = this.open;
		},
		// void fadeIn (delay) - fadeIn animation
		fadeIn: function (delay) {
			typecheck(arguments, Number);
			this.DOM.style.WebkitAnimationDelay = delay + "ms";
			this.DOM.classList.add("fadeIn");
		},
		fadeOut: function (delay) {
			typecheck(arguments, Number);
			this.DOM.style.WebkitAnimationDelay = delay + "ms";
			this.DOM.classList.add("fadeOut");
		},
		// void click(DOMEvent) override
		click: function (e) {
			this.open = !this.open;
		},
		// Number height override
		height: {
			get: function () {
				var height = 23;
				if (this.open)
					return height + (this.children.reduce(function (prev, child) {
						return prev + child.height;
					}, 0) || height)
				else return height;
			}
		},
		// bool open - is this folder open
		open: {
			get: function () {
				return this._open;
			},
			set: function (value) {
				this._open = value;
				this.DOM.classList.toggle("open", value);
				this.DOM.style.maxHeight = px(this.height);
				if (this.parent && value)
					this.parent.open = this.parent.open;
			}
		},
		// String title 
		title: {
			get: function () {
				return this._title.firstChild.value;
			},
			set: function (value) {
				this._title.firstChild.nodeValue = value;
				this._title.title = value;
			}
		}
	});
})();
