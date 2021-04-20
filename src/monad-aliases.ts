import * as Mx from './index';

export type Left<E> = Mx.Err<E>;
export type Right<E> = Mx.Val<E>;

export const right = Mx.val;
export const isRight = Mx.notErr;
export const getRight = Mx.getVal;

export const left = Mx.err;
export const getLeft = Mx.getErr;
export const isLeft = Mx.isErr;

export const flatMap = Mx.ifNotErr;
export const bind = Mx.ifNotErr;

export const flatMapAsync = Mx.ifNotErrAsync;
export const bindAsync = Mx.ifNotErrAsync;

export const map = Mx.withNotErr;
export const mapAsync = Mx.withNotErrAsync;

export const leftFlatMap = Mx.ifErr;
export const leftBind = Mx.ifErr;

export const leftFlatMapAsync = Mx.ifErrAsync;
export const leftBindAsync = Mx.ifErrAsync;

export const leftMap = Mx.withErr;

export const leftMapAsync = Mx.withErrAsync;
