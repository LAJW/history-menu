import Chrome from "./Chrome"
import Checkbox from "./libraries/lajw/ui/Checkbox"
import Header from "./libraries/lajw/ui/Header"
import Node from "./libraries/lajw/ui/Node"
import Root from "./libraries/lajw/ui/Root"
import Select from "./libraries/lajw/ui/Select"
import { LocalSettings, Settings } from "./Settings"
import Slider from "./Slider"
import { $ } from "./libraries/lajw/utils"
import Textarea from "./libraries/lajw/ui/Textarea"
import { parseGlobs } from "./utils"

// template for the Classic Button
const classicButtonTemplate = $({
	nodeName: "INPUT",
	type:     "button"
});

// Classic Button looking like <input type=Button>
class ClassicButton extends Node{
	constructor(e : {
			click: (e: MouseEvent) => void
			title: string
		}) {
		super({ ...e, DOM : classicButtonTemplate.cloneNode() as HTMLElement });
		this.click = e.click || function () {};
		this.title = e.title || "";
	}
	get title() {
		return (this.DOM as HTMLInputElement).value;
	}
	set title(value : string) {
		(this.DOM as HTMLInputElement).value = value;
	}
}

// request instance of SettingsRW
// although some settings should have ranges of possible values
async function getSettingsRW(defaultSettings : Settings) {
	const storages = await Promise.all([
		Chrome.storage.local.get(),
		Chrome.storage.sync.get()
	])
	const local = storages[0] as LocalSettings
	const sync = storages[1] as Settings
	const map : Settings | LocalSettings = Object.assign({}, defaultSettings) || {}
	let storage : chrome.storage.LocalStorageArea | chrome.storage.SyncStorageArea = null
	if (local.local) {
		storage = chrome.storage.local
		for (const i in local) {
			map[i] = local[i]
		}
	} else {
		storage = chrome.storage.sync
		for (const i_1 in sync) {
			map[i_1] = sync[i_1]
		}
	}
	const settings : Settings = {}
	for (const i_2 in map) {
		if (i_2 == "local") {
			continue
		}
		Object.defineProperty(settings, i_2, {
			set(value_2) {
				map[i_2] = value_2
				storage.set({[i_2]: value_2})
			},
			get() {
				return map[i_2]
			},
			enumerable: true
		})
	}
	const reset = () => storage.set(defaultSettings)
	Object.defineProperty(settings, "local", {
		get() {
			return local.local
		},
		set(value_4) {
			chrome.storage.local.set(sync)
			local.local = value_4
			chrome.storage.local.set({ local: value_4 })
			storage = value_4 ? chrome.storage.local
				: chrome.storage.sync
		},
		enumerable: true
	})
	return { settings, reset }
}

async function main() {
	const {settings, reset} = await Chrome.fetch("defaults.json").then(JSON.parse).then(getSettingsRW)
	const [root, i18n] = await Promise.all([Root.ready(), Chrome.getI18n(settings.lang)])
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
			change() {
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
			change: x => settings.width = x,
			title:  i18n("options_width"),
		}),
		new Slider({
			min:    300,
			max:    600,
			step:   10,
			value:  settings.height,
			change: x => settings.height = x,
			title:  i18n("options_height"),
		}),
		new Slider({
			min:    0,
			max:    25,
			step:   5,
			value:  settings.tabCount,
			change: x => settings.tabCount = x,
			title:  i18n("options_tab_count")
		}),
		new Slider({
			min:    0,
			max:    50,
			step:   5,
			value:  settings.historyCount,
			change: x => settings.historyCount = x,
			title:  i18n("options_history_count")
		}),
		new Checkbox({
			title:   i18n("options_timer"),
			checked: settings.timer,
			change:  x => settings.timer = x,
		}),
		new Checkbox({
			title:   i18n("options_animate"),
			checked: settings.animate,
			change:  x => settings.animate = x,
		}),
		new Checkbox({
			title:   i18n("options_tabs_first"),
			checked: settings.tabsFirst,
			change:  x => settings.tabsFirst = x,
		}),
		new Select({
			title:    i18n("options_lang") + " (Language)",
			values:   {
				"": "Auto",
				"en": "English",
				"ja": "日本語",
				"pl": "Polski",
				"sr": "Српски",
				"ru": "Русский",
			},
			selected: settings.lang,
			change() {
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
			change() {
				settings.theme = this.selected;
				// reload page
				window.location = window.location;
			}
		}),
		new Header({title: i18n("options_behavior")}),
		new Checkbox({
			title:   i18n("options_expand_folders"),
			checked: settings.expand,
			change:  x => settings.expand = x,
		}),
		new Checkbox({
			title:   i18n("options_prefer_select"),
			checked: settings.preferSelect,
			change:  x => settings.preferSelect = x,
		}),
		new Textarea({
			title: `${i18n("options_blacklist")}`,
			description: `${i18n("example")}:
<pre>
# Don't show google translate in recent history
# (it adds a new entry on every keystroke)
https://translate.google.com/*

# Don't show google search history
https://www.google.com/search?*

# Comment by putting "#" after space or on new line
</pre>`,
			value: settings.filter,
			change: x => settings.filter = x,
			validate: x => {
				const { errors } = parseGlobs(x.split("\n"));
				if (errors.length > 0) {
					return errors.join("\n");
				} else {
					return undefined;
				}
			},
		}),
		new Header({title: i18n("options_other")}),
		new Checkbox({
			title:   i18n("options_sync"),
			checked: !settings.local,
			change(value) {
				settings.local = !value;
				// reload page
				window.location = window.location;
			}
		}),
		new ClassicButton ({
			title: i18n("options_reset"),
			click() {
				reset();
				// reload page
				window.location = window.location;
			}
		}),
		new ClassicButton ({
			title: i18n("options_about"),
			click() {
				reset();
				window.location.href = "http://layv.net/history-menu";
			}
		}),
	]);
}

main()
