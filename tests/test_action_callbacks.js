/* eslint no-magic-numbers: 0, max-nested-callbacks: [2, 5] */
const test = require('tape')
const faction = require('..')
const handleAction = require('./utils').handleAction


test('onSuccess action callbacks', (t) => {
    const actions = faction.create((u) => ({
        FOLLOW_UP: {},
        CHAINED: u.async(() => Promise.resolve('yo'))
                    .onSuccess((c) => c.FOLLOW_UP({ x: 123 }))
    }))
    const action = actions.creators.CHAINED()

    t.plan(9)
    handleAction(action, actions.creators, (dispatch) => {
        t.equal(dispatch.callCount, 3)

        const firstAction = dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        const secondAction = dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'yo')

        const thirdAction = dispatch.thirdCall.args[0]
        t.strictEqual(thirdAction.type, 'FOLLOW_UP')
        t.strictEqual(thirdAction.meta.isPending, undefined)
        t.deepEqual(thirdAction.payload, { x: 123 })
    })
})

test('onError action callbacks', (t) => {
    const actions = faction.create((u) => ({
        FOLLOW_UP: {},
        CHAINED: u.async(() => Promise.reject('fail'))
                    .onError((c) => c.FOLLOW_UP({ x: 123 }))
    }))
    const action = actions.creators.CHAINED()

    t.plan(9)
    handleAction(action, actions.creators, (dispatch) => {
        t.equal(dispatch.callCount, 3)

        const firstAction = dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        const secondAction = dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'fail')

        const thirdAction = dispatch.thirdCall.args[0]
        t.strictEqual(thirdAction.type, 'FOLLOW_UP')
        t.strictEqual(thirdAction.meta.isPending, undefined)
        t.deepEqual(thirdAction.payload, { x: 123 })
    })
})

test('dispatching multiple follow-up actions by returning an array', (t) => {
    const actions = faction.create((u) => ({
        FOLLOW_UP: {},
        ANOTHER_ONE: {},
        CHAINED: u.async(() => Promise.resolve('ok'))
                    .onSuccess((c) => [
                        c.FOLLOW_UP({ x: 123 }),
                        c.ANOTHER_ONE({ x: 123 })
                    ])
    }))
    const action = actions.creators.CHAINED()

    t.plan(12)
    handleAction(action, actions.creators, (dispatch) => {
        t.equal(dispatch.callCount, 4)

        const firstAction = dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        const secondAction = dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'ok')

        const thirdAction = dispatch.thirdCall.args[0]
        t.strictEqual(thirdAction.type, 'FOLLOW_UP')
        t.strictEqual(thirdAction.meta.isPending, undefined)
        t.deepEqual(thirdAction.payload, { x: 123 })

        const fourthAction = dispatch.lastCall.args[0]
        t.strictEqual(fourthAction.type, 'ANOTHER_ONE')
        t.strictEqual(fourthAction.meta.isPending, undefined)
        t.deepEqual(fourthAction.payload, { x: 123 })
    })
})

test('onSuccess errors if function not given', (t) => {
    t.throws(() => {
        faction.create((u) => ({
            CHAINED: u.async(() => Promise.resolve('yo'))
                        .onSuccess('not a function')
        }))
    }, /onSuccess takes a function/)
    t.end()
})

test('onError errors if function not given', (t) => {
    t.throws(() => {
        faction.create((u) => ({
            CHAINED: u.async(() => Promise.resolve('yo'))
                        .onError('not a function')
        }))
    }, /onError takes a function/)
    t.end()
})

test('thrown errors in onError callback are not caught by initial action', (t) => {
    const actions = faction.create((u) => ({
        FOLLOW_UP: u.async(() => { throw new Error('ugh') }),
        CHAINED: u.async(() => Promise.resolve('yo'))
                    .onSuccess(c => c.FOLLOW_UP())
    }))
    const action = actions.creators.CHAINED()

    t.plan(4)
    handleAction(action, actions.creators, (dispatch) => {
        t.equal(dispatch.callCount, 3)

        const secondAction = dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.error, undefined)
        t.strictEqual(secondAction.payload, 'yo')
    })
})

