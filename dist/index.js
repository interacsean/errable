"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.Err = Err;
/*************************
 *** Monax constructors **
 ************************/
function val(v) {
    return v;
}
exports.val = val;
function isVal(m) {
    return !(m instanceof Error || m === null || m === undefined);
}
exports.isVal = isVal;
function notErr(m) {
    return !(m instanceof Error);
}
exports.notErr = notErr;
// todo: tests
function notUndefined(m) {
    return m !== undefined;
}
exports.notUndefined = notUndefined;
function notNull(m) {
    return m !== null;
}
exports.notNull = notNull;
// aka `id`
exports.getVal = function (r) { return r; };
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
exports.err = err;
function isErr(m) {
    return (m instanceof Err);
}
exports.isErr = isErr;
exports.getErr = function (l) { return l.data; };
// todo: write docs
function isUndefined(opt) {
    return opt === undefined;
}
exports.isUndefined = isUndefined;
// todo: write docs
function isNull(opt) {
    return opt === null;
}
exports.isNull = isNull;
function fromFalsey(ifFalsey, value) {
    return curry(function _fromFalsey(ifFalsey, value) {
        return Boolean(value) && value !== undefined && value !== null
            ? val(value)
            : err(ifFalsey);
    }).apply(this, arguments);
}
exports.fromFalsey = fromFalsey;
function fromNull(ifNully, value) {
    return curry(function _fromNull(ifNully, value) {
        return value !== undefined && value !== null
            ? val(value)
            : err(ifNully);
    }).apply(this, arguments);
}
exports.fromNull = fromNull;
function fromPromise(promise) {
    return promise.then(val, err);
}
exports.fromPromise = fromPromise;
// todo: write docs and tests
// /!\ inconsistent with other fromFactory function, in that this is curried
function fromOptional(error) {
    return function (optional) { return isUndefined(optional) ? err(error) : optional; };
}
exports.fromOptional = fromOptional;
function _ifNotErr(retProm, fn, m) {
    return notErr(m)
        ? fn(exports.getVal(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function _ifVal(retProm, fn, m) {
    return isVal(m)
        ? fn(exports.getVal(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function ifNotErr(fn, m) {
    return curry(_ifNotErr)(false).apply(this, arguments);
}
exports.ifNotErr = ifNotErr;
function ifVal(fn, m) {
    return curry(_ifVal)(false).apply(this, arguments);
}
exports.ifVal = ifVal;
function ifNotErrAsync(fn, m) {
    return curry(_ifNotErr)(true).apply(this, arguments);
}
exports.ifNotErrAsync = ifNotErrAsync;
function _ifNotUndefined(retProm, fn, m) {
    return notUndefined(m)
        ? fn(exports.getVal(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function ifNotUndefined(fn, o) {
    return curry(_ifNotUndefined)(false).apply(this, arguments);
}
exports.ifNotUndefined = ifNotUndefined;
function ifNotUndefinedAsync(fn, o) {
    return curry(_ifNotUndefined)(true).apply(this, arguments);
}
exports.ifNotUndefinedAsync = ifNotUndefinedAsync;
function _ifNotNull(retProm, fn, m) {
    return notNull(m)
        ? fn(exports.getVal(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function ifNotNull(fn, n) {
    return curry(_ifNotNull)(false).apply(this, arguments);
}
exports.ifNotNull = ifNotNull;
function ifNotNullAsync(fn, n) {
    return curry(_ifNotNull)(true).apply(this, arguments);
}
exports.ifNotNullAsync = ifNotNullAsync;
/**
 * withNotErr (map)
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function _withNotErr(fn, m) {
    return isVal(m) ? val(fn(exports.getVal(m))) : m;
}
function withNotErr(fn, m) {
    return curry(_withNotErr).apply(this, arguments);
}
exports.withNotErr = withNotErr;
/**
 * withNotErrAsync (mapAsync)
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */
function _withNotErrAsync(fn, m) {
    return notErr(m)
        ? fn(exports.getVal(m)).then(val)
        : Promise.resolve(m);
}
function withNotErrAsync(fn, m) {
    return curry(_withNotErrAsync).apply(this, arguments);
}
exports.withNotErrAsync = withNotErrAsync;
function _ifErr(retProm, fn, m) {
    return isErr(m)
        ? fn(exports.getErr(m))
        : (retProm
            ? Promise.resolve(m)
            : m);
}
function ifErr(fn, m) {
    return curry(_ifErr)(false).apply(this, arguments);
}
exports.ifErr = ifErr;
function ifErrAsync(fn, m) {
    return curry(_ifErr)(true).apply(this, arguments);
}
exports.ifErrAsync = ifErrAsync;
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
exports.ifUndefined = ifUndefined;
function ifUndefinedAsync(fn, o) {
    return curry(_ifUndefined)(true).apply(this, arguments);
}
exports.ifUndefinedAsync = ifUndefinedAsync;
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
exports.ifNull = ifNull;
function ifNullAsync(fn, n) {
    return curry(_ifNull)(true).apply(this, arguments);
}
exports.ifNullAsync = ifNullAsync;
//***
/**
 * withErr (leftMap)
 *
 * @param fn Function to map if a Left/Err
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function _withErr(fn, m) {
    return isErr(m) ? err(fn(exports.getErr(m))) : m;
}
function withErr(fn, m) {
    return curry(_withErr).apply(this, arguments);
}
exports.withErr = withErr;
/**
 * AwaitLeftMap
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */
function _withErrAsync(fn, m) {
    return isErr(m)
        ? fn(exports.getErr(m)).then(function (e) { return err(e); })
        : Promise.resolve(m);
}
function withErrAsync(fn, m) {
    return curry(_withErrAsync).apply(this, arguments);
}
exports.withErrAsync = withErrAsync;
/**
 * Fork
 * @param vFn Function to evaluate if a Right/Val
 * @param eFn Function to evaluate if a Left/Err
 * @param m  Monad to evaluate for execution
 * @return Monad
 */
function _fork(vFn, eFn, m) {
    notErr(m) ? vFn(exports.getVal(m)) : eFn(exports.getErr(m));
}
function fork(vFn, eFn, m) {
    return curry(_fork).apply(this, arguments);
}
exports.fork = fork;
/**
 * Cata
 * @param vFn Function to evaluate if a Right/Val
 * @param eFn Function to evaluate if a Left/Err
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */
// todo: rename to standardise
function _ifValElse(vFn, eFn, m) {
    return notErr(m) ? vFn(exports.getVal(m)) : eFn(exports.getErr(m));
}
function ifValElse(vFn, eFn, m) {
    return curry(_ifValElse).apply(this, arguments);
}
exports.ifValElse = ifValElse;
exports.cata = ifValElse;
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
exports.peek = peek;
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
exports.peekVal = peekVal;
/**
 * recover
 *
 * @param fallbackVal which will be used if not isVal
 * @param m Errable
 */
// todo: curry, write docs and tests
function recover(fallbackVal, m) {
    return isErr(m) ? fallbackVal : m;
}
exports.recover = recover;
//# sourceMappingURL=index.js.map