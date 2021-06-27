import Node from "./Node"
import { $ } from "../utils"

const template = $({
	nodeName: "CANVAS",
	className: "Progressbar",
	height: 8,
	width: 400
});

export default class Progressbar extends Node {
	#interval? : NodeJS.Timeout
	constructor() {
		super({ DOM : template.cloneNode(false) as HTMLElement });
		const canvas = this.DOM as HTMLCanvasElement
		let ctx = canvas.getContext("2d");
		let c = [-0.1, -0.2, -0.3];
		let then = Date.now();
		this.DOM.style.width = "inherit";
		this.#interval = setInterval(() => {
			if (!this.parent)
				this.fadeOut(); // BUG - this shouldn't be neccessary
			let width = this.DOM.offsetWidth | 0;
			if (canvas.width != width) {
				canvas.width = width;
			}
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
		}, 1);
	}
	override fadeOut() {
		clearInterval(this.#interval);
		this.#interval = undefined;
	}
}
