import Chrome from "../Chrome";
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

export interface IBookmarks {
    getTree() : Promise<BookmarkTreeNode[]>;
}

export class Bookmarks implements IBookmarks {
    getTree() : Promise<BookmarkTreeNode[]> {
        return Chrome.bookmarks.getTree()
    }
}
