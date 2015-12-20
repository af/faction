/* eslint no-magic-numbers: 0, max-nested-callbacks: [2, 5] */
const test = require('tape')
const sinon = require('sinon')
const faction = require('..')


test('onSuccess action callbacks', (t) => {
    const fakeStore = { dispatch: sinon.spy() }
    const actions = faction.create((u) => ({
        FOLLOW_UP: {},
        CHAINED: u.asyncp(() => Promise.resolve('yo'))
                    .onSuccess((c) => c.FOLLOW_UP({ x: 123 }))
    }))
    const middleware = faction.makeMiddleware(actions.creators)
    const action = actions.creators.CHAINED()

    t.plan(9)
    middleware(fakeStore)(() => {})(action)
    setTimeout(() => {
        t.equal(fakeStore.dispatch.callCount, 3)

        const firstAction = fakeStore.dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        const secondAction = fakeStore.dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'yo')

        const thirdAction = fakeStore.dispatch.thirdCall.args[0]
        t.strictEqual(thirdAction.type, 'FOLLOW_UP')
        t.strictEqual(thirdAction.meta.isPending, undefined)
        t.deepEqual(thirdAction.payload, { x: 123 })
    }, 20)
})

test('onError action callbacks', (t) => {
    const fakeStore = { dispatch: sinon.spy() }
    const actions = faction.create((u) => ({
        FOLLOW_UP: {},
        CHAINED: u.asyncp(() => Promise.reject('fail'))
                    .onError((c) => c.FOLLOW_UP({ x: 123 }))
    }))
    const middleware = faction.makeMiddleware(actions.creators)
    const action = actions.creators.CHAINED()

    t.plan(9)
    middleware(fakeStore)(() => {})(action)
    setTimeout(() => {
        t.equal(fakeStore.dispatch.callCount, 3)

        const firstAction = fakeStore.dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        const secondAction = fakeStore.dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'fail')

        const thirdAction = fakeStore.dispatch.thirdCall.args[0]
        t.strictEqual(thirdAction.type, 'FOLLOW_UP')
        t.strictEqual(thirdAction.meta.isPending, undefined)
        t.deepEqual(thirdAction.payload, { x: 123 })
    }, 20)
})

test('dispatching multiple follow-up actions by returning an array', (t) => {
    const fakeStore = { dispatch: sinon.spy() }
    const actions = faction.create((u) => ({
        FOLLOW_UP: {},
        ANOTHER_ONE: {},
        CHAINED: u.asyncp(() => Promise.resolve('ok'))
                    .onSuccess((c) => [
                        c.FOLLOW_UP({ x: 123 }),
                        c.ANOTHER_ONE({ x: 123 })
                    ])
    }))
    const middleware = faction.makeMiddleware(actions.creators)
    const action = actions.creators.CHAINED()

    t.plan(12)
    middleware(fakeStore)(() => {})(action)
    setTimeout(() => {
        t.equal(fakeStore.dispatch.callCount, 4)

        const firstAction = fakeStore.dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        const secondAction = fakeStore.dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'ok')

        const thirdAction = fakeStore.dispatch.thirdCall.args[0]
        t.strictEqual(thirdAction.type, 'FOLLOW_UP')
        t.strictEqual(thirdAction.meta.isPending, undefined)
        t.deepEqual(thirdAction.payload, { x: 123 })

        const fourthAction = fakeStore.dispatch.lastCall.args[0]
        t.strictEqual(fourthAction.type, 'ANOTHER_ONE')
        t.strictEqual(fourthAction.meta.isPending, undefined)
        t.deepEqual(fourthAction.payload, { x: 123 })
    }, 20)
})

test('onSuccess errors if function not given', (t) => {
    t.throws(() => {
        faction.create((u) => ({
            CHAINED: u.asyncp(() => Promise.resolve('yo'))
                        .onSuccess('not a function')
        }))
    }, /onSuccess takes a function/)
    t.end()
})

test('onError errors if function not given', (t) => {
    t.throws(() => {
        faction.create((u) => ({
            CHAINED: u.asyncp(() => Promise.resolve('yo'))
                        .onError('not a function')
        }))
    }, /onError takes a function/)
    t.end()
})

