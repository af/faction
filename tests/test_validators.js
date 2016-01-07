/* eslint no-magic-numbers: 0 */
const test = require('tape')
const faction = require('..')
const v = require('../lib/validators').validators
const ActionParamError = faction.ActionParamError


test('string validator', (t) => {
    t.equal(v.string.exec('hi'), 'hi')
    t.throws(() => v.string.exec(null), ActionParamError)
    t.throws(() => v.string.exec(5), ActionParamError)
    t.throws(() => v.string.exec(true), ActionParamError)
    t.throws(() => v.string.exec({}), ActionParamError)
    t.end()
})

test('boolean validator', (t) => {
    t.equal(v.boolean.exec(true), true)
    t.equal(v.boolean.exec(false), false)
    t.throws(() => v.boolean.exec('true'), ActionParamError)
    t.throws(() => v.boolean.exec('5'), ActionParamError)
    t.throws(() => v.boolean.exec(null), ActionParamError)
    t.throws(() => v.boolean.exec({}), ActionParamError)
    t.end()
})

test('number validator', (t) => {
    t.equal(v.number.exec(5), 5)
    t.throws(() => v.number.exec('5'), ActionParamError)
    t.throws(() => v.number.exec(NaN), ActionParamError)
    t.throws(() => v.number.exec(null), ActionParamError)
    t.throws(() => v.number.exec(true), ActionParamError)
    t.throws(() => v.number.exec({}), ActionParamError)
    t.end()
})

test('object validator', (t) => {
    t.deepEqual(v.object.exec({}), {})
    t.deepEqual(v.object.exec({ foo: 'bar' }), { foo: 'bar' })
    t.throws(() => v.object.exec(), ActionParamError)
    t.throws(() => v.object.exec(null), ActionParamError)
    t.throws(() => v.object.exec(5), ActionParamError)
    t.throws(() => v.object.exec(true), ActionParamError)
    t.throws(() => v.object.exec([]), ActionParamError)
    t.end()
})

test('array validator', (t) => {
    t.deepEqual(v.array.exec([]), [])
    t.deepEqual(v.array.exec([1, 2, 3]), [1, 2, 3])
    t.deepEqual(v.array.exec([1, 2, 'three']), [1, 2, 'three'])
    t.throws(() => v.array.exec('5'), ActionParamError)
    t.throws(() => v.array.exec(null), ActionParamError)
    t.throws(() => v.array.exec(true), ActionParamError)
    t.throws(() => v.array.exec({}), ActionParamError)
    t.end()
})

test('withDefault()', (t) => {
    const validatorWithDefault = v.number.withDefault(42)
    t.equal(validatorWithDefault.exec(), 42)
    t.equal(validatorWithDefault.exec(10), 10)
    t.throws(() => validatorWithDefault.exec('asdf'), ActionParamError)
    t.end()
})

test('enum()', (t) => {
    t.throws(() => v.number.enum('not an array').exec, TypeError)

    const validatorWithEnum = v.number.enum([1, 2, 3])
    t.equal(validatorWithEnum.exec(1), 1)
    t.equal(validatorWithEnum.exec(2), 2)
    t.throws(() => validatorWithEnum.exec(), ActionParamError)
    t.throws(() => validatorWithEnum.exec(16), ActionParamError)
    t.end()
})

test('enum() with a default value', (t) => {
    const complexValidator = v.number.withDefault(1).enum([1, 2, 3])
    t.equal(complexValidator.exec(1), 1)
    t.equal(complexValidator.exec(2), 2)
    t.equal(complexValidator.exec(), 1)
    t.throws(() => complexValidator.exec(16), ActionParamError)
    t.end()
})

test('custom validator creation and use', function(t) {
    const custom = faction.makeValidator(function(x) {
        if (x !== 'foo') throw new Error('foo was expected')
        else return 'bar'
    })
    t.equal(custom.exec('foo'), 'bar')
    t.throws(() => custom.exec('notbar'), Error)
    t.end()
})
