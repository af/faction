/* eslint no-magic-numbers: 0 */
const faction = require('..')
const sinon = require('sinon')

// Test utility for processing an action through a fake store/middleware setup
exports.handleAction = (action, creators, cb) => {
    const fakeStore = {
        dispatch: sinon.spy(),
        getState: () => 'TESTSTATE'
    }
    const next = sinon.spy()
    const middleware = faction.makeMiddleware(creators)
    middleware(fakeStore)(next)(action)
    setTimeout(() => {
        cb(fakeStore.dispatch, next)
    }, 20)
}

