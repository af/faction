/* eslint no-magic-numbers: 0 */
const faction = require('..')
const test = require('tape')
const handleAction = require('./utils').handleAction


const actions = faction.create((u) => ({
    FOO: u.async(() => Promise.resolve('hey')),
    ERR: u.async(() => Promise.reject('boo'))
}))

test('Promise middleware for successful actions', (t) => {
    const testStartTime = +(new Date)
    const action = actions.creators.FOO()

    t.plan(14)
    handleAction(action, actions.creators, (dispatch, next) => {
        t.equal(dispatch.callCount, 2)
        t.equal(next.callCount, 0)

        const firstAction = dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        // Check action.meta.timestamp:
        t.equal(typeof firstAction.meta.timestamp, 'number')
        t.ok(firstAction.meta.timestamp <= +(new Date))
        t.ok(firstAction.meta.timestamp >= testStartTime)

        const secondAction = dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.payload, 'hey')

        // Check second timetamp:
        t.equal(typeof secondAction.meta.timestamp, 'number')
        t.ok(secondAction.meta.timestamp <= +(new Date))
        t.ok(secondAction.meta.timestamp >= testStartTime)
        t.ok(secondAction.meta.timestamp >= firstAction.meta.timestamp)
    })
})

test('Promise middleware processes errors correctly', (t) => {
    const testStartTime = +(new Date)
    const action = actions.creators.ERR()

    t.plan(15)
    handleAction(action, actions.creators, (dispatch, next) => {
        t.equal(dispatch.callCount, 2)
        t.equal(next.callCount, 0)

        const firstAction = dispatch.firstCall.args[0]
        t.strictEqual(firstAction.type, action.type)
        t.strictEqual(firstAction.meta.isPending, true)

        // Check action.meta.timestamp:
        t.equal(typeof firstAction.meta.timestamp, 'number')
        t.ok(firstAction.meta.timestamp <= +(new Date))
        t.ok(firstAction.meta.timestamp >= testStartTime)

        const secondAction = dispatch.secondCall.args[0]
        t.strictEqual(secondAction.type, action.type)
        t.strictEqual(secondAction.meta.isPending, undefined)
        t.strictEqual(secondAction.error, true)
        t.strictEqual(secondAction.payload, 'boo')

        // Check second timetamp:
        t.equal(typeof secondAction.meta.timestamp, 'number')
        t.ok(secondAction.meta.timestamp <= +(new Date))
        t.ok(secondAction.meta.timestamp >= testStartTime)
        t.ok(secondAction.meta.timestamp >= firstAction.meta.timestamp)
    })
})

test('Promise middleware bypassed for non-async actions', (t) => {
    const action = { type: 'SYNC', payload: { foo: 'bar' } }

    t.plan(2)
    handleAction(action, {}, (dispatch, next) => {
        t.equal(dispatch.callCount, 0)
        t.equal(next.callCount, 1)
    })
})
