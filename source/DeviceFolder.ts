import Folder from "./libraries/lajw/ui/Folder"
import WindowFolder from "./WindowFolder"

export default class DeviceFolder extends Folder {
	constructor (device : chrome.sessions.Device) {
		const children = device.sessions.map(({window, lastModified}) => new WindowFolder({
			...window, lastModified
		}));
		super({ children, title : device.deviceName });
	}
}
