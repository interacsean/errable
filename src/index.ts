/**
 * todo:
 *  - withUndefined, withNull -> do these make sense, seeing as you can't do anything "with" one and return anything
 *    different, that is if{...} – maybe onUndefined, onNull, or recover{...}
 *  - val() and Val() are unnecessary
 *  - Update README propers
 *  - compat with err(undefined) / Optional / Errable type (aliases)
 *  - monadic aliases to come from a different file
 *  - chain – class that aliases all functions to / non-promise .thens
 *  - + cata / recover (takes (fn: (err: E) => R) and unwraps the val)
 *     - the function for a val would be optional - if omitted, is `id`
 *     - this may make overloads complex as 2nd arg could be function or monax
 *  - + tap/dblTap
 *  - Config option for `type Optional<T> = T | undefined` and `type Errable<SomeErrType, T> = T | Error<type>`
 */
const curry = (fn: Function, ...args: any[]) =>
  (fn.length <= args.length)
    ? fn(...args)
    : (...more: any[]) => curry(fn, ...args, ...more);


export class Err<E> extends Error {
  data: E;
  constructor(message: string, data?: E) {
    super(message);
    this.data = data !== undefined ? data : ({} as E);
    Object.setPrototypeOf(this, Err.prototype);
  }
}

export type Val<T> = T;
export type Errable<E, T> = Err<E> | Val<T>;

// todo: write docs and tests
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type Valable<E, T> = Errable<E, T> | Optional<T> | Nullable<T>;

/*************************
 *** Monax constructors **
 ************************/

export function val<T>(v: T): Val<T> {
  return v;
}

export function isVal<T>(m: Errable<any, T> | Nullable<T> | Optional<T>): m is Val<T> {
  return !(m instanceof Error || m === null || m === undefined);
}
export function notErr<T>(m: Errable<any, T>): m is Val<T> {
  return !(m instanceof Error);
}

// todo: tests
export function notUndefined<T>(m: Optional<T>): m is T {
  return m !== undefined;
}
export function notNull<T>(m: Nullable<T>): m is T {
  return m !== null;
}

// aka `id`
export const getVal = <T>(r: Val<T>): T => r;

function err<E>(e: E): Err<E>;
function err<E>(e: Err<E>): Err<E>;
function err<E>(e: E | Err<E>): Err<E> {
  if (e instanceof Err) return e;
  else if (e instanceof Error) return new Err(e.message, e);
  else if (typeof e === 'string') return new Err(e, e);
  // @ts-ignore
  return new Err((e && e.message) || 'Errable error', e);
}
export { err }

export function isErr<E>(m: Errable<E, any>): m is Err<E> {
  return (m instanceof Err);
}

export const getErr = <E>(l: Err<E>): E => l.data;

// todo: write docs
export function isUndefined<T>(opt: Optional<T>): opt is undefined {
  return opt === undefined;
}

// todo: write docs
export function isNull<T>(opt: Nullable<T>): opt is null {
  return opt === null;
}

function fromFalsey<E, T>(ifFalsey: E): (value: T | undefined | null) => Errable<E, T>;
function fromFalsey<E, T>(ifFalsey: E, value: T | undefined | null): Errable<E, T>;
function fromFalsey<E, T>(
  this: any,
  ifFalsey: E,
  value?: T | undefined | null
): Errable<E, T> {
  return curry(function _fromFalsey(ifFalsey: E, value: T | undefined | null): Errable<E, T> {
    return Boolean(value) && value !== undefined && value !== null
      ? val(value)
      : err(ifFalsey);
  }).apply(this, arguments);
}
export { fromFalsey };

export function fromNull<E, T>(ifNully: E): (value: T | undefined | null) => Errable<E, T>;
export function fromNull<E, T>(ifNully: E, value: T | undefined | null): Errable<E, T>;
export function fromNull<E, T>(
  this: any,
  ifNully: E,
  value?: T | undefined | null
): Errable<E, T> {
  return curry(function _fromNull(ifNully: E, value: T | undefined | null): Errable<E, T> {
    return value !== undefined && value !== null
      ? val(value)
      : err(ifNully);
  }).apply(this, arguments);
}

export function fromPromise<T>(promise: Promise<T>): Promise<Errable<any, T>> {
  return promise.then(
    val,
    err,
  );
}

