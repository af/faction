var utils = require('./utils')
var oa = utils.oa
var isPromise = utils.isPromise


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
            if (!action) return         // Follow up action may have been conditional
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
            return function handleMiddlewareAction(action) {
                // Don't handle non-faction actions:
                if (!action.meta || !action.meta.factionAsync) return next(action)

                // Don't re-process dispatched actions from this middleware:
                if (action.meta.isPending || action.payload) return next(action)

                var inputs = action.meta.inputs
                action.payload = action.meta._deferredHandler(inputs, store, creators)
                delete action.meta._deferredHandler

                // TODO: should flag an error here if service didn't return a Promise:
                if (!isPromise(action.payload)) return next(action)

                // Read the optional success/error callbacks from action.meta
                var _successCb = action.meta._successCb
                var _errorCb = action.meta._errorCb
                delete action.meta._successCb
                delete action.meta._errorCb

                // Dispatch a "pending" version of the action, so reducers
                // can set up any state related to loading:
                var pendingAction = oa(action, {
                    payload: null,
                    meta: oa(action.meta, { isPending: true })
                })
                dispatch(utils.addTimestamp(pendingAction))

                // When the Promise payload resolves, dispatch the success/error
                // action, and fire any follow up actions that were registered:
                action.payload.then(function(result) {
                    var successAction = oa(action, { payload: result })
                    dispatch(utils.addTimestamp(successAction))

                    if (typeof _successCb === 'function') {
                        handleFollowUp(_successCb(creators, successAction), 'chain')
                    }
                }, function(error) {
                    var errorAction = oa(action, { payload: error, error: true })
                    dispatch(utils.addTimestamp(errorAction))

                    if (typeof _errorCb === 'function') {
                        handleFollowUp(_errorCb(creators, errorAction), 'onError')
                    }
                }).catch(function(err) {
                    /* eslint-disable no-console */
                    // TODO: properly handle this (can happen if follow-up action fails)
                    console.log('Error while processing action:', err)
                    throw err
                })
            }
        }
    }
}
