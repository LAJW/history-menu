import ActionButton from "./ActionButton"
import DevicesButton from "./DevicesButton"
import Input from "./components/Input"
import Layer from "./components/Layer"
import MultiButton from "./components/MultiButton"
import Progressbar from "./components/Progressbar"
import Separator from "./components/Separator"
import WindowFolder, {WindowFolderInfo} from "./WindowFolder"
import TabButton, {TabButtonInfo} from "./TabButton"
import HistoryButton from "./HistoryButton"
import Root from "./components/Root"
import DeviceFolder from "./DeviceFolder"
import Node from "./components/Node"
import {I18n, LocalSettings, Settings as SettingsObject, Settings} from "./Settings"
import {
    px,
    groupBy,
    parseGlobs,
    removeDomain,
    removeProtocol,
    isInBackground,
    darkMode,
    processTitle, last, head, stripHash, urlToTitleMap, getHash, processTitle1
} from "./Utils"

import {IModel, Model} from "./models/Model";

let devicesButton : DevicesButton, deviceLayer : Layer;

// get time sectors for search
function timeSectors() {
    const now       = Date.now();
    const hour      = 1000 * 3600;
    const lastHour  = now - hour;
    const lastDay   = now - hour * 24;
    const yesterday = now - hour * 48;
    const lastWeek  = now - hour * 24 * 7;
    const prevWeek  = now - hour * 24 * 14;
    const lastMonth = now - hour * 24 * 30;
    const prevMonth = now - hour * 24 * 60;
    return [
        { start: lastHour,  end: now,       i18n: "results_recently" },
        { start: lastDay,   end: lastHour,  i18n: "results_today" },
        { start: yesterday, end: lastDay,   i18n: "results_yesterday" },
        { start: lastWeek,  end: yesterday, i18n: "results_this_week" },
        { start: prevWeek,  end: lastWeek,  i18n: "results_last_week" },
        { start: lastMonth, end: prevWeek,  i18n: "results_this_month" },
        { start: prevMonth, end: lastMonth, i18n: "results_last_month" }
    ];
}

class Token {
    _id : number
    _tokenFactory : TokenFactory
    constructor(tokenFactory : TokenFactory) {
        tokenFactory._id += 1;
        this._id           = tokenFactory._id;
        this._tokenFactory = tokenFactory;
    }
    get valid() {
        return this._id == this._tokenFactory._id;
    }
    valueOf() {
        return this.valid;
    }
}

class TokenFactory {
    _id : number
    constructor() {
        this._id = 0;
    }
}

const tokenFactory = new TokenFactory();
let selectedResult = 0;
let searchResults : HistoryButton[] = [];

const key = Object.freeze({
    arrowUp:   "ArrowUp",
    arrowDown: "ArrowDown",
    tab:       "Tab",
    enter:     "Enter"
});

window.addEventListener("keydown", e => {
    if ((e.key == key.arrowDown
            || e.key == key.tab && !e.shiftKey)
        && selectedResult + 1 <
        searchResults.length) {
        searchResults[selectedResult].highlighted = false;
        selectedResult++;
        searchResults[selectedResult].highlighted = true;
        if (searchResults[selectedResult - 5]) {
            searchResults[selectedResult - 5].DOM.scrollIntoView();
        }
        e.preventDefault();
    } else if ((e.key == key.arrowUp
            || e.key == key.tab && e.shiftKey)
        && selectedResult - 1 >= 0) {
        searchResults[selectedResult].highlighted = false;
        selectedResult--;
        searchResults[selectedResult].highlighted = true;
        if (searchResults[selectedResult - 5]) {
            searchResults[selectedResult - 5].DOM.scrollIntoView();
        }
        e.preventDefault();
    } else if (e.key == key.enter) {
        if (searchResults.length > 0) {
            // @ts-ignore
            // TODO: Outstanding, events might have to be rewired
            searchResults[selectedResult].click({
                preventDefault: () => e.preventDefault,
                button: isInBackground(e) ? 1 : 0
            });
        }
    }
});

