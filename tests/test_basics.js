var test = require('tape')
var faction = require('..')


test('create() returns an object with constants and funcs', function(t) {
    var output = faction.create({})
    t.equal(typeof output, 'object')
    t.equal(typeof output.funcs, 'object')
    t.equal(typeof output.constants, 'object')
    t.end()
})

test('constants and funcs are created as expected', function(t) {
    var output = faction.create({ TEST_ACTION: null })
    var f = output.funcs.TEST_ACTION
    t.equal(typeof f, 'function')
    t.equal(typeof f(), 'object')
    t.equal(f().type, 'TEST_ACTION')
    t.equal(f({ foo: 'bar' }).payload.foo, 'bar')

    t.equal(output.constants.TEST_ACTION, 'TEST_ACTION')
    t.end()
})

test('constants and funcs are frozen', function(t) {
    var output = faction.create({ TEST_ACTION: null })

    // Try to overwrite an action creator - should fail silently
    output.funcs.TEST_ACTION = 'asdf'
    t.equal(typeof output.funcs.TEST_ACTION, 'function')

    // Try to overwrite a constant - should fail silently
    output.constants.TEST_ACTION = 'asdf'
    t.equal(output.constants.TEST_ACTION, 'TEST_ACTION')
    t.end()
})