// todo: write docs and tests
// /!\ inconsistent with other fromFactory function, in that this is curried
export function fromOptional<E, T>(error: E): (opt: Optional<T>) => Errable<E, T> {
  return (optional: Optional<T>) => isUndefined(optional) ? err(error) : optional;
}

/**************************************
 *** Monax transformation functions  **
 *************************************/

function _ifNotErr<E, T, R>(retProm: false, fn: ((v: T) => Errable<E, R>), m: Errable<E, T>): Errable<E, R>;
function _ifNotErr<E, T, R>(retProm: true, fn: ((v: T) => Promise<Errable<E, R>>), m: Errable<E, T>): Promise<Errable<E, R>>;
function _ifNotErr<E, T, R>(
  retProm: boolean,
  fn: ((v: T) => Errable<E, R>) | ((v: T) => Promise<Errable<E, R>>),
  m: Errable<E, T>,
) {
  return notErr(m)
    ? fn(getVal(m))
    : (retProm
      ? Promise.resolve(m)
      : m);
}

function _ifVal<E, T, R>(retProm: false, fn: ((v: T) => Errable<E, R>), m: Errable<E, T>): Errable<E, R>;
function _ifVal<E, T, R>(retProm: true, fn: ((v: T) => Promise<Errable<E, R>>), m: Errable<E, T>): Promise<Errable<E, R>>;
function _ifVal<E, T, R>(retProm: false, fn: ((v: T) => Nullable<R>), m: Nullable<T>): Nullable<R>;
function _ifVal<E, T, R>(retProm: true, fn: ((v: T) => Promise<Nullable<R>>), m: Nullable<T>): Promise<Nullable<R>>;
function _ifVal<E, T, R>(retProm: false, fn: ((v: T) => Optional<R>), m: Optional<T>): Optional<R>;
function _ifVal<E, T, R>(retProm: true, fn: ((v: T) => Promise<Optional<R>>), m: Optional<T>): Promise<Optional<R>>;
function _ifVal<E, T, R>(
  retProm: boolean,
  fn: ((v: T) => Errable<E, R>)
    | ((v: T) => Promise<Errable<E, R>>)
    | ((v: T) => Nullable<R>)
    | ((v: T) => Promise<Nullable<R>>)
    | ((v: T) => Optional<R>)
    | ((v: T) => Promise<Optional<R>>),
  m: Errable<E, T> | Nullable<T> | Optional<T>,
) {
  return isVal<T>(m)
    ? fn(getVal(m))
    : (retProm
      ? Promise.resolve(m)
      : m);
}


/**
 * ifNotErr (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function ifNotErr<E, T, R>(fn: ((v: T) => Errable<E, R>), m: Errable<E, T>): Errable<E, R>;
function ifNotErr<E, T, R>(fn: ((v: T) => Errable<E, R>)): ((m: Errable<E, T>) => Errable<E, R>);
function ifNotErr<E, T, R>(this: any, fn: ((v: T) => Errable<E, R>), m?: Errable<E, T>) {
  return curry(_ifNotErr)(false).apply(this, arguments);
}

export { ifNotErr }


/**
 * ifVal (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function ifVal<E, T, R>(fn: ((v: T) => Errable<E, R>), m: Errable<E, T>): Errable<E, R>;
function ifVal<E, T, R>(fn: ((v: T) => Errable<E, R>)): ((m: Errable<E, T>) => Errable<E, R>);
function ifVal<E, T, R>(fn: ((v: T) => Nullable<R>), m: Nullable<T>): Nullable<R>;
function ifVal<E, T, R>(fn: ((v: T) => Nullable<R>)): ((m: Nullable<T>) => Nullable<R>);
function ifVal<E, T, R>(fn: ((v: T) => Optional<R>), m: Optional<T>): Optional<R>;
function ifVal<E, T, R>(fn: ((v: T) => Optional<R>)): ((m: Optional<T>) => Optional<R>);
function ifVal<E, T, R>(
  this: any,
  fn: ((v: T) => Errable<E, R>)
    | ((v: T) => Nullable<R>)
    | ((v: T) => Optional<R>),
  m?: Errable<E, T> | Nullable<T> | Optional<T>
) {
  return curry(_ifVal)(false).apply(this, arguments);
}

export { ifVal }

/**
 * ifNotErrAsync (flatMapAsync)
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function ifNotErrAsync<E, T, R>(fn: ((v: T) => Promise<Errable<E, R>>), m: Errable<E, T>): Promise<Errable<E, R>>;
function ifNotErrAsync<E, T, R>(fn: ((v: T) => Promise<Errable<E, R>>)): ((m: Errable<E, T>) => Promise<Errable<E, R>>);
function ifNotErrAsync<E, T, R>(this: any, fn: ((v: T) => Promise<Errable<E, R>>), m?: Errable<E, T>) {
  return curry(_ifNotErr)(true).apply(this, arguments);
}

export { ifNotErrAsync }


function _ifNotUndefined<T, R>(retProm: false, fn: ((v: T) => Optional<R>), m: Optional<T>): Optional<R>;
function _ifNotUndefined<T, R>(retProm: true, fn: ((v: T) => Promise<Optional<R>>), m: Optional<T>): Promise<Optional<R>>;
function _ifNotUndefined<T, R>(
  retProm: boolean,
  fn: ((v: T) => Optional<R>) | ((v: T) => Promise<Optional<R>>),
  m: Optional<T>,
) {
  return notUndefined(m)
    ? fn(getVal(m))
    : (retProm
      ? Promise.resolve(m)
      : m);
}


/**
 * ifNotUndefined (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param o Optional to evaluate for execution
 * @return Optional
 */
