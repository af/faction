/* eslint no-magic-numbers: 0 */
const test = require('tape')
const faction = require('..')
const ActionParamError = faction.ActionParamError


const f = faction.create((u) => ({
    DO_X: { foo: u.v.string, bar: u.v.number },
    DO_Y: null
}))

test('passing valid action parameters', (t) => {
    const action = f.creators.DO_X({ foo: 'hi', bar: 4 })
    t.equal(action.type, 'DO_X')
    t.equal(typeof action.meta, 'object')
    t.equal(action.error, undefined)
    t.equal(action.payload.foo, 'hi')
    t.equal(action.payload.bar, 4)
    t.end()
})

test('passing null instead of parameters', (t) => {
    t.equal(f.creators.DO_Y, undefined)     // No action creator is assigned
    t.equal(f.types.DO_Y, 'DO_Y')
    t.end()
})

test('passing an invalid action parameter cases', (t) => {
    // No args:
    t.throws(() => f.creators.DO_X(), ActionParamError)
    t.throws(() => f.creators.DO_X(),
             /Validation failed for "foo": Expected "undefined" to be a string/)

    // Missing arg:
    t.throws(() => f.creators.DO_X({ foo: 'hi' }), ActionParamError)
    t.throws(() => f.creators.DO_X({ foo: 'hi' }),
             /Validation failed for "bar": Expected "undefined" to be a number/)

    // Invalid arg type:
    t.throws(() => f.creators.DO_X({ foo: 'hi', bar: 'four' }), ActionParamError)
    t.end()
})
