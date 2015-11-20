var utils = require('./utils')
var oa = function(x, y) {
    return Object.assign({}, x, y)
}

// Redux middleware for handling async actions from services
module.exports = function makeMiddleware(creators) {
    return function factionServiceMiddleware(store) {
        var dispatch = store.dispatch

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

                action.payload.then(function(result) {
                    dispatch(oa(action, { payload: result }))

                    if (typeof _successCb === 'function') {
                        dispatch(_successCb(creators, action))
                    }
                }).catch(function(error) {
                    dispatch(oa(action, { payload: error, error: true }))

                    if (typeof _errorCb === 'function') {
                        dispatch(_errorCb(creators, action))
                    }
                })
            }
        }
    }
}
