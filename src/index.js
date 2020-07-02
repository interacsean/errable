var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
/**
 * todo:
 *  - withUndefined, withNull -> do these make sense, seeing as you can't do anything "with" one and return anything
 *    different, that is if{...} – maybe recoverUndefined, onNull, or recover{...}
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
        return curry.apply(void 0, __spreadArrays([fn], args, more));
    };
};
var Err = /** @class */ (function (_super) {
    __extends(Err, _super);
    function Err(message, data) {
        var _this = _super.call(this, message) || this;
        _this.data = data !== undefined ? data : {};
        Object.setPrototypeOf(_this, Err.prototype);
        return _this;
    }
    return Err;
}(Error));
export { Err };
/*************************
 *** Monax constructors **
 ************************/
export function val(v) {
    return v;
}
export function isVal(m) {
    return !(m instanceof Error || m === null || m === undefined);
}
export function notErr(m) {
    return !(m instanceof Error);
}
// todo: tests
export function notUndefined(m) {
    return m !== undefined;
}
export function notNull(m) {
    return m !== null;
}
// aka `id`
export var getVal = function (r) { return r; };
function err(e) {
    if (e instanceof Err)
        return e;
    else if (e instanceof Error)
        return new Err(e.message, e);
    else if (typeof e === 'string')
        return new Err(e, e);
    // @ts-ignore
    return new Err((e && e.message) || 'Errable error', e);
}
export { err };
export function isErr(m) {
    return (m instanceof Err);
}
export var getErr = function (l) { return l.data; };
// todo: write docs
export function isUndefined(opt) {
    return opt === undefined;
}
// todo: write docs
export function isNull(opt) {
    return opt === null;
}
function fromFalsey(ifFalsey, value) {
    return curry(function _fromFalsey(ifFalsey, value) {
        return Boolean(value) && value !== undefined && value !== null
            ? val(value)
            : err(ifFalsey);
    }).apply(this, arguments);
}
export { fromFalsey };
export function fromNull(ifNully, value) {
    return curry(function _fromNull(ifNully, value) {
        return value !== undefined && value !== null
            ? val(value)
            : err(ifNully);
    }).apply(this, arguments);
}
export function fromPromise(promise) {
    return promise.then(val, err);
}
// todo: write docs and tests
// /!\ inconsistent with other fromFactory function, in that this is curried
export function fromOptional(error) {
    return function (optional) { return isUndefined(optional) ? err(error) : optional; };
}
function _ifNotErr(retProm, fn, m) {
    return notErr(m)
        ? fn(getVal(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function _ifVal(retProm, fn, m) {
    return isVal(m)
        ? fn(getVal(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function ifNotErr(fn, m) {
    return curry(_ifNotErr)(false).apply(this, arguments);
}
export { ifNotErr };
function ifVal(fn, m) {
    return curry(_ifVal)(false).apply(this, arguments);
}
export { ifVal };
function ifNotErrAsync(fn, m) {
    return curry(_ifNotErr)(true).apply(this, arguments);
}
export { ifNotErrAsync };
function _ifNotUndefined(retProm, fn, m) {
    return notUndefined(m)
        ? fn(getVal(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function ifNotUndefined(fn, o) {
    return curry(_ifNotUndefined)(false).apply(this, arguments);
}
export { ifNotUndefined };
function ifNotUndefinedAsync(fn, o) {
    return curry(_ifNotUndefined)(true).apply(this, arguments);
}
export { ifNotUndefinedAsync };
function _ifNotNull(retProm, fn, m) {
    return notNull(m)
        ? fn(getVal(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function ifNotNull(fn, n) {
    return curry(_ifNotNull)(false).apply(this, arguments);
}
export { ifNotNull };
function ifNotNullAsync(fn, n) {
    return curry(_ifNotNull)(true).apply(this, arguments);
}
export { ifNotNullAsync };
/**
 * withNotErr (map)
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function _withNotErr(fn, m) {
    return isVal(m) ? val(fn(getVal(m))) : m;
}
function withNotErr(fn, m) {
    return curry(_withNotErr).apply(this, arguments);
}
export { withNotErr };
/**
 * withNotErrAsync (mapAsync)
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */
function _withNotErrAsync(fn, m) {
    return notErr(m)
        ? fn(getVal(m)).then(val)
        : Promise.resolve(m);
}
function withNotErrAsync(fn, m) {
    return curry(_withNotErrAsync).apply(this, arguments);
}
export { withNotErrAsync };
function _ifErr(retProm, fn, m) {
    return isErr(m)
        ? fn(getErr(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function ifErr(fn, m) {
    return curry(_ifErr)(false).apply(this, arguments);
}
export { ifErr };
function ifErrAsync(fn, m) {
    return curry(_ifErr)(true).apply(this, arguments);
}
export { ifErrAsync };
function _ifUndefined(retProm, fn, m) {
    return isUndefined(m)
        ? fn()
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function ifUndefined(fn, o) {
    return curry(_ifUndefined)(false).apply(this, arguments);
}
export { ifUndefined };
function ifUndefinedAsync(fn, o) {
    return curry(_ifUndefined)(true).apply(this, arguments);
}
export { ifUndefinedAsync };
function _recoverUndefined(retProm, fn, m) {
    return isUndefined(m)
        ? fn()
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function recoverUndefined(fn, o) {
    return curry(_recoverUndefined)(false).apply(this, arguments);
}
export { recoverUndefined };
function recoverUndefinedAsync(fn, o) {
    return curry(_recoverUndefined)(true).apply(this, arguments);
}
export { recoverUndefinedAsync };
function _ifNull(retProm, fn, m) {
    return isNull(m)
        ? fn()
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function ifNull(fn, n) {
    return curry(_ifNull)(false).apply(this, arguments);
}
export { ifNull };
function ifNullAsync(fn, n) {
    return curry(_ifNull)(true).apply(this, arguments);
}
export { ifNullAsync };
//***
/**
 * withErr (leftMap)
 *
 * @param fn Function to map if a Left/Err
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function _withErr(fn, m) {
    return isErr(m) ? err(fn(getErr(m))) : m;
}
function withErr(fn, m) {
    return curry(_withErr).apply(this, arguments);
}
export { withErr };
/**
 * AwaitLeftMap
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */
function _withErrAsync(fn, m) {
    return isErr(m)
        ? fn(getErr(m)).then(function (e) { return err(e); })
        : Promise.resolve(m);
}
function withErrAsync(fn, m) {
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
function _fork(vFn, eFn, m) {
    notErr(m) ? vFn(getVal(m)) : eFn(getErr(m));
}
function fork(vFn, eFn, m) {
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
function _ifValElse(vFn, eFn, m) {
    return notErr(m) ? vFn(getVal(m)) : eFn(getErr(m));
}
function ifValElse(vFn, eFn, m) {
    return curry(_ifValElse).apply(this, arguments);
}
export { ifValElse };
export var cata = ifValElse;
/**
 * Peek
 *
 * @param fn Function that will peek inside the valable
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function _peek(fn, m) {
    fn(m);
    return m;
}
function peek(fn, m) {
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
function _peekVal(fn, m) {
    if (notErr(m))
        fn(m);
    return m;
}
function peekVal(fn, m) {
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
function _recover(fallbackVal, m) {
    return isErr(m) ? fallbackVal : m;
}
function recover(fallbackVal, m) {
    return curry(_recover).apply(this, arguments);
}
export { recover };
//# sourceMappingURL=index.js.map