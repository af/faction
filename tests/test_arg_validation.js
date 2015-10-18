var test = require('tape')
var faction = require('..')
var v = faction.validators
var ActionParamError = faction.ActionParamError


var f = faction.create({
    DO_X: { foo: v.string, bar: v.number }
})

test('passing valid action parameters', function(t) {
    var action = f.creators.DO_X({ foo: 'hi', bar: 4 })
    t.equal(action.type, 'DO_X')
    t.equal(typeof action.meta, 'object')
    t.equal(action.error, undefined)
    t.equal(action.payload.foo, 'hi')
    t.equal(action.payload.bar, 4)
    t.end()
})

test('passing an invalid action parameter cases', function(t) {
    // No args:
    t.throws(function() { f.creators.DO_X() }, ActionParamError)

    // Missing arg:
    t.throws(function() { f.creators.DO_X({ foo: 'hi' }) }, ActionParamError)

    // Invalid arg type:
    t.throws(function() { f.creators.DO_X({ foo: 'hi', bar: 'four' }) }, ActionParamError)
    t.end()
})