function ifNotUndefined<T, R>(fn: ((v: T) => Optional<R>), o: Optional<T>): Optional<R>;
function ifNotUndefined<T, R>(fn: ((v: T) => Optional<R>)): ((o: Optional<T>) => Optional<R>);
function ifNotUndefined<T, R>(this: any, fn: ((v: T) => Optional<R>), o?: Optional<T>) {
  return curry(_ifNotUndefined)(false).apply(this, arguments);
}

export { ifNotUndefined }


/**
 * ifNotUndefinedAsync (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param o Optional to evaluate for execution
 * @return Optional
 */
function ifNotUndefinedAsync<T, R>(fn: ((v: T) => Promise<Optional<R>>), o: Optional<T>): Promise<Optional<R>>;
function ifNotUndefinedAsync<T, R>(fn: ((v: T) => Promise<Optional<R>>)): ((o: Optional<T>) => Promise<Optional<R>>);
function ifNotUndefinedAsync<T, R>(this: any, fn: ((v: T) => Promise<Optional<R>>), o?: Optional<T>) {
  return curry(_ifNotUndefined)(true).apply(this, arguments);
}

export { ifNotUndefinedAsync }


function _ifNotNull<T, R>(retProm: false, fn: ((v: T) => Nullable<R>), m: Nullable<T>): Nullable<R>;
function _ifNotNull<T, R>(retProm: true, fn: ((v: T) => Promise<Nullable<R>>), m: Nullable<T>): Promise<Nullable<R>>;
function _ifNotNull<T, R>(
  retProm: boolean,
  fn: ((v: T) => Nullable<R>) | ((v: T) => Promise<Nullable<R>>),
  m: Nullable<T>,
) {
  return notNull(m)
    ? fn(getVal(m))
    : (retProm
      ? Promise.resolve(m)
      : m);
}


/**
 * ifNotNull (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param n Nullable to evaluate for execution
 * @return Nullable
 */
function ifNotNull<T, R>(fn: ((v: T) => Nullable<R>), n: Nullable<T>): Nullable<R>;
function ifNotNull<T, R>(fn: ((v: T) => Nullable<R>)): ((n: Nullable<T>) => Nullable<R>);
function ifNotNull<T, R>(this: any, fn: ((v: T) => Nullable<R>), n?: Nullable<T>) {
  return curry(_ifNotNull)(false).apply(this, arguments);
}

export { ifNotNull }


/**
 * ifNotNullAsync (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param n Nullable to evaluate for execution
 * @return Nullable
 */
