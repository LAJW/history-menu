import Node from "./Node"
import Parent from "./Parent"
import { $ } from "../utils"

const template = $({
	nodeName: "DIV",
	className: "MultiButton"
});

export default class MultiButton extends Parent {
	constructor({ children } : { children: Node[] }) {
		super({ children, DOM : template.cloneNode(false) as HTMLElement });
	}
}
