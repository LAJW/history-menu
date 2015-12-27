"use strict"

define(["./libraries/lajw/ui/Button", "./Chrome"], function (Button, Chrome) {
const template = $({
	nodeName: "DIV",
	className: "Timer hidden",
	childNodes: [$("")]
});

return class TimerButton extends Button {
	constructor(e) {
		super(e);
		this._timerNode = this.DOM.appendChild(template.cloneNode(true));
		this.timer = e.timer;
	}
	fadeIn(e) { // override
		super.fadeIn(e);
		this._timerInterval = setInterval(this._updateTimer.bind(this), 500);
	}
	fadeOut(e) { // override
		super.fadeOut(e);
		clearInterval(this._timerInterval);
	}
	set timer(value) {
		typecheck(arguments, [Number, undefined]);
		this._timer = value;
		this._timerNode.classList.toggle("hidden", !value);
		this._updateTimer();
	}
	get timer() {
		return this._timer;
	}
	_updateTimer() {
		if (this.timer) {
			this._timerNode.firstChild.nodeValue =
				relativeTime(this.timer);
		}
	}
};
});
