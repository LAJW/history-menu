import Chrome from "../Chrome";

export interface IBrowser {
    getPlatform() : "Windows" | "Ubuntu" | "";
    fetch(url: string): Promise<string>;
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
}
