/************* source/popup.js - WHM Popup Entry Point Script *****************/
/**
 * @file This file is the entry point for Wrona History Menu Popup.
 * @copyright Copyright 2015 (c) Lukasz A.J. Wrona. All rights reserved.  This
 * file is distributed under the GNU General Public License version 3. See
 * LICENSE for details.
 * @author Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com)
 */

import ActionButton from "./ActionButton"
import Chrome from "./Chrome"
import DevicesButton from "./DevicesButton"
import Input from "./components/Input"
import Layer from "./components/Layer"
import MultiButton from "./components/MultiButton"
import Progressbar from "./components/Progressbar"
import Separator from "./components/Separator"
import WindowFolder from "./WindowFolder"
import TabButton from "./TabButton"
import HistoryButton from "./HistoryButton"
import Root from "./components/Root"
import DeviceFolder from "./DeviceFolder"
import Node from "./components/Node"
import { I18n, Settings } from "./Settings"
import { groupBy, parseGlobs, removeDomain, removeProtocol, url } from "./Utils"
import { isTemplateExpression } from "typescript"
import { resolve } from "../webpack.config"

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

const keyCode = {
	arrowUp:   38,
	arrowDown: 40,
	tab:       9,
	enter:     13
};

window.addEventListener("keydown", e => {
	if ((e.keyCode == keyCode.arrowDown 
			|| e.keyCode == keyCode.tab && !e.shiftKey)
		&& selectedResult + 1 <
			searchResults.length) {
		searchResults[selectedResult].highlighted = false;
		selectedResult++;
		searchResults[selectedResult].highlighted = true;
		if (searchResults[selectedResult - 5]) {
			searchResults[selectedResult - 5].DOM.scrollIntoView();
		}
		e.preventDefault();
	} else if ((e.keyCode == keyCode.arrowUp 
			|| e.keyCode == keyCode.tab && e.shiftKey)
		&& selectedResult - 1 >= 0) {
		searchResults[selectedResult].highlighted = false;
		selectedResult--;
		searchResults[selectedResult].highlighted = true;
		if (searchResults[selectedResult - 5]) {
			searchResults[selectedResult - 5].DOM.scrollIntoView();
		}
		e.preventDefault();
	} else if (e.keyCode == keyCode.enter) {
		if (searchResults.length > 0) {
			// @ts-ignore
			// TODO: Outstanding, events might have to be rewired
			searchResults[selectedResult].click({
				preventDefault: () => e.preventDefault,
				button: (e.ctrlKey || e.shiftKey) ? 1 : 0
			});
		}
	}
});

