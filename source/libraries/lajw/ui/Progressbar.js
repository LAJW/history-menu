import Node from "./Node.js"

const template = $({
	nodeName: "CANVAS",
	className: "Progressbar",
	height: 8,
	width: 400
});

export default class Progressbar extends Node {
	constructor(e) {
		e = e || {};
		e.DOM = template.cloneNode(false);
		super(e);
	}
	fadeIn() { /* override */
		let ctx = this.DOM.getContext("2d");
		let c = [-0.1, -0.2, -0.3];
		let then = Date.now();
		this.DOM.style.width = "inherit";
		this._interval = setInterval(function () {
			if (!this.parent)
				this.fadeOut(); // BUG - this shouldn't be neccessary
			let width = this.DOM.offsetWidth | 0;
			if (this.DOM.width != width)
				this.DOM.width = width;
			ctx.fillStyle = "rgb(64, 129, 244)";
			
			let dt = (Date.now() - then) / 1000;
			if (dt > 4 / 1000) {
				then = Date.now();
				ctx.clearRect(0, 0, width, 10);
				for (let i = 0; i < 3; i++) {
					ctx.beginPath();
					c[i] = (c[i] + dt) % 1;
					ctx.arc(Math.acos(1 - 2 * c[i]) 
						/ Math.PI * width, 2, 4, 4, Math.PI)
					ctx.closePath();
					ctx.fill();
				}
			}
		}.bind(this), 1);
	}
	fadeOut() { /* override */
		clearInterval(this._interval);
		this._interval = null;
	}
}
