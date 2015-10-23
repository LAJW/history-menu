"use strict"

function getPlatform() {
	if (navigator.appVersion.indexOf("Win") != -1)
		return "Windows";
	else if (navigator.appVersion.indexOf("Linux") != -1)
		return "Ubuntu";
	else return "";
}

class Slider extends Node {
	constructor(e) {
		e = e || {};
		e.DOM = $({
			nodeName: "LABEL",
			className: "Slider",
			childNodes: [
				$({
					nodeName: "INPUT",
					type: "range",
					min: e.min || 0,
					max: e.max || 100,
					step: e.step || 1,
					value: e.value || 50
				}),
				$({
					nodeName: "INPUT",
					disabled: true,
					value: e.value || 50
				}),
				$(e.title || "")
			]
		});
		super(e);
		this._knob = this.DOM.firstChild;
		this._title = this.DOM.lastChild;
		this._display = this.DOM.childNodes[1];
		this.change = e.change || function () {}
	}
	set title(value) {
		typecheck(arguments, String);
		this._title.nodeValue = value;
	}
	get title() {
		return this._title.nodeValue;
	}
	set value(value) {
		typecheck(arguments, Number);
		this._knob.value = value;
	}
	get value() {
		return this._knob.value;
	}
	fadeIn() {
		let oldValue = this.value;
		this._interval = setInterval(function () {
			if (this.value != oldValue) {
				oldValue = this.value;
				this._display.value = this.value;
				this.change(this.value);
			}
		}.bind(this), 16);
	}
	fadeOut() {
		clearInterval(this._interval);
		this._interval = null;
	}
}

// fetch for chrome protocol
function chromeFetch(url) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300)
				resolve(xhr.response);
			else reject(xhr.statusText);
		}
		xhr.onerror = function () {
			reject(xhr.statusText);
		}
		xhr.send();
	});
}

// Function.prototype.create - "new" abstraction, for use in functional code
Object.defineProperty(Function.prototype, "create", {
	get: function () {
		let self = this;
		return function (a, b, c, d, e, f, g, h) {
			return new self(a, b, c, d, e, f, g, h)
		}
	}
})

// remove ftp|http|https://(www). from url
function trimURL(url) {
	typecheck(arguments, String);	
	url = url.substr(url.indexOf("://") + 3);
	if (url.substr(0,4) == "www.")
		url = url.substr(4);
	return url;
}

// get i18n engine in promise
function getI18n(locale) {
	typecheck(arguments, [String, undefined]);
	// default locale - use default chrome locale engine
	if (!locale)
		return Promise.resolve(chrome.i18n.getMessage.bind(chrome.i18n));
	// custom set to english - load only english
	if (locale == "en")
		return chromeFetch("_locales/en/messages.json")
			.then(JSON.parse)
			.then(function (locale) {
				return function (messageKey) {
					typecheck(arguments, String);
					let data = locale[messageKey];
					return data ? data.message : "";
				}
			});
	// custom set to non-english, english fallback
	return Promise.all([
			chromeFetch("_locales/" + locale + "/messages.json"),
			chromeFetch("_locales/en/messages.json")
	]).then(function (locales) {
		let locale = JSON.parse(locales[0]);
		let enLocale = JSON.parse(locales[1]);
		return function (messageKey) {
			typecheck(arguments, String);
			let data = locale[messageKey] || enLocale[messageKey];
			return data ? data.message : "";		
		}
	});
}

class ResetButton extends Node{
	constructor(e) {
		e = e || {};
		e.DOM = $({
			nodeName: "INPUT",
			type: "button",
			value: e.title || ""
		});
		super(e);
		this.click = e.click || function () {};
	}
}

function control(parent, propertyName) {
	return function (value) {
		parent[propertyName] = value;
	}
}

