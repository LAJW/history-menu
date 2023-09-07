import Chrome from "../Chrome";
import {LocalSettings, Settings} from "../Settings";

export interface IStorage<T> {
    get() : Promise<T>
    set(object : Object) : Promise<void>
}

export class LocalStorage implements IStorage<LocalSettings> {
    async get() : Promise<LocalSettings> {
        const result = await Chrome.storage.local.get();
        return result as LocalSettings;
    }

    set(object : Object) : Promise<void> {
        return Chrome.storage.local.set(object);
    }
}

export class SyncStorage implements IStorage<Settings> {
    async get() : Promise<Settings> {
        const result = await Chrome.storage.sync.get();
        return result as Settings;
    }

    set(object : Object) : Promise<void> {
        return Chrome.storage.sync.set(object);
    }
}

export class Storage {
    sync : IStorage<Settings> = new SyncStorage()
    local : IStorage<LocalSettings> = new LocalStorage()
}
