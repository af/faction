;(function(global) {       // IIFE for legacy non-module usage
'use strict'


function createFaction(actionSpecs, options) {
    var types = {}
    var creators = {}

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
        types[key] = key
        creators[key] = makeActionCreator(key)
    }

    return {
        types: Object.freeze(types),
        creators: Object.freeze(creators)
    }
}

var exports = {
    create: createFaction
}


// Export for CommonJS, or else add a global faction variable:
if (typeof(module) !== 'undefined') module.exports = exports
else global.faction = exports

}(this))
