"use strict"

define(["./libraries/lajw/ui/Folder", "./WindowFolder"], function (Folder,
	WindowFolder) {

class DeviceFolder extends Folder {
	constructor (device) {
		super({
			children: device.sessions.map(function (session) {
				let window = session.window;
				window.lastModified = session.lastModified;
				return new WindowFolder(window);
			})
		});
		this.title = device.deviceName;
	}
}

return DeviceFolder;

});
