import Chrome from "../Chrome";
import Filter = chrome.sessions.Filter;
import Session = chrome.sessions.Session;
import Device = chrome.sessions.Device;

export interface ISessions {
    restore(sessionId : string, inBackground? : boolean) : Promise<void>;
    getRecent(filter : Filter): Promise<Session[]>;
    getDevices(): Promise<Device[]>;
}

export class Sessions implements ISessions {
    restore(sessionId : string, inBackground? : boolean) : Promise<void> {
        return Chrome.sessions.restore(sessionId, inBackground);
    }

    getRecent(filter : Filter): Promise<Session[]> {
        return Chrome.sessions.getRecent(filter);
    }

    getDevices(): Promise<Device[]> {
        return Chrome.sessions.getDevices();
    }
}
