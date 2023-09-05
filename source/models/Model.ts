import {ITabs, Tabs} from "./Tabs";
import {ISessions, Sessions} from "./Sessions";
import {Favicons, IFavicons} from "./Favicons"
import {IHistory, History} from "./History";

export default class Model {
    tabs : ITabs
    sessions : ISessions
    favicons : IFavicons
    history : IHistory

    constructor() {
        this.tabs = new Tabs();
        this.sessions = new Sessions();
        this.favicons = new Favicons();
        this.history = new History();
    }
}
