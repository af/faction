# Faction

A [FSA](https://github.com/acdlite/flux-standard-action)-compatible library for
creating and managing Flux actions. Early WIP!

* Act as a single point of truth for action constants
* Export an actionCreator function for each action (named after the constant)
* Your constants and action creators live in the same place


## Usage

**actions.js**
```
var actionConstantSpecs = {
    ADD_TODO: null,
    EDIT_TODO: null
}

var actions = faction.create(actionConstantSpecs, options)

module.exports = actions
```

**app.js**
```
let { types, creators } = require('./actions')
types                               // => { ADD_TODO: 'ADD_TODO', EDIT_TODO: 'EDIT_TODO' ... }
creators.ADD_TODO({ text: 'hi' })   // => { type: 'ADD_TODO', payload: { text: 'hi' } }
```

## License

MIT
