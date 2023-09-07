import HistoryQuery = chrome.history.HistoryQuery;
import HistoryItem = chrome.history.HistoryItem;

export interface IHistory {
    deleteUrl(url : string): Promise<void>;
    search(query: HistoryQuery): Promise<HistoryItem[]>;
}

export class History implements IHistory {
    deleteUrl(url : string): Promise<void> {
        return chrome.history.deleteUrl({url});
    }

    search(query: HistoryQuery): Promise<HistoryItem[]> {
        return chrome.history.search(query)
    }
}