function ifNotNullAsync<T, R>(fn: ((v: T) => Promise<Nullable<R>>), n: Nullable<T>): Promise<Nullable<R>>;
function ifNotNullAsync<T, R>(fn: ((v: T) => Promise<Nullable<R>>)): ((n: Nullable<T>) => Promise<Nullable<R>>);
function ifNotNullAsync<T, R>(this: any, fn: ((v: T) => Promise<Nullable<R>>), n?: Nullable<T>) {
  return curry(_ifNotNull)(true).apply(this, arguments);
}

export { ifNotNullAsync }


/**
 * withNotErr (map)
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */

function _withNotErr<E, T, R>(fn: (v: T) => R, m: Errable<E, T>): Errable<E, R> {
  return isVal<T>(m) ? val(fn(getVal(m))) : m as Errable<E, R>;
}

function withNotErr<E, T, R>(fn: ((v: T) => R), m: Errable<E, T>): Errable<E, R>;
function withNotErr<E, T, R>(fn: ((v: T) => R)): ((m: Errable<E, T>) => Errable<E, R>);
function withNotErr<E, T, R>(this: any, fn: ((v: T) => R), m?: Errable<E, T>) {
  return curry(_withNotErr).apply(this, arguments);
}

export { withNotErr };



/**
 * withNotErrAsync (mapAsync)
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */

function _withNotErrAsync<E, T, R>(fn: (v: T) => Promise<R>, m: Errable<E, T>): Promise<Errable<E, R>> {
  return notErr<T>(m)
    ? fn(getVal(m)).then(val)
    : Promise.resolve(m) as Promise<Errable<E, R>>;
}

function withNotErrAsync<E, T, R>(fn: ((v: T) => Promise<R>), m: Errable<E, T>): Promise<Errable<E, R>>;
function withNotErrAsync<E, T, R>(fn: ((v: T) => Promise<R>)): ((m: Errable<E, T>) => Promise<Errable<E, R>>);
function withNotErrAsync<E, T, R>(this: any, fn: ((v: T) => Promise<R>), m?: Errable<E, T>) {
  return curry(_withNotErrAsync).apply(this, arguments);
}

export { withNotErrAsync };


// todo: try adding `fn: ((e: E) => T)` for reconciling the error
function _ifErr<E, T, F>(retProm: false, fn: ((e: E) => Errable<F, T>), m: Errable<E, T>): Errable<F, T>;
function _ifErr<E, T, F>(retProm: true, fn: ((e: E) => Promise<Errable<F, T>>), m: Errable<E, T>): Promise<Errable<F, T>>;
function _ifErr<E, T, F>(
  retProm: boolean,
  fn: ((e: E) => Errable<F, T>) | ((e: E) => Promise<Errable<F, T>>),
  m: Errable<E, T>,
) {
  return isErr(m)
    ? fn(getErr(m))
    : (retProm
      ? Promise.resolve(m)
      : m);
}

/**
 * LeftFlatMap
 *
 * @param fn Function to map if a Left/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function ifErr<E, T, F>(fn: ((e: E) => Errable<F, T>), m: Errable<E, T>): Errable<F, T>;
function ifErr<E, T, F>(fn: ((e: E) => Errable<F, T>)): ((m: Errable<E, T>) => Errable<F, T>);
function ifErr<E, T, F>(this: any, fn: ((e: E) => Errable<F, T>), m?: Errable<E, T>) {
  return curry(_ifErr)(false).apply(this, arguments);
}

export { ifErr }



/**
 * ifErrAsync
 *
 * @param fn Function to map if a Left/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function ifErrAsync<E, T, F>(fn: ((e: F) => Promise<Errable<F, T>>), m: Errable<E, T>): Promise<Errable<F, T>>;
function ifErrAsync<E, T, F>(fn: ((e: F) => Promise<Errable<F, T>>)): ((m: Errable<E, T>) => Promise<Errable<F, T>>);
function ifErrAsync<E, T, F>(this: any, fn: ((e: F) => Promise<Errable<F, T>>), m?: Errable<E, T>) {
  return curry(_ifErr)(true).apply(this, arguments);
}

export { ifErrAsync }


//***
function _ifUndefined<T, R>(retProm: false, fn: (() => Optional<R>), m: Optional<T>): Optional<R>;
function _ifUndefined<T, R>(retProm: true, fn: (() => Promise<Optional<R>>), m: Optional<T>): Promise<Optional<R>>;
function _ifUndefined<T, R>(
  retProm: boolean,
  fn: (() => Optional<R>) | (() => Promise<Optional<R>>),
  m: Optional<T>,
) {
  return isUndefined(m)
    ? fn()
    : (retProm
      ? Promise.resolve(m)
      : m);
}


/**
 * ifUndefined (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param o Optional to evaluate for execution
 * @return Optional
 */
