import {ITabs, Tabs} from "./Tabs";
import {ISessions, Sessions} from "./Sessions";
import {Favicons, IFavicons} from "./Favicons"

export default class Model {
    tabs : ITabs
    sessions : ISessions
    favicons : IFavicons

    constructor() {
        this.tabs = new Tabs();
        this.sessions = new Sessions();
        this.favicons = new Favicons();
    }
}
