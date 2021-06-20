import Button from "./libraries/lajw/ui/Button"

export default class ActionButton extends Button {
	constructor (e : {
			id?: string,
			icon?: string
			title?: string
			tooltip?: string
			click : (e : MouseEvent) => void
		}) {
		super(e);
		this.click = e.click;
	}
}