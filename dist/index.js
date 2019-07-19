"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var curry = function (fn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return (fn.length <= args.length)
        ? fn.apply(void 0, args) : function () {
        var more = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            more[_i] = arguments[_i];
        }
        return curry.apply(void 0, [fn].concat(args, more));
    };
};
/*************************
 *** Monax constructors **
 ************************/
function right(v) {
    return [true, undefined, v];
}
exports.right = right;
exports.val = right;
function isRight(m) {
    return m[0];
}
exports.isRight = isRight;
exports.isVal = isRight;
exports.getRight = function (r) { return r[2]; };
exports.getVal = exports.getRight;
function left(e) {
    return [false, e, undefined];
}
exports.left = left;
exports.err = left;
function isLeft(m) {
    return !isRight(m);
}
exports.isLeft = isLeft;
exports.isErr = isLeft;
exports.getLeft = function (l) { return l[1]; };
exports.getErr = exports.getLeft;
function fromFalsey(val, ifFalsey) {
    return val !== undefined && val !== null && val !== false
        ? right(val)
        : left(ifFalsey);
}
exports.fromFalsey = fromFalsey;
function fromNull(val, ifNully) {
    return val !== undefined && val !== null
        ? right(val)
        : left(ifNully);
}
exports.fromNull = fromNull;
function fromPromise(promise) {
    return promise.then(right, left);
}
exports.fromPromise = fromPromise;
function _flatMap(retProm, fn, m) {
    return isRight(m)
        ? fn(exports.getRight(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function flatMap(fn, m) {
    return curry(_flatMap)(false).apply(this, arguments);
}
exports.flatMap = flatMap;
exports.ifVal = flatMap;
exports.bind = flatMap;
function asyncFlatMap(fn, m) {
    return curry(_flatMap)(true).apply(this, arguments);
}
exports.asyncFlatMap = asyncFlatMap;
exports.asyncIfVal = asyncFlatMap;
exports.asyncBind = asyncFlatMap;
/**
 * Map
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function _map(fn, m) {
    return isRight(m) ? right(fn(exports.getRight(m))) : m;
}
function map(fn, m) {
    return curry(_map).apply(this, arguments);
}
exports.map = map;
exports.withVal = map;
/**
 * awaitMap
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */
function _awaitMap(fn, m) {
    return isRight(m)
        ? fn(exports.getRight(m)).then(right)
        : Promise.resolve(m);
}
function awaitMap(fn, m) {
    return curry(_awaitMap).apply(this, arguments);
}
exports.awaitMap = awaitMap;
exports.withAwaitedVal = awaitMap;
function _leftFlatMap(retProm, fn, m) {
    return isLeft(m)
        ? fn(exports.getLeft(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function leftFlatMap(fn, m) {
    return curry(_leftFlatMap)(false).apply(this, arguments);
}
exports.leftFlatMap = leftFlatMap;
exports.ifErr = leftFlatMap;
exports.leftBind = leftFlatMap;
exports.errBind = leftFlatMap;
exports.errFlatMap = leftFlatMap;
function asyncLeftFlatMap(fn, m) {
    return curry(_leftFlatMap)(true).apply(this, arguments);
}
exports.asyncLeftFlatMap = asyncLeftFlatMap;
exports.asyncIfErr = asyncLeftFlatMap;
exports.asyncLeftBind = asyncLeftFlatMap;
exports.asyncErrBind = asyncLeftFlatMap;
exports.asyncErrFlatMap = asyncLeftFlatMap;
/**
 * LeftMap
 *
 * @param fn Function to map if a Left/Err
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function _leftMap(fn, m) {
    return isLeft(m) ? left(fn(exports.getLeft(m))) : m;
}
function leftMap(fn, m) {
    return curry(_leftMap).apply(this, arguments);
}
exports.leftMap = leftMap;
exports.withErr = leftMap;
exports.errMap = leftMap;
/**
 * AwaitLeftMap
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */
function _awaitLeftMap(fn, m) {
    return isLeft(m)
        ? fn(exports.getLeft(m)).then(left)
        : Promise.resolve(m);
}
function awaitLeftMap(fn, m) {
    return curry(_awaitLeftMap).apply(this, arguments);
}
exports.awaitLeftMap = awaitLeftMap;
exports.withAwaitedErr = awaitLeftMap;
exports.awaitErrMap = awaitLeftMap;
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
//# sourceMappingURL=index.js.map