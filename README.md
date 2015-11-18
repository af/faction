# Faction

A [FSA](https://github.com/acdlite/flux-standard-action)-compatible library for
creating and managing Flux actions. Early WIP!

* Keep a single point of truth for action constants
* Optionally make an actionCreator function for each action (named after the constant)
* Co-locate your constants and action creators and keep them DRY
* Validate the arguments sent to each actionCreator


## Basic Usage

*Note: these examples use ES6/2015 for brevity, but faction will work in any ES5
environment (though you may need a Promise polyfill for async action creators).*

**actions.js**
```js
import faction, { validators } from 'faction'

const v = validators
const actions = faction.create({
    ADD_TODO:  { text: v.string },
    EDIT_TODO: { text: v.string },
    MARK_TODO: { isDone: v.boolean.withDefault(true) },
}

export default actions
```

**app.js**
```js
import { types, creators } from './actions'
types                               // => { ADD_TODO: 'ADD_TODO', EDIT_TODO: 'EDIT_TODO' ... }
creators.ADD_TODO({ text: 'hi' })   // => { type: 'ADD_TODO', payload: { text: 'hi' } }
creators.ADD_TODO()                 // => throws an error because of missing arg "text"
```


## Parameter validation

TODO


## Async Action Creators using Services

Faction supports asynchronous action creators using "services". A service is
simply a function that returns a Promise. Here's a simple example:

```js
import faction, { useService, validators } from 'faction'

// A service is any function that returns a Promise, as shown here using
// the `fetch()` API to get some data from the server:
const myService = ({ count }) => fetch(`/api/todos?limit=${count}`)

const v = validators
const actions = faction.create({
    FETCH_TODOS: useService(myService, { count: v.number })
}

actions.creators.FETCH_TODOS({ count: 5 })
// => { type: 'FETCH_TODOS',
//      payload: <Promise>,
//      meta: { ... }
//    }
```

Note that all of the asynchronous logic is isolated in a simple function that can
be tested (or mocked if need be) in complete isolation.

If you're using [redux](https://github.com/rackt/redux) you can then use the
[redux-promise](https://github.com/acdlite/redux-promise) middleware to painlessly
deal with these Promise action payloads.


## License

MIT
