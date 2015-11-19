var ActionParamError = require('./utils').ActionParamError

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

module.exports = validators
