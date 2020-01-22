/**
 * todo:
 *  - val() and Val() are unnecessary
 *  - prefer isVal over isNotErr, if possible.  Use overloads for Nullable | Errable etc
 *  - Update README propers
 *  - compat with err(undefined) / Optional / Errable type (aliases)
 *  - monadic aliases to come from a different file
 *  - chain – class that aliases all functions to / non-promise .thens
 *  - + fork (like cata but must returns void)
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
// todo: isNotErr... etc
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

export function err<E>(e: E): Err<E> {
  if (e instanceof Err) return e;
  else if (e instanceof Error) return new Err(e.message);
  else if (typeof e === 'string') return new Err(e, e);
  return new Err('', e);
}

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

export function fromFalsey<E, T>(value: T | undefined | null, ifFalsey: E): Errable<E, T> {
  return Boolean(value) && value !== undefined && value !== null
    ? val(value)
    : err(ifFalsey);
}

export function fromNull<E, T>(value: T | undefined | null, ifNully: E): Errable<E, T> {
  return value !== undefined && value !== null
    ? val(value)
    : err(ifNully);
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



/**
 * withNotErr (map)
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */

// todo: mv toNotErr

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
    ? fn(getErr(m)).then(err)
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

function _cata<E, T, R>(
  vFn: (v: T) => R,
  eFn: (e: E) => R,
  m: Errable<E, T>,
): R {
  return notErr(m) ? vFn(getVal(m)) : eFn(getErr(m))
}

function cata<E, T, R>(
  vFn: ((v: T) => R),
  eFn: ((e: E) => R),
  m: Errable<E, T>,
): R;
function cata<E, T, R>(
  vFn: ((v: T) => R),
  eFn: ((e: E) => R),
): ((m: Errable<E, T>) => R);
function cata<E, T, R>(
  this: any,
  vFn: ((v: T) => R),
  eFn: ((e: E) => R),
  m?: Errable<E, T>,
) {
  return curry(_cata).apply(this, arguments);
}

export { cata };

export const ifValElse = cata;



/**
 * Peek
 *
 * @param fn Function that will peek inside the monad
 * @param m Monad to evaluate for execution
 * @return Monad
 */

function _peek<E, T>(fn: (m: Errable<E, T>) => void, m: Errable<E, T>): Errable<E, T> {
  fn(m);
  return m;
}

function peek<E, T>(fn: ((m: Errable<E, T>) => void), m: Errable<E, T>): Errable<E, T>;
function peek<E, T>(fn: ((m: Errable<E, T>) => void)): ((m: Errable<E, T>) => Errable<E, T>);
function peek<E, T>(this: any, fn: ((m: Errable<E, T>) => void), m?: Errable<E, T>) {
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

// todo: write docs and tests
export function recover<E, T>(fallbackVal: T, m: Errable<E, T>): T {
  return isErr(m) ? fallbackVal : m;
}