function ifUndefined<T, R>(fn: (() => Optional<R>), o: Optional<T>): Optional<R>;
function ifUndefined<T, R>(fn: (() => Optional<R>)): ((o: Optional<T>) => Optional<R>);
function ifUndefined<T, R>(this: any, fn: (() => Optional<R>), o?: Optional<T>) {
  return curry(_ifUndefined)(false).apply(this, arguments);
}

export { ifUndefined }


/**
 * ifUndefinedAsync (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param o Optional to evaluate for execution
 * @return Optional
 */
function ifUndefinedAsync<T, R>(fn: (() => Promise<Optional<R>>), o: Optional<T>): Promise<Optional<R>>;
function ifUndefinedAsync<T, R>(fn: (() => Promise<Optional<R>>)): ((o: Optional<T>) => Promise<Optional<R>>);
function ifUndefinedAsync<T, R>(this: any, fn: (() => Promise<Optional<R>>), o?: Optional<T>) {
  return curry(_ifUndefined)(true).apply(this, arguments);
}

export { ifUndefinedAsync }


function _ifNull<T, R>(retProm: false, fn: (() => Nullable<R>), m: Nullable<T>): Nullable<R>;
function _ifNull<T, R>(retProm: true, fn: (() => Promise<Nullable<R>>), m: Nullable<T>): Promise<Nullable<R>>;
function _ifNull<T, R>(
  retProm: boolean,
  fn: (() => Nullable<R>) | (() => Promise<Nullable<R>>),
  m: Nullable<T>,
) {
  return isNull(m)
    ? fn()
    : (retProm
      ? Promise.resolve(m)
      : m);
}


/**
 * ifNull (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param n Nullable to evaluate for execution
 * @return Nullable
 */
function ifNull<T, R>(fn: (() => Nullable<R>), n: Nullable<T>): Nullable<R>;
function ifNull<T, R>(fn: (() => Nullable<R>)): ((n: Nullable<T>) => Nullable<R>);
function ifNull<T, R>(this: any, fn: (() => Nullable<R>), n?: Nullable<T>) {
  return curry(_ifNull)(false).apply(this, arguments);
}

export { ifNull }


/**
 * ifNullAsync (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param n Nullable to evaluate for execution
 * @return Nullable
 */
function ifNullAsync<T, R>(fn: ((v: T) => Promise<Nullable<R>>), n: Nullable<T>): Promise<Nullable<R>>;
function ifNullAsync<T, R>(fn: ((v: T) => Promise<Nullable<R>>)): ((n: Nullable<T>) => Promise<Nullable<R>>);
function ifNullAsync<T, R>(this: any, fn: ((v: T) => Promise<Nullable<R>>), n?: Nullable<T>) {
  return curry(_ifNull)(true).apply(this, arguments);
}

export { ifNullAsync }


//***


/**
 * withErr (leftMap)
 *
 * @param fn Function to map if a Left/Err
 * @param m Monad to evaluate for execution
 * @return Monad
 */

function _withErr<E, T, F>(fn: (v: E) => F, m: Errable<E, T>): Errable<F, T> {
  return isErr(m) ? err(fn(getErr(m))) : m as Errable<F, T>;
}

function withErr<E, T, F>(fn: ((v: E) => F), m: Errable<E, T>): Errable<F, T>;
function withErr<E, T, F>(fn: ((v: E) => F)): ((m: Errable<E, T>) => Errable<F, T>);
function withErr<E, T, F>(this: any, fn: ((v: E) => F), m?: Errable<E, T>) {
  return curry(_withErr).apply(this, arguments);
}

export { withErr };


/**
 * AwaitLeftMap
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */

function _withErrAsync<E, T, F>(fn: (v: E) => Promise<F>, m: Errable<E, T>): Promise<Errable<F, T>> {
  return isErr(m)
    ? fn(getErr(m)).then(e => err(e))
    : Promise.resolve(m) as Promise<Errable<F, T>>;
}

