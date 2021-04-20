# Errable

---

**Errable** is a suite of functions to help conditional flow and dealing with exception states, while
maintaining type safety and encouraging consistent and flat programming.

- Designed to be compatible in promise .then chains, or your favourite functional pipeline (e.g. lodash / ramda)
- Retains type information for error states (unlike rejected Promises / throws)
- Improved flow-control over promises (as per the Fluture library)
- Interface uses simplified, intuitive terms (not so much with Fluture!)

**Errable** reflects the philosophy of a monad library, without requiring you to
know what the heck a monad is or how to use them.

### Rationale

In traditional javascript, errors are generally thrown within a function, necessitating the try/catch
pattern. This forces error handling (of an unknown error type) to happen in another block scope, removed
from the regular flow of your program.

As a standalone piece of code, if your module throws an error, it is impossible to annotate the type
of the error that is thrown, in order for any consumer to appropriately handle the exception state.

If the caller of a function did not wrap the call in a `try`/`catch`,
the error may be caught further upstream, or not at all. Additionally
caught errors are of unknown or coerced type.

Simply put, the program flow can not be easily expressed, nor could it be annotated or
determined by the type signatures.

Returning an union type, aka `Err<E> | T` (aliased as `Errable<E, T>`) solves this problem of multiple return types.

## Installing

`npm i errable`

### Importing

```
// You can import individual functions and types:
import { Errable, val, err, withVal } from 'errable';

// or import all using the `* as` pattern:
import * as E from 'errable';
```

## Usage guide

