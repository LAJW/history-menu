import {strictEqual} from "assert";
import { Result, Ok, Fail } from "../../source/Result";

const escapedSplit = (string : string) => string.split(/(?<!\\)\*/);

function stripComments(line : string) : Result<string, string> {
	const parts = line.split(" ");
	if (parts.length > 1 && !parts[1].startsWith("#")) {
		return new Fail("Comments should start with #");
	}
	return new Ok(parts[0]);
}

function glob(parts : string[], haystack : string) {
	const first = parts[0];
	const last = parts[parts.length - 1];
	if (!haystack.startsWith(first)) {
		return false;
	}
	let index = first.length;
	for (let i = 1; i < parts.length; ++i) {
		const part = parts[i];
		index = haystack.indexOf(part, index);
		if (index === -1) {
			return false;
		}
		index += part.length;
	}
	return index === haystack.length || last === "";
}

function parseGlob(line: string) : Result<(str: string) => boolean, string> {
	return stripComments(line).bind(pattern => {
		const parts = escapedSplit(pattern);
		if (parts.length === 0) {
			return new Fail("Empty pattern.");
		} else if (parts.reduce((sum, str) => sum + str.length, 0) <= 3) {
			return new Fail("Pattern is too short");
		} else {
			return new Ok(haystack => glob(parts, haystack));
		}
	});
}

describe("glob", () => {
	it("exact match", () => {
		strictEqual(escapedSplit("foobar"), ["foobar"]);
	})
	it("regular split", () => {
		strictEqual(escapedSplit("foo*bar"), ["foo", "bar", "baz"]);
	})
	it("escaped split", () => {
		strictEqual(escapedSplit("foo*bar\\*baz"), ["foo", "bar\\*baz"]);
	})
	it("glob exact match", () => {
		strictEqual(glob(["foobar"], "foobar"), true);
	})
	it("glob starts with", () => {
		strictEqual(glob(["foo", ""], "foobar"), true);
	})
	it("glob starts with FAIL", () => {
		strictEqual(glob(["foo", ""], "barfoo"), false);
	})
	it("glob ends with", () => {
		strictEqual(glob(["", "bar"], "foobar"), true);
	})
	it("glob ends with FAIL", () => {
		strictEqual(glob(["", "bar"], "barfoo"), false);
	})
})
