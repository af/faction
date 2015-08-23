;(function(global) {       // IIFE for legacy non-module usage
'use strict'


function createFaction(actionSpecs, options) {
    var constants = {}
    var funcs = {}

    function makeActionCreator(key) {
        return function actionCreator(args) {
            // If action argument is an error object, follow the FSA convention:
            if (args instanceof Error) {
                return {
                    type: key,
                    payload: args,
                    error: true,
                    meta: {}
                }
            }

            return { type: key, payload: args, meta: {} }
        }
    }

    for (var key in actionSpecs) {
        constants[key] = key
        funcs[key] = makeActionCreator(key)
    }

    return {
        constants: Object.freeze(constants),
        funcs: Object.freeze(funcs)
    }
}

var exports = {
    create: createFaction
}


// Export for CommonJS, or else add a global faction variable:
if (typeof(module) !== 'undefined') module.exports = exports
else global.faction = exports

}(this))
