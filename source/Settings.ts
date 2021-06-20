export interface Settings {
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
}

export interface LocalSettings extends Settings {
	local : boolean
}
