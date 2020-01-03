# Errable

---

## *** Note this package is still in active development ***

_You may find the API will change, and the README has yet to be redefined from a previous
iteration_

--- 

Errable is a suite of functions to help logical flow and error control, while
maintaining type safety and encouraging consistent and flat programming.
 
 - Designed to be compatible in promise .then chains, or your favourite pipeline
 - Retains type information for error states (unlike rejected Promises)
 - Improved flow-control over promises (as per the Fluture library)
 - Interface uses simplified, untuitive terms (not so much with Fluture)

Errable reflects the philosophy of a monad library, without requiring you to
know what they are or how to use them; we've translated the
traditional mathemathical terms to an intuitive interface for easy onboarding.

## Installing

`npm i errable`

## Guide on use


Errable is most useful in typescript (flow defs coming, PRs welcome), where rejections / throwing
and catching errors in Promises is
[imprecise by design](https://github.com/Microsoft/TypeScript/issues/6283#issuecomment-167851788). 

### Using functionally:

All features are exported as standalone functions.

**It becomes most useful when used in a promise .then chain, composed or pipeline
(see further below)** but is shown here as a starting point:

**Simple but useless and naive example:**
```
// You can import individual functions and types:
import { Errable, val, err, withVal } from 'errable';

// or import all using the `* as` pattern:
import * as Ebl from 'errable';

const step1_numAsNumber = Errable<string, number> = Ebl.fromNull(
  // Create from a hypothetical function
  badFunctionReturnsNumberOrNullForError(someFunctionInput),
  // Create an error message if the function returned null or undefined
  "Number error: Internal error code",
);

// step1_numAsNumber is now either: number | Ebl.Err<string>

const step2_numAsString = Errable<string, string> = Ebl.ifVal(
  // this function will run if arg2 is not an error
  (num: number): string => `Thanks for choosing ${num.toLocaleString()}`,
  step1_numAsNumber,
);

const step3_numAsString = string = Ebl.ifErr(
  (err: Error) => "We couldn't retrieve your number",
  step2_numAsString,
);
```

*Why is this useful*? 

In traditional javascript, errors are generally thrown within a function, making it annoying to
continue exception handling within the same function scope, hard to enforce catching, act on the error
nearer to it's origin, and impossible to annotate your 
function to ensure that a consumer appropriately handles the exception.

If the caller of a function did not wrap the call in a `try`/`catch`,
the error may be caught further upstream, or not at all.  Additionally
caught errors are of unknown or coerced type.

Simply put, the program flow can not be easily expressed, nor could it be annotated or
determined by the type signatures.

Returning an expressive type (our Errable) solves this problem of multiple return types.

**A more practical example**

_(This example is in an Express app context but should be simple to follow even if you are not familiar with Express)_

```
import { fnReturnsNumberOrThrows } from 'some/module';
import { Errable }, * as Ebl from 'errable';

function checkout(res: Response) {
  // someAuthService doesn't use Errable (we can fix that later)
  const userId: number | undefined = someAuthService.currentUser();

  // The number here refers to an error status code
  const selectProduct: Errable<number, string> = getUsersProduct(userId);

  // this is unnecessary; will see a better way shortly:
  const selectedWithDesc = Ebl.withNotErr(
    (prodName: string): string => `Thank you for your order of ${prodName}`,
    selectedProduct,
  );

  Ebl.fork(
    // function to run if err
    (errCode: number) => {
      res.status(errCode);
      res.send('There was an error processing your order');
    },
    // function to run if val
    (prodName: string) => {
      res.send(prodName);
    },
    // (the data to evaluate)
    selectedWithDesc,
  )
}

```

### Chaining

**/!\ Warning: yet to be implemented!**

To chain multiple transformations together, use the utility function `chain`.

(This initalises a class that contains method aliases for the errable functions.)

```
/**
 * Let's rewrite the checkout route function
 */

function checkout(req: Request) {
  const userId: number | undefined = someAuthService.currentUser();

  // if userId is undefined, fromFalsey will result in an err of number 403
  Ebl.chain(Ebl.fromFalsey(userId, 403)) // current type of the chained errable: Errable<number, number> - userId or 403
    // pass the userId to selectProduct and use the result
    .ifNotErr(selectProduct) // current type: Errable<number, string> - 'foo' or 403
    // transform the val
    .withNotErr((prodName: string): string => `Thank you for your order of ${prodName}`)
    // respond accordingly
    .fork(
      (errCode: number) => {
        req.status(errCode);
        req.send('There was an error processing your order');
      },
      (prodName: string) => {
        req.send(prodName);
      },
    );
}
```

Note, `ifNotErr` is used with functions that return a Errable and can switch to the 'err' state (aliases `flatMap`, `bind`)

whereas `withNotErr` is used to apply transformations to the value only, and cannot switch to 'err' state (alias `map`)

### Using errable in a promise chain

This is where Errable separates itself from other monad libraries...

All functions are curried*, which is perfect for use within a promise chain of `.then`s

_*'Curried' means you can pass a single argument, and you can pass in one argument, and returned will be a
 function which takes the remainder of the arguments_

```
/**
 * In a real usecase, services/functions like someAuthService.currentUser and selectProduct often return Promises
 * as they are database driven.
 *
 * Let's assume they have been fully implemented as such:
 */
function someAuthService_currentUser(): Promise<number | undefined> { /*...*/ }
function selectProduct(userId: number): Promise<Errable<string, number>> { /*...*/ }

//* Our checkout function would now run like this:

function checkout(req: Request) {
  someAuthService_currentUser()
    .then(uid => Ebl.fromFalsey(uid, 403)) // dev thought, should the params be reversed for point-free?
    .then(ifVal(selectProduct)) // see the use of the curried function here by only passing the fn
    .then(withVal((prodName: string): string => `Thank you for your order of ${prodName}`))
    .then(fork(
      (errCode: number) => {
        req.status(errCode);
        req.send('There was an error processing your order');
      },
      (prodNmae: string) => {
        req.send(prodNmae);
      },
    ))
    // The `.catch` should now only have to deal with completely unexpected errors
    .catch((e: any) => {
      req.status(400);
      req.send('There was an unexpected error');
    });
}
```

### A note on withVal / map and functions that return promises

// todo: write better

use withAwaitedVal / awaitMap to get:

`Promise<Errable<any, YourResponse>>`

rather than:

`Errable<any, Promise<YourResponse>>`

## Recommended approach for higher level architecture when using Errable

- Don't throw errors or reject promises (you will lose type annotation in typescript).  Instead, return / resolve with a Ebl.err(yourError).
- Use the `Error` object for your `err` states.  You get a lot of meta data which is also extendable
- Do use Promise chains with the curried errable functions (higher order functions) to control the logic flow
- Don't go overboard with point-free programming or obsess with immediately returning fat-arrow functions.  If it's clearer to write out the function and define a few consts that are technically unnecessary but add context, that is ultimately more important.
- ***Leave obsesive optimisation code for compilers/transpilers***
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
map == withVal
awaitMap == withAwaitedVal
flatMap == bind == ifVal
asyncFlatMap == asyncBind == asyncIfVal
leftMap == errMap == withErr
awaitLeftMap == awaitErrMap == withAwaitedErr
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

## Reflections / roadmap

- Should the map function automatically await promises (i.e. should map's implementation be awaitMap?)
