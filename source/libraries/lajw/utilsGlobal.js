import utils from "./utils.ts"

window.px = utils.px
window.url = utils.url
window.isURL = utils.isURL
window.trimURL = utils.trimURL
window.relativeTime = utils.relativeTime

/**
 * DOM Element generator
 * @param {Object} params - parameters describing element to be created
 * @return {Element} - created element
 */
window.$ = utils.$
