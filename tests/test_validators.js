var test = require('tape')
var faction = require('..')
var v = faction.v
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

test('withDefault()', function(t) {
    var validatorWithDefault = v.number.withDefault(42)
    t.equal(validatorWithDefault(), 42)
    t.equal(validatorWithDefault(10), 10)
    t.throws(function() { validatorWithDefault('asdf') }, ActionParamError)
    t.end()
});

test('enum()', function(t) {
    t.throws(function() { v.number.enum('not an array') }, TypeError)

    var validatorWithEnum = v.number.enum([1,2,3])
    t.equal(validatorWithEnum(1), 1)
    t.equal(validatorWithEnum(2), 2)
    t.throws(function() { validatorWithEnum() }, ActionParamError)
    t.throws(function() { validatorWithEnum(16) }, ActionParamError)
    t.end()
});

test('enum() with a default value', function(t) {
    var complexValidator = v.number.enum([1,2,3], 1)
    t.equal(complexValidator(1), 1)
    t.equal(complexValidator(2), 2)
    t.equal(complexValidator(), 1)
    t.throws(function() { complexValidator(16) }, ActionParamError)
    t.end()
});
