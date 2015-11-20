;(function(global) {       // IIFE for legacy non-module usage
'use strict'

var utils = require('./lib/utils')


// Validate the arguments passed in to an action creator against the schema
// that is declared in faction.create()
function _validate(paramsHash, spec) {
    var specKeys = Object.keys(spec)
    specKeys.forEach(function(k) {
        var validator = spec[k]
        // TODO: assign validated values to a cloned object?
        paramsHash[k] = validator(paramsHash[k])    // may throw ActionParamError
    })
}


// Return an action creator function
//
// If a service function is given, the action's payload will be a Promise, which
// is returned from the service function.
//
// Otherwise the action creator is fully synchronous, and the Object literal
// passed in to it will be the action payload.
function _makeActionCreator(type, options) {
    return function actionCreator(paramsHash) {
        var action = { type: type, meta: {} }    // payload is set below

        // If action argument is an error object, follow the FSA conventions:
        if (paramsHash instanceof Error) {
            action.error = true
            action.payload = paramsHash
            return action
        }

        paramsHash = paramsHash || {}

        // This will throw if validation fails:
        if (options.validators) _validate(paramsHash, options.validators)

        if (typeof options.service === 'function') {
            // The service function *must* return a Promise, or else we throw:
            var result = options.service(paramsHash)
            if (!utils.isPromise(result)) {
                throw new Error('Service for ' + type + ' did not return a Promise')
            }

            action.meta._fromFactionService = true
            action.meta._successCb = options._successCb
            action.meta._errorCb = options._errorCb

            action.payload = result
        } else {
            action.payload = paramsHash
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
        else if (spec.service) {
            creators[key] = _makeActionCreator(key, spec)
        } else creators[key] = _makeActionCreator(key, { validators: spec })
    }

    return {
        types: Object.freeze(types),
        creators: Object.freeze(creators)
    }
}


// Register a service function for handling asynchronous actions.
// Returns an object that createFaction() will use to make the appropriate
// Promise-returning action creator
function useService(service, argSpecs) {
    if (typeof service !== 'function') {
        throw new Error('First arg to useService must be a function, got: ' +
                        JSON.stringify(service))
    }

    return {
        service: service,
        validators: argSpecs,
        _successCb: null,
        _errorCb: null,
        onSuccess: function(cb) {
            if (typeof cb !== 'function') throw new Error('onSuccess takes a function')
            this._successCb = cb
            return this
        },
        onError: function(cb) {
            if (typeof cb !== 'function') throw new Error('onError takes a function')
            this._errorCb = cb
            return this
        },
    }
}


var exports = {
    create: createFaction,
    useService: useService,
    v: require('./lib/validators'),
    makeMiddleware: require('./lib/middleware'),
    ActionParamError: utils.ActionParamError
}

// Export for CommonJS, or else add a global faction variable:
if (typeof(module) !== 'undefined') module.exports = exports
else global.faction = exports

}(this))
