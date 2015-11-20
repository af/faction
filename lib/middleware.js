var utils = require('./utils')


function oa(x, y) { return Object.assign({}, x, y) }

function verifyAction(action, sourceName) {
    var isValid = (action && action.type && action.meta)
    if (!isValid) throw new Error((sourceName || 'Argument') + ' should be an action')
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
                        var followUpAction = _successCb(creators, action)
                        verifyAction(followUpAction, 'onSuccess cb return value')

                        dispatch(followUpAction)
                    }
                }).catch(function(error) {
                    dispatch(oa(action, { payload: error, error: true }))

                    if (typeof _errorCb === 'function') {
                        var followUpAction = _errorCb(creators, action)
                        verifyAction(followUpAction, 'onError cb return value')

                        dispatch(followUpAction)
                    }
                })
            }
        }
    }
}
