import {IBrowser, Browser} from "./Browser";
import {ITabs, Tabs} from "./Tabs";
import {ISessions, Sessions} from "./Sessions";
import {Favicons, IFavicons} from "./Favicons"
import {IHistory, History} from "./History";

export default class Model {
    browser : IBrowser
    tabs : ITabs
    sessions : ISessions
    favicons : IFavicons
    history : IHistory

    constructor() {
        this.browser = new Browser();
        this.tabs = new Tabs();
        this.sessions = new Sessions();
        this.favicons = new Favicons();
        this.history = new History();
    }
}
