var utils = require('./utils')
var ActionParamError = utils.ActionParamError
var oa = utils.oa

var base = {
    // This should be overridden by any "subclass"
    call: function(input) { return input },

    withDefault: function(value) {
        var newValidator = Object.create(this)
        newValidator._default = value
        return newValidator
    },

    enum: function(optionsArray) {
        if (!Array.isArray(optionsArray)) {
            throw new TypeError('enum() requires an array argument')
        }
        var newValidator = Object.create(this)
        newValidator._enum = optionsArray
        return newValidator
    },

    exec: function(input) {
        var value = typeof input === 'undefined' ? this._default : input
        value = this.call(value)
        if (Array.isArray(this._enum)) {
            var isValid = (this._enum.indexOf(value) !== -1)
            if (!isValid) {
                throw new ActionParamError(value + ' is not in ' +
                                           JSON.stringify(this._enum))
            }
        }
        return value
    }
}

function makeValidator(handler) {
    return oa(base, { call: handler })
}


// Built-in param validators for action payloads
// Each one is a function that returns the (possibly cleaned) argument value,
// or throws a ValidationError
var validators = {
    string: makeValidator(function(x) {
        if (typeof x !== 'string') {
            throw new ActionParamError('Expected "' + x + '" to be a string')
        }
        return x
    }),

    number: makeValidator(function(x) {
        if (typeof x !== 'number' || isNaN(x)) {
            throw new ActionParamError('Expected "' + x + '" to be a number')
        }
        return x
    }),

    boolean: makeValidator(function(x) {
        if (typeof x !== 'boolean') {
            throw new ActionParamError('Expected "' + x + '" to be a boolean')
        }
        return x
    }),

    object: makeValidator(function(x) {
        if (typeof x !== 'object' || !x || Array.isArray(x)) {
            throw new ActionParamError('Expected "' + x + '" to be an object')
        }
        return x
    }),

    array: makeValidator(function(x) {
        if (!Array.isArray(x)) {
            throw new ActionParamError('Expected "' + x + '" to be an array')
        }
        return x
    })
}

exports.validators = validators
exports.makeValidator = makeValidator
