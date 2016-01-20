# Faction [![Build Status](https://secure.travis-ci.org/af/faction.png)](http://travis-ci.org/af/faction)

Utilities and conventions for managing Redux (or Flux) actions.

* Co-locate your action types and action creators and keep them DRY
* Optionally make an actionCreator function for each action type
* Automatically dispatch follow-up actions when your async actions complete
* Validate arguments sent to each actionCreator
* [FSA](https://github.com/acdlite/flux-standard-action)-compatible


## Basic Usage

*Note: these examples use ES6/2015 for brevity, but faction will work in any ES5
environment (though you will need `Promise` & `Object.assign` polyfills for async
action creators).*

Define your actions using `faction.create()`, which transforms your declarative
action definitions into action types and action creators:

**actions.js**
```js
import faction from 'faction'

const actions = faction.create(({ v }) => ({
    ADD_TODO:  { text: v.string },
    EDIT_TODO: { text: v.string },
    MARK_TODO: { isDone: v.boolean.withDefault(true) },
})

export const types = actions.types  // => { ADD_TODO: 'ADD_TODO', EDIT_TODO: 'EDIT_TODO' ... }
export const creators = actions.creators
```

Each action creator made via `faction.create()` expects a single object argument:

**app.js**
```js
import { creators } from './actions'
creators.ADD_TODO({ text: 'hi' })   // => { type: 'ADD_TODO', payload: { text: 'hi' } }
creators.ADD_TODO()                 // => throws an error because of missing arg "text"
```


## Parameter validation

Faction comes with an optional set of utilities for validating the arguments to
your action creators. This can be very handy for tracking down bugs in development,
similar to how React's `propTypes` work. Here's a contrived example showing use of
all the built-in validators:

```js
import faction from 'faction'

const actions = faction.create(({ v }) => ({
    ADD_TODO:  {
        text:       v.string,
        isDone:     v.boolean,
        priority:   v.number,
        tags:       v.array,
        metadata:   v.object,

        // There are two chainable add-ons that work with all built-in validators:
        category:   v.string.enum(['WORK', 'PERSONAL']),
        reminder:   v.boolean.withDefault(true),
    },
})
```

By default, these validators throw an error when an input fails validation. This
behaviour will soon be configurable (feedback welcome!).


## Async action creators using `launch()`

Faction supports asynchronous action creators using "services". A service is
simply a function that returns a Promise. Here's a simple example:

```js
import faction from 'faction'

// `launch()` wraps any function that returns a Promise, as shown here using
// the `fetch()` API to get some data from the server:
const fetchTodos = ({ count }) => fetch(`/api/todos?limit=${count}`)

const actions = faction.create(({ launch, v }) => ({
    FETCH_TODOS: launch(fetchTodos, { count: v.number })
}

actions.creators.FETCH_TODOS({ count: 5 })
// => { type: 'FETCH_TODOS',
//      payload: <Promise>,
//      meta: { ... }
//    }
```

Note that your app's asynchronous logic is isolated in simple functions that can
be tested (or mocked if need be) in complete isolation.


## Redux middleware for async actions

If you're using [redux](https://github.com/rackt/redux) you can then use faction's
built-in middleware to painlessly deal with these Promise action payloads. In the
preceding async action example, this middleware will dispatch two separate actions
to the store as follows:

First it will dispatch a "pending" action (with the same `type`), indicating that
the asynchronous operation has begun. Note that `action.meta.isPending` is `true`:
```js
{ type: 'FETCH_TODOS',
  payload: null,
  meta: { isPending: true, ... }
}
```

When the Promise resolves, its value will form the payload of the second
action that is dispatched from the middleware (again with the same `type`):
```js
{ type: 'FETCH_TODOS',
  payload: <Promise resolution value>,
  meta: { ... }
}
```

To set up the faction middleware, use `faction.makeMiddleware`, optionally
passing it your action creators if you want to use Follow-up actions (explained
in the next section):

```js
import { createStore, applyMiddleware } from 'redux'
import faction from 'faction'
import { creators } from './actions'

const createStoreWithMiddleware = applyMiddleware(
    faction.makeMiddleware(creators)
)(createStore)
const store = createStoreWithMiddleware(myReducer)
```


## Follow-up actions

Sometimes you will want to trigger another action when an async action completes.
For example, after a user logs in successfully, you may want to fetch their profile
information in a separate request. While you can do this by writing a longer async
action creator, it's sometimes nicer to handle this case in a more declarative way.
Faction lets you chain `onSuccess(cb)` and `onError(cb)` after `launch()` to
handle these cases:

```js
const actions = faction.create(({ launch, v } => ({
    FETCH_PROFILE: launch(fetchProfile),
    LOGIN_ATTEMPT: launch(loginFn, { username: v.string, password: v.string })
                      .onSuccess((creators, action) => creators.FETCH_PROFILE())
                      .onError((creators, action) => creators.DO_SOMETHING())
})
```

Note that the return value of the onSuccess callback must be an action object
(or an array of actions), which will then be dispatched (and run through middleware).


## Meta fields

Faction autmatically adds some helpful info to each action’s `meta` object:

* `action.meta.timestamp` - a Unix timestamp for when the action was dispatched
* `action.meta.inputs` - a copy of the input parameters for the action creator


## Running tests

```
npm test
```

Note that you'll need Node 4.x or above, since some ES6 features are used in the tests.
You can also check code coverage with `npm coverage`


## License

MIT
