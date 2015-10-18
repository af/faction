var test = require('tape')
var faction = require('..')
var v = faction.validators
var ActionParamError = faction.ActionParamError


test('string validator', function(t) {
    t.equal(v.string('hi'), 'hi')
    t.throws(function() { v.string(null) }, ActionParamError)
    t.throws(function() { v.string(5) }, ActionParamError)
    t.throws(function() { v.string(true) }, ActionParamError)
    t.throws(function() { v.string({}) }, ActionParamError)
    t.end()
})

test('boolean validator', function(t) {
    t.equal(v.boolean(true), true)
    t.equal(v.boolean(false), false)
    t.throws(function() { v.boolean('true') }, ActionParamError)
    t.throws(function() { v.boolean('5') }, ActionParamError)
    t.throws(function() { v.boolean(null) }, ActionParamError)
    t.throws(function() { v.boolean({}) }, ActionParamError)
    t.end()
})

test('number validator', function(t) {
    t.equal(v.number(5), 5)
    t.throws(function() { v.number('5') }, ActionParamError)
    t.throws(function() { v.number(NaN) }, ActionParamError)
    t.throws(function() { v.number(null) }, ActionParamError)
    t.throws(function() { v.number(true) }, ActionParamError)
    t.throws(function() { v.number({}) }, ActionParamError)
    t.end()
})

test('object validator', function(t) {
    t.deepEqual(v.object({}), {})
    t.deepEqual(v.object({ foo: 'bar' }), { foo: 'bar' })
    t.throws(function() { v.object() }, ActionParamError)
    t.throws(function() { v.object(null) }, ActionParamError)
    t.throws(function() { v.object(5) }, ActionParamError)
    t.throws(function() { v.object(true) }, ActionParamError)
    t.throws(function() { v.object([]) }, ActionParamError)
    t.end()
})

test('array validator', function(t) {
    t.deepEqual(v.array([]), [])
    t.deepEqual(v.array([1,2,3]), [1,2,3])
    t.deepEqual(v.array([1,2,'three']), [1,2,'three'])
    t.throws(function() { v.array('5') }, ActionParamError)
    t.throws(function() { v.array(null) }, ActionParamError)
    t.throws(function() { v.array(true) }, ActionParamError)
    t.throws(function() { v.array({}) }, ActionParamError)
    t.end()
})
