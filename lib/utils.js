// Jump through hoops to get a custom Error subclass
// See discussion on http://stackoverflow.com/q/783818
function ActionParamError(message) {
    this.message = message
    var error = new Error(this.message)
    this.stack = error.stack
}
ActionParamError.prototype = Object.create(Error.prototype)
ActionParamError.prototype.name = ActionParamError.name
ActionParamError.prototype.constructor = ActionParamError
exports.ActionParamError = ActionParamError

// Object.assign() shorthand
function oa(x, y) { return Object.assign({}, x, y) }
exports.oa = oa


exports.isPromise = function(x) {
    return x && typeof x.then === 'function'
}

/**
* Add a timestamp to an action object's as action.meta.timestamp.
* @arg {object} action - An action object
* @return {object} - A new action object that has meta.timestamp set
*/
exports.addTimestamp = function(action) {
    var ts = +(new Date)
    return oa(action, {
        meta: oa(action.meta, { timestamp: ts })
    })
}
