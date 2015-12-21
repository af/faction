/* eslint no-magic-numbers: 0 */
const test = require('tape')
const handleAction = require('./utils').handleAction


const creator = () => ({
    type: 'FOO',
    payload: Promise.resolve('hey'),
    meta: { _fromFactionService: true }
})

const errorCreator = () => ({
    type: 'FOO',
    payload: Promise.reject('boo'),
    meta: { _fromFactionService: true }
})

test('Promise middleware for successful actions', (t) => {
    const testStartTime = +(new Date)
    const action = creator()

    t.plan(14)
    handleAction(action, { FOO: creator }, (dispatch, next) => {
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
    const action = errorCreator()

    t.plan(15)
    handleAction(action, { FOO: errorCreator }, (dispatch, next) => {
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
