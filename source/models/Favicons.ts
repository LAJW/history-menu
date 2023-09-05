export interface IFavicons {
    forUrl(url: string) : string;
}

export class Favicons implements IFavicons {
    forUrl(url: string) : string {
        return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`;
    }
}
