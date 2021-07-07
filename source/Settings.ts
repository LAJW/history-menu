export interface Settings {
	[key: string]: string | number | boolean
	width?: number
	height?: number
	tabCount?: number
	historyCount?: number
	icon?: string
	lang?: string
	timer?: boolean
	animate?: boolean
	expand?: boolean
	preferSelect?: boolean
	tabsFirst?: boolean
	theme?: string
	filter?: string
	trimTitles?: boolean
}

export interface LocalSettings extends Settings {
	local : boolean
}

export type I18n = (key: I18nKey) => string

export type I18nKey =
	"description"
	| "popup_history_manager"
	| "popup_recently_closed_tabs"
	| "popup_recent_history"
	| "popup_search_history"
	| "popup_other_devices"
	| "popup_options"
	| "popup_back"
	| "popup_ok"
	| "popup_window"
	| "popup_number_of_tabs"
	| "results_recently"
	| "results_today"
	| "results_yesterday"
	| "results_this_week"
	| "results_last_week"
	| "results_this_month"
	| "results_last_month"
	| "results_nothing_found"
	| "results_end"
	| "options_display"
	| "options_behavior"
	| "options_other"
	| "options_height"
	| "options_width"
	| "options_tabs_first"
	| "options_sync"
	| "options_reset"
	| "icon_color"
	| "granite"
	| "white"
	| "red"
	| "green"
	| "blue"
	| "options_timer"
	| "options_tab_count"
	| "options_history_count"
	| "options_expand_folders"
	| "options_prefer_select"
	| "options_lang"
	| "options_theme"
	| "options_animate"
	| "options_about"
	| "options_blacklist"
	| "example"
	| "remove"
	| "hide_domain_from_title"
