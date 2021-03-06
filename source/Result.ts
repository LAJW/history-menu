export interface Result<OkState, FailState> {
	match : <T>(ok: (value: OkState) => T, fail: (error: FailState) => T) => T;
	bind : <T>(func: (value: OkState) => Result<T, FailState>) => Result<T, FailState>;
	map<T>(func: (value: OkState) => T) : Result<T, FailState>;
	mapFail<T>(func: (fail: FailState) => T) : Result<OkState, T>;
	isOk : boolean
	ok : OkState
	fail : FailState
}

export class Ok<OkState, FailState> implements Result<OkState, FailState> {
	#value : OkState
	constructor(value : OkState) {
		this.#value = value;
	}
	match<T>(ok: (value: OkState) => T, _: (fail: FailState) => T) : T {
		return ok(this.#value);
	}
	bind<T>(func: (value: OkState) => Result<T, FailState>) : Result<T, FailState> {
		return func(this.#value);
	}
	map<T>(func: (value: OkState) => T) : Result<T, FailState> {
		return new Ok<T, FailState>(func(this.#value));
	}
	mapFail<T>(_: (value: FailState) => T) : Result<OkState, T> {
		return new Ok<OkState, T>(this.#value);
	}
	toString() {
		return `Ok { ${this.#value.toString()} }`;
	}
	get ok() {
		return this.#value;
	}
	get fail() : FailState {
		throw new Error("Accessing error of successful result");
	}
	get isOk() {
		return true;
	}
}

export class Fail<OkState, FailState> implements Result<OkState, FailState> {
	#fail : FailState
	constructor(fail : FailState) {
		this.#fail = fail;
	}
	match<T>(_: (value: OkState) => T, fail: (fail: FailState) => T) : T {
		return fail(this.#fail);
	}
	bind<T>(_: (value: OkState) => Result<T, FailState>) : Result<T, FailState> {
		return new Fail<T, FailState>(this.#fail);
	}
	map<T>(func: (value: OkState) => T) : Result<T, FailState> {
		return new Fail<T, FailState>(this.#fail);
	}
	mapFail<T>(fail: (value: FailState) => T) : Result<OkState, T> {
		return new Fail<OkState, T>(fail(this.#fail));
	}
	toString() {
		return `Fail { ${this.#fail.toString()} }`;
	}
	get ok() : OkState {
		throw new Error("Accessing value of failed result");
	}
	get fail() : FailState {
		return this.#fail;
	}
	get isOk() {
		return false;
	}
}
