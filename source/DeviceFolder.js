"use strict";

define(["./libraries/lajw/ui/Folder", "./WindowFolder"], function (Folder,
	WindowFolder) {

class DeviceFolder extends Folder {
	constructor (device) {
		const children = device.sessions.map(function (session) {
			const window        = session.window;
			window.lastModified = session.lastModified;
			return new WindowFolder(window);
		});
		super({
			children: children
		});
		this.title     = device.deviceName;
	}
}

return DeviceFolder;

});
