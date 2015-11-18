var test = require('tape')
var sinon = require('sinon')
var faction = require('..')
require('es6-promise').polyfill()

var creator = function() {
    return { type: 'FOO', payload: Promise.resolve('hey'), meta: {} }
}
var errorCreator = function() {
    return { type: 'FOO', payload: Promise.reject('boo'), meta: {} }
}

test('Promise middleware for successful actions', function(t) {
    var fakeStore = { dispatch: sinon.spy() }
    var fakeNext = sinon.spy()
    var action = creator()

    t.plan(7)
    faction.middleware(fakeStore)(fakeNext)(action)
    setTimeout(function() {
        t.equal(fakeStore.dispatch.callCount, 2)
        t.equal(fakeNext.callCount, 0)

        var firstAction = fakeStore.dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        var secondAction = fakeStore.dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'hey')
    }, 20)
})

test('Promise middleware processes errors correctly', function(t) {
    var fakeStore = { dispatch: sinon.spy() }
    var fakeNext = sinon.spy()
    var action = errorCreator()

    t.plan(8)
    faction.middleware(fakeStore)(fakeNext)(action)
    setTimeout(function() {
        t.equal(fakeStore.dispatch.callCount, 2)
        t.equal(fakeNext.callCount, 0)

        var firstAction = fakeStore.dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        var secondAction = fakeStore.dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.error, true)
        t.strictEqual(secondAction.payload, 'boo')
    }, 20)
})

test('Promise middleware bypassed for non-async actions', function(t) {
    var fakeStore = { dispatch: sinon.spy() }
    var fakeNext = sinon.spy()
    var action = { type: 'SYNC', payload: { foo: 'bar' } }

    t.plan(2)
    faction.middleware(fakeStore)(fakeNext)(action)
    setTimeout(function() {
        t.equal(fakeStore.dispatch.callCount, 0)
        t.equal(fakeNext.callCount, 1)
    }, 20)
})

