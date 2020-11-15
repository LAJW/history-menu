import Folder from "./libraries/lajw/ui/Folder.js"
import WindowFolder from "./WindowFolder.js"

export default class DeviceFolder extends Folder {
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
