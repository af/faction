/* eslint no-magic-numbers: 0 */
var test = require('tape')
var faction = require('..')
var v = faction.v
var ActionParamError = faction.ActionParamError


test('string validator', (t) => {
    t.equal(v.string('hi'), 'hi')
    t.throws(() => v.string(null), ActionParamError)
    t.throws(() => v.string(5), ActionParamError)
    t.throws(() => v.string(true), ActionParamError)
    t.throws(() => v.string({}), ActionParamError)
    t.end()
})

test('boolean validator', (t) => {
    t.equal(v.boolean(true), true)
    t.equal(v.boolean(false), false)
    t.throws(() => v.boolean('true'), ActionParamError)
    t.throws(() => v.boolean('5'), ActionParamError)
    t.throws(() => v.boolean(null), ActionParamError)
    t.throws(() => v.boolean({}), ActionParamError)
    t.end()
})

test('number validator', (t) => {
    t.equal(v.number(5), 5)
    t.throws(() => v.number('5'), ActionParamError)
    t.throws(() => v.number(NaN), ActionParamError)
    t.throws(() => v.number(null), ActionParamError)
    t.throws(() => v.number(true), ActionParamError)
    t.throws(() => v.number({}), ActionParamError)
    t.end()
})

test('object validator', (t) => {
    t.deepEqual(v.object({}), {})
    t.deepEqual(v.object({ foo: 'bar' }), { foo: 'bar' })
    t.throws(() => v.object(), ActionParamError)
    t.throws(() => v.object(null), ActionParamError)
    t.throws(() => v.object(5), ActionParamError)
    t.throws(() => v.object(true), ActionParamError)
    t.throws(() => v.object([]), ActionParamError)
    t.end()
})

test('array validator', (t) => {
    t.deepEqual(v.array([]), [])
    t.deepEqual(v.array([1, 2, 3]), [1, 2, 3])
    t.deepEqual(v.array([1, 2, 'three']), [1, 2, 'three'])
    t.throws(() => v.array('5'), ActionParamError)
    t.throws(() => v.array(null), ActionParamError)
    t.throws(() => v.array(true), ActionParamError)
    t.throws(() => v.array({}), ActionParamError)
    t.end()
})

test('withDefault()', (t) => {
    var validatorWithDefault = v.number.withDefault(42)
    t.equal(validatorWithDefault(), 42)
    t.equal(validatorWithDefault(10), 10)
    t.throws(() => validatorWithDefault('asdf'), ActionParamError)
    t.end()
})

test('enum()', (t) => {
    t.throws(() => v.number.enum('not an array'), TypeError)

    var validatorWithEnum = v.number.enum([1, 2, 3])
    t.equal(validatorWithEnum(1), 1)
    t.equal(validatorWithEnum(2), 2)
    t.throws(() => validatorWithEnum(), ActionParamError)
    t.throws(() => validatorWithEnum(16), ActionParamError)
    t.end()
})

test('enum() with a default value', (t) => {
    var complexValidator = v.number.enum([1, 2, 3], 1)
    t.equal(complexValidator(1), 1)
    t.equal(complexValidator(2), 2)
    t.equal(complexValidator(), 1)
    t.throws(() => complexValidator(16), ActionParamError)
    t.end()
})
