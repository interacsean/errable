/**
 * todo:
 *  - Update README propers
 *  - compat with left(undefined) / Optional / Errable type (aliases)
 *  - monadic aliases to come from a different file
 *  - chain – class that aliases all functions to / non-promise .thens
 *  - + fork (like cata but must returns void)
 *  - + cata / recover (takes (fn: (err: E) => R) and unwraps the val)
 *     - the function for a val would be optional - if omitted, is `id`
 *     - this may make overloads complex as 2nd arg could be function or monax
 *  - + tap/dblTap
 *  - Config option for `type Optional<T> = T | undefined` and `type Monax<SomeErrType, T> = T | Error<type>`
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
  }
}
export type Left<E> = Err<E>;

export type Val<T> = T;
export type Right<E> = Val<E>;

export type Monax<E, T> = Err<E> | Val<T>
export type Errable<E, T> = Monax<E, T>;

// todo: write docs and tests
export type Optional<T> = T | undefined;

export type Nullable<T> = T | null;

/*************************
 *** Monax constructors **
 ************************/

export function right<T>(v: T): Val<T> {
  return v;
}
export const val = right;

export function isRight<T>(m: Monax<any, T>): m is Val<T> {
  return !(m instanceof Error);
  // && !isEmpty(m) && !isUndefined(m)
}
export const isVal = isRight;

export const getRight = <T>(r: Val<T>): T => r;
export const getVal = getRight;

export function left<E>(e: E): Err<E> {
  if (e instanceof Err) return e;
  else if (e instanceof Error) return new Err(e.message);
  else if (typeof e === 'string') return new Err(e, e);
  return new Err('', e);
}
export const err = left;

export function isLeft<E>(m: Monax<E, any>): m is Err<E> {
  return !isRight(m);
}
export const isErr = isLeft;

export const getLeft = <E>(l: Err<E>): E => l.data;
export const getErr = getLeft;

// todo: write docs and tests
export function isUndefined<T>(optional: Optional<T>): optional is undefined {
  return optional === undefined;
}

export function fromFalsey<E, T>(value: T | undefined | null, ifFalsey: E): Monax<E, T> {
  return Boolean(value) && value !== undefined && value !== null
    ? right(value)
    : left(ifFalsey);
}

export function fromNull<E, T>(value: T | undefined | null, ifNully: E): Monax<E, T> {
  return value !== undefined && value !== null
    ? right(value)
    : left(ifNully);
}

export function fromPromise<T>(promise: Promise<T>): Promise<Monax<any, T>> {
  return promise.then(
    right,
    left,
  );
}

// todo: write docs and tests
// /!\ inconsistent with other fromFactory function, in that this is curried
export function fromOptional<E, T>(error: E): (opt: Optional<T>) => Monax<E, T> {
  return (optional: Optional<T>) => isUndefined(optional) ? err(error) : optional;
}

/**************************************
 *** Monax transformation functions  **
 *************************************/

function _flatMap<E, T, R>(retProm: false, fn: ((v: T) => Monax<E, R>), m: Monax<E, T>): Monax<E, R>;
function _flatMap<E, T, R>(retProm: true, fn: ((v: T) => Promise<Monax<E, R>>), m: Monax<E, T>): Promise<Monax<E, R>>;
function _flatMap<E, T, R>(
  retProm: boolean,
  fn: ((v: T) => Monax<E, R>) | ((v: T) => Promise<Monax<E, R>>),
  m: Monax<E, T>,
) {
  return isRight(m)
    ? fn(getRight(m))
    : (retProm
      ? Promise.resolve(m)
      : m);
}



/**
 * FlatMap
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function flatMap<E, T, R>(fn: ((v: T) => Monax<E, R>), m: Monax<E, T>): Monax<E, R>;
function flatMap<E, T, R>(fn: ((v: T) => Monax<E, R>)): ((m: Monax<E, T>) => Monax<E, R>);
function flatMap<E, T, R>(this: any, fn: ((v: T) => Monax<E, R>), m?: Monax<E, T>) {
  return curry(_flatMap)(false).apply(this, arguments);
}

export { flatMap }

export const ifVal = flatMap;
export const bind = flatMap;

/**
 * AsyncFlatMap
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function asyncFlatMap<E, T, R>(fn: ((v: T) => Promise<Monax<E, R>>), m: Monax<E, T>): Promise<Monax<E, R>>;
function asyncFlatMap<E, T, R>(fn: ((v: T) => Promise<Monax<E, R>>)): ((m: Monax<E, T>) => Promise<Monax<E, R>>);
function asyncFlatMap<E, T, R>(this: any, fn: ((v: T) => Promise<Monax<E, R>>), m?: Monax<E, T>) {
  return curry(_flatMap)(true).apply(this, arguments);
}

export { asyncFlatMap }

export const asyncIfVal = asyncFlatMap;
export const asyncBind = asyncFlatMap;



/**
 * Map
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */

