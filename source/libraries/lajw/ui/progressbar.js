"use strict"
var Progressbar = (function () {
	const template = $({
		nodeName: "CANVAS",
		className: "Progressbar",
		width: 400,
		height: 400
	});
	class Progressbar extends Node {
		constructor(e) {
			e = e || {};
			e.DOM = template.cloneNode(false);
			super(e);
			this.DOM.width = 400;
			this.DOM.height = 8;
		}
		fadeIn() { // override
			var ctx = this.DOM.getContext("2d");
			ctx.fillStyle = "rgb(64, 129, 244)";
			var c = [-0.1, -0.2, -0.3];
			var then = Date.now();
			this._interval = setInterval(function () {
				var dt = (Date.now() - then) / 1000;
				if (dt > 4 / 1000) {
					then = Date.now();
					if (!this.parent)
						clearInterval(this._interval);
					ctx.clearRect(0, 0, 400, 10);
					for (var i = 0; i < 3; i++) {
						ctx.beginPath();
						c[i] = (c[i] + dt) % 1;
						ctx.arc(Math.acos(1 - 2 * c[i]) 
							/ Math.PI * 400, 2, 4, 4, Math.PI)
						ctx.closePath();
						ctx.fill();
					}
				}
			}.bind(this), 1);
		}
	}
	return Progressbar;
})();