Errable is most useful in typescript (flow defs welcome), where rejections / throwing
and catching errors in Promises is
[imprecise by design](https://github.com/Microsoft/TypeScript/issues/6283#issuecomment-167851788).

### Concepts

There are three utility union types exported to represent when data may or may not be present:

```
type Optional<T> = undefined | T;

type Nullable<T> = null | T;

type Errable<E, T> = Err<E> | T;
```

The custom error class `Err<E>` allows you to store any data type inside an Error.  (Unlike the native javascript 
Error which can only store a string).

For example, you might write a function which returns either the successful data, or an error:

```
const ERRORS = { USER_NOT_FOUND: 'USER_NOT_FOUND' };
const usersDb: User[] = [...];

function getUserById(userId: number): Errable<string, User> {
  return usersDb[userId] !== undefined
    ? usersDb[userId]
    : E.err(ERRORS.USER_NOT_FOUND);
}
```

**errable** provides functions that can deal with this `Errable` union type elegantly.

**Errable functions become most useful when used in a promise .then chain
or a pipeline (see further below)** but some examples are included here, which show individual use for clarify...

#### Run a function if value is not undefined:

```
import * as E from 'errable';

const input: undefined | number = returnNumberOrUndefined();

const result: undefined | string = E.withNotUndefined(
  (n /* (type will be inferred as: number) */) => `Your number is: ${n}`,
  input,
);

if (E.notUndefined(result)) {
  console.log(result);
}
```

#### Create a custom Err with a message string when a variable is null:
```
const input: null | number = returnNumberOrNull();

const result: Errable<string, number> = E.fromNull(
  // Error message, if input is null:
  "No number could be found",
  input,
);

if (E.isErr(result)) {
  console.log(E.getErr(result)); // logs the error message
} else {
  console.log(`Your number was: ${result}`);
}
```

#### Recover from an error state:
```
const input: string | E.Err<string> = returnStringOrErrStr();

const result: string = E.recover(
  (e: string) => `An error occured: ${e}`,
  input,
);
```

These are all very trivial of course... let's shift gears

**A more practical example**:

All functions are curried*, which is perfect for use within a promise chain of `.then`s, or a pipeline.

_\*'Curried' means you can pass one argument, and returned will be a
function which takes the remainder of the arguments_

```
/**
 * Example for an express app route
 */

const ERROR_USER_NOT_FOUND = 403403;

function checkout(req: Request, res: Response) {
  const userId: number | undefined = someAuthService.currentUser();
  
  // E.g. using Ramda's pipe function
  R.pipe(
    () => userId,
    E.fromFalsey(ERROR_USER_NOT_FOUND), // Create an Err containing the number 403403 if userId is undefined
    E.ifNotErr(selectProductByUserId),
    E.withNotErr(
      function formatProductName(product: Product) {
        return `Thank you for your order of ${product.prodName}`
      },
    ),
    E.fork(
      (errCode: number) => {
        res.status(500);
        res.send(`There was an error processing your order: Internal error code ${errCode}`);
      },
      (productMessage: string) => {
        res.send(productMessage);
      },
    ),
  )();
}
```

_Explanation:_

Function `selectProductByUserId` will only run if there is a userId, and `formatProductName` will only run
if `selectProductByUserId` returns a valid Product.

The final fork deals with both the error case, and the success case.

---
### The difference between `if` and `with` in errable functions

`ifNotErr` is used to run functions that could return an Errable (monad aliases `flatMap`, `bind`)
```
function ifNotErr<E, T, R>(
  fn: (v: T) => Errable<E, R>,
  m: Errable<E, T>,
): Errable<E, R>

// Note the `fn` returns Errable<E, R>
```

whereas `withNotErr` is used to run functions which cannot fail (monad alias `map`)

```
function withNotErr<E, T, R>(
  fn: (v: T) => R,
  m: Errable<E, T>,
): Errable<E, R>;

// Note the `fn` can only return R
```

### Using Errable in a promise chain

This is where Errable separates itself from other monad libraries.

All conditional-flow functions (like `ifErr`, `ifNotUndefined`) have asynchronous versions, which
will await the result of the Promise.

```
/**
 * In a real usecase, services/functions like someAuthService.currentUser and
 * selectProductByUserId return Promises because they are database driven.
 *
 * Let's assume they have been fully implemented as such:
 */
function someAuthService_currentUser(): Promise<number | undefined>;
function selectProductByUserId(userId: number): Promise<Errable<number, Product>>;

const ERROR_USER_NOT_FOUND = 403403;

//* Our checkout function would now run like this:

function checkout(req: Request) {
  someAuthService_currentUser()
    .then(E.fromFalsey(ERROR_USER_NOT_FOUND))
    // Note the use of async version `ifNotErrAsync`, to correctly handle returned promise
    .then(E.ifNotErrAsync(selectProductByUserId))
    .then(E.withNotErr(
      function formatProductName(product: Product) {
        return `Thank you for your order of ${product.prodName}`
      },
    )
    .then(E.fork(
      (errCode: number) => {
        res.status(500);
        res.send(`There was an error processing your order: Internal error code ${errCode}`);
      },
      (productMessage: string) => {
        res.send(productMessage);
      },
    ))
    // The `.catch` should now only have to deal with completely unexpected thrown errors
    .catch((e: any) => {
      req.status(400);
      req.send('There was an unexpected error');
    });
}
```

---

## API Documentation

#### Creator functions

Functions to create special Errable types

### `function err(_errorValue_: E): Err<E>`

Factory function to create an `Err<E>`

### `function val(_value_: T): T`

Just returns what you pass in (identity function)

### `function fromNull(_errorFallbackIfNull_: E, _value_: T | null): Errable<E, T>`

Factory function to create an Errable, creating an Err of the passed fallback value when variable is null

### `function fromFalsey(_errorFallbackIfFalsey_: E, _value_: T | null): Errable<E, T>`

As per fromNull, but creates `Err<E>` when the variable is undefined, null, false, or 0

### `function fromPromise(_promise_: Promise<T>): Promise<Errable<any, T>>`

Create an Errable from a Promise.  If the passed promise is rejected, the function
will promise.resolve an Err containing the rejected value.  However, doing this cannot 
guarantee the type, as rejected promises are untyped.

Note the Errable is returned, wrapped in a Promise, since it must wait to resolve/reject.

---

#### Evaluation functions

These functions evaluate the state of the special Errable types

### `function isVal(_ebl_: Errable<any, T> | Nullable<T> | Optional<T>): boolean`

A typeguard function to check if the given variable is of type T 

### `function isNotErr(_ebl_: Errable<any, T>): boolean`
### `function isNotUndefined(_onl_: Optional<T>): boolean`
### `function isNotNull(_nbl_: Nullable<T>): boolean`

Typeguard functions to check if the given variable is of type T (not an Err, undefined or null, respectively)

### `function isErr(_ebl_: Errable<E>): boolean`
### `function isUndefined(_onl_: Optional<any>): boolean`
### `function isNull(_nbl_: Nullable<any>): boolean`

Typeguard function to check if given variable IS Err<E>, undefined, or null, respectively

#### Conditional flow functions

Functions to use on special Errable types to determine whether to execute functions

### `function ifNotErr<E, T, R>(_fn_: (v: T) => Errable<E, R>, _ebl_: Errable<E, T>): Errable<E, R>`

With a variable `Errable<E, T>` (`Err<E> | T`), run the given function if the variable is not an `Err`

The function can return a concrete type, `R`, or an `Err<E>`; i.e. it may return a different type 
to the original variable, or an error.

### `function withNotErr<E, T, R>(_fn_: (v: T) => R, _ebl_: Errable<E, T>): Errable<E, R>`

With a variable `Errable<E, T>` (`Err<E> | T`), run the given function if the variable is not an `Err`

The function should not be able to fail in transforming type `T -> R`.

_Note: the return type of `withNotErr` is still `Errable<E, R>`, because if the variable was initially an `Err<E>`,
it will remain an `Err<E>`._

### `function ifNotNull<T, R>(_fn_: (v: T) => Nullable<R>, _nbl_: Nullable<T>): Nullable<R>`

With a variable `Nullable<T>` (`null | T`), run the given function if the variable is not null

### `function withNotNull<T, R>(_fn_: (v: T) => R, _nbl_: Nullable<T>): Nullable<R>`

With a variable `Nullable<T>` (`null | T`), run the given function if the variable is not null

### `function ifNotUndefined<T, R>(_fn_: (v: T) => Optional<R>, _onl_: Optional<T>): Optional<R>`

With a variable `Optional<T>` (`undefined | T`), run the given function if the variable is not undefined

### `function withNotUndefined<T, R>(_fn_: (v: T) => R, _onl_: Optional<T>): Optional<R>`

With a variable `Optional<T>` (`undefined | T`), run the given function if the variable is not undefined

### `function ifErr<E, T, F>(_fn_: (e: E) => Errable<F, T>, _ebl_: Errable<E, T>): Errable<F, T>`

With a variable `Errable<E, T>` (`Err<E> | T`), run the given function if the variable IS an `Err`

### `function withErr<E, T, F>(_fn_: (e: E) => F, _ebl_: Errable<E, T>): Errable<F, T>`

With a variable `Errable<E, T>` (`Err<E> | T`), run the given function if the variable IS an `Err`

Note: The returned value of the function will automatically be wrapped in an Err container

### `function recover<E, T>(_fn_: (e: E) => T, _ebl_: Errable<E, T>): T`

With a variable `Errable<T>` (`Err<E> | T`), run the given function if the variable is an Err.

Note: The function must return a `T`; the same type as if the variable were not an Err.

### `function ifUndefined<T, R>(_fn_: () => Optional<R>, _onl_: Optional<T>): Optional<R>`

With a variable `Optional<T>` (`undefined | T`), run the given function if the variable IS undefined

### `function recoverUndefined<T>(_fn_: () => T, _onl_: Optional<T>): T`

With a variable `Optional<T>` (`undefined | T`), run the given function if the variable is undefined.

Note: The function must return a `T`; the same type as if the variable were not undefined.

### `function ifNull<T, R>(_fn_: () => Nullable<R>, _onl_: Nullable<T>): Nullable<R>`

With a variable `Nullable<T>` (`null | T`), run the given function if the variable IS null

### `function recoverNull<T>(_fn_: () => T, _nbl_: Nullable<T>): T`

With a variable `Nullable<T>` (`null | T`), run the given function if the variable is null.

Note: The function must return a `T`; the same type as if the variable were not null.

### `function reconcile<E, T, R>(vFn: (v: T) => R, eFn: (e: E) => R, ebl: Errable<E, T>): R`

With an `Errable<E, T>` run one of two functions, depending if the Errable is an `Err` of if it is a `T`.

Each function should return a consistent type (`R` – the returned type `R` can be the same as type `T`, or
it can be a new type).

## Recommended approach for higher level architecture when using Errable

- Don't throw errors or reject promises (you will lose type annotation in typescript). Instead, return / resolve with a Ebl.err(yourError).
- Do use Promise chains with the curried errable functions to control the logic flow
- Don't go overboard with point-free programming or obsess with one-liner fat-arrow functions. If it's clearer to write out the function and define a few consts that are technically unnecessary but add context and self-document the procedure, that is ultimately more important.
- **_Leave obsessive code optimisation for compilers/transpilers_**
- Do: remember to `.catch` for unexpected exceptions

## Monad aliases

Errable has traditional monad-like aliases for all functions:

**Monad constructors**

```
right == val
left == err
fromPromise (no aliases)
fromNull (no aliases)
fromFalsey (no aliases)
```

**Monad transformation functions**

```
map == withVal | withNotErr
awaitMap == withValAsync | withNotErrAsync
flatMap == bind == ifVal
asyncFlatMap == asyncBind == ifValAsync | ifNotErrAsync
leftMap == errMap == withErr
awaitLeftMap == awaitErrMap == withErrAsync
leftFlatMap == leftBind == errFlatMap == errBind == ifErr
asyncLeftFlatMap == asyncLeftBind == asyncErrFlatMap == asyncErrBind == asyncIfErr
// cata == reconcile
```

**Utilities**

```
isRight == isVal
isLeft == isErr

// dev note: consider removing getRight and getLeft
getRight == getVal
getLeft == getErr
//tap == peek
```
