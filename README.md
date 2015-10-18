# Faction

A [FSA](https://github.com/acdlite/flux-standard-action)-compatible library for
creating and managing Flux actions. Early WIP!

* Act as a single point of truth for action constants
* Export an actionCreator function for each action (named after the constant)
* Your constants and action creators are DRY and live in the same place
* Validate the arguments sent to each actionCreator


## Usage

**actions.js**
```
var v = faction.validators
var actionConstantSpecs = {
    ADD_TODO: { text: v.string },
    EDIT_TODO: { text: v.string },
    MARK_TODO: { isDone: v.boolean },
}

var actions = faction.create(actionConstantSpecs, options)

module.exports = actions
```

**app.js**
```
let { types, creators } = require('./actions')
types                               // => { ADD_TODO: 'ADD_TODO', EDIT_TODO: 'EDIT_TODO' ... }
creators.ADD_TODO({ text: 'hi' })   // => { type: 'ADD_TODO', payload: { text: 'hi' } }
creators.ADD_TODO()                 // => throws faction.ActionParamError
```

## License

MIT
