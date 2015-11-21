var test = require('tape')
var sinon = require('sinon')
var faction = require('..')


test('onSuccess action callbacks', function(t) {
    var fakeStore = { dispatch: sinon.spy() }
    var actions = faction.create({
        FOLLOW_UP: {},
        CHAINED: faction.useService(function() { return Promise.resolve('yo') })
                    .onSuccess(function(c) { return c.FOLLOW_UP({ x: 123 }) })
    })
    var middleware = faction.makeMiddleware(actions.creators)
    var action = actions.creators.CHAINED()

    t.plan(9)
    middleware(fakeStore)(function() {})(action)
    setTimeout(function() {
        t.equal(fakeStore.dispatch.callCount, 3)

        var firstAction = fakeStore.dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        var secondAction = fakeStore.dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'yo')

        var thirdAction = fakeStore.dispatch.thirdCall.args[0]
        t.strictEqual(thirdAction.type, 'FOLLOW_UP')
        t.strictEqual(thirdAction.meta.isPending, undefined)
        t.deepEqual(thirdAction.payload, { x: 123 })
    }, 20)
})

test('onError action callbacks', function(t) {
    var fakeStore = { dispatch: sinon.spy() }
    var actions = faction.create({
        FOLLOW_UP: {},
        CHAINED: faction.useService(function() { return Promise.reject('fail') })
                    .onError(function(c) { return c.FOLLOW_UP({ x: 123 }) })
    })
    var middleware = faction.makeMiddleware(actions.creators)
    var action = actions.creators.CHAINED()

    t.plan(9)
    middleware(fakeStore)(function() {})(action)
    setTimeout(function() {
        t.equal(fakeStore.dispatch.callCount, 3)

        var firstAction = fakeStore.dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        var secondAction = fakeStore.dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'fail')

        var thirdAction = fakeStore.dispatch.thirdCall.args[0]
        t.strictEqual(thirdAction.type, 'FOLLOW_UP')
        t.strictEqual(thirdAction.meta.isPending, undefined)
        t.deepEqual(thirdAction.payload, { x: 123 })
    }, 20)
})

