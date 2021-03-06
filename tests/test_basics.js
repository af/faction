const test = require('tape')
const faction = require('..')


test('create() returns an object with types and creators', (t) => {
    const output = faction.create(() => {})
    t.equal(typeof output, 'object')
    t.equal(typeof output.creators, 'object')
    t.equal(typeof output.types, 'object')
    t.end()
})

test('types and creators are created as expected', (t) => {
    const output = faction.create(() => ({ TEST_ACTION: {} }))
    const f = output.creators.TEST_ACTION
    t.equal(typeof f, 'function')
    t.equal(typeof f(), 'object')
    t.equal(f().type, 'TEST_ACTION')
    t.equal(f({ foo: 'bar' }).payload.foo, 'bar')

    // The action object should have `meta: {}`
    t.equal(typeof f({ foo: 'bar' }).meta, 'object')
    t.equal(typeof f({ foo: 'bar' }).meta.hasOwnProperty, 'function')

    t.equal(output.types.TEST_ACTION, 'TEST_ACTION')
    t.end()
})

test('types and creators are frozen', (t) => {
    const output = faction.create(() => ({ TEST_ACTION: {} }))

    // Try to overwrite an action creator - should fail silently
    output.creators.TEST_ACTION = 'asdf'
    t.equal(typeof output.creators.TEST_ACTION, 'function')

    // Try to overwrite a constant - should fail silently
    output.types.TEST_ACTION = 'asdf'
    t.equal(output.types.TEST_ACTION, 'TEST_ACTION')
    t.end()
})

test('errors are handled correctly and do not trigger validation', (t) => {
    const err = new Error('fail')
    const output = faction.create((u) => ({
        TEST_ACTION: { msg: u.v.string }
    }))
    const result = output.creators.TEST_ACTION(err)

    t.equal(result.error, true)
    t.equal(result.payload, err)
    t.end()
})

test('action.meta.inputs stores a serializable copy of the action inputs', (t) => {
    const output = faction.create((u) => ({
        TEST_ACTION: { msg: u.v.string }
    }))
    const args = { msg: 'hello there' }
    const result = output.creators.TEST_ACTION(args)

    t.deepEqual(result.meta.inputs, args)
    t.deepEqual(result.payload, args)
    t.end()
})

test('simple sync actions have action.meta.timestamp set', (t) => {
    const testStartTime = +(new Date)
    const output = faction.create(() => ({ TEST_ACTION: {} }))
    const result = output.creators.TEST_ACTION({ str: 'hi' })

    t.deepEqual(result.payload, { str: 'hi' })
    t.equal(typeof result.meta.timestamp, 'number')
    t.ok(result.meta.timestamp <= +(new Date))   // Should be slightly in the past
    t.ok(result.meta.timestamp >= testStartTime)   // Should be slightly in the past
    t.end()
})
