import Button from "./libraries/lajw/ui/Button"

export default class ActionButton extends Button {
	constructor (e) {
		super(e);
		this.click = e.click;
	}
}
