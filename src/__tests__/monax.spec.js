import * as Mx from '../index';
import * as Md from '../monad-aliases';
function createPromise(resOrRej, val) {
    return new Promise(function (res, rej) {
        setTimeout(function () { return (resOrRej ? res : rej)(val); }, 50);
    });
}
describe('errable', function () {
    var fixture = { fix: 'ture' };
    describe('a value', function () {
        var result = Mx.val(fixture);
        it('should be recognised by isVal', function () {
            expect(Mx.isVal(result)).toBe(true);
        });
        it('should be recognised by isNotErr', function () {
            expect(Mx.notErr(result)).toBe(true);
        });
        it('should be not recognised by isErr', function () {
            expect(Mx.isErr(result)).toBe(false);
        });
        it('has aliases', function () {
            expect(Md.right).toBe(Mx.val);
            expect(Md.isRight).toBe(Mx.notErr);
        });
    });
    describe('undefined', function () {
        var result = undefined;
        it('should be rejected by isVal', function () {
            expect(Mx.isVal(result)).toBe(false);
        });
        it('should be recognised by isNotErr', function () {
            expect(Mx.notErr(result)).toBe(true);
        });
        it('should be not recognised by isNull', function () {
            expect(Mx.isNull(result)).toBe(false);
        });
        it('should be recognised by isUndefined', function () {
            expect(Mx.isUndefined(result)).toBe(true);
        });
    });
    describe('null', function () {
        var result = null;
        it('should be rejected by isVal', function () {
            expect(Mx.isVal(result)).toBe(false);
        });
        it('should be recognised by isNotErr', function () {
            expect(Mx.notErr(result)).toBe(true);
        });
        it('should be not recognised by isUndefined', function () {
            expect(Mx.isUndefined(result)).toBe(false);
        });
        it('should be recognised by isNull', function () {
            expect(Mx.isNull(result)).toBe(true);
        });
    });
    describe('getVal', function () {
        it('returns for val', function () {
            var result = Mx.val(fixture);
            expect(Mx.getVal(result)).toBe(fixture);
        });
    });
    describe('err', function () {
        var result = Mx.err(fixture);
        it('should be recognised by isErr', function () {
            expect(Mx.isErr(result)).toBe(true);
            expect(Mx.notErr(result)).toBe(false);
        });
        // it('should be recognised by notVal', () => {
        //   expect(Mx.isErr(result)).toBe(true);
        //   expect(Mx.isVal(result)).toBe(false);
        // });
        it('should be not recognised by isVal', function () {
            expect(Mx.isVal(result)).toBe(false);
            expect(Mx.isErr(result)).toBe(true);
        });
        it('has aliases', function () {
            expect(Md.left).toBe(Mx.err);
            expect(Md.isLeft).toBe(Mx.isErr);
        });
    });
    describe('getErr', function () {
        it('returns for err', function () {
            var result = Mx.err(fixture);
            expect(Mx.getErr(result)).toBe(fixture);
        });
    });
    describe('fromFalsey factory', function () {
        it('should create val on truthy', function () {
            var result = Mx.fromFalsey(0, 5);
            expect(Mx.isVal(result)).toBe(true);
        });
        it('should create err on false', function () {
            var result = Mx.fromFalsey(0, false);
            expect(Mx.isVal(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should create err on null', function () {
            var result = Mx.fromFalsey(0, null);
            expect(Mx.isVal(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should create err on undefined', function () {
            var result = Mx.fromFalsey(0, undefined);
            expect(Mx.isVal(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should create err on 0', function () {
            var result = Mx.fromFalsey(0, 0);
            expect(Mx.isVal(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should be curried', function () {
            var result = Mx.fromFalsey(0)(undefined);
            expect(Mx.isVal(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
    });
    describe('fromNull factory', function () {
        it('should create val on truthy', function () {
            var result = Mx.fromNull(0, fixture);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
        });
        it('should create val on false', function () {
            var result = Mx.fromNull(0, false);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(false);
        });
        it('should create err on null', function () {
            var result = Mx.fromNull(0, null);
            expect(Mx.isVal(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should create err on undefined', function () {
            var result = Mx.fromNull(0, undefined);
            expect(Mx.isVal(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
    });
    describe('fromPromise factory', function () {
        it('should resolve to val', function (done) {
            var prom = Mx.fromPromise(Promise.resolve(fixture));
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(true);
                expect(Mx.getVal(result)).toBe(fixture);
                done();
            }).catch(done);
        });
        it('should reject to err', function (done) {
            var prom = Mx.fromPromise(Promise.reject(fixture));
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(false);
                expect(Mx.getErr(result)).toBe(fixture);
                done();
            }).catch(done);
        });
    });
    describe('withNotErr', function () {
        var valFix = {};
        it('should map a Val', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var val = Mx.val(valFix);
            var result = Mx.withNotErr(fn, val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Err', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var err = Mx.err(valFix);
            var result = Mx.withNotErr(fn, err);
            expect(Mx.isVal(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(valFix);
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var val = Mx.val(valFix);
            var exec = Mx.withNotErr(fn);
            var result = exec(val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('has aliases', function () {
            expect(Md.map).toBe(Mx.withNotErr);
        });
    });
    describe('withNotErrAsync', function () {
        it('should wait for promises value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(fixture); });
            var valFix = {};
            var val = Mx.val(valFix);
            var exec = Mx.withNotErrAsync(fn);
            var prom = exec(val);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(true);
                expect(Mx.getVal(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            }).catch(done);
        });
        it('has aliases', function () {
            expect(Md.mapAsync).toBe(Mx.withNotErrAsync);
        });
    });
    describe('withErr', function () {
        it('should withErr a Err', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var err = Mx.err(valFix);
            var result = Mx.withErr(fn, err);
            expect(Mx.isErr(result)).toBe(true);
            expect(Mx.getErr(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Val', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var val = Mx.val(valFix);
            var result = Mx.withErr(fn, val);
            expect(Mx.isErr(result)).toBe(false);
            expect(Mx.getErr(result)).toBeUndefined();
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var err = Mx.err(valFix);
            var exec = Mx.withErr(fn);
            var result = exec(err);
            expect(Mx.isErr(result)).toBe(true);
            expect(Mx.getErr(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('has aliases', function () {
            expect(Md.leftMap).toBe(Mx.withErr);
        });
    });
    describe('withErrAsync', function () {
        it('should wait for promises value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(fixture); });
            var valFix = {};
            var err = Mx.err(valFix);
            var exec = Mx.withErrAsync(fn);
            var prom = exec(err);
            prom.then(function (result) {
                expect(Mx.isErr(result)).toBe(true);
                expect(Mx.getErr(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            }).catch(done);
        });
        it('has aliases', function () {
            expect(Md.leftMapAsync).toBe(Mx.withErrAsync);
        });
    });
    describe('ifNotErr', function () {
        it('should flatMap a Val', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var valFix = {};
            var val = Mx.val(valFix);
            var result = Mx.ifNotErr(fn, val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should flatMap a Val and return err', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.err(fixture); });
            var valFix = {};
            var val = Mx.val(valFix);
            var result = Mx.ifNotErr(fn, val);
            expect(Mx.isErr(result)).toBe(true);
            if (Mx.isErr(result))
                expect(Mx.getErr(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Err', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val({}); });
            var val = Mx.err(fixture);
            var result = Mx.ifNotErr(fn, val);
            expect(Mx.isVal(result)).toBe(false);
            if (Mx.isErr(result))
                expect(Mx.getErr(result)).toBe(fixture);
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var valFix = {};
            var val = Mx.val(valFix);
            var exec = Mx.ifNotErr(fn);
            var result = exec(val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('has aliases', function () {
            expect(Md.flatMap).toBe(Mx.ifNotErr);
            expect(Md.bind).toBe(Mx.ifNotErr);
        });
    });
    describe('ifNotErrAsync', function () {
        it('should work for promise return value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val(fixture)); });
            var valFix = {};
            var val = Mx.val(valFix);
            var exec = Mx.ifNotErrAsync(fn);
            var prom = exec(val);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(true);
                expect(Mx.getVal(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            }).catch(done);
        });
        it('should work for promise return value on err', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val(fixture)); });
            var valFix = {};
            var err = Mx.err(valFix);
            var exec = Mx.ifNotErrAsync(fn);
            var prom = exec(err);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(false);
                expect(Mx.getErr(result)).toBe(valFix);
                expect(fn).not.toHaveBeenCalled();
                done();
            }).catch(done);
        });
        it('has aliases', function () {
            expect(Md.flatMapAsync).toBe(Mx.ifNotErrAsync);
            expect(Md.bindAsync).toBe(Mx.ifNotErrAsync);
        });
    });
    describe('ifNotUndefined', function () {
        it('should flatMap a Val', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var valFix = {};
            var val = Mx.val(valFix);
            var result = Mx.ifNotUndefined(fn, val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should flatMap a Val and return undef', function () {
            var fn = jest.fn().mockImplementation(function () { return undefined; });
            var valFix = {};
            var val = Mx.val(valFix);
            var result = Mx.ifNotUndefined(fn, val);
            expect(Mx.isUndefined(result)).toBe(true);
            if (Mx.isUndefined(result))
                expect(result).toBeUndefined();
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip undefined', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val({}); });
            var val = undefined;
            var result = Mx.ifNotUndefined(fn, val);
            expect(Mx.isUndefined(result)).toBe(true);
            if (Mx.isUndefined(result))
                expect(result).toBeUndefined();
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var valFix = {};
            var val = Mx.val(valFix);
            var exec = Mx.ifNotUndefined(fn);
            var result = exec(val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
    });
    describe('ifNotUndefinedAsync', function () {
        it('should work for promise return value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val(fixture)); });
            var valFix = {};
            var val = Mx.val(valFix);
            var exec = Mx.ifNotUndefinedAsync(fn);
            var prom = exec(val);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(true);
                expect(Mx.getVal(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            }).catch(done);
        });
        it('should work for promise return value on err', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val(fixture)); });
            var err = undefined;
            var exec = Mx.ifNotUndefinedAsync(fn);
            var prom = exec(err);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(false);
                expect(result).toBe(undefined);
                expect(fn).not.toHaveBeenCalled();
                done();
            }).catch(done);
        });
    });
    describe('ifNotNull', function () {
        it('should flatMap a Val', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var valFix = {};
            var val = Mx.val(valFix);
            var result = Mx.ifNotNull(fn, val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should flatMap a Val and return null', function () {
            var fn = jest.fn().mockImplementation(function () { return null; });
            var valFix = {};
            var val = Mx.val(valFix);
            var result = Mx.ifNotNull(fn, val);
            expect(Mx.isNull(result)).toBe(true);
            if (Mx.isNull(result))
                expect(fn).toHaveBeenCalledWith(valFix);
            expect(result).toBeNull();
        });
        it('should skip null', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val({}); });
            var val = null;
            var result = Mx.ifNotNull(fn, val);
            expect(Mx.isNull(result)).toBe(true);
            if (Mx.isNull(result))
                expect(result).toBeNull();
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var valFix = {};
            var val = Mx.val(valFix);
            var exec = Mx.ifNotNull(fn);
            var result = exec(val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
    });
    describe('ifNotNullAsync', function () {
        it('should work for promise return value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val(fixture)); });
            var valFix = {};
            var val = Mx.val(valFix);
            var exec = Mx.ifNotNullAsync(fn);
            var prom = exec(val);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(true);
                expect(Mx.getVal(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            }).catch(done);
        });
        it('should work for promise return value on err', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val(fixture)); });
            var err = null;
            var exec = Mx.ifNotNullAsync(fn);
            var prom = exec(err);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(false);
                expect(result).toBeNull();
                expect(fn).not.toHaveBeenCalled();
                done();
            }).catch(done);
        });
    });
    describe('ifErr', function () {
        it('should flatMap a Err', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var valFix = {};
            var err = Mx.err(valFix);
            var result = Mx.ifErr(fn, err);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should flatMap a Err and return err', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.err(fixture); });
            var valFix = {};
            var err = Mx.err(valFix);
            var result = Mx.ifErr(fn, err);
            expect(Mx.isErr(result)).toBe(true);
            if (Mx.isErr(result))
                expect(Mx.getErr(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Val', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val({}); });
            var val = Mx.val(fixture);
            var result = Mx.ifErr(fn, val);
            expect(Mx.isErr(result)).toBe(false);
            if (Mx.isVal(result))
                expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.err(fixture); });
            var valFix = {};
            var err = Mx.err(valFix);
            var exec = Mx.ifErr(fn);
            var result = exec(err);
            expect(Mx.isErr(result)).toBe(true);
            expect(Mx.getErr(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('has aliases', function () {
            expect(Md.leftBind).toBe(Mx.ifErr);
            expect(Md.leftFlatMap).toBe(Mx.ifErr);
        });
    });
    describe('ifErrAsync', function () {
        it('should work for promise return value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.err(fixture)); });
            var valFix = {};
            var err = Mx.err(valFix);
            var exec = Mx.ifErrAsync(fn);
            var prom = exec(err);
            prom.then(function (result) {
                expect(Mx.isErr(result)).toBe(true);
                expect(Mx.getErr(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            }).catch(done);
        });
        it('should work for promise return value on val', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val(fixture)); });
            var valFix = {};
            var val = Mx.val(valFix);
            var exec = Mx.ifErrAsync(fn);
            var prom = exec(val);
            prom.then(function (result) {
                expect(Mx.isErr(result)).toBe(false);
                expect(Mx.getVal(result)).toBe(valFix);
                expect(fn).not.toHaveBeenCalled();
                done();
            }).catch(done);
        });
        it('has aliases', function () {
            expect(Md.leftFlatMapAsync).toBe(Mx.ifErrAsync);
            expect(Md.leftBindAsync).toBe(Mx.ifErrAsync);
        });
    });
    describe('ifUndefined', function () {
        it('should skip a Val', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var valFix = {};
            var val = Mx.val(valFix);
            var result = Mx.ifUndefined(fn, val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(valFix);
            expect(fn).not.toHaveBeenCalled();
        });
        it('should leftFlatMap undefined', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var val = undefined;
            var result = Mx.ifUndefined(fn, val);
            expect(Mx.isUndefined(result)).toBe(false);
            if (!Mx.isUndefined(result))
                expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var val = undefined;
            var exec = Mx.ifUndefined(fn);
            var result = exec(val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalled();
        });
    });
    describe('ifUndefinedAsync', function () {
        it('should work for promise return value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val(fixture)); });
            var val = undefined;
            var exec = Mx.ifUndefinedAsync(fn);
            var prom = exec(val);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(true);
                expect(Mx.getVal(result)).toBe(fixture);
                expect(fn).toHaveBeenCalled();
                done();
            }).catch(done);
        });
        it('should skip calling on value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val(fixture)); });
            var err = fixture;
            var exec = Mx.ifUndefinedAsync(fn);
            var prom = exec(err);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(true);
                expect(result).toBe(fixture);
                expect(fn).not.toHaveBeenCalled();
                done();
            }).catch(done);
        });
    });
    describe('ifNull', function () {
        it('should skip a Val', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var valFix = {};
            var val = Mx.val(valFix);
            var result = Mx.ifNull(fn, val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(valFix);
            expect(fn).not.toHaveBeenCalled();
        });
        it('should leftFlatMap a null', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var val = null;
            var result = Mx.ifNull(fn, val);
            expect(Mx.isNull(result)).toBe(false);
            if (!Mx.isNull(result))
                expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.val(fixture); });
            var val = null;
            var exec = Mx.ifNull(fn);
            var result = exec(val);
            expect(Mx.isVal(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
            expect(fn).toHaveBeenCalled();
        });
    });
    describe('ifNullAsync', function () {
        it('should work for promise return value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val(fixture)); });
            var val = null;
            var exec = Mx.ifNullAsync(fn);
            var prom = exec(val);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(true);
                expect(Mx.getVal(result)).toBe(fixture);
                expect(fn).toHaveBeenCalled();
                done();
            }).catch(done);
        });
        it('should work for promise return value on err', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.val({})); });
            var err = fixture;
            var exec = Mx.ifNullAsync(fn);
            var prom = exec(err);
            prom.then(function (result) {
                expect(Mx.isVal(result)).toBe(true);
                expect(result).toBe(fixture);
                expect(fn).not.toHaveBeenCalled();
                done();
            }).catch(done);
        });
    });
    describe('fork', function () {
        it('should fork a Val', function () {
            var vFn = jest.fn();
            var eFn = jest.fn();
            var valFix = {};
            var val = Mx.val(valFix);
            Mx.fork(vFn, eFn, val);
            expect(vFn).toHaveBeenCalledWith(valFix);
            expect(eFn).not.toHaveBeenCalled();
        });
        it('should fork a Err', function () {
            var vFn = jest.fn();
            var eFn = jest.fn();
            var valFix = {};
            var err = Mx.err(valFix);
            Mx.fork(vFn, eFn, err);
            expect(eFn).toHaveBeenCalledWith(valFix);
            expect(vFn).not.toHaveBeenCalled();
        });
    });
    describe('cata', function () {
        it('should cata a Val', function () {
            var vFn = jest.fn()
                .mockImplementation(function () { return fixture; });
            var eFn = jest.fn();
            var valFix = {};
            var val = Mx.val(valFix);
            var result = Mx.cata(vFn, eFn, val);
            expect(vFn).toHaveBeenCalledWith(valFix);
            expect(result).toBe(fixture);
            expect(eFn).not.toHaveBeenCalled();
        });
        it('should cata a Err', function () {
            var vFn = jest.fn();
            var eFn = jest.fn()
                .mockImplementation(function () { return fixture; });
            var valFix = {};
            var err = Mx.err(valFix);
            var result = Mx.cata(vFn, eFn, err);
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