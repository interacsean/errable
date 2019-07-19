/**
 * todo:
 *  - Update README propers
 *  - compat with left(undefined) [option]
 *  - chain – class that aliases all functions to?
 *  - fork (like cata but must returns void)
 *  - cata / recover (takes (fn: (err: E) => R) and unwraps the val)
 *     - the function for a val would be optional - if omitted, is `id`
 *     - this may make overloads complex as 2nd arg could be function or monax
 *  - + tap/dblTap
 *  - Config option for `type Optional<T> = T | undefined` and `type Monax<SomeErrType, T> = T | Error<type>`
 */
const curry = (fn: Function, ...args: any[]) =>
  (fn.length <= args.length)
    ? fn(...args)
    : (...more: any[]) => curry(fn, ...args, ...more);

export type Err<E> = [false, E, undefined];
export type Left<E> = Err<E>;
export type Val<T> = [true, undefined, T];
export type Right<E> = Val<E>;
export type Monax<E, T> = Err<E> | Val<T>



/*************************
 *** Monax constructors **
 ************************/

export function right<T>(v: T): Val<T> {
  return [true, undefined, v];
}
export const val = right;

export function isRight<E, T>(m: Monax<E, T>): m is Val<T> {
  return m[0];
}
export const isVal = isRight;

export const getRight = <T>(r: Val<T>): T => r[2];
export const getVal = getRight;

export function left<E>(e: E): Err<E> {
  return [false, e, undefined];
}
export const err = left;

export function isLeft<E, T>(m: Monax<E, T>): m is Err<E> {
  return !isRight(m);
}
export const isErr = isLeft;

export const getLeft = <E>(l: Err<E>): E => l[1];
export const getErr = getLeft;

export function fromFalsey<E, T>(val: T | undefined | null | false, ifFalsey: E): Monax<E, T> {
  return val !== undefined && val !== null && val !== false
    ? right(val)
    : left(ifFalsey);
}

export function fromNull<E, T>(val: T | undefined | null, ifNully: E): Monax<E, T> {
  return val !== undefined && val !== null
    ? right(val)
    : left(ifNully);
}


export function fromPromise<T>(promise: Promise<T>): Promise<Monax<any, T>> {
  return promise.then(
    right,
    left,
  );
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
function leftFlatMap<E, T, F>(fn: ((e: F) => Monax<F, T>), m: Monax<E, T>): Monax<F, T>;
function leftFlatMap<E, T, F>(fn: ((e: F) => Monax<F, T>)): ((m: Monax<E, T>) => Monax<F, T>);
function leftFlatMap<E, T, F>(this: any, fn: ((e: F) => Monax<F, T>), m?: Monax<E, T>) {
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


//   Promise.prototype.cata = function<T, E, R>(
//     rejFn: (rejVal: E | any) => R,
//     resFn: (resVal: T) => R,
//   ): Pnd<never, R> {
//     return this.then(resFn, rejFn);
//   };

//   Promise.prototype.tap = function<E, T>(fn: (val: T) => void): Pnd<E, T> {
//     return this.then((val: T): T => {
//       fn(val);
//       return val;
//     });
//   };

//   Promise.prototype.doubleTap = function<E, T>(fn: (rejVal: E | any | null, resVal: T | null, isResolved?: boolean) => void): Pnd<E, T> {
//     return this.then(
//       (resVal: T): T => {
//         fn(null, resVal, true);
//         return resVal;
//       },
//       (rejVal: E): Pnd<E, never> => {
//         fn(rejVal, null, false);
//         return Promise.reject(rejVal);
//       },
//     );
//   };

//   Promise.prototype.bimap = function<T, E, F, R>(
//     rejFn: (rejVal: E | any) => F,
//     resFn: (resVal: T) => R,
//   ): Pnd<F, R> {
//     return this.then(resFn, (e: E | any): Pnd<F, never> => Promise.reject(rejFn(e)));
//   };

//   Promise.prototype.recover = function<E, T>(fn: (rejVal: E | any) => T): Promise<T> {
//     return this.catch(fn);
//   };
// }