function _map<E, T, R>(fn: (v: T) => R, m: Monax<E, T>): Monax<E, R> {
  return isRight(m) ? right(fn(getRight(m))) : m as Monax<E, R>;
}

function map<E, T, R>(fn: ((v: T) => R), m: Monax<E, T>): Monax<E, R>;
function map<E, T, R>(fn: ((v: T) => R)): ((m: Monax<E, T>) => Monax<E, R>);
function map<E, T, R>(this: any, fn: ((v: T) => R), m?: Monax<E, T>) {
  return curry(_map).apply(this, arguments);
}

export { map };

export const withVal = map;



/**
 * awaitMap
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */

function _awaitMap<E, T, R>(fn: (v: T) => Promise<R>, m: Monax<E, T>): Promise<Monax<E, R>> {
  return isRight(m)
    ? fn(getRight(m)).then(right)
    : Promise.resolve(m) as Promise<Monax<E, R>>;
}

function awaitMap<E, T, R>(fn: ((v: T) => Promise<R>), m: Monax<E, T>): Promise<Monax<E, R>>;
function awaitMap<E, T, R>(fn: ((v: T) => Promise<R>)): ((m: Monax<E, T>) => Promise<Monax<E, R>>);
function awaitMap<E, T, R>(this: any, fn: ((v: T) => Promise<R>), m?: Monax<E, T>) {
  return curry(_awaitMap).apply(this, arguments);
}

export { awaitMap };

export const withAwaitedVal = awaitMap;