// request instance of SettingsRW
// although some settings should have ranges of possible values
function getSettingsRW(defaultSettings) {
	return Promise.all([
		Chrome.storage.local.get(),
		Chrome.storage.sync.get()
	]).then(function (storages) {
		let local = storages[0];
		let sync = storages[1];
		let map = Object.assign({}, defaultSettings) || {};
		let storage = null;
		if (local.local) {
			storage = chrome.storage.local;
			for (let i in local) {
				map[i] = local[i];
			}
		} else {
			storage = chrome.storage.sync;
			for (let i in sync) {
				map[i] = sync[i];
			}
		}
		let settings = {};
		for (let i in map) {
			if (i != "local")
				Object.defineProperty(settings, i, {
					set: function (value) {
						map[i] = value;
						let setting = {};
						setting[i] = value;
						storage.set(setting);
					},
					get: function () {
						return map[i];
					},
					enumerable: true
				})
		}
		Object.defineProperty(settings, "reset", {
			value: function () {
				storage.set(defaultSettings)
			}
		}),
		Object.defineProperty(settings, "local", {
			get: function () {
				return local.local;
			},
			set: function (value) {
				chrome.storage.local.set(sync);
				local.local = value;
				chrome.storage.local.set({local: value});
				if (value)
					storage = chrome.storage.local;
				else
					storage = chrome.storage.sync;
			},
			enumerable: true
		})
		return settings;
	})
}

/* IDEA: Reset button for each field */
/* IDEA: Use background.js as a cache for history items */
/* IDEA: Use background.js as cache for all data */

chromeFetch("defaults.json")
	.then(JSON.parse)
	.then(getSettingsRW)
	.then(function (settings) {
		return Promise.all([
			Root.ready(),
			getI18n(settings.lang),
			settings
		])
	}).then(function (arr) {
		(function (root, i18n, settings) {
			root.setTheme(settings.theme || getPlatform(), settings.animate);
			root.insert([
				new Header({title: i18n("popup_options")}),
				new Header({title: i18n("options_display")}),
				new Select({
					title: i18n("icon_color"),
					values: {
						"granite": i18n("granite"),
						"white": i18n("white"),
						"red": i18n("red"),
						"blue": i18n("blue"),
						"green": i18n("green")
					},
					selected: settings.icon,
					change: function () {
						settings.icon = this.selected;
						chrome.browserAction.setIcon({
							path: "icons/history-19-" + this.selected + ".png"
						})
					}
				}),
				new Slider({
					min: 200,
					max: 400,
					step: 10,
					value: settings.width,
					change: control(settings, "width"),
					title: i18n("options_width"),
				}),
				new Slider({
					min: 300,
					max: 600,
					step: 10,
					value: settings.height,
					change: control(settings, "height"),
					title: i18n("options_height"),
				}),
				new Slider({
					min: 0,
					max: 25,
					step: 5,
					value: settings.tabCount,
					change: control(settings, "tabCount"),
					title: i18n("options_tab_count")
				}),
				new Slider({
					min: 0,
					max: 50,
					step: 5,
					value: settings.historyCount,
					change: control(settings, i18n("options_history_count")),
					title: "Number of history entries"
				}),
				new Checkbox({
					title: i18n("options_timer"),
					checked: settings.timer,
					change: control(settings, "timer")
				}),
				new Checkbox({
					title: i18n("options_animate"),
					checked: settings.animate,
					change: control(settings, "animate")
				}),
				new Checkbox({
					title: i18n("options_tabs_first"),
					checked: settings.tabsFirst,
					change: control(settings, "tabsFirst")
				}),
				new Select({
					title: i18n("options_lang"),
					values: {
						"": "Auto (UI Default / English)",
						"en": "English",
						"ja": "Japanese",
						"pl": "Polish"
					},
					selected: settings.lang,
					change: function () {
						settings.lang = this.selected;
						
						window.location = window.location;
					}
				}),
				new Select({
					title: i18n("options_theme"),
					values: {
						"": "Auto (" + getPlatform() + ")",
						"Windows": "Windows",
						"Ubuntu": "Ubuntu",
						"Other": "Other"
					},
					selected: settings.theme,
					change: function () {
						settings.theme = this.selected;
						window.location = window.location;
					}
				}),
				new Header({title: i18n("options_behavior")}),
				new Checkbox({
					title: i18n("options_expand_folders"),
					checked: settings.expand,
					change: control(settings, "expand")
				}),
				new Checkbox({
					title: i18n("options_prefer_select"),
					checked: settings.preferSelect,
					change: control(settings, "preferSelect")
				}),
				new Header({title: i18n("options_other")}),
				new Checkbox({
					title: i18n("options_sync"),
					checked: !settings.local,
					change: function (value) {
						settings.local = !value;
						window.location = window.location;
					}
				}),
				new ResetButton ({
					title: i18n("options_reset"),
					click: function () {
						settings.reset();
						window.location = window.location;
					}
				})
			]);
		}).apply(this, arr);
	});