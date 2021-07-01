import Button from "./components/Button"
import { $, relativeTime } from "./Utils";

const template = $({
	nodeName: "DIV",
	className: "Timer hidden",
	childNodes: [$("")]
});

export default class TimerButton extends Button {
	#timerNode : HTMLElement
	#timerInterval : NodeJS.Timeout
	#timer : number
	constructor(e : {
			icon: string
			title: string
			tooltip: string
			timer: number
		}) {
		super(e);
		this.#timerNode = this.DOM.appendChild(template.cloneNode(true)) as HTMLElement;
		this.timer = e.timer;
		this.#timerInterval = setInterval(this.updateTimer.bind(this), 500);
	}
	override fadeOut(e : number) {
		super.fadeOut(e);
		clearInterval(this.#timerInterval);
	}
	set timer(value : number) {
		this.#timer = value;
		this.#timerNode.classList.toggle("hidden", !value);
		this.updateTimer();
	}
	get timer() {
		return this.#timer;
	}
	protected updateTimer() {
		if (this.timer) {
			this.#timerNode.firstChild.nodeValue = relativeTime(this.timer);
		}
	}
}
