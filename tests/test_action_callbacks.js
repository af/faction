var test = require('tape')
var sinon = require('sinon')
var faction = require('..')


test('onSuccess action callbacks', (t) => {
    var fakeStore = { dispatch: sinon.spy() }
    var actions = faction.create({
        FOLLOW_UP: {},
        CHAINED: faction.useService(() => Promise.resolve('yo'))
                    .onSuccess((c) => c.FOLLOW_UP({ x: 123 }))
    })
    var middleware = faction.makeMiddleware(actions.creators)
    var action = actions.creators.CHAINED()

    t.plan(9)
    middleware(fakeStore)(() => {})(action)
    setTimeout(() => {
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

test('onError action callbacks', (t) => {
    var fakeStore = { dispatch: sinon.spy() }
    var actions = faction.create({
        FOLLOW_UP: {},
        CHAINED: faction.useService(() => Promise.reject('fail'))
                    .onError((c) => c.FOLLOW_UP({ x: 123 }))
    })
    var middleware = faction.makeMiddleware(actions.creators)
    var action = actions.creators.CHAINED()

    t.plan(9)
    middleware(fakeStore)(() => {})(action)
    setTimeout(() => {
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

test('dispatching multiple follow-up actions by returning an array', (t) => {
    var fakeStore = { dispatch: sinon.spy() }
    var actions = faction.create({
        FOLLOW_UP: {},
        ANOTHER_ONE: {},
        CHAINED: faction.useService(() => Promise.resolve('ok'))
                    .onSuccess((c) => [
                        c.FOLLOW_UP({ x: 123 }),
                        c.ANOTHER_ONE({ x: 123 })
                    ])
    })
    var middleware = faction.makeMiddleware(actions.creators)
    var action = actions.creators.CHAINED()

    t.plan(12)
    middleware(fakeStore)(() => {})(action)
    setTimeout(() => {
        t.equal(fakeStore.dispatch.callCount, 4)

        var firstAction = fakeStore.dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        var secondAction = fakeStore.dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'ok')

        var thirdAction = fakeStore.dispatch.thirdCall.args[0]
        t.strictEqual(thirdAction.type, 'FOLLOW_UP')
        t.strictEqual(thirdAction.meta.isPending, undefined)
        t.deepEqual(thirdAction.payload, { x: 123 })

        var fourthAction = fakeStore.dispatch.lastCall.args[0]
        t.strictEqual(fourthAction.type, 'ANOTHER_ONE')
        t.strictEqual(fourthAction.meta.isPending, undefined)
        t.deepEqual(fourthAction.payload, { x: 123 })
    }, 20)
})

