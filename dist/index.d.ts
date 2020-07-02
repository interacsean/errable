export declare class Err<E> extends Error {
    data: E;
    constructor(message: string, data?: E);
}
export declare type Val<T> = T;
export declare type Errable<E, T> = Err<E> | Val<T>;
export declare type Optional<T> = T | undefined;
export declare type Nullable<T> = T | null;
export declare type Valable<E, T> = Errable<E, T> | Optional<T> | Nullable<T>;
/*************************
 *** Monax constructors **
 ************************/
export declare function val<T>(v: T): Val<T>;
export declare function isVal<T>(m: Errable<any, T> | Nullable<T> | Optional<T>): m is Val<T>;
export declare function notErr<T>(m: Errable<any, T>): m is Val<T>;
export declare function notUndefined<T>(m: Optional<T>): m is T;
export declare function notNull<T>(m: Nullable<T>): m is T;
export declare const getVal: <T>(r: T) => T;
declare function err<E>(e: E): Err<E>;
declare function err<E>(e: Err<E>): Err<E>;
export { err };
export declare function isErr<E>(m: Errable<E, any>): m is Err<E>;
export declare const getErr: <E>(l: Err<E>) => E;
export declare function isUndefined<T>(opt: Optional<T>): opt is undefined;
export declare function isNull<T>(opt: Nullable<T>): opt is null;
declare function fromFalsey<E, T>(ifFalsey: E): (value: T | undefined | null) => Errable<E, T>;
declare function fromFalsey<E, T>(ifFalsey: E, value: T | undefined | null): Errable<E, T>;
export { fromFalsey };
export declare function fromNull<E, T>(ifNully: E): (value: T | undefined | null) => Errable<E, T>;
export declare function fromNull<E, T>(ifNully: E, value: T | undefined | null): Errable<E, T>;
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
 * ifVal (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
declare function ifVal<E, T, R>(fn: ((v: T) => Errable<E, R>), m: Errable<E, T>): Errable<E, R>;
declare function ifVal<E, T, R>(fn: ((v: T) => Errable<E, R>)): ((m: Errable<E, T>) => Errable<E, R>);
declare function ifVal<E, T, R>(fn: ((v: T) => Nullable<R>), m: Nullable<T>): Nullable<R>;
declare function ifVal<E, T, R>(fn: ((v: T) => Nullable<R>)): ((m: Nullable<T>) => Nullable<R>);
declare function ifVal<E, T, R>(fn: ((v: T) => Optional<R>), m: Optional<T>): Optional<R>;
declare function ifVal<E, T, R>(fn: ((v: T) => Optional<R>)): ((m: Optional<T>) => Optional<R>);
export { ifVal };
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
/**
 * ifNotUndefined (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param o Optional to evaluate for execution
 * @return Optional
 */
declare function ifNotUndefined<T, R>(fn: ((v: T) => Optional<R>), o: Optional<T>): Optional<R>;
declare function ifNotUndefined<T, R>(fn: ((v: T) => Optional<R>)): ((o: Optional<T>) => Optional<R>);
export { ifNotUndefined };
/**
 * ifNotUndefinedAsync (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param o Optional to evaluate for execution
 * @return Optional
 */
declare function ifNotUndefinedAsync<T, R>(fn: ((v: T) => Promise<Optional<R>>), o: Optional<T>): Promise<Optional<R>>;
declare function ifNotUndefinedAsync<T, R>(fn: ((v: T) => Promise<Optional<R>>)): ((o: Optional<T>) => Promise<Optional<R>>);
export { ifNotUndefinedAsync };
/**
 * ifNotNull (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param n Nullable to evaluate for execution
 * @return Nullable
 */
declare function ifNotNull<T, R>(fn: ((v: T) => Nullable<R>), n: Nullable<T>): Nullable<R>;
declare function ifNotNull<T, R>(fn: ((v: T) => Nullable<R>)): ((n: Nullable<T>) => Nullable<R>);
export { ifNotNull };
/**
 * ifNotNullAsync (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param n Nullable to evaluate for execution
 * @return Nullable
 */
declare function ifNotNullAsync<T, R>(fn: ((v: T) => Promise<Nullable<R>>), n: Nullable<T>): Promise<Nullable<R>>;
declare function ifNotNullAsync<T, R>(fn: ((v: T) => Promise<Nullable<R>>)): ((n: Nullable<T>) => Promise<Nullable<R>>);
export { ifNotNullAsync };
declare function withNotErr<E, T, R>(fn: ((v: T) => R), m: Errable<E, T>): Errable<E, R>;
declare function withNotErr<E, T, R>(fn: ((v: T) => R)): ((m: Errable<E, T>) => Errable<E, R>);
export { withNotErr };
declare function withNotErrAsync<E, T, R>(fn: ((v: T) => Promise<R>), m: Errable<E, T>): Promise<Errable<E, R>>;
declare function withNotErrAsync<E, T, R>(fn: ((v: T) => Promise<R>)): ((m: Errable<E, T>) => Promise<Errable<E, R>>);
export { withNotErrAsync };
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
/**
 * ifUndefined (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param o Optional to evaluate for execution
 * @return Optional
 */
declare function ifUndefined<T>(fn: (() => Optional<T>), o: Optional<T>): Optional<T>;
declare function ifUndefined<T>(fn: (() => Optional<T>)): ((o: Optional<T>) => Optional<T>);
export { ifUndefined };
/**
 * ifUndefinedAsync (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param o Optional to evaluate for execution
 * @return Optional
 */
declare function ifUndefinedAsync<T>(fn: (() => Promise<Optional<T>>), o: Optional<T>): Promise<Optional<T>>;
declare function ifUndefinedAsync<T>(fn: (() => Promise<Optional<T>>)): ((o: Optional<T>) => Promise<Optional<T>>);
export { ifUndefinedAsync };
/**
 * recoverUndefined (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param o Optional to evaluate for execution
 * @return Optional
 */
declare function recoverUndefined<T>(fn: (() => T), o: Optional<T>): T;
declare function recoverUndefined<T>(fn: (() => T)): ((o: Optional<T>) => T);
export { recoverUndefined };
/**
 * recoverUndefinedAsync (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param o Optional to evaluate for execution
 * @return Optional
 */
declare function recoverUndefinedAsync<T>(fn: (() => Promise<T>), o: Optional<T>): Promise<T>;
declare function recoverUndefinedAsync<T>(fn: (() => Promise<T>)): ((o: Optional<T>) => Promise<T>);
export { recoverUndefinedAsync };
/**
 * ifNull (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param n Nullable to evaluate for execution
 * @return Nullable
 */
declare function ifNull<T>(fn: (() => Nullable<T>), n: Nullable<T>): Nullable<T>;
declare function ifNull<T>(fn: (() => Nullable<T>)): ((n: Nullable<T>) => Nullable<T>);
export { ifNull };
/**
 * ifNullAsync (flatMap)
 *
 * @param fn Function to map if a Right/Val
 * @param n Nullable to evaluate for execution
 * @return Nullable
 */
declare function ifNullAsync<T>(fn: ((v: T) => Promise<Nullable<T>>), n: Nullable<T>): Promise<Nullable<T>>;
declare function ifNullAsync<T>(fn: ((v: T) => Promise<Nullable<T>>)): ((n: Nullable<T>) => Promise<Nullable<T>>);
export { ifNullAsync };
declare function withErr<E, T, F>(fn: ((v: E) => F), m: Errable<E, T>): Errable<F, T>;
declare function withErr<E, T, F>(fn: ((v: E) => F)): ((m: Errable<E, T>) => Errable<F, T>);
export { withErr };
declare function withErrAsync<E, T, F>(fn: ((v: E) => Promise<F>), m: Errable<E, T>): Promise<Errable<F, T>>;
declare function withErrAsync<E, T, F>(fn: ((v: E) => Promise<F>)): ((m: Errable<E, T>) => Promise<Errable<F, T>>);
export { withErrAsync };
declare function fork<E, T>(vFn: ((v: T) => any), eFn: ((e: E) => any), m: Errable<E, T>): void;
declare function fork<E, T>(vFn: ((v: T) => any), eFn: ((e: E) => any)): ((m: Errable<E, T>) => void);
export { fork };
declare function ifValElse<E, T, R>(vFn: ((v: T) => R), eFn: ((e: E) => R), m: Errable<E, T>): R;
declare function ifValElse<E, T, R>(vFn: ((v: T) => R), eFn: ((e: E) => R)): ((m: Errable<E, T>) => R);
export { ifValElse };
export declare const cata: typeof ifValElse;
declare function peek<E, T>(fn: ((m: Valable<E, T>) => void), m: Valable<E, T>): Valable<E, T>;
declare function peek<E, T>(fn: ((m: Valable<E, T>) => void)): ((m: Valable<E, T>) => Valable<E, T>);
export { peek };
declare function peekVal<E, T>(fn: ((v: T) => void), m: Errable<E, T>): Errable<E, T>;
declare function peekVal<E, T>(fn: ((v: T) => void)): ((m: Errable<E, T>) => Errable<E, T>);
export { peekVal };
declare function recover<E, T>(fallbackVal: T, m: Errable<E, T>): T;
declare function recover<E, T>(fallbackVal: T): ((m: Errable<E, T>) => T);
export { recover };
//# sourceMappingURL=index.d.ts.map