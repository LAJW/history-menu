import Chrome from "../Chrome";

export interface ITabs {
    openInCurrentTab(url : string, inBackground : boolean) : Promise<void>;
    openOrSelect(url : string, inBackground : boolean) : Promise<void>;
}

export class Tabs implements ITabs {
    async openInCurrentTab(url : string, inBackground : boolean) : Promise<void> {
        await Chrome.tabs.openInCurrentTab(url, inBackground);
    }

    async openOrSelect(url : string, inBackground : boolean) : Promise<void> {
        await Chrome.tabs.openOrSelect(url, inBackground);
    }
}