function onSearch(deviceLayer : Layer, searchLayer : Layer, i18n : (key : string) => string, settings : Settings, value : string, model : IModel) {
    if (deviceLayer) {
        deviceLayer.visible = false;
        devicesButton.on    = false;
    }
    const token         = new Token(tokenFactory);
    selectedResult      = 0;
    searchResults       = [];
    searchLayer.visible = value.length > 0;
    searchLayer.clear();
    if (value.length > 0) {
        const progressbar = new Progressbar
        searchLayer.insert(progressbar);
        setTimeout(async () => {
            if (!token.valid) {
                return;
            }
            for (const sector of timeSectors()) {
                const results = await model.history.search({
                    text:      value,
                    startTime: sector.start,
                    endTime:   sector.end,
                })
                if (results.length && token.valid) {
                    const nodes = results.map(result => {
                        if (!settings.timer) {
                            return new HistoryButton(i18n, {
                                ...result,
                                lastVisitTime : null,
                                model,
                            });
                        } else {
                            return new HistoryButton(i18n, { ...result, model });
                        }
                    });
                    searchResults = [ ...searchResults, ...nodes ];
                    searchLayer.insert(new Separator({title: i18n(sector.i18n)}))
                    searchLayer.insert(nodes);
                }
            }
            if (!token.valid) {
                return;
            }
            if (searchResults.length > 0) {
                searchResults[0].highlighted = true;
            }
            searchLayer.remove(progressbar);
            if (searchLayer.children.length) {
                searchLayer.insert(new Separator({
                    title: i18n("results_end")
                }));
            } else {
                searchLayer.insert(new Separator({
                    title: i18n("results_nothing_found")
                }));
            }
        }, 500);
    }
}

function getMainLayer(sessions : Node[], history : Node[], i18n : (key : string) => string, settings : Settings) {
    if (sessions.length > 0) {
        sessions.unshift(new Separator({
            title: i18n("popup_recently_closed_tabs")
        }));
    }
    if (history.length > 0) {
        history.unshift(new Separator({
            title: i18n("popup_recent_history")
        }));
    }
    const children = settings.tabsFirst
        ? sessions.concat(history)
        : history.concat(sessions);
    if (children.length == 0) {
        history.unshift(new Separator({
            title: i18n("results_nothing_found")
        }));
    }
    return new Layer({
        children: children,
        fadeInEnabled: false,
    });
}

function main(
    root : Root,
    sessions : Node[],
    devices : DeviceFolder[],
    history : HistoryButton[],
    stream : AsyncIterable<HistoryButton>,
    bookmarks : chrome.bookmarks.BookmarkTreeNode[],
    i18n : (key : string) => string, settings : Settings,
    model : IModel) {

    root.width  = settings.width || 0;
    root.height = settings.height || 0;
    const mainLayer = getMainLayer(sessions, history, i18n, settings)
    root.insert(mainLayer);
    const searchLayer = root.insert(new Layer({
        visible:  false,
        children: [new Separator({
            title: i18n("popup_search_history")
        })],
        fadeInEnabled: true,
    })) as Layer;
    const anchorClick = (url : string) => async (e : MouseEvent) => {
        const inBackground = isInBackground(e);
        await model.tabs.openOrSelect(url, inBackground);
        if (!inBackground) {
            model.browser.closeWindow();
        }
    }
    const mainButtons = new MultiButton({
        children: [
            new Input({
                placeholder: i18n("popup_search_history"),
                lockon:      true,
                change: value => onSearch(deviceLayer, searchLayer, i18n, settings, value ?? "", model)
            }),
            new ActionButton({
                title: "",
                tooltip: i18n("popup_history_manager"),
                iconClass: "icon-history",
                click: anchorClick(model.browser.historyPage)
            }),
            new ActionButton({
                title: "",
                tooltip: i18n("popup_options"),
                iconClass: "icon-options",
                click: anchorClick(model.browser.extensionRoot)
            })
        ]
    });
    if (devices.length > 0) {
        deviceLayer = new Layer({
            visible:  false,
            children: devices,
            fadeInEnabled: false,
        });
        devicesButton = new DevicesButton({
            tooltip: i18n("popup_other_devices"),
            click(_e) {
                const visible = !deviceLayer.visible;
                deviceLayer.visible = visible;
                this.on = visible;
            }
        });
        root.insert(deviceLayer);
        mainButtons.insert(devicesButton, mainButtons.children[1]);
    }
    root.insert(mainButtons);
    const gen = (async function* nice() { yield* stream })();
    if ((settings.tabsFirst && settings.historyCount > 0) || settings.tabCount === 0) {
        async function fill(amount : number) {
            while (mainLayer.DOM.scrollTop + mainLayer.DOM.clientHeight >= (mainLayer.DOM.scrollHeight - amount)) {
                const {done, value : entry} = await gen.next();
                if (done) {
                    break;
                }
                mainLayer.insert(entry as HistoryButton);
            }
        }
        fill(100);
        mainLayer.DOM.addEventListener("scroll", () => fill(500));
    }
}

