var test = require('tape')
var faction = require('..')


test('create() returns an object with types and creators', function(t) {
    var output = faction.create({})
    t.equal(typeof output, 'object')
    t.equal(typeof output.creators, 'object')
    t.equal(typeof output.types, 'object')
    t.end()
})

test('types and creators are created as expected', function(t) {
    var output = faction.create({ TEST_ACTION: {} })
    var f = output.creators.TEST_ACTION
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

test('types and creators are frozen', function(t) {
    var output = faction.create({ TEST_ACTION: {} })

    // Try to overwrite an action creator - should fail silently
    output.creators.TEST_ACTION = 'asdf'
    t.equal(typeof output.creators.TEST_ACTION, 'function')

    // Try to overwrite a constant - should fail silently
    output.types.TEST_ACTION = 'asdf'
    t.equal(output.types.TEST_ACTION, 'TEST_ACTION')
    t.end()
})

test('errors are handling correctly', function(t) {
    var err = new Error('fail')
    var output = faction.create({ TEST_ACTION: {} })
    var result = output.creators.TEST_ACTION(err)

    t.equal(result.error, true)
    t.equal(result.payload, err)
    t.end()
})
