import { Fail, Ok, Result } from "./Result";

export function inlineEscaped(str : string) : Result<string, string> {
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

export function escapedSplit (string : string) : Result<string[], string> {
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

export function stripComments(line : string) : Result<string, string> {
	const parts = line.split(" ");
	if (parts.length > 1 && !parts[1].startsWith("#")) {
		return new Fail("Comments should start with #");
	}
	return new Ok(parts[0]);
}

export function glob(parts : string[], haystack : string) {
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

export function parseGlob(line: string) : Result<(str: string) => boolean, string> {
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

export function* enumerate<T>(enumerator: Iterable<T>) : Iterable<[number, T]> {
	let i = 0;
	for (const element of enumerator) {
		yield [i, element];
		++i;
	}
}

export function parseGlobs(lines : string[]) {
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