function processTab(model: IModel, settings: Settings, tab: chrome.tabs.Tab, lastModified?: number): TabButtonInfo {
    const {title: originalTitle, url, sessionId} = tab
    const title = processTitle1(settings, tab)
    return {
        title,
        originalTitle,
        lastModified: settings.timer ? lastModified : undefined,
        url,
        sessionId,
        model,
    }
}

function processWindow(model: IModel, settings: Settings, window: chrome.windows.Window, lastModified: number): WindowFolderInfo {
    return {
        sessionId : window.sessionId,
        tabs: window.tabs.map(tab => processTab(model, settings, tab)),
        fadeInEnabled : false,
        lastModified : settings.timer ? lastModified : undefined,
        open : settings.expand,
    }
}

function sessionToButton(model : IModel, i18n : I18n, settings : Settings, session : chrome.sessions.Session, titleMap : Map<string, string>) {
    if (session.tab) {
        const tabInfo = processTab(model, settings, session.tab, session.lastModified)
        const bookmarkedTitle = titleMap.get(session.tab.url.toLowerCase())
        return bookmarkedTitle ? new TabButton({...tabInfo, title: bookmarkedTitle}) : new TabButton(tabInfo)
    } else {
        return new WindowFolder(
            i18n,
            model.sessions,
            model.browser,
            processWindow(model, settings, session.window, session.lastModified)
        )
    }
}

async function getSessionNodes(model: IModel, i18n : I18n, settings : Settings, titleMap: Map<string, string>) : Promise<Node[]> {
    return (await model.sessions.getRecent({ }))
        .slice(0, settings.tabCount | 0)
        .map(session => sessionToButton(model, i18n, settings, session, titleMap));
}

async function getDeviceNodes(model: IModel, i18n : I18n, settings : Settings) {
    const devices = await model.sessions.getDevices();
    return devices.map(({sessions, deviceName}) => {
        const processedSessions =
            sessions.map(session =>
                processWindow(model, settings, session.window, session.lastModified))
        return new DeviceFolder(i18n, model.sessions, model.browser, {deviceName, sessions: processedSessions})
    });
}

function auxiliaryTitle(titleGroups : Map<string, chrome.history.HistoryItem[]>, item : chrome.history.HistoryItem) : { title : string, aux? : string } {
    const title = item.title;
    const titleGroup = titleGroups.get(title);
    if (titleGroup) {
        const baseUrlGroups = groupBy([...titleGroup].map(item => stripHash(item.url)), id => id);
        // TODO: Query different
        if (baseUrlGroups.size === 1) { // base URL unique - good site
            if (head(baseUrlGroups.values()).length == 1) {
                return { title };
            } else {
                return { title, aux : getHash(item.url) };
            }
        } else { // Base URL different - trash site
            return { title, aux : removeDomain(item.url) };
        }
    } else { // no title
        return { title: item.url };
    }
}

