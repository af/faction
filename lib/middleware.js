var utils = require('./utils')

// Object.assign() shorthand
function oa(x, y) { return Object.assign({}, x, y) }


/**
* Create Redux middleware for handling async actions
* @arg {object} creators - A {type} -> {action creator} hash
* @return {function} - Redux middleware function
*/
module.exports = function makeMiddleware(creators) {
    return function factionServiceMiddleware(store) {
        var dispatch = store.dispatch

        // Takes an action (or array of them); verifies, and dispatches them
        function handleFollowUp(action, contextName) {
            var isMulti = Array.isArray(action)
            var actionList = (isMulti ? action : [action])
            actionList.forEach(function(act) {
                var isValid = (act && act.type && act.meta)
                if (!isValid) {
                    throw new Error(contextName + ' callback should return action(s)')
                }
                dispatch(act)
            })
        }

        return function(next) {
            return function(action) {
                if (!action.meta || !action.meta._fromFactionService) return next(action)
                if (!utils.isPromise(action.payload)) return next(action)

                // Read the optional success/error callbacks from action.meta
                var _successCb = action.meta._successCb
                var _errorCb = action.meta._errorCb
                delete action.meta._successCb
                delete action.meta._errorCb

                // Dispatch a "pending" version of the action, so reducers
                // can set up any state related to loading:
                dispatch(oa(action, {
                    payload: null,
                    meta: oa(action.meta, { isPending: true })
                }))

                // When the Promise payload resolves, dispatch the success/error
                // action, and fire any follow up actions that were registered:
                action.payload.then(function(result) {
                    dispatch(oa(action, { payload: result }))

                    if (typeof _successCb === 'function') {
                        handleFollowUp(_successCb(creators, action), 'onSuccess')
                    }
                }).catch(function(error) {
                    dispatch(oa(action, { payload: error, error: true }))

                    if (typeof _errorCb === 'function') {
                        handleFollowUp(_errorCb(creators, action), 'onError')
                    }
                })
            }
        }
    }
}
