/* eslint no-magic-numbers: 0 */
var test = require('tape')
var sinon = require('sinon')
var faction = require('..')


var creator = () => ({
    type: 'FOO',
    payload: Promise.resolve('hey'),
    meta: { _fromFactionService: true }
})

var errorCreator = () => ({
    type: 'FOO',
    payload: Promise.reject('boo'),
    meta: { _fromFactionService: true }
})

test('Promise middleware for successful actions', (t) => {
    var testStartTime = +(new Date)
    var fakeStore = { dispatch: sinon.spy() }
    var fakeNext = sinon.spy()
    var action = creator()
    var middleware = faction.makeMiddleware({})

    t.plan(14)
    middleware(fakeStore)(fakeNext)(action)
    setTimeout(() => {
        t.equal(fakeStore.dispatch.callCount, 2)
        t.equal(fakeNext.callCount, 0)

        var firstAction = fakeStore.dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        // Check action.meta.timestamp:
        t.equal(typeof firstAction.meta.timestamp, 'number')
        t.ok(firstAction.meta.timestamp <= +(new Date))
        t.ok(firstAction.meta.timestamp >= testStartTime)

        var secondAction = fakeStore.dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'hey')

        // Check second timetamp:
        t.equal(typeof secondAction.meta.timestamp, 'number')
        t.ok(secondAction.meta.timestamp <= +(new Date))
        t.ok(secondAction.meta.timestamp >= testStartTime)
        t.ok(secondAction.meta.timestamp >= firstAction.meta.timestamp)
    }, 20)
})

test('Promise middleware processes errors correctly', (t) => {
    var testStartTime = +(new Date)
    var fakeStore = { dispatch: sinon.spy() }
    var fakeNext = sinon.spy()
    var action = errorCreator()
    var middleware = faction.makeMiddleware({})

    t.plan(15)
    middleware(fakeStore)(fakeNext)(action)
    setTimeout(() => {
        t.equal(fakeStore.dispatch.callCount, 2)
        t.equal(fakeNext.callCount, 0)

        var firstAction = fakeStore.dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        // Check action.meta.timestamp:
        t.equal(typeof firstAction.meta.timestamp, 'number')
        t.ok(firstAction.meta.timestamp <= +(new Date))
        t.ok(firstAction.meta.timestamp >= testStartTime)

        var secondAction = fakeStore.dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.error, true)
        t.strictEqual(secondAction.payload, 'boo')

        // Check second timetamp:
        t.equal(typeof secondAction.meta.timestamp, 'number')
        t.ok(secondAction.meta.timestamp <= +(new Date))
        t.ok(secondAction.meta.timestamp >= testStartTime)
        t.ok(secondAction.meta.timestamp >= firstAction.meta.timestamp)
    }, 20)
})

test('Promise middleware bypassed for non-async actions', (t) => {
    var fakeStore = { dispatch: sinon.spy() }
    var fakeNext = sinon.spy()
    var action = { type: 'SYNC', payload: { foo: 'bar' } }
    var middleware = faction.makeMiddleware({})

    t.plan(2)
    middleware(fakeStore)(fakeNext)(action)
    setTimeout(() => {
        t.equal(fakeStore.dispatch.callCount, 0)
        t.equal(fakeNext.callCount, 1)
    }, 20)
})
