import Button from "./libraries/lajw/ui/Button.js"

export default class ActionButton extends Button {
	constructor (e) {
		super(e);
		this.click = e.click;
	}
}