function _leftFlatMap<E, T, F>(retProm: false, fn: ((e: E) => Monax<F, T>), m: Monax<E, T>): Monax<F, T>;
function _leftFlatMap<E, T, F>(retProm: true, fn: ((e: E) => Promise<Monax<F, T>>), m: Monax<E, T>): Promise<Monax<F, T>>;
function _leftFlatMap<E, T, F>(
  retProm: boolean,
  fn: ((e: E) => Monax<F, T>) | ((e: E) => Promise<Monax<F, T>>),
  m: Monax<E, T>,
) {
  return isLeft(m)
    ? fn(getLeft(m))
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
function leftFlatMap<E, T, F>(fn: ((e: E) => Monax<F, T>), m: Monax<E, T>): Monax<F, T>;
function leftFlatMap<E, T, F>(fn: ((e: E) => Monax<F, T>)): ((m: Monax<E, T>) => Monax<F, T>);
function leftFlatMap<E, T, F>(this: any, fn: ((e: E) => Monax<F, T>), m?: Monax<E, T>) {
  return curry(_leftFlatMap)(false).apply(this, arguments);
}

export { leftFlatMap }

export const ifErr = leftFlatMap;
export const leftBind = leftFlatMap;
export const errBind = leftFlatMap;
export const errFlatMap = leftFlatMap;


/**
 * AsyncLeftFlatMap
 *
 * @param fn Function to map if a Left/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function asyncLeftFlatMap<E, T, F>(fn: ((e: F) => Promise<Monax<F, T>>), m: Monax<E, T>): Promise<Monax<F, T>>;
function asyncLeftFlatMap<E, T, F>(fn: ((e: F) => Promise<Monax<F, T>>)): ((m: Monax<E, T>) => Promise<Monax<F, T>>);
function asyncLeftFlatMap<E, T, F>(this: any, fn: ((e: F) => Promise<Monax<F, T>>), m?: Monax<E, T>) {
  return curry(_leftFlatMap)(true).apply(this, arguments);
}

export { asyncLeftFlatMap }

export const asyncIfErr = asyncLeftFlatMap;
export const asyncLeftBind = asyncLeftFlatMap;
export const asyncErrBind = asyncLeftFlatMap;
export const asyncErrFlatMap = asyncLeftFlatMap;



/**
 * LeftMap
 *
 * @param fn Function to map if a Left/Err
 * @param m Monad to evaluate for execution
 * @return Monad
 */

function _leftMap<E, T, F>(fn: (v: E) => F, m: Monax<E, T>): Monax<F, T> {
  return isLeft(m) ? left(fn(getLeft(m))) : m as Monax<F, T>;
}

function leftMap<E, T, F>(fn: ((v: E) => F), m: Monax<E, T>): Monax<F, T>;
function leftMap<E, T, F>(fn: ((v: E) => F)): ((m: Monax<E, T>) => Monax<F, T>);
function leftMap<E, T, F>(this: any, fn: ((v: E) => F), m?: Monax<E, T>) {
  return curry(_leftMap).apply(this, arguments);
}

export { leftMap };

export const withErr = leftMap;
export const errMap = leftMap;

/**
 * AwaitLeftMap
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */

function _awaitLeftMap<E, T, F>(fn: (v: E) => Promise<F>, m: Monax<E, T>): Promise<Monax<F, T>> {
  return isLeft(m)
    ? fn(getLeft(m)).then(left)
    : Promise.resolve(m) as Promise<Monax<F, T>>;
}

function awaitLeftMap<E, T, F>(fn: ((v: E) => Promise<F>), m: Monax<E, T>): Promise<Monax<F, T>>;
function awaitLeftMap<E, T, F>(fn: ((v: E) => Promise<F>)): ((m: Monax<E, T>) => Promise<Monax<F, T>>);
function awaitLeftMap<E, T, F>(this: any, fn: ((v: E) => Promise<F>), m?: Monax<E, T>) {
  return curry(_awaitLeftMap).apply(this, arguments);
}

export { awaitLeftMap };

export const withAwaitedErr = awaitLeftMap;
export const awaitErrMap = awaitLeftMap;



/**
 * Fork
 * @param fn Function to evaluate if a Right/Val
 * @param fn Function to evaluate if a Left/Err
 * @param m  Monad to evaluate for execution
 * @return Monad
 */

function _fork<E, T, R>(
  vFn: (v: T) => R,
  eFn: (e: E) => R,
  m: Monax<E, T>,
): void {
  isRight(m) ? vFn(getRight(m)) : eFn(getLeft(m))
}

function fork<E, T>(
  vFn: ((v: T) => any),
  eFn: ((e: E) => any),
  m: Monax<E, T>,
): void;
function fork<E, T>(
  vFn: ((v: T) => any),
  eFn: ((e: E) => any),
): ((m: Monax<E, T>) => void);
function fork<E, T>(
  this: any,
  vFn: ((v: T) => any),
  eFn: ((e: E) => any),
  m?: Monax<E, T>,
) {
  return curry(_fork).apply(this, arguments);
}

export { fork };


/**
 * Cata
 * @param fn Function to evaluate if a Right/Val
 * @param fn Function to evaluate if a Left/Err
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */

function _cata<E, T, R>(
  vFn: (v: T) => R,
  eFn: (e: E) => R,
  m: Monax<E, T>,
): R {
  return isRight(m) ? vFn(getRight(m)) : eFn(getLeft(m))
}

function cata<E, T, R>(
  vFn: ((v: T) => R),
  eFn: ((e: E) => R),
  m: Monax<E, T>,
): R;
function cata<E, T, R>(
  vFn: ((v: T) => R),
  eFn: ((e: E) => R),
): ((m: Monax<E, T>) => R);
function cata<E, T, R>(
  this: any,
  vFn: ((v: T) => R),
  eFn: ((e: E) => R),
  m?: Monax<E, T>,
) {
  return curry(_cata).apply(this, arguments);
}

export { cata };

export const ifValElse = cata;



/**
 * Peak
 *
 * @param fn Function that will peak inside the monad
 * @param m Monad to evaluate for execution
 * @return Monad
 */

function _peak<E, T>(fn: (m: Monax<E, T>) => void, m: Monax<E, T>): Monax<E, T> {
  fn(m);
  return m;
}

function peak<E, T>(fn: ((m: Monax<E, T>) => void), m: Monax<E, T>): Monax<E, T>;
function peak<E, T>(fn: ((m: Monax<E, T>) => void)): ((m: Monax<E, T>) => Monax<E, T>);
function peak<E, T>(this: any, fn: ((m: Monax<E, T>) => void), m?: Monax<E, T>) {
  return curry(_peak).apply(this, arguments);
}

export { peak };


/**
 * PeakVal;
 *
 * @param fn Function that will peak inside the monad
 * @param m Monad to evaluate for execution
 * @return Monad
 */

function _peakVal<E, T>(fn: (v: T) => void, m: Monax<E, T>): Monax<E, T> {
  if (isRight(m)) fn(m);
  return m;
}

function peakVal<E, T>(fn: ((v: T) => void), m: Monax<E, T>): Monax<E, T>;
function peakVal<E, T>(fn: ((v: T) => void)): ((m: Monax<E, T>) => Monax<E, T>);
function peakVal<E, T>(this: any, fn: ((v: T) => void), m?: Monax<E, T>) {
  return curry(_peakVal).apply(this, arguments);
}

export { peakVal };

// todo: write docs and tests
export function recover<E, T>(fallbackVal: T, m: Monax<E, T>): T {
  return isErr(m) ? fallbackVal : m;
}
