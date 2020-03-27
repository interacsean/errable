import * as Mx from '../index';
import * as Md from '../monad-aliases';

function createPromise<T>(resOrRej: boolean, val: T): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(() => (resOrRej ? res : rej)(val), 50);
  });
}

type Fix = { fix: string };

describe('errable', () => {
  const fixture: Fix = { fix: 'ture' };

  describe('a value', () => {
    const result = Mx.val(fixture);

    it('should be recognised by isVal', () => {
      expect(Mx.isVal(result)).toBe(true);
    });
    it('should be recognised by isNotErr', () => {
      expect(Mx.notErr(result)).toBe(true);
    });
    it('should be not recognised by isErr', () => {
      expect(Mx.isErr(result)).toBe(false);
    });
    it('has aliases', () => {
      expect(Md.right).toBe(Mx.val);
      expect(Md.isRight).toBe(Mx.notErr);
    });
  });

  describe('undefined', () => {
    const result = undefined;

    it('should be rejected by isVal', () => {
      expect(Mx.isVal(result)).toBe(false);
    });
    it('should be recognised by isNotErr', () => {
      expect(Mx.notErr(result)).toBe(true);
    });
    it('should be not recognised by isNull', () => {
      expect(Mx.isNull(result)).toBe(false);
    });
    it('should be recognised by isUndefined', () => {
      expect(Mx.isUndefined(result)).toBe(true);
    });
  });

  describe('null', () => {
    const result = null;

    it('should be rejected by isVal', () => {
      expect(Mx.isVal(result)).toBe(false);
    });
    it('should be recognised by isNotErr', () => {
      expect(Mx.notErr(result)).toBe(true);
    });
    it('should be not recognised by isUndefined', () => {
      expect(Mx.isUndefined(result)).toBe(false);
    });
    it('should be recognised by isNull', () => {
      expect(Mx.isNull(result)).toBe(true);
    });
  });

  describe('getVal', () => {
    it('returns for val', () => {
      const result = Mx.val(fixture);

      expect(Mx.getVal(result)).toBe(fixture);
    });
  });

  describe('err', () => {
    const result = Mx.err(fixture);

    it('should be recognised by isErr', () => {
      expect(Mx.isErr(result)).toBe(true);
      expect(Mx.notErr(result)).toBe(false);
    });
    // it('should be recognised by notVal', () => {
    //   expect(Mx.isErr(result)).toBe(true);
    //   expect(Mx.isVal(result)).toBe(false);
    // });
    it('should be not recognised by isVal', () => {
      expect(Mx.isVal(result)).toBe(false);
      expect(Mx.isErr(result)).toBe(true);
    });
    it('has aliases', () => {
      expect(Md.left).toBe(Mx.err);
      expect(Md.isLeft).toBe(Mx.isErr);
    });
  });

  describe('getErr', () => {
    it('returns for err', () => {
      const result = Mx.err(fixture);

      expect(Mx.getErr(result)).toBe(fixture);
    });
  });

  describe('fromFalsey factory', () => {
    it('should create val on truthy', () => {
      const result = Mx.fromFalsey(0, 5);

      expect(Mx.isVal(result)).toBe(true);
    });

    it('should create err on false', () => {
      const result = Mx.fromFalsey(0, false);

      expect(Mx.isVal(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Err<number>)).toBe(0);
    });

    it('should create err on null', () => {
      const result = Mx.fromFalsey(0, null);

      expect(Mx.isVal(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Err<number>)).toBe(0);
    });

    it('should create err on undefined', () => {
      const result = Mx.fromFalsey(0, undefined);

      expect(Mx.isVal(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Err<number>)).toBe(0);
    });

    it('should create err on 0', () => {
      const result = Mx.fromFalsey(0, 0);

      expect(Mx.isVal(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Err<number>)).toBe(0);
    });

    it('should be curried', () => {
      const result = Mx.fromFalsey(0)(undefined);

      expect(Mx.isVal(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Err<number>)).toBe(0);
    });

  });

  describe('fromNull factory', () => {
    it('should create val on truthy', () => {
      const result = Mx.fromNull(0, fixture);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<Fix>)).toBe(fixture);
    });

    it('should create val on false', () => {
      const result = Mx.fromNull(0, false);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<boolean>)).toBe(false);
    });

    it('should create err on null', () => {
      const result = Mx.fromNull(0, null);

      expect(Mx.isVal(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Err<number>)).toBe(0);
    });

    it('should create err on undefined', () => {
      const result = Mx.fromNull(0, undefined);

      expect(Mx.isVal(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Err<number>)).toBe(0);
    });
  });

  describe('fromPromise factory', () => {
    it('should resolve to val', (done) => {
      const prom: Promise<Mx.Errable<any, Fix>> = Mx.fromPromise(Promise.resolve(fixture));

      prom.then((result) => {
        expect(Mx.isVal(result)).toBe(true);
        expect(Mx.getVal(result as Mx.Val<Fix>)).toBe(fixture);
        done();
      }).catch(done);
    });
    it('should reject to err', (done) => {
      const prom: Promise<Mx.Errable<any, any>> = Mx.fromPromise(Promise.reject(fixture));

      prom.then((result) => {
        expect(Mx.isVal(result)).toBe(false);
        expect(Mx.getErr(result as Mx.Err<Fix>)).toBe(fixture);
        done();
      }).catch(done);
    });
  });

  describe('withNotErr', () => {
    const valFix = {};
    it('should map a Val', () => {
      const fn: (v: any) => any = jest.fn().mockImplementation(() => fixture);
      const val = Mx.val(valFix);

      const result: Mx.Errable<any, Fix> = Mx.withNotErr(fn, val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<Fix>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });

    it('should skip a Err', () => {
      const fn = jest.fn().mockImplementation(() => fixture);
      const err = Mx.err(valFix);

      const result: Mx.Errable<any, {}> = Mx.withNotErr(fn, err);

      expect(Mx.isVal(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Err<{}>)).toBe(valFix);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should be curried', () => {
      const fn: (v: any) => any = jest.fn().mockImplementation(() => fixture);
      const val = Mx.val(valFix);

      const exec = Mx.withNotErr(fn);

      const result: Mx.Errable<any, Fix> = exec(val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<Fix>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('has aliases', () => {
      expect(Md.map).toBe(Mx.withNotErr)
    })
  });

  describe('withNotErrAsync', () => {
    it('should wait for promises value', (done) => {
      const fn: (v: {}) => Promise<Fix> = jest.fn().mockImplementation(() => Promise.resolve(fixture));
      const valFix = {};
      const val = Mx.val(valFix);

      const exec = Mx.withNotErrAsync(fn);
      const prom: Promise<Mx.Errable<any, Fix>> = exec(val);

      prom.then((result: Mx.Errable<any, Fix>) => {
        expect(Mx.isVal(result)).toBe(true);
        expect(Mx.getVal(result as Mx.Val<Fix>)).toBe(fixture);
        expect(fn).toHaveBeenCalledWith(valFix);
        done();
      }).catch(done);
    });
    it('has aliases', () => {
      expect(Md.mapAsync).toBe(Mx.withNotErrAsync);
    })
  });

  describe('withErr', () => {
    it('should withErr a Err', () => {
      const fn: (v: any) => any = jest.fn().mockImplementation(() => fixture);
      const valFix = {}
      const err = Mx.err(valFix);

      const result: Mx.Errable<Fix, any> = Mx.withErr(fn, err);

      expect(Mx.isErr(result)).toBe(true);
      expect(Mx.getErr(result as Mx.Err<Fix>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('should skip a Val', () => {
      const fn = jest.fn().mockImplementation(() => fixture);
      const valFix = {};
      const val = Mx.val(valFix);

      const result: Mx.Errable<{}, any> = Mx.withErr(fn, val);

      expect(Mx.isErr(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Err<{}>)).toBeUndefined();
      expect(fn).not.toHaveBeenCalled();
    });
    it('should be curried', () => {
      const fn: (v: any) => any = jest.fn().mockImplementation(() => fixture);
      const valFix = {};
      const err = Mx.err(valFix);

      const exec = Mx.withErr(fn);

      const result: Mx.Errable<{}, any> = exec(err);

      expect(Mx.isErr(result)).toBe(true);
      expect(Mx.getErr(result as Mx.Err<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('has aliases', () => {
      expect(Md.leftMap).toBe(Mx.withErr)
    });
  });

  describe('withErrAsync', () => {
    it('should wait for promises value', (done) => {
      const fn: (v: any) => any = jest.fn().mockImplementation(() => Promise.resolve(fixture));
      const valFix = {};
      const err = Mx.err(valFix);

      const exec = Mx.withErrAsync(fn);
      const prom: Promise<Mx.Errable<{}, any>> = exec(err);

      prom.then((result: Mx.Errable<{}, any>) => {
        expect(Mx.isErr(result)).toBe(true);
        expect(Mx.getErr(result as Mx.Err<{}>)).toBe(fixture);
        expect(fn).toHaveBeenCalledWith(valFix);
        done();
      }).catch(done);
    });
    it('has aliases', () => {
      expect(Md.leftMapAsync).toBe(Mx.withErrAsync);
    });
  });

  describe('ifNotErr', () => {
    it('should flatMap a Val', () => {
      const fn: (v: any) => Mx.Errable<any, any> =
        jest.fn().mockImplementation(() => Mx.val(fixture));
      const valFix = {};
      const val = Mx.val(valFix);

      const result: Mx.Errable<any, {}> = Mx.ifNotErr(fn, val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });

    it('should flatMap a Val and return err', () => {
      const fn: (v: any) => Mx.Errable<any, any> =
        jest.fn().mockImplementation(() => Mx.err(fixture));
      const valFix = {};
      const val = Mx.val(valFix);

      const result: Mx.Errable<{}, any> = Mx.ifNotErr(fn, val);

      expect(Mx.isErr(result)).toBe(true);
      if (Mx.isErr(result))
        expect(Mx.getErr(result)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });

    it('should skip a Err', () => {
      const fn = jest.fn().mockImplementation(() => Mx.val({}));
      const val = Mx.err(fixture);

      const result: Mx.Errable<{}, any> = Mx.ifNotErr(fn, val);

      expect(Mx.isVal(result)).toBe(false);
      if (Mx.isErr(result))
        expect(Mx.getErr(result)).toBe(fixture);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should be curried', () => {
      const fn: (v: any) => Mx.Errable<any, any> = jest.fn().mockImplementation(() => Mx.val(fixture));
      const valFix = {};
      const val = Mx.val(valFix);

      const exec = Mx.ifNotErr(fn);
      const result: Mx.Errable<any, {}> = exec(val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });

    it('has aliases', () => {
      expect(Md.flatMap).toBe(Mx.ifNotErr);
      expect(Md.bind).toBe(Mx.ifNotErr);
    })
  });

  describe('ifNotErrAsync', () => {
    it('should work for promise return value', (done) => {
      const fn: (v: any) => Promise<Mx.Errable<any, any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val(fixture)));
      const valFix = {};
      const val = Mx.val(valFix);

      const exec = Mx.ifNotErrAsync(fn);

      const prom: Promise<Mx.Errable<any, {}>> = exec(val);

      prom.then((result: Mx.Errable<any, {}>) => {
        expect(Mx.isVal(result)).toBe(true);
        expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
        expect(fn).toHaveBeenCalledWith(valFix);
        done();
      }).catch(done);
    });

    it('should work for promise return value on err', (done) => {
      const fn: (v: any) => Promise<Mx.Errable<any, any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val(fixture)));
      const valFix = {};
      const err = Mx.err(valFix);

      const exec = Mx.ifNotErrAsync(fn);

      const prom: Promise<Mx.Errable<any, {}>> = exec(err);

      prom.then((result: Mx.Errable<any, {}>) => {
        expect(Mx.isVal(result)).toBe(false);
        expect(Mx.getErr(result as Mx.Err<{}>)).toBe(valFix);
        expect(fn).not.toHaveBeenCalled();
        done();
      }).catch(done);
    });
    it('has aliases', () => {
      expect(Md.flatMapAsync).toBe(Mx.ifNotErrAsync);
      expect(Md.bindAsync).toBe(Mx.ifNotErrAsync);
    })
  });

  describe('ifNotUndefined', () => {
    it('should flatMap a Val', () => {
      const fn: (v: any) => Mx.Optional<any> =
        jest.fn().mockImplementation(() => Mx.val(fixture));
      const valFix = {};
      const val = Mx.val(valFix);

      const result: Mx.Optional<{}> = Mx.ifNotUndefined(fn, val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });

    it('should flatMap a Val and return undef', () => {
      const fn: (v: any) => Mx.Optional<any> =
        jest.fn().mockImplementation(() => undefined);
      const valFix = {};
      const val = Mx.val(valFix);

      const result: Mx.Optional<any> = Mx.ifNotUndefined(fn, val);

      expect(Mx.isUndefined(result)).toBe(true);
      if (Mx.isUndefined(result))
        expect(result).toBeUndefined();
      expect(fn).toHaveBeenCalledWith(valFix);
    });

    it('should skip undefined', () => {
      const fn = jest.fn().mockImplementation(() => Mx.val({}));
      const val = undefined;

      const result: Mx.Optional<any> = Mx.ifNotUndefined(fn, val);

      expect(Mx.isUndefined(result)).toBe(true);
      if (Mx.isUndefined(result))
        expect(result).toBeUndefined();
      expect(fn).not.toHaveBeenCalled();
    });

    it('should be curried', () => {
      const fn: (v: any) => Mx.Optional<any> = jest.fn().mockImplementation(() => Mx.val(fixture));
      const valFix = {};
      const val = Mx.val(valFix);

      const exec = Mx.ifNotUndefined(fn);
      const result: Mx.Optional<{}> = exec(val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
  });

  describe('ifNotUndefinedAsync', () => {
    it('should work for promise return value', (done) => {
      const fn: (v: any) => Promise<Mx.Optional<any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val(fixture)));
      const valFix = {};
      const val = Mx.val(valFix);

      const exec = Mx.ifNotUndefinedAsync(fn);

      const prom: Promise<Mx.Optional<{}>> = exec(val);

      prom.then((result: Mx.Optional<{}>) => {
        expect(Mx.isVal(result)).toBe(true);
        expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
        expect(fn).toHaveBeenCalledWith(valFix);
        done();
      }).catch(done);
    });

    it('should work for promise return value on err', (done) => {
      const fn: (v: any) => Promise<Mx.Optional<any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val(fixture)));
      const err = undefined;

      const exec = Mx.ifNotUndefinedAsync(fn);

      const prom: Promise<Mx.Optional<{}>> = exec(err);

      prom.then((result: Mx.Optional<{}>) => {
        expect(Mx.isVal(result)).toBe(false);
        expect(result).toBe(undefined);
        expect(fn).not.toHaveBeenCalled();
        done();
      }).catch(done);
    });
  });

  describe('ifNotNull', () => {
    it('should flatMap a Val', () => {
      const fn: (v: any) => Mx.Nullable<any> =
        jest.fn().mockImplementation(() => Mx.val(fixture));
      const valFix = {};
      const val = Mx.val(valFix);

      const result: Mx.Nullable<{}> = Mx.ifNotNull(fn, val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });

    it('should flatMap a Val and return null', () => {
      const fn: (v: any) => Mx.Nullable<any> =
        jest.fn().mockImplementation(() => null);
      const valFix = {};
      const val = Mx.val(valFix);

      const result: Mx.Nullable<any> = Mx.ifNotNull(fn, val);

      expect(Mx.isNull(result)).toBe(true);
      if (Mx.isNull(result))
      expect(fn).toHaveBeenCalledWith(valFix);
        expect(result).toBeNull();
    });

    it('should skip null', () => {
      const fn = jest.fn().mockImplementation(() => Mx.val({}));
      const val = null;

      const result: Mx.Nullable<any> = Mx.ifNotNull(fn, val);

      expect(Mx.isNull(result)).toBe(true);
      if (Mx.isNull(result))
        expect(result).toBeNull();
      expect(fn).not.toHaveBeenCalled();
    });

    it('should be curried', () => {
      const fn: (v: any) => Mx.Nullable<any> = jest.fn().mockImplementation(() => Mx.val(fixture));
      const valFix = {};
      const val = Mx.val(valFix);

      const exec = Mx.ifNotNull(fn);
      const result: Mx.Nullable<{}> = exec(val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
  });

  describe('ifNotNullAsync', () => {
    it('should work for promise return value', (done) => {
      const fn: (v: any) => Promise<Mx.Nullable<any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val(fixture)));
      const valFix = {};
      const val = Mx.val(valFix);

      const exec = Mx.ifNotNullAsync(fn);

      const prom: Promise<Mx.Nullable<{}>> = exec(val);

      prom.then((result: Mx.Nullable<{}>) => {
        expect(Mx.isVal(result)).toBe(true);
        expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
        expect(fn).toHaveBeenCalledWith(valFix);
        done();
      }).catch(done);
    });

    it('should work for promise return value on err', (done) => {
      const fn: (v: any) => Promise<Mx.Nullable<any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val(fixture)));
      const err = null;

      const exec = Mx.ifNotNullAsync(fn);

      const prom: Promise<Mx.Nullable<{}>> = exec(err);

      prom.then((result: Mx.Nullable<{}>) => {
        expect(Mx.isVal(result)).toBe(false);
        expect(result).toBeNull();
        expect(fn).not.toHaveBeenCalled();
        done();
      }).catch(done);
    });
  });

  describe('ifErr', () => {
    it('should flatMap a Err', () => {
      const fn: (e: any) => Mx.Errable<any, any> =
        jest.fn().mockImplementation(() => Mx.val(fixture));
      const valFix = {};
      const err = Mx.err(valFix);

      const result: Mx.Errable<any, {}> = Mx.ifErr(fn, err);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });

    it('should flatMap a Err and return err', () => {
      const fn: (e: any) => Mx.Errable<any, any> =
        jest.fn().mockImplementation(() => Mx.err(fixture));
      const valFix = {};
      const err = Mx.err(valFix);

      const result: Mx.Errable<{}, any> = Mx.ifErr(fn, err);

      expect(Mx.isErr(result)).toBe(true);
      if (Mx.isErr(result))
        expect(Mx.getErr(result)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });

    it('should skip a Val', () => {
      const fn = jest.fn().mockImplementation(() => Mx.val({}));
      const val = Mx.val(fixture);

      const result: Mx.Errable<any, {}> = Mx.ifErr(fn, val);

      expect(Mx.isErr(result)).toBe(false);
      if (Mx.isVal(result))
        expect(Mx.getVal(result)).toBe(fixture);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should be curried', () => {
      const fn: (v: any) => Mx.Errable<any, any> = jest.fn().mockImplementation(() => Mx.err(fixture));
      const valFix = {};
      const err = Mx.err(valFix);

      const exec = Mx.ifErr(fn);
      const result: Mx.Errable<any, {}> = exec(err);

      expect(Mx.isErr(result)).toBe(true);
      expect(Mx.getErr(result as Mx.Err<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });

    it('has aliases', () => {
      expect(Md.leftBind).toBe(Mx.ifErr);
      expect(Md.leftFlatMap).toBe(Mx.ifErr);
    });
  });

  describe('ifErrAsync', () => {
    it('should work for promise return value', (done) => {
      const fn: (v: any) => Promise<Mx.Errable<any, any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.err(fixture)));
      const valFix = {};
      const err = Mx.err(valFix);

      const exec = Mx.ifErrAsync(fn);

      const prom: Promise<Mx.Errable<{}, any>> = exec(err);

      prom.then((result: Mx.Errable<{}, any>) => {
        expect(Mx.isErr(result)).toBe(true);
        expect(Mx.getErr(result as Mx.Err<{}>)).toBe(fixture);
        expect(fn).toHaveBeenCalledWith(valFix);
        done();
      }).catch(done);
    });

    it('should work for promise return value on val', (done) => {
      const fn: (v: any) => Promise<Mx.Errable<any, any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val(fixture)));
      const valFix = {};
      const val = Mx.val(valFix);

      const exec = Mx.ifErrAsync(fn);

      const prom: Promise<Mx.Errable<any, {}>> = exec(val);

      prom.then((result: Mx.Errable<any, {}>) => {
        expect(Mx.isErr(result)).toBe(false);
        expect(Mx.getVal(result as Mx.Val<{}>)).toBe(valFix);
        expect(fn).not.toHaveBeenCalled();
        done();
      }).catch(done);
    });

    it('has aliases', () => {
      expect(Md.leftFlatMapAsync).toBe(Mx.ifErrAsync);
      expect(Md.leftBindAsync).toBe(Mx.ifErrAsync);
    });
  });




  describe('ifUndefined', () => {
    it('should skip a Val', () => {
      const fn: () => Mx.Optional<any> =
        jest.fn().mockImplementation(() => Mx.val(fixture));
      const valFix = {};
      const val = Mx.val(valFix);

      const result: Mx.Optional<{}> = Mx.ifUndefined(fn, val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(valFix);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should leftFlatMap undefined', () => {
      const fn = jest.fn().mockImplementation(() => Mx.val(fixture));
      const val = undefined;

      const result: Mx.Optional<any> = Mx.ifUndefined(fn, val);

      expect(Mx.isUndefined(result)).toBe(false);
      if (!Mx.isUndefined(result))
        expect(Mx.getVal(result)).toBe(fixture);
      expect(fn).toHaveBeenCalled();
    });

    it('should be curried', () => {
      const fn: () => Mx.Optional<any> = jest.fn().mockImplementation(() => Mx.val(fixture));
      const val = undefined;

      const exec = Mx.ifUndefined(fn);
      const result: Mx.Optional<{}> = exec(val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('ifUndefinedAsync', () => {
    it('should work for promise return value', (done) => {
      const fn: () => Promise<Mx.Optional<any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val(fixture)));
      const val = undefined;

      const exec = Mx.ifUndefinedAsync(fn);

      const prom: Promise<Mx.Optional<{}>> = exec(val);

      prom.then((result: Mx.Optional<{}>) => {
        expect(Mx.isVal(result)).toBe(true);
        expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
        expect(fn).toHaveBeenCalled();
        done();
      }).catch(done);
    });

    it('should skip calling on value', (done) => {
      const fn: () => Promise<Mx.Optional<any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val(fixture)));
      const err = fixture;

      const exec = Mx.ifUndefinedAsync(fn);

      const prom: Promise<Mx.Optional<{}>> = exec(err);

      prom.then((result: Mx.Optional<{}>) => {
        expect(Mx.isVal(result)).toBe(true);
        expect(result).toBe(fixture);
        expect(fn).not.toHaveBeenCalled();
        done();
      }).catch(done);
    });
  });

  describe('ifNull', () => {
    it('should skip a Val', () => {
      const fn: () => Mx.Nullable<any> =
        jest.fn().mockImplementation(() => Mx.val(fixture));
      const valFix = {};
      const val = Mx.val(valFix);

      const result: Mx.Nullable<{}> = Mx.ifNull(fn, val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(valFix);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should leftFlatMap a null', () => {
      const fn = jest.fn().mockImplementation(() => Mx.val(fixture));
      const val = null;

      const result: Mx.Nullable<any> = Mx.ifNull(fn, val);

      expect(Mx.isNull(result)).toBe(false);
      if (!Mx.isNull(result))
        expect(Mx.getVal(result)).toBe(fixture);
      expect(fn).toHaveBeenCalled();
    });

    it('should be curried', () => {
      const fn: () => Mx.Nullable<any> = jest.fn().mockImplementation(() => Mx.val(fixture));
      const val = null;

      const exec = Mx.ifNull(fn);
      const result: Mx.Nullable<{}> = exec(val);

      expect(Mx.isVal(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('ifNullAsync', () => {
    it('should work for promise return value', (done) => {
      const fn: () => Promise<Mx.Nullable<any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val(fixture)));
      const val = null;

      const exec = Mx.ifNullAsync(fn);

      const prom: Promise<Mx.Nullable<{}>> = exec(val);

      prom.then((result: Mx.Nullable<{}>) => {
        expect(Mx.isVal(result)).toBe(true);
        expect(Mx.getVal(result as Mx.Val<{}>)).toBe(fixture);
        expect(fn).toHaveBeenCalled();
        done();
      }).catch(done);
    });

    it('should work for promise return value on err', (done) => {
      const fn: () => Promise<Mx.Nullable<any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.val({})));
      const err = fixture;

      const exec = Mx.ifNullAsync(fn);

      const prom: Promise<Mx.Nullable<{}>> = exec(err);

      prom.then((result: Mx.Nullable<{}>) => {
        expect(Mx.isVal(result)).toBe(true);
        expect(result).toBe(fixture);
        expect(fn).not.toHaveBeenCalled();
        done();
      }).catch(done);
    });
  });



  describe('fork', () => {
    it('should fork a Val', () => {
      const vFn: (v: any) => void = jest.fn();
      const eFn: (v: any) => void = jest.fn();
      const valFix = {};
      const val = Mx.val(valFix);

      Mx.fork(vFn, eFn, val);

      expect(vFn).toHaveBeenCalledWith(valFix);
      expect(eFn).not.toHaveBeenCalled();
    });
    it('should fork a Err', () => {
      const vFn: (v: any) => void = jest.fn();
      const eFn: (v: any) => void = jest.fn();
      const valFix = {};
      const err = Mx.err(valFix);

      Mx.fork(vFn, eFn, err);

      expect(eFn).toHaveBeenCalledWith(valFix);
      expect(vFn).not.toHaveBeenCalled();
    });
  });
  describe('cata', () => {
    it('should cata a Val', () => {
      const vFn: (v: any) => Fix = jest.fn()
        .mockImplementation(() => fixture);
      const eFn: (v: any) => Fix = jest.fn();
      const valFix = {};
      const val = Mx.val(valFix);

      const result: {} = Mx.cata(vFn, eFn, val);

      expect(vFn).toHaveBeenCalledWith(valFix);
      expect(result).toBe(fixture);
      expect(eFn).not.toHaveBeenCalled();
    });
    it('should cata a Err', () => {
      const vFn: (v: any) => Fix = jest.fn();
      const eFn: (v: any) => Fix = jest.fn()
        .mockImplementation(() => fixture);
      const valFix = {};
      const err = Mx.err(valFix);

      const result: {} = Mx.cata(vFn, eFn, err);

      expect(eFn).toHaveBeenCalledWith(valFix);
      expect(result).toBe(fixture);
      expect(vFn).not.toHaveBeenCalled();
    });
    it('has aliases', () => {
      expect(Mx.ifValElse).toBe(Mx.cata);
    })
  });
});
