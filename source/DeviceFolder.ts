import Folder from "./components/Folder"
import { I18n } from "./Settings";
import WindowFolder from "./WindowFolder"

export default class DeviceFolder extends Folder {
	constructor (i18n : I18n, device : chrome.sessions.Device) {
		const children = device.sessions.map(({window, lastModified}) => new WindowFolder(i18n, {
			...window, lastModified, fadeInEnabled : true,
		}));
		super({
			children,
			title : device.deviceName,
			tooltip : device.deviceName,
			fadeInEnabled : true,
		});
	}
}
