import Folder from "./components/Folder"
import { I18n } from "./Settings";
import WindowFolder, {WindowFolderInfo} from "./WindowFolder"

interface DeviceInfo {
	deviceName: string
	sessions: WindowFolderInfo[]
}

export default class DeviceFolder extends Folder {
	constructor (i18n : I18n, device : DeviceInfo) {
		super({
			children: device.sessions.map(window => new WindowFolder(i18n, window)),
			title : device.deviceName,
			tooltip : device.deviceName,
			fadeInEnabled : false,
		});
	}
}
