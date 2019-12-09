export declare class Err<E> extends Error {
    data: E;
    constructor(message: string, data?: E);
}
export declare type Val<T> = T;
export declare type Errable<E, T> = Err<E> | Val<T>;
export declare type Optional<T> = T | undefined;
export declare type Nullable<T> = T | null;
export declare type Valable<E, T> = Err<E> | Val<T> | Optional<T> | Nullable<T>;
/*************************
 *** Monax constructors **
 ************************/
export declare function val<T>(v: T): Val<T>;
export declare function isVal<T>(m: Errable<any, T> | Nullable<T> | Optional<T>): m is Val<T>;
export declare function notErr<T>(m: Errable<any, T>): m is Val<T>;
export declare function notUndefined<T>(m: Optional<T>): m is T;
export declare function notNull<T>(m: Nullable<T>): m is T;
export declare const getVal: <T>(r: T) => T;
export declare function err<E>(e: E): Err<E>;
export declare function isErr<E>(m: Errable<E, any>): m is Err<E>;
export declare const getErr: <E>(l: Err<E>) => E;
export declare function isUndefined<T>(opt: Optional<T>): opt is undefined;
export declare function fromFalsey<E, T>(value: T | undefined | null, ifFalsey: E): Errable<E, T>;
export declare function fromNull<E, T>(value: T | undefined | null, ifNully: E): Errable<E, T>;
export declare function fromPromise<T>(promise: Promise<T>): Promise<Errable<any, T>>;
export declare function fromOptional<E, T>(error: E): (opt: Optional<T>) => Errable<E, T>;
/**
 * ifNotErr (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
declare function ifNotErr<E, T, R>(fn: ((v: T) => Errable<E, R>), m: Errable<E, T>): Errable<E, R>;
declare function ifNotErr<E, T, R>(fn: ((v: T) => Errable<E, R>)): ((m: Errable<E, T>) => Errable<E, R>);
export { ifNotErr };
/**
 * ifNotErrAsync (flatMapAsync)
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
declare function ifNotErrAsync<E, T, R>(fn: ((v: T) => Promise<Errable<E, R>>), m: Errable<E, T>): Promise<Errable<E, R>>;
declare function ifNotErrAsync<E, T, R>(fn: ((v: T) => Promise<Errable<E, R>>)): ((m: Errable<E, T>) => Promise<Errable<E, R>>);
export { ifNotErrAsync };
declare function withNotErr<E, T, R>(fn: ((v: T) => R), m: Errable<E, T>): Errable<E, R>;
declare function withNotErr<E, T, R>(fn: ((v: T) => R)): ((m: Errable<E, T>) => Errable<E, R>);
export { withNotErr };
declare function withNotErrAsync<E, T, R>(fn: ((v: T) => Promise<R>), m: Errable<E, T>): Promise<Errable<E, R>>;
declare function withNotErrAsync<E, T, R>(fn: ((v: T) => Promise<R>)): ((m: Errable<E, T>) => Promise<Errable<E, R>>);
export { withNotErrAsync };
export declare const withAwaitedVal: typeof withNotErrAsync;
/**
 * LeftFlatMap
 *
 * @param fn Function to map if a Left/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
declare function ifErr<E, T, F>(fn: ((e: E) => Errable<F, T>), m: Errable<E, T>): Errable<F, T>;
declare function ifErr<E, T, F>(fn: ((e: E) => Errable<F, T>)): ((m: Errable<E, T>) => Errable<F, T>);
export { ifErr };
/**
 * ifErrAsync
 *
 * @param fn Function to map if a Left/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
declare function ifErrAsync<E, T, F>(fn: ((e: F) => Promise<Errable<F, T>>), m: Errable<E, T>): Promise<Errable<F, T>>;
declare function ifErrAsync<E, T, F>(fn: ((e: F) => Promise<Errable<F, T>>)): ((m: Errable<E, T>) => Promise<Errable<F, T>>);
export { ifErrAsync };
declare function withErr<E, T, F>(fn: ((v: E) => F), m: Errable<E, T>): Errable<F, T>;
declare function withErr<E, T, F>(fn: ((v: E) => F)): ((m: Errable<E, T>) => Errable<F, T>);
export { withErr };
declare function withErrAsync<E, T, F>(fn: ((v: E) => Promise<F>), m: Errable<E, T>): Promise<Errable<F, T>>;
declare function withErrAsync<E, T, F>(fn: ((v: E) => Promise<F>)): ((m: Errable<E, T>) => Promise<Errable<F, T>>);
export { withErrAsync };
declare function fork<E, T>(vFn: ((v: T) => any), eFn: ((e: E) => any), m: Errable<E, T>): void;
declare function fork<E, T>(vFn: ((v: T) => any), eFn: ((e: E) => any)): ((m: Errable<E, T>) => void);
export { fork };
declare function cata<E, T, R>(vFn: ((v: T) => R), eFn: ((e: E) => R), m: Errable<E, T>): R;
declare function cata<E, T, R>(vFn: ((v: T) => R), eFn: ((e: E) => R)): ((m: Errable<E, T>) => R);
export { cata };
export declare const ifValElse: typeof cata;
declare function peek<E, T>(fn: ((m: Errable<E, T>) => void), m: Errable<E, T>): Errable<E, T>;
declare function peek<E, T>(fn: ((m: Errable<E, T>) => void)): ((m: Errable<E, T>) => Errable<E, T>);
export { peek };
declare function peekVal<E, T>(fn: ((v: T) => void), m: Errable<E, T>): Errable<E, T>;
declare function peekVal<E, T>(fn: ((v: T) => void)): ((m: Errable<E, T>) => Errable<E, T>);
export { peekVal };
export declare function recover<E, T>(fallbackVal: T, m: Errable<E, T>): T;
//# sourceMappingURL=index.d.ts.map