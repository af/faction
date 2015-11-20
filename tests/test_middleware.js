var test = require('tape')
var sinon = require('sinon')
var faction = require('..')


var creator = function() {
    return {
        type: 'FOO',
        payload: Promise.resolve('hey'),
        meta: { _fromFactionService: true }
    }
}
var errorCreator = function() {
    return {
        type: 'FOO',
        payload: Promise.reject('boo'),
        meta: { _fromFactionService: true }
    }
}

test('Promise middleware for successful actions', function(t) {
    var fakeStore = { dispatch: sinon.spy() }
    var fakeNext = sinon.spy()
    var action = creator()
    var middleware = faction.makeMiddleware({})

    t.plan(7)
    middleware(fakeStore)(fakeNext)(action)
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
    var middleware = faction.makeMiddleware({})

    t.plan(8)
    middleware(fakeStore)(fakeNext)(action)
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
    var middleware = faction.makeMiddleware({})

    t.plan(2)
    middleware(fakeStore)(fakeNext)(action)
    setTimeout(function() {
        t.equal(fakeStore.dispatch.callCount, 0)
        t.equal(fakeNext.callCount, 1)
    }, 20)
})

