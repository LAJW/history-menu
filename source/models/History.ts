export interface IHistory {
    deleteUrl(url : string): Promise<void>;
}

export class History implements IHistory {
    deleteUrl(url : string): Promise<void> {
        return chrome.history.deleteUrl({url});
    }
}
