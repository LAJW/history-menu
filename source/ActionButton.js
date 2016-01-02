"use strict"

define(["./libraries/lajw/ui/Button"], function (_Button) {

class ActionButton extends _Button {
	constructor (e) {
		super(e);
		this.click = e.click;
	}
}

return ActionButton;

});
