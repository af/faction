/* eslint no-magic-numbers: 0 */
var test = require('tape')
var faction = require('..')
var ActionParamError = faction.ActionParamError


var f = faction.create((u) => ({
    DO_X: { foo: u.v.string, bar: u.v.number }
}))

test('passing valid action parameters', (t) => {
    var action = f.creators.DO_X({ foo: 'hi', bar: 4 })
    t.equal(action.type, 'DO_X')
    t.equal(typeof action.meta, 'object')
    t.equal(action.error, undefined)
    t.equal(action.payload.foo, 'hi')
    t.equal(action.payload.bar, 4)
    t.end()
})

test('passing an invalid action parameter cases', (t) => {
    // No args:
    t.throws(() => f.creators.DO_X(), ActionParamError)

    // Missing arg:
    t.throws(() => f.creators.DO_X({ foo: 'hi' }), ActionParamError)

    // Invalid arg type:
    t.throws(() => f.creators.DO_X({ foo: 'hi', bar: 'four' }), ActionParamError)
    t.end()
})
