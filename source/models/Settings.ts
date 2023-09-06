import Chrome from "../Chrome";
import {Settings as SettingsObject} from "../Settings";

export interface ISettings {
    getReadOnly(defaultSettings : SettingsObject) : Promise<SettingsObject>;
}

export class Settings implements ISettings {
    async getReadOnly(defaultSettings : SettingsObject = {}) : Promise<SettingsObject> {
        return Chrome.settings.getReadOnly(defaultSettings);
    }
}
