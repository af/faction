var utils = require('./utils')
var oa = function(x, y) {
    return Object.assign({}, x, y)
}

// Redux middleware for handling async actions from services
module.exports = function factionServiceMiddleware(store) {
    var dispatch = store.dispatch
    return function(next) {
        return function(action) {
            if (!utils.isPromise(action.payload)) return next(action)

            // Dispatch a "pending" version of the action, so reducers
            // can set up any state related to loading:
            dispatch(oa(action, {
                payload: null,
                meta: oa(action.meta, { isPending: true })
            }))

            action.payload.then(function(result) {
                dispatch(oa(action, { payload: result }))
            }).catch(function(error) {
                dispatch(oa(action, { payload: error, error: true }))
            })
        }
    }
}
