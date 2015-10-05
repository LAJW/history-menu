"use strict"

class ActionButton extends Button {
	constructor (e) {
		super(e);
		this.click = e.click;
	}
}
