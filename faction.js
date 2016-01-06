'use strict'

var utils = require('./lib/utils')


/**
* Validate an action creator's params with a schema declared in faction.create()
*
* @private
* @arg {object} paramsHash - The parameters passed in to an action creator
* @arg {object} spec - A hash of name -> {validator function} pairs
* @return {void}
* @throws {ActionParamError} - Thrown if any parameter fails validation
*/
function _validate(paramsHash, spec) {
    var specKeys = Object.keys(spec)
    specKeys.forEach(function(k) {
        var validator = spec[k]
        // TODO: assign validated values to a cloned object?
        try {
            paramsHash[k] = validator.exec(paramsHash[k])    // may throw ActionParamError
        } catch (err) {
            var msg = 'Validation failed for "' + k + '": ' + err.message
            throw new utils.ActionParamError(msg)
        }
    })
}


/**
* Return an action creator function
*
* If a service function is given, the action's payload will be a Promise, which
* is returned from the service function.
*
* Otherwise the action creator is fully synchronous, and the Object literal
* passed in to it will be the action payload.
*
* @private
* @arg {string}   type - The action's type constant
* @arg {object}   options - Options object
* @arg {object}     options.validators - Hash of validators to apply to inputs
* @arg {function}   options.service - Promise-returning function used for async logic
* @return {function} - An action creator function
*/
function _makeActionCreator(type, options) {
    return function actionCreator(inputParams) {
        var action = { type: type, meta: {} }    // payload is set below

        // If action argument is an error object, follow the FSA conventions:
        if (inputParams instanceof Error) {
            action.error = true
            action.payload = inputParams
            return action
        }

        var paramsHash = inputParams || {}

        // This will throw if validation fails:
        if (options.validators) _validate(paramsHash, options.validators)
        action.meta.inputs = JSON.parse(JSON.stringify(paramsHash))

        if (typeof options.service !== 'function') {
            action.payload = paramsHash
        } else {
            action.meta._fromFactionService = true
            action.meta._successCb = options._successCb
            action.meta._errorCb = options._errorCb

            if (options._executeInMiddleware) {
                action.meta._executeInMiddleware = true
                action.meta._deferredHandler = options.service
            } else {
                // The service function *must* return a Promise, or else we throw:
                var result = options.service(paramsHash)
                if (!utils.isPromise(result)) {
                    throw new Error('Service for ' + type + ' did not return a Promise')
                }
                action.payload = result
            }
        }

        return utils.addTimestamp(action)
    }
}


/**
* Register a service function for handling asynchronous actions.
* Returns an object that createFaction() will use to make the appropriate
* Promise-returning action creator
*
* @arg {boolean} deferExecution - If true, execute the service function in middleware.
* @arg {function} service - Async handler function (should return a Promise)
* @arg {object} validators - Optional hash of validators
* @return {object} - A config object for _makeActionCreator()
*/
function usePromise(deferExecution, service, validators) {
    if (typeof service !== 'function') {
        throw new Error('First arg must be a function, got: ' + JSON.stringify(service))
    }

    return {
        service: service,
        validators: validators,
        _executeInMiddleware: deferExecution,
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
        }
    }
}


function createFaction(definitionCallback) {
    var types = {}
    var creators = {}

    // Inject an object of helpers into the provided action definition callback:
    var actionSpecs = definitionCallback({
        asyncp: usePromise.bind(null, false),
        withStore: usePromise.bind(null, true),
        v: require('./lib/validators')
    })

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

var exports = {
    create: createFaction,
    makeMiddleware: require('./lib/middleware'),
    ActionParamError: utils.ActionParamError
}

// Export for CommonJS, or else add a global faction variable:
if (typeof module !== 'undefined') module.exports = exports
else if (typeof window === 'object') window.faction = exports
