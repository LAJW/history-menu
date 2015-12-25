"use strict"

define([], function () {

return class ActionButton extends Button {
	constructor (e) {
		super(e);
		this.click = e.click;
	}
}

});
