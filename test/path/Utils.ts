import {strictEqual, deepStrictEqual} from "assert";
import { Ok, Fail } from "../../source/Result";
import { escapedSplit, glob, parseGlob, parseGlobs } from "../../source/utils";

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
	it("glob anything in Google", () => {
		const glob = parseGlob("https://google.com/*").ok;
		strictEqual(glob("https://google.com/?search=test"), true);
		strictEqual(glob("https://google.com/"), true);
		strictEqual(glob("https://translate.google.com/"), false);
	})
})
