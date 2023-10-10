import Folder from "./components/Folder"
import { I18n } from "./Settings";
import WindowFolder, {WindowFolderInfo} from "./WindowFolder"
import {ISessions} from "./models/Sessions";
import {IBrowser} from "./models/Browser";

interface DeviceInfo {
	deviceName: string
	sessions: WindowFolderInfo[]
}

export default class DeviceFolder extends Folder {
	constructor (i18n : I18n, sessions: ISessions, browser: IBrowser, device : DeviceInfo) {
		super({
			children: device.sessions.map(window =>
				new WindowFolder(i18n, sessions, browser, { ...window, open: true })),
			title : device.deviceName,
			tooltip : device.deviceName,
			fadeInEnabled : false,
		});
	}
}
