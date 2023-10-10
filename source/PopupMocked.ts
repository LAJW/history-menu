import {IModel} from "./models/Model";
import {Settings as SettingsObject} from "./Settings";
import {createPopup} from "./PopupImpl";

const querySettings: {[key: string]: string | boolean | number} = {}
const url = new URL(window.location.href)
for (const key of url.searchParams.keys()) {
    querySettings[key] = (() => {
        const value = url.searchParams.get(key);
        switch (value) {
            case "true":
                return true;
            case "false":
                return false;
        }
        if (parseInt(value) + "" === value) {
            return parseInt(value);
        }
        return value;
    })();
}

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

let emptyTab: chrome.tabs.Tab  = {
    active: false,
    autoDiscardable: false,
    discarded: false,
    groupId: 0,
    highlighted: false,
    incognito: false,
    index: 0,
    pinned: false,
    selected: false,
    windowId: 0,

    // url: "",
    // favIconUrl: "",
    // sessionId: "",
}

const emptyHistoryItem : chrome.history.HistoryItem = {
    id: "",
    lastVisitTime : Date.now() - 3600 * 2000,
}

const historyGenerator: Generator<chrome.history.HistoryItem> = (function* () {
    yield { ...emptyHistoryItem, title: "Google", url: "https://google.com/" };
})();

const model : IModel = {
    bookmarks : {
        getTree() {
            return Promise.resolve([])
        }
    },
    browser : {
        getPlatform: () => "",
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
        async getRecent(filter) { return [
            {
                lastModified : Date.now() / 1000 - 3600,
                tab: { ...emptyTab, title: "Google", url: "https://google.com/" },
            }
        ]; },
        async getDevices() { return []; }
    },
    favicons : {
        forUrl(url: string) { return ""; },
    },
    history : {
        async deleteUrl(url : string) {},
        async search(query) {
            const {done, value} = historyGenerator.next();
            return done ? [] : [value];
        },
    },
    settings : {
        async getReadOnly(defaultSettings : SettingsObject) { return {...defaultSettings, ...querySettings} },
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