import {Bookmarks, IBookmarks} from "./Bookmarks";
import {IBrowser, Browser} from "./Browser";
import {ITabs, Tabs} from "./Tabs";
import {ISessions, Sessions} from "./Sessions";
import {Favicons, IFavicons} from "./Favicons"
import {IHistory, History} from "./History";
import {ISettings, Settings} from "./Settings"
import {Storage} from "./Storage";
import {ITheme, Theme} from "./Theme";

export default class Model {
    bookmarks : IBookmarks
    browser : IBrowser
    tabs : ITabs
    sessions : ISessions
    favicons : IFavicons
    history : IHistory
    settings : ISettings
    storage : Storage
    theme : ITheme

    constructor() {
        this.bookmarks = new Bookmarks();
        this.browser = new Browser();
        this.tabs = new Tabs();
        this.sessions = new Sessions();
        this.favicons = new Favicons();
        this.history = new History();
        this.settings = new Settings();
        this.storage = new Storage();
        this.theme = new Theme();
    }
}
