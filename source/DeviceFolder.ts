import Folder from "./libraries/lajw/ui/Folder"
import WindowFolder from "./WindowFolder"

export default class DeviceFolder extends Folder {
	constructor (device : chrome.sessions.Device) {
		const children = device.sessions.map(session => new WindowFolder({
			...window, lastModified : session.lastModified
		}));
		super({ children });
		this.title = device.deviceName;
	}
}
