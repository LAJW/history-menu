import Button from "./components/Button"

export default class ActionButton extends Button {
	constructor (e : {
			icon?: string
			iconClass?: string
			title: string
			tooltip: string
			click : (e : MouseEvent) => void
		}) {
		super(e);
		this.DOM.classList.add(e.iconClass);
		this.click = e.click;
	}
}
