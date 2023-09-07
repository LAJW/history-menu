import {IModel} from "./models/Model";
import {Settings as SettingsObject} from "./Settings";
import {createPopup} from "./PopupImpl";

const defaultSettings = {
    width: 300,
    height: 600,
    tabCount: 10,
    historyCount: 10,
    icon: "auto",
    lang: "",
    timer: true,
    animate: true,
    expand: true,
    preferSelect: true,
    tabsFirst: true,
    theme: "",
    darkMode: "",
    filter: "https://translate.google.com/*",
    trimTitles: true
};

const model : IModel = {
    bookmarks : {
        getTree() {
            return Promise.resolve([])
        }
    },
    browser : {
        getPlatform: () => "Windows",
        fetch: (url) => Promise.resolve(JSON.stringify(defaultSettings)),
        getI18n: locale => Promise.resolve(key => key),
        reload() {},
        openInNewTab(url: string) {},
        extensionRoot: "./",
        historyPage: `chrome://history/`,
        closeWindow(){},
    },
    tabs : {
        async openInCurrentTab(url, inBackground) {},
        async openOrSelect(url : string, inBackground : boolean) {},
    },
    sessions : {
        async restore(sessionId : string, inBackground? : boolean) {},
        async getRecent(filter) { return []; },
        async getDevices() { return []; }
    },
    favicons : {
        forUrl(url: string) { return ""; },
    },
    history : {
        async deleteUrl(url : string) {},
        async search(query) { return []; },
    },
    settings : {
        async getReadOnly(defaultSettings : SettingsObject) { return defaultSettings },
    },
    storage : {
        sync : {
            async get() {
                return defaultSettings;
            },
            async set(object) {},
        },
        local : {
            async get() {
                return { ...defaultSettings, local : false, wasDark: false };
            },
            async set(object : Object) {},
        },
    },
    theme : {
        update() {},
        async updateIcon() {},
        isDarkTheme: false
    }
}

createPopup(model);
