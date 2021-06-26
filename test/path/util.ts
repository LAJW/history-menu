import {strictEqual, deepStrictEqual} from "assert";
import { Result, Ok, Fail } from "../../source/Result";

function inlineEscaped(str : string) : Result<string, string> {
	let result = ""
	for (let i = 0; i < str.length; ++i) {
		const ch = str[i];
		if (ch == "\\") {
			if (i + 1 === str.length) {
				return new Fail("Extra backslash");
			}
			result += str[i + 1];
			++i;
		} else {
			result += ch;
		}
	}
	return new Ok(result);
}

function escapedSplit (string : string) : Result<string[], string> {
	const result : string[] = []
	for (const part of string.split(/(?<!\\)\*/)) {
		const inlined = inlineEscaped(part);
		if (inlined.isOk) {
			result.push(inlined.ok);
		} else {
			return new Fail(inlined.fail);
		}
	}
	return new Ok(result);
}

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
	return stripComments(line)
	.bind(escapedSplit)
	.bind(parts => {
		if (parts.length === 0) {
			return new Fail("Empty pattern.");
		} else if (parts.reduce((sum, str) => sum + str.length, 0) <= 3) {
			return new Fail("Pattern is too short: " + parts);
		} else {
			return new Ok(haystack => glob(parts, haystack));
		}
	});
}

function* enumerate<T>(enumerator: Iterable<T>) : Iterable<[number, T]> {
	let i = 0;
	for (const element of enumerator) {
		yield [i, element];
		++i;
	}
}

function parseGlobs(lines : string[]) {
	const parsers : ((str: string) => boolean)[] = [];
	const errors : string[] = [];
	for (const [lineIndex, line] of enumerate(lines)) {
		const trimmed = line.trim();
		if (trimmed !== "") {
			parseGlob(trimmed).match(
				parser => parsers.push(parser),
				error => errors.push(`Line ${lineIndex + 1}: ${error}`));
		}
	}
	return { parsers, errors }
}

describe("glob", () => {
	it("exact match", () => {
		deepStrictEqual(escapedSplit("foobar"), new Ok(["foobar"]));
	})
	it("regular split", () => {
		deepStrictEqual(escapedSplit("foo*bar"), new Ok(["foo", "bar"]));
	})
	it("escaped split", () => {
		deepStrictEqual(escapedSplit("foo*bar\\*baz"), new Ok(["foo", "bar*baz"]));
	})
	it("trailing backslash", () => {
		deepStrictEqual(escapedSplit("foo*bar\\*baz\\"), new Fail("Trailing backslash"));
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
	it("parse all globs test", () => {
		const globs =
			`foo*bar*baz # comment
             abc\\*def\\*ghi`;
		const { parsers: [ foobarbaz, alphabet ], errors } = parseGlobs(globs.split("\n"));

		deepStrictEqual(errors, []);

		strictEqual(foobarbaz("foobarbaz"), true);
		strictEqual(foobarbaz("foo//bar//baz"), true);
		strictEqual(foobarbaz("foobarbar"), false)
		strictEqual(foobarbaz("bar//foo//baz"), false)

		strictEqual(alphabet("abc*def*ghi"), true);
		strictEqual(alphabet("abc123def456ghi"), false);
	})
	it("parse all globs error message test", () => {
		const globs =
			`foo*bar*baz // bad comment

             ht # very long comment, but pattern too short
             http://\\ # unescaped character
			 `;
		const { parsers, errors } = parseGlobs(globs.split("\n"));

		deepStrictEqual(parsers, []);
		deepStrictEqual(errors, [
			"Line 1: Comments should start with #",
			"Line 3: Pattern is too short: ht",
			"Line 4: Extra backslash"
		]);
	})
})