function onSearch(deviceLayer : Layer, searchLayer : Layer, i18n : (key : string) => string, settings : Settings, value : string) {
	if (deviceLayer) {
		deviceLayer.visible = false;
		devicesButton.on    = false;
	}
	const token         = new Token(tokenFactory);
	selectedResult      = 0;
	searchResults       = new Array;
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
				const results = await Chrome.history.search({
					text:      value,
					startTime: sector.start,
					endTime:   sector.end,
				})
				if (results.length && token.valid) {
					const nodes = results.map(result => {
						if (!settings.timer) {
							result.lastVisitTime = null;
						}
						return new HistoryButton(i18n, { ...result });
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

function isFolder(node : chrome.bookmarks.BookmarkTreeNode) {
	return node.children !== undefined;
}

function isTitledBookmark(node : chrome.bookmarks.BookmarkTreeNode) {
	return node.url && node.title && node.title !== "";
}

function stripHash(url : string) {
	const index = url.indexOf("#");
	if (index === -1) {
		return url;
	} else {
		return url.substring(0, index);
	}
}

function getHash(url : string) {
	const index = url.indexOf("#");
	if (index === -1) {
		return "";
	} else {
		return url.substring(index);
	}
}

function urlToTitleMap(bookmarks : chrome.bookmarks.BookmarkTreeNode[]) {
	const urlToTitle = new Map<string, string>()
	function addAllChildren(node : chrome.bookmarks.BookmarkTreeNode) {
		if (isFolder(node)) {
			node.children.forEach(addAllChildren);
		} else if (isTitledBookmark(node)) {
			urlToTitle.set(node.url.toLowerCase(), node.title);
		}
	}
	bookmarks.forEach(addAllChildren);
	return urlToTitle;
}

function main(
		root : Root,
		sessions : Node[],
		devices : DeviceFolder[],
		history : HistoryButton[],
		stream : AsyncIterable<HistoryButton>,
		bookmarks : chrome.bookmarks.BookmarkTreeNode[],
		i18n : (key : string) => string, settings : Settings) {

	root.setTheme(settings.theme || Chrome.getPlatform(), settings.animate);
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
		const inBackground = e.button == 1 || e.ctrlKey
		await Chrome.tabs.openOrSelect(url, inBackground)
		if (!inBackground) {
			window.close();
		}
	}
	const mainButtons = new MultiButton({
		children: [
			new Input({
				placeholder: i18n("popup_search_history"),
				lockon:      true,
				change: value => onSearch(deviceLayer, searchLayer, i18n, settings, value ?? "")
			}),
			new ActionButton({
				title: "",
				tooltip: i18n("popup_history_manager"),
				iconClass: "icon-history",
				click: anchorClick(`chrome://history/`)
			}),
			new ActionButton({
				title: "",
				tooltip: i18n("popup_options"),
				iconClass: "icon-options",
				click: anchorClick(`chrome://extensions/?options=${chrome.runtime.id}`)
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
			click:   function (e) {
				const visible       = !deviceLayer.visible;
				deviceLayer.visible = visible;
				this.on             = visible;
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

function sessionToButton(i18n : I18n, settings : Settings, session : chrome.sessions.Session, titleMap : Map<string, string>) {
	if (session.tab) {
		return new TabButton({
			...session.tab,
			title : titleMap.get(session.tab.url.toLowerCase()) ?? processTitle(settings, session.tab),
			originalTitle : session.tab.title,
			lastModified : settings.timer ? session.lastModified : undefined,
		})
	}
	return new WindowFolder(i18n, {
		...session.window,
		lastModified : settings.timer ? session.lastModified : undefined,
		open : session.window !== undefined ? settings.expand : undefined,
		fadeInEnabled : false,
	})
}

async function getSessionNodes(i18n : I18n, settings : Settings, titleMap: Map<string, string>) : Promise<Node[]> {
	return (await Chrome.sessions.getRecent({ }))
		.slice(0, settings.tabCount | 0)
		.map(session => sessionToButton(i18n, settings, session, titleMap));
}

async function getDeviceNodes(i18n : I18n, settings : Settings) {
	const devices = await Chrome.sessions.getDevices();
	return devices.map(device => {
		if (!settings.timer) {
			device.sessions.forEach(session => {
				session.lastModified = undefined;
			});
		}
		return new DeviceFolder(i18n, device)
	});
}


function head<T>(collection : Iterable<T>) : T {
	for (const el of collection) {
		return el;
	}
	throw new Error("Collection was empty");
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

function processTitle(settings : Settings, item : { url? : string, title? : string }) {
	if (settings.trimTitles) {
		const domainParts = (item.url.split("/")[2] ?? "").split(".");
		const titleParts = item.title.split(/[-\/—|]/g);
		function isRedundant(titlePart : string) {
			return titlePart
				.trim()
				.toLowerCase()
				.split(/[ .]/g)
				.every(part => domainParts.some(domainPart => domainPart.includes(part)));
		}
		if (titleParts.length == 1) {
			return item.title;
		} else {
			if (isRedundant(titleParts[0])) {
				return titleParts.slice(1).join("-");
			} else if (isRedundant(titleParts[titleParts.length - 1])) {
				return titleParts.slice(0, titleParts.length - 1).join("-");
			} else {
				return item.title;
			}
		}
	} else {
		return item.title;
	}
}

function last<T>(elements : T[]) : T | undefined {
	return elements[elements.length - 1];
}

async function* streamHistoryNodes(
		i18n : I18n,
		settings : Settings,
		titleMap : Map<string, string>,
		titleGroups : Map<string, chrome.history.HistoryItem[]>,
		seen : Set<string>,
		chunkStart : number,
		filter : (value : string) => boolean) {
	while (true) {
		// TODO: this can have 50 entries with the same timestamp which would hang the popup
		const chunk = await Chrome.history.search({
			text:       "", 
			startTime:  chunkStart - 1000 * 3600 * 24 * 30, 
			endTime:    chunkStart,
			maxResults: 50
		})
		chunkStart = last(chunk).lastVisitTime;
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
					title = titleMap.get(stripHash(item.url.toLowerCase())) ?? processTitle(settings, item);
				}
			}
			yield new HistoryButton(i18n, {
				...item,
				title,
				lastVisitTime : settings.timer ? item.lastVisitTime : undefined,
				preferSelect : settings.preferSelect,
				originalTitle : aux.title,
				aux : aux.aux
			})
		}
		if (chunk.length == 0) {
			break;
		}
	}
}

async function getHistoryNodes(i18n : I18n, settings : Settings, titleMap : Map<string, string>) : Promise<{
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
		const preFilter = await Chrome.history.search({
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
	const stream = streamHistoryNodes(i18n, settings, titleMap, titleGroups, seen, last(results).lastVisitTime, filter)
	return {
		results:
			results
			.map(item => {
				const aux = auxiliaryTitle(titleGroups, item);
				let title = titleMap.get(item.url.toLowerCase())
				if (!title) {
					if (!item.title || item.title === "" || titleGroups.get(item.title).length > 0) {
						title = titleMap.get(stripHash(item.url.toLowerCase())) ?? processTitle(settings, item);
					}
				}
				return new HistoryButton(i18n, {
					...item,
					title,
					lastVisitTime : settings.timer ? item.lastVisitTime : undefined,
					preferSelect : settings.preferSelect,
					originalTitle : aux.title,
					aux : aux.aux
				})
			}),
		stream
	 }
}

(async () => {
	const settings = await Chrome.fetch("defaults.json")
		.then(JSON.parse)
		.then(Chrome.settings.getReadOnly)
	const i18n = await Chrome.getI18n(settings.lang);
	const bookmarks = await Chrome.bookmarks.getTree();
	const titleMap = urlToTitleMap(bookmarks);
	const [root, sessions, devices, {results: history, stream : historyStream}] = await Promise.all([
		Root.ready(),
		getSessionNodes(i18n, settings, titleMap),
		getDeviceNodes(i18n, settings),
		getHistoryNodes(i18n, settings, titleMap),
	])
	Chrome.theme.updateTheme();
	main(
		root,
		sessions,
		devices,
		history,
		historyStream,
		bookmarks,
		i18n,
		settings);
})();
