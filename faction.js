;(function(global) {       // IIFE for legacy non-module usage
'use strict'


function createFaction(actionSpecs, options) {
    var types = {}
    var creators = {}

    function makeActionCreator(key, spec) {
        return function actionCreator(args) {
            // TODO: validate args against spec here
            var action = { type: key, payload: args, meta: {} }

            // If action argument is an error object, follow the FSA convention:
            if (args instanceof Error) {
                action.error = true
                return action
            }

            return action
        }
    }

    for (var key in actionSpecs) {
        types[key] = key
        creators[key] = makeActionCreator(key, actionSpecs[key])
    }

    return {
        types: Object.freeze(types),
        creators: Object.freeze(creators)
    }
}


// Jump through hoops to get a custom Error subclass
// See discussion on http://stackoverflow.com/q/783818
function ActionParamError(message) {
    this.message = message
    var error = new Error(this.message)
    this.stack = error.stack
}
ActionParamError.prototype = Object.create(Error.prototype)
ActionParamError.prototype.name = ActionParamError.name
ActionParamError.prototype.constructor = ActionParamError


// Built-in param validators for action payloads
// Each one is a function that returns the (possibly cleaned) argument value,
// or throws a ValidationError
var validators = {
    string: function(x) {
        if (typeof x === 'string') return x
        else throw new ActionParamError('Expected "' + x + '" to be a string')
    },

    number: function(x) {
        if (typeof x === 'number') return x
        else throw new ActionParamError('Expected "' + x + '" to be a number')
    },

    boolean: function(x) {
        if (typeof x === 'boolean') return x
        else throw new ActionParamError('Expected "' + x + '" to be a boolean')
    },

    array: function(x) {
        if (Array.isArray(x)) return x
        else throw new ActionParamError('Expected "' + x + '" to be an array')
    },
}

var exports = {
    create: createFaction,
    validators: validators
}


// Export for CommonJS, or else add a global faction variable:
if (typeof(module) !== 'undefined') module.exports = exports
else global.faction = exports

}(this))
