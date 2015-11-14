;(function(global) {       // IIFE for legacy non-module usage
'use strict'


function _validate(argsHash, spec) {
    // validate argsHash against action spec, if one was given:
    if (spec) {
        var specKeys = Object.keys(spec)
        specKeys.forEach(function(k) {
            var validator = spec[k]
            // TODO: assign validated values to a cloned object?
            argsHash[k] = validator(argsHash[k])    // may throw ActionParamError
        })
    }
}


// Return an action creator function
//
// If a service function is given, the action's payload will be a Promise, which
// is returned from the service function.
//
// Otherwise the action creator is fully synchronous, and the Object literal
// passed in to it will be the action payload.
function _makeActionCreator(key, spec, service) {
    return function actionCreator(argsHash) {
        argsHash = argsHash || {}
        _validate(argsHash, spec)       // Will throw if validation fails

        var payload = argsHash          // Overridden for service case below
        if (service) {
            // The service function *must* return a Promise, or else we throw:
            var result = service(argsHash)
            if (!(result instanceof Promise)) throw new Error('Service did not return a Promise')
            else payload = result
        }

        var action = { type: key, payload: payload, meta: {} }

        // If action argument is an error object, follow the FSA convention:
        // TODO: skip validation for error case?
        if (argsHash instanceof Error) {
            action.error = true
            return action
        }

        return action
    }
}


function createFaction(actionSpecs, options) {
    var types = {}
    var creators = {}

    for (var key in actionSpecs) {
        types[key] = key

        var spec = actionSpecs[key]
        if (!spec) break
        else if (spec._service) {
            creators[key] = _makeActionCreator(key, spec._spec, spec._service)
        } else creators[key] = _makeActionCreator(key, spec)
    }

    return {
        types: Object.freeze(types),
        creators: Object.freeze(creators)
    }
}


// TODO: need redux middleware for this
function useService(service, argSpecs) {
    if (typeof service !== 'function') {
        throw new Error('First arg to useService must be a function, got: ' +
                        JSON.stringify(service))
    }

    return {
        _service: service,
        _spec: argSpecs
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
        if (typeof x === 'number' && !isNaN(x)) return x
        else throw new ActionParamError('Expected "' + x + '" to be a number')
    },

    boolean: function(x) {
        if (typeof x === 'boolean') return x
        else throw new ActionParamError('Expected "' + x + '" to be a boolean')
    },

    object: function(x) {
        if (typeof x === 'object' && x && !Array.isArray(x)) return x
        else throw new ActionParamError('Expected "' + x + '" to be an object')
    },

    array: function(x) {
        if (Array.isArray(x)) return x
        else throw new ActionParamError('Expected "' + x + '" to be an array')
    },
}

// Extra function to provide an default value for each type of built-in validator.
// This effectively makes the field optional.
// Example usage:
//      v.string.withDefault('hello')
function withDefault(defaultValue) {
    /* jshint validthis:true */
    var validatorFn = this
    return function(givenValue) {
        if (typeof givenValue === 'undefined') return defaultValue
        else return validatorFn(givenValue)
    }
}

// Add validation against an enum for any of the built-in validators
// Example usage:
//      v.number.enum([1, 2, 3], 1)
function withEnum(optionsArray, defaultValue) {
    /* jshint validthis:true */
    if (!Array.isArray(optionsArray)) throw new TypeError('enum() requires an array argument')
    var validatorFn = this
    var hasDefault = typeof defaultValue !== 'undefined'
    return function(givenValue) {
        var isValid = (optionsArray.indexOf(givenValue) !== -1)
        if (hasDefault && typeof givenValue === 'undefined') return defaultValue
        else if (!isValid) throw new ActionParamError(givenValue + ' is not in ' +
                                                 JSON.stringify(optionsArray))
        else return validatorFn(givenValue)
    }
}

for (var k in validators) {
    validators[k].withDefault = withDefault.bind(validators[k])
    validators[k].enum = withEnum.bind(validators[k])
}


var exports = {
    create: createFaction,
    useService: useService,
    validators: validators,
    ActionParamError: ActionParamError
}

// Export for CommonJS, or else add a global faction variable:
if (typeof(module) !== 'undefined') module.exports = exports
else global.faction = exports

}(this))
