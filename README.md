# Faction

A [FSA](https://github.com/acdlite/flux-standard-action)-compatible library for
creating and managing Flux actions. Early WIP!

* Keep a single point of truth for action constants
* Optionally make an actionCreator function for each action (named after the constant)
* Co-locate your constants and action creators and keep them DRY
* Validate the arguments sent to each actionCreator


## Usage

Note: these examples use ES6/2015 for brevity, but faction will work in any ES5
environment (though you may need a Promise polyfill for async action).

**actions.js**
```js
import { validators: v } from 'faction'

const actionConstantSpecs = {
    ADD_TODO:  { text: v.string },
    EDIT_TODO: { text: v.string },
    MARK_TODO: { isDone: v.boolean.withDefault(true) },
}

const actions = faction.create(actionConstantSpecs, options)

module.exports = actions
```

**app.js**
```js
let { types, creators } = require('./actions')
types                               // => { ADD_TODO: 'ADD_TODO', EDIT_TODO: 'EDIT_TODO' ... }
creators.ADD_TODO({ text: 'hi' })   // => { type: 'ADD_TODO', payload: { text: 'hi' } }
creators.ADD_TODO()                 // => throws faction.ActionParamError
```

## License

MIT
