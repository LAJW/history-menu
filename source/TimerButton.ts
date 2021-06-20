import Button from "./libraries/lajw/ui/Button"
import { $, relativeTime } from "./libraries/lajw/utils";

const template = $({
	nodeName: "DIV",
	className: "Timer hidden",
	childNodes: [$("")]
});

export default class TimerButton extends Button {
	_timerNode : HTMLElement
	_timerInterval : NodeJS.Timeout
	_timer : number
	constructor(e : {
			icon: string
			title: string
			tooltip: string
			timer: number
		}) {
		super(e);
		this._timerNode = this.DOM.appendChild(template.cloneNode(true)) as HTMLElement;
		this.timer = e.timer;
	}
	override fadeIn(e : number) {
		super.fadeIn(e);
		this._timerInterval = setInterval(this._updateTimer.bind(this), 500);
	}
	override fadeOut(e : number) {
		super.fadeOut(e);
		clearInterval(this._timerInterval);
	}
	set timer(value : number) {
		this._timer = value;
		this._timerNode.classList.toggle("hidden", !value);
		this._updateTimer();
	}
	get timer() {
		return this._timer;
	}
	_updateTimer() {
		if (this.timer) {
			this._timerNode.firstChild.nodeValue = relativeTime(this.timer);
		}
	}
}
