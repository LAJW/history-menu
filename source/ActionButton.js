"use strict"

define(["./libraries/lajw/ui/Button"], function (Button) {

return class ActionButton extends Button {
	constructor (e) {
		super(e);
		this.click = e.click;
	}
}

});
