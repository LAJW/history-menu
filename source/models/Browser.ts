import Chrome from "../Chrome";
import {I18n} from "../Settings";

export interface IBrowser {
    getPlatform() : "Windows" | "Ubuntu" | "";
    fetch(url: string): Promise<string>;
    getI18n(locale? : string) : Promise<I18n>;
}

export class Browser implements IBrowser {
    getPlatform() {
        if (navigator.appVersion.indexOf("Win") != -1) {
            return "Windows";
        } else if (navigator.appVersion.indexOf("Linux") != -1) {
            return "Ubuntu";
        } else {
            return "";
        }
    }
    fetch(url: string): Promise<string> {
        return Chrome.fetch(url)
    }
    getI18n(locale? : string) : Promise<I18n> {
        return Chrome.getI18n(locale);
    }
}