function withErrAsync<E, T, F>(fn: ((v: E) => Promise<F>), m: Errable<E, T>): Promise<Errable<F, T>>;
function withErrAsync<E, T, F>(fn: ((v: E) => Promise<F>)): ((m: Errable<E, T>) => Promise<Errable<F, T>>);
function withErrAsync<E, T, F>(this: any, fn: ((v: E) => Promise<F>), m?: Errable<E, T>) {
  return curry(_withErrAsync).apply(this, arguments);
}

export { withErrAsync };



/**
 * Fork
 * @param vFn Function to evaluate if a Right/Val
 * @param eFn Function to evaluate if a Left/Err
 * @param m  Monad to evaluate for execution
 * @return Monad
 */

function _fork<E, T, R>(
  vFn: (v: T) => R,
  eFn: (e: E) => R,
  m: Errable<E, T>,
): void {
  notErr(m) ? vFn(getVal(m)) : eFn(getErr(m))
}

function fork<E, T>(
  vFn: ((v: T) => any),
  eFn: ((e: E) => any),
  m: Errable<E, T>,
): void;
function fork<E, T>(
  vFn: ((v: T) => any),
  eFn: ((e: E) => any),
): ((m: Errable<E, T>) => void);
function fork<E, T>(
  this: any,
  vFn: ((v: T) => any),
  eFn: ((e: E) => any),
  m?: Errable<E, T>,
) {
  return curry(_fork).apply(this, arguments);
}

export { fork };


/**
 * Cata
 * @param vFn Function to evaluate if a Right/Val
 * @param eFn Function to evaluate if a Left/Err
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */

// todo: rename to standardise

function _ifValElse<E, T, R>(
  vFn: (v: T) => R,
  eFn: (e: E) => R,
  m: Errable<E, T>,
): R {
  return notErr(m) ? vFn(getVal(m)) : eFn(getErr(m))
}

function ifValElse<E, T, R>(
  vFn: ((v: T) => R),
  eFn: ((e: E) => R),
  m: Errable<E, T>,
): R;
function ifValElse<E, T, R>(
  vFn: ((v: T) => R),
  eFn: ((e: E) => R),
): ((m: Errable<E, T>) => R);
function ifValElse<E, T, R>(
  this: any,
  vFn: ((v: T) => R),
  eFn: ((e: E) => R),
  m?: Errable<E, T>,
) {
  return curry(_ifValElse).apply(this, arguments);
}

export { ifValElse };

export const cata = ifValElse;



/**
 * Peek
 *
 * @param fn Function that will peek inside the valable
 * @param m Monad to evaluate for execution
 * @return Monad
 */

function _peek<E, T>(fn: (m: Valable<E, T>) => void, m: Valable<E, T>): Valable<E, T> {
  fn(m);
  return m;
}

function peek<E, T>(fn: ((m: Valable<E, T>) => void), m: Valable<E, T>): Valable<E, T>;
function peek<E, T>(fn: ((m: Valable<E, T>) => void)): ((m: Valable<E, T>) => Valable<E, T>);
function peek<E, T>(this: any, fn: ((m: Valable<E, T>) => void), m?: Valable<E, T>) {
  return curry(_peek).apply(this, arguments);
}

export { peek };


/**
 * PeakVal;
 *
 * @param fn Function that will peek inside the monad
 * @param m Monad to evaluate for execution
 * @return Monad
 */

function _peekVal<E, T>(fn: (v: T) => void, m: Errable<E, T>): Errable<E, T> {
  if (notErr(m)) fn(m);
  return m;
}

function peekVal<E, T>(fn: ((v: T) => void), m: Errable<E, T>): Errable<E, T>;
function peekVal<E, T>(fn: ((v: T) => void)): ((m: Errable<E, T>) => Errable<E, T>);
function peekVal<E, T>(this: any, fn: ((v: T) => void), m?: Errable<E, T>) {
  return curry(_peekVal).apply(this, arguments);
}

export { peekVal };


/**
 * recover
 *
 * @param fallbackVal which will be used if not isVal
 * @param m Errable
 */
// todo: curry, write docs and tests
export function recover<E, T>(fallbackVal: T, m: Errable<E, T>): T {
  return isErr(m) ? fallbackVal : m;
}
