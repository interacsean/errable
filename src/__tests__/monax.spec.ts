import * as Mx from '../index';

function createPromise<T>(resOrRej: boolean, val: T): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(() => (resOrRej ? res : rej)(val), 50);
  });
}

type Fix = { fix: string };

describe('monax', () => {
  const fixture: Fix = { fix: 'ture' };

  describe('right', () => {
    it('should be recognised by isRight', () => {
      const result = Mx.right(fixture);

      expect(Mx.isRight(result)).toBe(true);
      expect(Mx.isLeft(result)).toBe(false);
    });
    it('should be not recognised by isLeft', () => {
      const result = Mx.right(fixture);

      expect(Mx.isLeft(result)).toBe(false);
      expect(Mx.isRight(result)).toBe(true);
    });
    it('has aliases', () => {
      expect(Mx.val).toBe(Mx.right);
      expect(Mx.isVal).toBe(Mx.isRight);
    });
  });
  describe('getRight', () => {
    it('returns for right', () => {
      const result = Mx.right(fixture);

      expect(Mx.getRight(result)).toBe(fixture);
    });
  });

  describe('left', () => {
    it('should be recognised by isLeft', () => {
      const result = Mx.left(fixture);

      expect(Mx.isLeft(result)).toBe(true);
      expect(Mx.isRight(result)).toBe(false);
    });
    it('should be not recognised by isRight', () => {
      const result = Mx.left(fixture);

      expect(Mx.isRight(result)).toBe(false);
      expect(Mx.isLeft(result)).toBe(true);
    });
    it('has aliases', () => {
      expect(Mx.err).toBe(Mx.left);
      expect(Mx.isErr).toBe(Mx.isLeft);
    });
  });

  describe('getLeft', () => {
    it('returns for left', () => {
      const result = Mx.left(fixture);

      expect(Mx.getLeft(result)).toBe(fixture);
    });
  });

  describe('fromFalsey factory', () => {
    it('should create right on truthy', () => {
      const result = Mx.fromFalsey(5, 0);

      expect(Mx.isRight(result)).toBe(true);
    });

    it('should create left on false', () => {
      const result = Mx.fromFalsey(false, 0);

      expect(Mx.isRight(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Left<number>)).toBe(0);
    });

    it('should create left on null', () => {
      const result = Mx.fromFalsey(null, 0);

      expect(Mx.isRight(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Left<number>)).toBe(0);
    });

    it('should create left on undefined', () => {
      const result = Mx.fromFalsey(undefined, 0);

      expect(Mx.isRight(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Left<number>)).toBe(0);
    });

    it('should create left on 0', () => {
      const result = Mx.fromFalsey(0, 0);

      expect(Mx.isRight(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Left<number>)).toBe(0);
    });
  });

  describe('fromNull factory', () => {
    it('should create right on truthy', () => {
      const result = Mx.fromNull(fixture, 0);

      expect(Mx.isRight(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Right<Fix>)).toBe(fixture);
    });

    it('should create right on false', () => {
      const result = Mx.fromNull(false, 0);

      expect(Mx.isRight(result)).toBe(true);
      expect(Mx.getVal(result as Mx.Right<boolean>)).toBe(false);
    });

    it('should create left on null', () => {
      const result = Mx.fromNull(null, 0);

      expect(Mx.isRight(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Left<number>)).toBe(0);
    });

    it('should create left on undefined', () => {
      const result = Mx.fromNull(undefined, 0);

      expect(Mx.isRight(result)).toBe(false);
      expect(Mx.getErr(result as Mx.Left<number>)).toBe(0);
    });
  });

  describe('fromPromise factory', () => {
    it('should resolve to right', (done) => {
      const prom: Promise<Mx.Monax<any, Fix>> = Mx.fromPromise(Promise.resolve(fixture));

      prom.then((result) => {
        expect(Mx.isRight(result)).toBe(true);
        expect(Mx.getVal(result as Mx.Right<Fix>)).toBe(fixture);
        done();
      }).catch(done);
    });
    it('should reject to left', (done) => {
      const prom: Promise<Mx.Monax<any, any>> = Mx.fromPromise(Promise.reject(fixture));

      prom.then((result) => {
        expect(Mx.isRight(result)).toBe(false);
        expect(Mx.getErr(result as Mx.Left<Fix>)).toBe(fixture);
        done();
      }).catch(done);
    });
  });

  describe('map', () => {
    it('should map a Right', () => {
      const fn: (v: any) => any = jest.fn().mockImplementation(() => fixture);
      const valFix = {}
      const right = Mx.right(valFix);

      const result: Mx.Monax<any, Fix> = Mx.map(fn, right);

      expect(Mx.isRight(result)).toBe(true);
      expect(Mx.getRight(result as Mx.Right<Fix>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('should skip a Left', () => {
      const fn = jest.fn().mockImplementation(() => fixture);
      const valFix = {};
      const left = Mx.left(valFix);

      const result: Mx.Monax<any, {}> = Mx.map(fn, left);

      expect(Mx.isRight(result)).toBe(false);
      expect(Mx.getLeft(result as Mx.Left<{}>)).toBe(valFix);
      expect(fn).not.toHaveBeenCalled();
    });
    it('should be curried', () => {
      const fn: (v: any) => any = jest.fn().mockImplementation(() => fixture);
      const valFix = {};
      const right = Mx.right(valFix);

      const exec = Mx.map(fn);

      const result: Mx.Monax<any, Fix> = exec(right);

      expect(Mx.isRight(result)).toBe(true);
      expect(Mx.getRight(result as Mx.Right<Fix>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('has aliases', () => {
      expect(Mx.withVal).toBe(Mx.map)
    })
  });

  describe('awaitMap', () => {
    it('should wait for promises value', (done) => {
      const fn: (v: {}) => Promise<Fix> = jest.fn().mockImplementation(() => Promise.resolve(fixture));
      const valFix = {};
      const right = Mx.right(valFix);

      const exec = Mx.awaitMap(fn);
      const prom: Promise<Mx.Monax<any, Fix>> = exec(right);

      prom.then((result: Mx.Monax<any, Fix>) => {
        expect(Mx.isRight(result)).toBe(true);
        expect(Mx.getRight(result as Mx.Right<Fix>)).toBe(fixture);
        expect(fn).toHaveBeenCalledWith(valFix);
        done();
      }).catch(done);
    });
    it('has aliases', () => {
      // expect(Mx.map).toBe(Mx.awaitMap);
      expect(Mx.withAwaitedVal).toBe(Mx.awaitMap);
    })
  });

  describe('leftMap', () => {
    it('should leftMap a Left', () => {
      const fn: (v: any) => any = jest.fn().mockImplementation(() => fixture);
      const valFix = {}
      const left = Mx.left(valFix);

      const result: Mx.Monax<Fix, any> = Mx.leftMap(fn, left);

      expect(Mx.isLeft(result)).toBe(true);
      expect(Mx.getLeft(result as Mx.Left<Fix>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('should skip a Right', () => {
      const fn = jest.fn().mockImplementation(() => fixture);
      const valFix = {};
      const right = Mx.right(valFix);

      const result: Mx.Monax<{}, any> = Mx.leftMap(fn, right);

      expect(Mx.isLeft(result)).toBe(false);
      expect(Mx.getLeft(result as Mx.Left<{}>)).toBeUndefined();
      expect(fn).not.toHaveBeenCalled();
    });
    it('should be curried', () => {
      const fn: (v: any) => any = jest.fn().mockImplementation(() => fixture);
      const valFix = {};
      const left = Mx.left(valFix);

      const exec = Mx.leftMap(fn);

      const result: Mx.Monax<{}, any> = exec(left);

      expect(Mx.isLeft(result)).toBe(true);
      expect(Mx.getLeft(result as Mx.Left<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('has aliases', () => {
      expect(Mx.errMap).toBe(Mx.leftMap)
      expect(Mx.withErr).toBe(Mx.leftMap)
    });
  });

  describe('awaitLeftMap', () => {
    it('should wait for promises value', (done) => {
      const fn: (v: any) => any = jest.fn().mockImplementation(() => Promise.resolve(fixture));
      const valFix = {};
      const left = Mx.left(valFix);

      const exec = Mx.awaitLeftMap(fn);
      const prom: Promise<Mx.Monax<{}, any>> = exec(left);

      prom.then((result: Mx.Monax<{}, any>) => {
        expect(Mx.isLeft(result)).toBe(true);
        expect(Mx.getLeft(result as Mx.Left<{}>)).toBe(fixture);
        expect(fn).toHaveBeenCalledWith(valFix);
        done();
      }).catch(done);
    });
    it('has aliases', () => {
      expect(Mx.withAwaitedErr).toBe(Mx.awaitLeftMap)
      expect(Mx.awaitErrMap).toBe(Mx.awaitLeftMap)
    });
  });

  describe('flatMap', () => {
    it('should flatMap a Right', () => {
      const fn: (v: any) => Mx.Monax<any, any> =
        jest.fn().mockImplementation(() => Mx.right(fixture));
      const valFix = {};
      const right = Mx.right(valFix);

      const result: Mx.Monax<any, {}> = Mx.flatMap(fn, right);

      expect(Mx.isRight(result)).toBe(true);
      expect(Mx.getRight(result as Mx.Right<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('should flatMap a Right and return left', () => {
      const fn: (v: any) => Mx.Monax<any, any> =
        jest.fn().mockImplementation(() => Mx.left(fixture));
      const valFix = {};
      const right = Mx.right(valFix);

      const result: Mx.Monax<{}, any> = Mx.flatMap(fn, right);

      expect(Mx.isLeft(result)).toBe(true);
      if (Mx.isLeft(result))
        expect(Mx.getLeft(result)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('should skip a Left', () => {
      const fn = jest.fn().mockImplementation(() => Mx.right({}));
      const right = Mx.left(fixture);

      const result: Mx.Monax<{}, any> = Mx.flatMap(fn, right);

      expect(Mx.isRight(result)).toBe(false);
      if (Mx.isLeft(result))
        expect(Mx.getLeft(result)).toBe(fixture);
      expect(fn).not.toHaveBeenCalled();
    });
    it('should be curried', () => {
      const fn: (v: any) => Mx.Monax<any, any> = jest.fn().mockImplementation(() => Mx.right(fixture));
      const valFix = {};
      const right = Mx.right(valFix);

      const exec = Mx.flatMap(fn);
      const result: Mx.Monax<any, {}> = exec(right);

      expect(Mx.isRight(result)).toBe(true);
      expect(Mx.getRight(result as Mx.Right<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('should work for promise return value', (done) => {
      const fn: (v: any) => Promise<Mx.Monax<any, any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.right(fixture)));
      const valFix = {};
      const right = Mx.right(valFix);

      const exec = Mx.asyncFlatMap(fn);

      const prom: Promise<Mx.Monax<any, {}>> = exec(right);

      prom.then((result: Mx.Monax<any, {}>) => {
        expect(Mx.isRight(result)).toBe(true);
        expect(Mx.getRight(result as Mx.Right<{}>)).toBe(fixture);
        expect(fn).toHaveBeenCalledWith(valFix);
        done();
      }).catch(done);
    });
    it('should work for promise return value on left', (done) => {
      const fn: (v: any) => Promise<Mx.Monax<any, any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.right(fixture)));
      const valFix = {};
      const left = Mx.left(valFix);

      const exec = Mx.asyncFlatMap(fn);

      const prom: Promise<Mx.Monax<any, {}>> = exec(left);

      prom.then((result: Mx.Monax<any, {}>) => {
        expect(Mx.isRight(result)).toBe(false);
        expect(Mx.getLeft(result as Mx.Left<{}>)).toBe(valFix);
        expect(fn).not.toHaveBeenCalled();
        done();
      }).catch(done);
    });
    it('has aliases', () => {
      expect(Mx.bind).toBe(Mx.flatMap);
      expect(Mx.ifVal).toBe(Mx.flatMap);

      expect(Mx.asyncBind).toBe(Mx.asyncFlatMap);
      expect(Mx.asyncIfVal).toBe(Mx.asyncFlatMap);
    })
  });

  describe('leftFlatMap', () => {
    it('should flatMap a Left', () => {
      const fn: (e: any) => Mx.Monax<any, any> =
        jest.fn().mockImplementation(() => Mx.right(fixture));
      const valFix = {};
      const left = Mx.left(valFix);

      const result: Mx.Monax<any, {}> = Mx.leftFlatMap(fn, left);

      expect(Mx.isRight(result)).toBe(true);
      expect(Mx.getRight(result as Mx.Right<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('should flatMap a Left and return left', () => {
      const fn: (e: any) => Mx.Monax<any, any> =
        jest.fn().mockImplementation(() => Mx.left(fixture));
      const valFix = {};
      const left = Mx.left(valFix);

      const result: Mx.Monax<{}, any> = Mx.leftFlatMap(fn, left);

      expect(Mx.isLeft(result)).toBe(true);
      if (Mx.isLeft(result))
        expect(Mx.getLeft(result)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('should skip a Right', () => {
      const fn = jest.fn().mockImplementation(() => Mx.right({}));
      const right = Mx.right(fixture);

      const result: Mx.Monax<any, {}> = Mx.leftFlatMap(fn, right);

      expect(Mx.isLeft(result)).toBe(false);
      if (Mx.isRight(result))
        expect(Mx.getRight(result)).toBe(fixture);
      expect(fn).not.toHaveBeenCalled();
    });
    it('should be curried', () => {
      const fn: (v: any) => Mx.Monax<any, any> = jest.fn().mockImplementation(() => Mx.left(fixture));
      const valFix = {};
      const left = Mx.left(valFix);

      const exec = Mx.leftFlatMap(fn);
      const result: Mx.Monax<any, {}> = exec(left);

      expect(Mx.isLeft(result)).toBe(true);
      expect(Mx.getLeft(result as Mx.Left<{}>)).toBe(fixture);
      expect(fn).toHaveBeenCalledWith(valFix);
    });
    it('should work for promise return value', (done) => {
      const fn: (v: any) => Promise<Mx.Monax<any, any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.left(fixture)));
      const valFix = {};
      const left = Mx.left(valFix);

      const exec = Mx.asyncLeftFlatMap(fn);

      const prom: Promise<Mx.Monax<{}, any>> = exec(left);

      prom.then((result: Mx.Monax<{}, any>) => {
        expect(Mx.isLeft(result)).toBe(true);
        expect(Mx.getLeft(result as Mx.Left<{}>)).toBe(fixture);
        expect(fn).toHaveBeenCalledWith(valFix);
        done();
      }).catch(done);
    });
    it('should work for promise return value on right', (done) => {
      const fn: (v: any) => Promise<Mx.Monax<any, any>> =
        jest.fn().mockImplementation(() => Promise.resolve(Mx.right(fixture)));
      const valFix = {};
      const right = Mx.right(valFix);

      const exec = Mx.asyncLeftFlatMap(fn);

      const prom: Promise<Mx.Monax<any, {}>> = exec(right);

      prom.then((result: Mx.Monax<any, {}>) => {
        expect(Mx.isLeft(result)).toBe(false);
        expect(Mx.getRight(result as Mx.Right<{}>)).toBe(valFix);
        expect(fn).not.toHaveBeenCalled();
        done();
      }).catch(done);
    });
    it('has aliases', () => {
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
  describe('fork', () => {
    it('should fork a Right', () => {
      const vFn: (v: any) => void = jest.fn();
      const eFn: (v: any) => void = jest.fn();
      const valFix = {};
      const right = Mx.right(valFix);

      Mx.fork(vFn, eFn, right);

      expect(vFn).toHaveBeenCalledWith(valFix);
      expect(eFn).not.toHaveBeenCalled();
    });
    it('should fork a Left', () => {
      const vFn: (v: any) => void = jest.fn();
      const eFn: (v: any) => void = jest.fn();
      const valFix = {};
      const left = Mx.left(valFix);

      Mx.fork(vFn, eFn, left);

      expect(eFn).toHaveBeenCalledWith(valFix);
      expect(vFn).not.toHaveBeenCalled();
    });
  });
  describe('cata', () => {
    it('should cata a Right', () => {
      const vFn: (v: any) => Fix = jest.fn()
        .mockImplementation(() => fixture);
      const eFn: (v: any) => Fix = jest.fn();
      const valFix = {};
      const right = Mx.right(valFix);

      const result: {} = Mx.cata(vFn, eFn, right);

      expect(vFn).toHaveBeenCalledWith(valFix);
      expect(result).toBe(fixture);
      expect(eFn).not.toHaveBeenCalled();
    });
    it('should cata a Left', () => {
      const vFn: (v: any) => Fix = jest.fn();
      const eFn: (v: any) => Fix = jest.fn()
        .mockImplementation(() => fixture);
      const valFix = {};
      const left = Mx.left(valFix);

      const result: {} = Mx.cata(vFn, eFn, left);

      expect(eFn).toHaveBeenCalledWith(valFix);
      expect(result).toBe(fixture);
      expect(vFn).not.toHaveBeenCalled();
    });
    it('has aliases', () => {
      expect(Mx.ifValElse).toBe(Mx.cata);
    })
  });
});
