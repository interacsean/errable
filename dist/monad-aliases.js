'use strict';
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result['default'] = mod;
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
var Mx = __importStar(require('./index'));
exports.right = Mx.val;
exports.isRight = Mx.notErr;
exports.getRight = Mx.getVal;
exports.left = Mx.err;
exports.getLeft = Mx.getErr;
exports.isLeft = Mx.isErr;
exports.flatMap = Mx.ifNotErr;
exports.bind = Mx.ifNotErr;
exports.flatMapAsync = Mx.ifNotErrAsync;
exports.bindAsync = Mx.ifNotErrAsync;
exports.map = Mx.withNotErr;
exports.mapAsync = Mx.withNotErrAsync;
exports.leftFlatMap = Mx.ifErr;
exports.leftBind = Mx.ifErr;
exports.leftFlatMapAsync = Mx.ifErrAsync;
exports.leftBindAsync = Mx.ifErrAsync;
exports.leftMap = Mx.withErr;
exports.leftMapAsync = Mx.withErrAsync;
//# sourceMappingURL=monad-aliases.js.map
