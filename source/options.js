"use strict"

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
	}
	fadeIn() { /* override */
		this._interval = setInterval(function () {
			this._display.value = this._knob.value;
		}.bind(this), 30);
	}
	fadeOut() { /* override */
		clearInterval(this._interval);
		this._interval = null;
	}
	set title(value) {
		typecheck(arguments, String);
		this._title.nodeValue = value;
	}
	get title() {
		return this._title.nodeValue;
	}
	// value in percent <0, 100>
	set value(value) {
		typecheck(arguments, Number);
		this._knob.value = value;
	}
	get value() {
		return this._value;
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
				typecheck(arguments, String);
				return function (messageKey) {
					let data = locale[messageKey];
					return data ? data.message : "";
				}
			});
	// custom set to non-english, english fallback
	return Promise.all(
			chromeFetch("_locales/" + locale + "/messages.json")
				.then(JSON.parse),
			chromeFetch("_locales/en/messages.json")
				.then(JSON.parse)
	).then(function (locales) {
		let locale = locales[0];
		let enLocale = locales[1];
		return function (messageKey) {
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
	}
}

// Read-only settings server 
function getSettings() {
	return Promise.all([
		Chrome.storage.local.get(),
		Chrome.storage.sync.get()
	]).then(function (storages) {
		let local = storages[0];
		let sync = storages[1];
		if (local.local)
			return local;
		else return sync;
	});
}

/* IDEA: Reset button for each field */
/* IDEA: Use background.js as a cache for history items */

getSettings().then(function (settings) {
	Promise.all([
		Root.ready(),
		getI18n(settings.locale)
	]).then(function (arr) {
		(function (root, i18n) {
			root.setTheme("Windows", true);
			root.insert([
				new Header({title: "Options page"}),
				new Header({title: "Display"}),
				new Select({
					title: "Icon color",
					values: {
						"0": "Grey",
						"1": "White",
						"2": "Red",
						"3": "Blue",
						"4": "Green"
					}
				}),
				new Slider({
					min: 200,
					max: 400,
					step: 10,
					value: 350,
					title: "Popup width"
				}),
				new Slider({
					min: 300,
					max: 600,
					step: 10,
					value: 600,
					title: "Popup Height"
				}),
				new Slider({
					min: 0,
					max: 25,
					step: 5,
					value: 10,
					title: "Maximum number of tabs"
				}),
				new Slider({
					min: 0,
					max: 50,
					step: 5,
					value: 10,
					title: "Number of history entries"
				}),
				new Checkbox({
					title: "Show Timer",
					checked: true
				}),
				new Checkbox({
					title: "Enable animations",
					checked: true
				}),
				new Select({
					title: "Language",
					values: {
						"": "Auto (English)",
						"en": "English",
						"ja": "Japanese",
						"pl": "Polish"
					}
				}),
				new Select({
					title: "Theme",
					values: {
						"": "Auto (Windows)",
						"Windows": "Windows",
						"Ubuntu": "Ubuntu",
						"Other": "Other"
					}
				}),
				new Header({title: "Behavior"}),
								new Checkbox({
					title: "Automatically expand folders",
					checked: true
				}),
				new Checkbox({
					title: "Prefer selecting existing tabs rather than creating new ones",
					checked: true
				}),
				new Header({title: "Other"}),
				new Checkbox({
					title: "Synchronize settings",
					checked: true
				}),
				new ResetButton ({
					title: "Reset Settings"
				})
			]);
		}).apply(this, arr);
	});
});
