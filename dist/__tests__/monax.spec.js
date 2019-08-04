"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Mx = __importStar(require("../index"));
function createPromise(resOrRej, val) {
    return new Promise(function (res, rej) {
        setTimeout(function () { return (resOrRej ? res : rej)(val); }, 50);
    });
}
describe('monax', function () {
    var fixture = { fix: 'ture' };
    describe('right', function () {
        it('should be recognised by isRight', function () {
            var result = Mx.right(fixture);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.isLeft(result)).toBe(false);
        });
        it('should be not recognised by isLeft', function () {
            var result = Mx.right(fixture);
            expect(Mx.isLeft(result)).toBe(false);
            expect(Mx.isRight(result)).toBe(true);
        });
        it('has aliases', function () {
            expect(Mx.val).toBe(Mx.right);
            expect(Mx.isVal).toBe(Mx.isRight);
        });
    });
    describe('getRight', function () {
        it('returns for right', function () {
            var result = Mx.right(fixture);
            expect(Mx.getRight(result)).toBe(fixture);
        });
    });
    describe('left', function () {
        it('should be recognised by isLeft', function () {
            var result = Mx.left(fixture);
            expect(Mx.isLeft(result)).toBe(true);
            expect(Mx.isRight(result)).toBe(false);
        });
        it('should be not recognised by isRight', function () {
            var result = Mx.left(fixture);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.isLeft(result)).toBe(true);
        });
        it('has aliases', function () {
            expect(Mx.err).toBe(Mx.left);
            expect(Mx.isErr).toBe(Mx.isLeft);
        });
    });
    describe('getLeft', function () {
        it('returns for left', function () {
            var result = Mx.left(fixture);
            expect(Mx.getLeft(result)).toBe(fixture);
        });
    });
    describe('fromFalsey factory', function () {
        it('should create right on truthy', function () {
            var result = Mx.fromFalsey(5, 0);
            expect(Mx.isRight(result)).toBe(true);
        });
        it('should create left on false', function () {
            var result = Mx.fromFalsey(false, 0);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should create left on null', function () {
            var result = Mx.fromFalsey(null, 0);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should create left on undefined', function () {
            var result = Mx.fromFalsey(undefined, 0);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
    });
    describe('fromNull factory', function () {
        it('should create right on truthy', function () {
            var result = Mx.fromNull(fixture, 0);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
        });
        it('should create right on false', function () {
            var result = Mx.fromNull(false, 0);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(false);
        });
        it('should create left on null', function () {
            var result = Mx.fromNull(null, 0);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should create left on undefined', function () {
            var result = Mx.fromNull(undefined, 0);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
    });
    describe('fromPromise factory', function () {
        it('should resolve to right', function (done) {
            var prom = Mx.fromPromise(Promise.resolve(fixture));
            prom.then(function (result) {
                expect(Mx.isRight(result)).toBe(true);
                expect(Mx.getVal(result)).toBe(fixture);
                done();
            });
        });
        it('should reject to left', function (done) {
            var prom = Mx.fromPromise(Promise.reject(fixture));
            prom.then(function (result) {
                expect(Mx.isRight(result)).toBe(false);
                expect(Mx.getErr(result)).toBe(fixture);
                done();
            });
        });
    });
    describe('map', function () {
        it('should map a Right', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var right = Mx.right(valFix);
            var result = Mx.map(fn, right);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getRight(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Left', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var left = Mx.left(valFix);
            var result = Mx.map(fn, left);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getLeft(result)).toBe(valFix);
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var right = Mx.right(valFix);
            var exec = Mx.map(fn);
            var result = exec(right);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getRight(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('has aliases', function () {
            expect(Mx.withVal).toBe(Mx.map);
        });
    });
    describe('awaitMap', function () {
        it('should wait for promises value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(fixture); });
            var valFix = {};
            var right = Mx.right(valFix);
            var exec = Mx.awaitMap(fn);
            var prom = exec(right);
            prom.then(function (result) {
                expect(Mx.isRight(result)).toBe(true);
                expect(Mx.getRight(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            });
        });
        it('has aliases', function () {
            // expect(Mx.map).toBe(Mx.awaitMap);
            expect(Mx.withAwaitedVal).toBe(Mx.awaitMap);
        });
    });
    describe('leftMap', function () {
        it('should leftMap a Left', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var left = Mx.left(valFix);
            var result = Mx.leftMap(fn, left);
            expect(Mx.isLeft(result)).toBe(true);
            expect(Mx.getLeft(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Right', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var right = Mx.right(valFix);
            var result = Mx.leftMap(fn, right);
            expect(Mx.isLeft(result)).toBe(false);
            expect(Mx.getLeft(result)).toBeUndefined();
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var left = Mx.left(valFix);
            var exec = Mx.leftMap(fn);
            var result = exec(left);
            expect(Mx.isLeft(result)).toBe(true);
            expect(Mx.getLeft(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('has aliases', function () {
            expect(Mx.errMap).toBe(Mx.leftMap);
            expect(Mx.withErr).toBe(Mx.leftMap);
        });
    });
    describe('awaitLeftMap', function () {
        it('should wait for promises value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(fixture); });
            var valFix = {};
            var left = Mx.left(valFix);
            var exec = Mx.awaitLeftMap(fn);
            var prom = exec(left);
            prom.then(function (result) {
                expect(Mx.isLeft(result)).toBe(true);
                expect(Mx.getLeft(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            });
        });
        it('has aliases', function () {
            expect(Mx.withAwaitedErr).toBe(Mx.awaitLeftMap);
            expect(Mx.awaitErrMap).toBe(Mx.awaitLeftMap);
        });
    });
    describe('flatMap', function () {
        it('should flatMap a Right', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.right(fixture); });
            var valFix = {};
            var right = Mx.right(valFix);
            var result = Mx.flatMap(fn, right);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getRight(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should flatMap a Right and return left', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.left(fixture); });
            var valFix = {};
            var right = Mx.right(valFix);
            var result = Mx.flatMap(fn, right);
            expect(Mx.isLeft(result)).toBe(true);
            if (Mx.isLeft(result))
                expect(Mx.getLeft(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Left', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.right({}); });
            var right = Mx.left(fixture);
            var result = Mx.flatMap(fn, right);
            expect(Mx.isRight(result)).toBe(false);
            if (Mx.isLeft(result))
                expect(Mx.getLeft(result)).toBe(fixture);
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.right(fixture); });
            var valFix = {};
            var right = Mx.right(valFix);
            var exec = Mx.flatMap(fn);
            var result = exec(right);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getRight(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should work for promise return value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.right(fixture)); });
            var valFix = {};
            var right = Mx.right(valFix);
            var exec = Mx.asyncFlatMap(fn);
            var prom = exec(right);
            prom.then(function (result) {
                expect(Mx.isRight(result)).toBe(true);
                expect(Mx.getRight(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            });
        });
        it('should work for promise return value on left', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.right(fixture)); });
            var valFix = {};
            var left = Mx.left(valFix);
            var exec = Mx.asyncFlatMap(fn);
            var prom = exec(left);
            prom.then(function (result) {
                expect(Mx.isRight(result)).toBe(false);
                expect(Mx.getLeft(result)).toBe(valFix);
                expect(fn).not.toHaveBeenCalled();
                done();
            });
        });
        it('has aliases', function () {
            expect(Mx.bind).toBe(Mx.flatMap);
            expect(Mx.ifVal).toBe(Mx.flatMap);
            expect(Mx.asyncBind).toBe(Mx.asyncFlatMap);
            expect(Mx.asyncIfVal).toBe(Mx.asyncFlatMap);
        });
    });
    describe('leftFlatMap', function () {
        it('should flatMap a Left', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.right(fixture); });
            var valFix = {};
            var left = Mx.left(valFix);
            var result = Mx.leftFlatMap(fn, left);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getRight(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should flatMap a Left and return left', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.left(fixture); });
            var valFix = {};
            var left = Mx.left(valFix);
            var result = Mx.leftFlatMap(fn, left);
            expect(Mx.isLeft(result)).toBe(true);
            if (Mx.isLeft(result))
                expect(Mx.getLeft(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Right', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.right({}); });
            var right = Mx.right(fixture);
            var result = Mx.leftFlatMap(fn, right);
            expect(Mx.isLeft(result)).toBe(false);
            if (Mx.isRight(result))
                expect(Mx.getRight(result)).toBe(fixture);
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.left(fixture); });
            var valFix = {};
            var left = Mx.left(valFix);
            var exec = Mx.leftFlatMap(fn);
            var result = exec(left);
            expect(Mx.isLeft(result)).toBe(true);
            expect(Mx.getLeft(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should work for promise return value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.left(fixture)); });
            var valFix = {};
            var left = Mx.left(valFix);
            var exec = Mx.asyncLeftFlatMap(fn);
            var prom = exec(left);
            prom.then(function (result) {
                expect(Mx.isLeft(result)).toBe(true);
                expect(Mx.getLeft(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            });
        });
        it('should work for promise return value on right', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.right(fixture)); });
            var valFix = {};
            var right = Mx.right(valFix);
            var exec = Mx.asyncLeftFlatMap(fn);
            var prom = exec(right);
            prom.then(function (result) {
                expect(Mx.isLeft(result)).toBe(false);
                expect(Mx.getRight(result)).toBe(valFix);
                expect(fn).not.toHaveBeenCalled();
                done();
            });
        });
        it('has aliases', function () {
            expect(Mx.leftBind).toBe(Mx.leftFlatMap);
            expect(Mx.ifErr).toBe(Mx.leftFlatMap);
            expect(Mx.errFlatMap).toBe(Mx.leftFlatMap);
            expect(Mx.errBind).toBe(Mx.leftFlatMap);
            expect(Mx.asyncIfErr).toBe(Mx.asyncLeftFlatMap);
            expect(Mx.asyncLeftBind).toBe(Mx.asyncLeftFlatMap);
            expect(Mx.asyncErrBind).toBe(Mx.asyncLeftFlatMap);
            expect(Mx.asyncErrFlatMap).toBe(Mx.asyncLeftFlatMap);
        });
    });
    describe('fork', function () {
        it('should fork a Right', function () {
            var vFn = jest.fn();
            var eFn = jest.fn();
            var valFix = {};
            var right = Mx.right(valFix);
            Mx.fork(vFn, eFn, right);
            expect(vFn).toHaveBeenCalledWith(valFix);
            expect(eFn).not.toHaveBeenCalled();
        });
        it('should fork a Left', function () {
            var vFn = jest.fn();
            var eFn = jest.fn();
            var valFix = {};
            var left = Mx.left(valFix);
            Mx.fork(vFn, eFn, left);
            expect(eFn).toHaveBeenCalledWith(valFix);
            expect(vFn).not.toHaveBeenCalled();
        });
    });
    describe('cata', function () {
        it('should cata a Right', function () {
            var vFn = jest.fn()
                .mockImplementation(function () { return fixture; });
            var eFn = jest.fn();
            var valFix = {};
            var right = Mx.right(valFix);
            var result = Mx.cata(vFn, eFn, right);
            expect(vFn).toHaveBeenCalledWith(valFix);
            expect(result).toBe(fixture);
            expect(eFn).not.toHaveBeenCalled();
        });
        it('should cata a Left', function () {
            var vFn = jest.fn();
            var eFn = jest.fn()
                .mockImplementation(function () { return fixture; });
            var valFix = {};
            var left = Mx.left(valFix);
            var result = Mx.cata(vFn, eFn, left);
            expect(eFn).toHaveBeenCalledWith(valFix);
            expect(result).toBe(fixture);
            expect(vFn).not.toHaveBeenCalled();
        });
        it('has aliases', function () {
            expect(Mx.ifValElse).toBe(Mx.cata);
        });
    });
});
//# sourceMappingURL=monax.spec.js.map