async function* streamHistoryNodes(
    i18n : I18n,
    settings : Settings,
    titleMap : Map<string, string>,
    titleGroups : Map<string, chrome.history.HistoryItem[]>,
    seen : Set<string>,
    chunkStart : number,
    filter : (value : string) => boolean,
    model : IModel) {
    while (true) {
        // TODO: this can have 50 entries with the same timestamp which would hang the popup
        const chunk = await model.history.search({
            text:       "",
            startTime:  chunkStart - 1000 * 3600 * 24 * 30,
            endTime:    chunkStart,
            maxResults: 50
        })
        chunkStart = last(chunk)?.lastVisitTime;
        for (const item of chunk) {
            if (seen.has(item.url)) {
                continue;
            }
            seen.add(item.url);

            if (!filter(item.url)) {
                continue;
            }

            // TODO: Post mortem updates to existing buttons
            // Set aux after ambiguity detected
            // This way we could have 1 function rather than 2
            let group = titleGroups.get(item.title);
            if (!group) {
                group = [];
                titleGroups.set(item.title, group);
            }
            group.push(item);

            const aux = auxiliaryTitle(titleGroups, item);
            let title = titleMap.get(item.url.toLowerCase())
            if (!title) {
                if (!item.title || item.title === "" || titleGroups.get(item.title).length > 0) {
                    title = titleMap.get(stripHash(item.url.toLowerCase())) ?? processTitle1(settings, item);
                }
            }
            yield new HistoryButton(i18n, {
                ...item,
                title,
                lastVisitTime : settings.timer ? item.lastVisitTime : undefined,
                preferSelect : settings.preferSelect,
                originalTitle : aux.title,
                aux : aux.aux,
                model,
            })
        }
        if (chunk.length == 0) {
            break;
        }
    }
}

async function getHistoryNodes(i18n : I18n, settings : Settings, titleMap : Map<string, string>, model : IModel) : Promise<{
    results : HistoryButton[],
    stream : AsyncIterable<HistoryButton>
}> {
    if (settings.historyCount === 0) {
        return { results : [], stream : (async function* () {})() }
    }
    const timestamp = Date.now();
    const blacklist = parseGlobs(settings.filter.split("\n")).parsers;
    let results : chrome.history.HistoryItem[]
    const seen = new Set<string>()
    const filter = (url: string) => !blacklist.some(match => match(url) || match(removeProtocol(url)));
    for (let i = 1; i < 10; ++i) {
        // TODO: Into async generator
        const preFilter = await model.history.search({
            text:       "",
            startTime:  timestamp - 1000 * 3600 * 24 * 30,
            endTime:    timestamp,
            maxResults: (settings.historyCount | 20) + (20 * i)
        })
        results = preFilter.filter(({url}) => filter(url));
        if (preFilter.length === results.length || results.length >= settings.length) {
            break;
        }
    }
    results = results.slice(0, settings.historyCount)
    for (const item of results) {
        seen.add(item.url);
    }
    const titleGroups = groupBy(results, ({title}) => title)
    const stream = streamHistoryNodes(i18n, settings, titleMap, titleGroups, seen, last(results)?.lastVisitTime, filter, model)
    return {
        results:
            results
                .map(item => {
                    const aux = auxiliaryTitle(titleGroups, item);
                    let title = titleMap.get(item.url.toLowerCase())
                    if (!title) {
                        if (!item.title || item.title === "" || titleGroups.get(item.title).length > 0) {
                            title = titleMap.get(stripHash(item.url.toLowerCase())) ?? processTitle1(settings, item);
                        }
                    }
                    return new HistoryButton(i18n, {
                        ...item,
                        title,
                        lastVisitTime : settings.timer ? item.lastVisitTime : undefined,
                        preferSelect : settings.preferSelect,
                        originalTitle : aux.title,
                        aux : aux.aux,
                        model,
                    })
                }),
        stream
    }
}

function reserveSpace(settings : Settings) {
    document.body.style.minWidth = px(settings.width)
    document.body.style.minHeight = px(settings.height)
}

export async function createPopup(model: Model) {
    const settings = await model.browser.fetch("defaults.json")
        .then(JSON.parse)
        .then(model.settings.getReadOnly)

    const root = await Root.ready()
    model.theme.update();
    root.setTheme(settings.theme || model.browser.getPlatform(), settings.animate, darkMode(settings));
    reserveSpace(settings)
    const i18n = await model.browser.getI18n(settings.lang);
    const bookmarks = await model.bookmarks.getTree();
    const titleMap = urlToTitleMap(bookmarks);
    const [sessions, devices, {results: history, stream : historyStream}] = await Promise.all([
        getSessionNodes(model, i18n, settings, titleMap),
        getDeviceNodes(model, i18n, settings),
        getHistoryNodes(i18n, settings, titleMap, model),
    ])
    main(
        root,
        sessions,
        devices,
        history,
        historyStream,
        bookmarks,
        i18n,
        settings,
        model);
}
