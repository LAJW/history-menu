"use strict"

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

getSettings().then(function (settings) {
	Promise.all([
		Root.ready(),
		getI18n(settings.locale)
	]).then(function (arr) {
		(function (root, i18n) {
			root.setTheme("Ubuntu", true);
			root.insert([
				new Header({title: "Options page"}),
				new Header({title: "Display"}),
				new Select({
					values: {
						"0": "Grey",
						"1": "White",
						"2": "Red",
						"3": "Blue",
						"4": "Green"
					}
				}),
				new Header({title: "Behavior"})
			]);
		}).apply(this, arr);
	});
});
