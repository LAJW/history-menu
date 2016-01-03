"use strict";

// using _Node, for compatibility with Google Closure Compiler
define(["./Chrome", "./libraries/lajw/ui/Checkbox",
		"./libraries/lajw/ui/Header", "./libraries/lajw/ui/Node",
		"./libraries/lajw/ui/Root", "./libraries/lajw/ui/Select",
		"./Slider.js"],
function (Chrome, Checkbox, Header, _Node, Root, Select, Slider) {

// template for the Classic Button
const classicButtonTemplate = $({
	nodeName: "INPUT",
	type:     "button"
});

// Classic Button looking like <input type=Button>
class ClassicButton extends _Node{
	constructor(e) {
		typecheck(arguments, {
			click: [Function, undefined],
			title: [String,   undefined]
		}, undefined);
		e          = e || {};
		e.DOM      = classicButtonTemplate.cloneNode();
		super(e);
		this.click = e.click || function () {};
		this.title = e.title || "";
	}
	get title() {
		return this.DOM.value;
	}
	set title(value) {
		typecheck(arguments, String);
		this.DOM.value = value;
	}
}

// bind method to its parent
function bind(parent, propertyName) {
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
		const local = storages[0];
		const sync  = storages[1];
		const map   = Object.assign({}, defaultSettings) || {};
		let storage = null;
		if (local.local) {
			storage = chrome.storage.local;
			for (const i in local) {
				map[i] = local[i];
			}
		} else {
			storage = chrome.storage.sync;
			for (const i in sync) {
				map[i] = sync[i];
			}
		}
		const settings = {};
		for (const i in map) {
			if (i == "local") {
				continue;
			}
			Object.defineProperty(settings, i, {
				set:        function (value) {
					map[i]        = value;
					const setting = {};
					setting[i]    = value;
					storage.set(setting);
				},
				get:        function () {
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
			get:        function () {
				return local.local;
			},
			set:        function (value) {
				chrome.storage.local.set(sync);
				local.local = value;
				chrome.storage.local.set({local: value});
				storage = value
					? chrome.storage.local
					: chrome.storage.sync;
			},
			enumerable: true
		})
		return settings;
	})
}

Chrome.fetch("defaults.json")
	.then(JSON.parse)
	.then(getSettingsRW)
	.then(function (settings) {
		return Promise.all([
			Root.ready(),
			Chrome.getI18n(settings.lang),
			settings
		])
	}).then(function (arr) {
		(function (root, i18n, settings) {
			root.setTheme(settings.theme || Chrome.getPlatform(), settings.animate);
			root.insert([
				new Header({title: i18n("popup_options")}),
				new Header({title: i18n("options_display")}),
				new Select({
					title:    i18n("icon_color"),
					values:   {
						"granite": i18n("granite"),
						"white":   i18n("white"),
						"red":     i18n("red"),
						"blue":    i18n("blue"),
						"green":   i18n("green")
					},
					selected: settings.icon,
					change:   function () {
						settings.icon = this.selected;
						chrome.browserAction.setIcon({
							path: "icons/history-19-" + this.selected + ".png"
						})
					}
				}),
				new Slider({
					min:    200,
					max:    400,
					step:   10,
					value:  settings.width,
					change: bind(settings, "width"),
					title:  i18n("options_width"),
				}),
				new Slider({
					min:    300,
					max:    600,
					step:   10,
					value:  settings.height,
					change: bind(settings, "height"),
					title:  i18n("options_height"),
				}),
				new Slider({
					min:    0,
					max:    25,
					step:   5,
					value:  settings.tabCount,
					change: bind(settings, "tabCount"),
					title:  i18n("options_tab_count")
				}),
				new Slider({
					min:    0,
					max:    50,
					step:   5,
					value:  settings.historyCount,
					change: bind(settings, "historyCount"),
					title:  i18n("options_history_count")
				}),
				new Checkbox({
					title:   i18n("options_timer"),
					checked: settings.timer,
					change:  bind(settings, "timer")
				}),
				new Checkbox({
					title:   i18n("options_animate"),
					checked: settings.animate,
					change:  bind(settings, "animate")
				}),
				new Checkbox({
					title:   i18n("options_tabs_first"),
					checked: settings.tabsFirst,
					change:  bind(settings, "tabsFirst")
				}),
				new Select({
					title:    i18n("options_lang") + " (Language)",
					values:   {
						"": "Auto",
						"en": "English",
						"ja": "Japanese",
						"pl": "Polski",
						"sr": "Српски"
					},
					selected: settings.lang,
					change:   function () {
						settings.lang = this.selected;
						// reload page
						window.location = window.location;
					}
				}),
				new Select({
					title:    i18n("options_theme"),
					values:   {
						"":        "Auto (" + Chrome.getPlatform() + ")",
						"Windows": "Windows",
						"Ubuntu":  "Ubuntu",
						"Other":   "Other"
					},
					selected: settings.theme,
					change:   function () {
						settings.theme = this.selected;
						// reload page
						window.location = window.location;
					}
				}),
				new Header({title: i18n("options_behavior")}),
				new Checkbox({
					title:   i18n("options_expand_folders"),
					checked: settings.expand,
					change:  bind(settings, "expand")
				}),
				new Checkbox({
					title:   i18n("options_prefer_select"),
					checked: settings.preferSelect,
					change:  bind(settings, "preferSelect")
				}),
				new Header({title: i18n("options_other")}),
				new Checkbox({
					title:   i18n("options_sync"),
					checked: !settings.local,
					change:  function (value) {
						settings.local = !value;
						// reload page
						window.location = window.location;
					}
				}),
				new ClassicButton ({
					title: i18n("options_reset"),
					click: function () {
						settings.reset();
						// reload page
						window.location = window.location;
					}
				}),
				new ClassicButton ({
					title: i18n("options_about"),
					click: function () {
						settings.reset();
						window.location = "http://layv.net/history-menu";
					}
				}),
			]);
		}).apply(this, arr);
	});
});
