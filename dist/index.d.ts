export declare type Err<E> = {
    data: E;
} & Error;
export declare type Left<E> = Err<E>;
export declare type Val<T> = T;
export declare type Right<E> = Val<E>;
export declare type Monax<E, T> = Err<E> | Val<T>;
export declare type Errable<E, T> = Monax<E, T>;
export declare type Emptable<T> = T | undefined;
export declare type Optionax<T> = Emptable<T>;
/*************************
 *** Monax constructors **
 ************************/
export declare function right<T>(v: T): Val<T>;
export declare const val: typeof right;
export declare function isRight<E, T>(m: Monax<E, T>): m is Val<T>;
export declare const isVal: typeof isRight;
export declare const getRight: <T>(r: T) => T;
export declare const getVal: <T>(r: T) => T;
export declare function left<E>(e: E): Err<E>;
export declare const err: typeof left;
export declare function isLeft<E, T>(m: Monax<E, T>): m is Err<E>;
export declare const isErr: typeof isLeft;
export declare const getLeft: <E>(l: Err<E>) => E;
export declare const getErr: <E>(l: Err<E>) => E;
export declare function fromFalsey<E, T>(val: T | undefined | null | false, ifFalsey: E): Monax<E, T>;
export declare function fromNull<E, T>(val: T | undefined | null, ifNully: E): Monax<E, T>;
export declare function fromPromise<T>(promise: Promise<T>): Promise<Monax<any, T>>;
/**
 * FlatMap
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
declare function flatMap<E, T, R>(fn: ((v: T) => Monax<E, R>), m: Monax<E, T>): Monax<E, R>;
declare function flatMap<E, T, R>(fn: ((v: T) => Monax<E, R>)): ((m: Monax<E, T>) => Monax<E, R>);
export { flatMap };
export declare const ifVal: typeof flatMap;
export declare const bind: typeof flatMap;
/**
 * AsyncFlatMap
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
declare function asyncFlatMap<E, T, R>(fn: ((v: T) => Promise<Monax<E, R>>), m: Monax<E, T>): Promise<Monax<E, R>>;
declare function asyncFlatMap<E, T, R>(fn: ((v: T) => Promise<Monax<E, R>>)): ((m: Monax<E, T>) => Promise<Monax<E, R>>);
export { asyncFlatMap };
export declare const asyncIfVal: typeof asyncFlatMap;
export declare const asyncBind: typeof asyncFlatMap;
declare function map<E, T, R>(fn: ((v: T) => R), m: Monax<E, T>): Monax<E, R>;
declare function map<E, T, R>(fn: ((v: T) => R)): ((m: Monax<E, T>) => Monax<E, R>);
export { map };
export declare const withVal: typeof map;
declare function awaitMap<E, T, R>(fn: ((v: T) => Promise<R>), m: Monax<E, T>): Promise<Monax<E, R>>;
declare function awaitMap<E, T, R>(fn: ((v: T) => Promise<R>)): ((m: Monax<E, T>) => Promise<Monax<E, R>>);
export { awaitMap };
export declare const withAwaitedVal: typeof awaitMap;
/**
 * LeftFlatMap
 *
 * @param fn Function to map if a Left/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
declare function leftFlatMap<E, T, F>(fn: ((e: F) => Monax<F, T>), m: Monax<E, T>): Monax<F, T>;
declare function leftFlatMap<E, T, F>(fn: ((e: F) => Monax<F, T>)): ((m: Monax<E, T>) => Monax<F, T>);
export { leftFlatMap };
export declare const ifErr: typeof leftFlatMap;
export declare const leftBind: typeof leftFlatMap;
export declare const errBind: typeof leftFlatMap;
export declare const errFlatMap: typeof leftFlatMap;
/**
 * AsyncLeftFlatMap
 *
 * @param fn Function to map if a Left/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
declare function asyncLeftFlatMap<E, T, F>(fn: ((e: F) => Promise<Monax<F, T>>), m: Monax<E, T>): Promise<Monax<F, T>>;
declare function asyncLeftFlatMap<E, T, F>(fn: ((e: F) => Promise<Monax<F, T>>)): ((m: Monax<E, T>) => Promise<Monax<F, T>>);
export { asyncLeftFlatMap };
export declare const asyncIfErr: typeof asyncLeftFlatMap;
export declare const asyncLeftBind: typeof asyncLeftFlatMap;
export declare const asyncErrBind: typeof asyncLeftFlatMap;
export declare const asyncErrFlatMap: typeof asyncLeftFlatMap;
declare function leftMap<E, T, F>(fn: ((v: E) => F), m: Monax<E, T>): Monax<F, T>;
declare function leftMap<E, T, F>(fn: ((v: E) => F)): ((m: Monax<E, T>) => Monax<F, T>);
export { leftMap };
export declare const withErr: typeof leftMap;
export declare const errMap: typeof leftMap;
declare function awaitLeftMap<E, T, F>(fn: ((v: E) => Promise<F>), m: Monax<E, T>): Promise<Monax<F, T>>;
declare function awaitLeftMap<E, T, F>(fn: ((v: E) => Promise<F>)): ((m: Monax<E, T>) => Promise<Monax<F, T>>);
export { awaitLeftMap };
export declare const withAwaitedErr: typeof awaitLeftMap;
export declare const awaitErrMap: typeof awaitLeftMap;
declare function fork<E, T>(vFn: ((v: T) => any), eFn: ((e: E) => any), m: Monax<E, T>): void;
declare function fork<E, T>(vFn: ((v: T) => any), eFn: ((e: E) => any)): ((m: Monax<E, T>) => void);
export { fork };
declare function cata<E, T, R>(vFn: ((v: T) => R), eFn: ((e: E) => R), m: Monax<E, T>): R;
declare function cata<E, T, R>(vFn: ((v: T) => R), eFn: ((e: E) => R)): ((m: Monax<E, T>) => R);
export { cata };
export declare const ifValElse: typeof cata;
//# sourceMappingURL=index.d.ts.map