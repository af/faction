var test = require('tape')
var faction = require('..')
require('es6-promise').polyfill()


test('Async action creators with services', function(t) {
    var s = function(args) { return Promise.resolve(args.msg) }
    var f = faction.create({
        SERVICE_ACTION: faction.useService(s, { msg: faction.validators.string })
    })

    t.plan(5)
    t.equal(f.types.SERVICE_ACTION, 'SERVICE_ACTION')
    t.equal(typeof f.creators.SERVICE_ACTION, 'function')

    var action = f.creators.SERVICE_ACTION({ msg: 'yo' })
    t.equal(action.type, f.types.SERVICE_ACTION)
    t.ok(action.payload instanceof Promise)

    action.payload.then(function(val) {
        t.equal(val, 'yo')
    })
})

test('Async creators with rejecting promises', function(t) {
    var s = function(args) { return Promise.reject(args.msg) }
    var f = faction.create({
        REJECT_ACTION: faction.useService(s, { msg: faction.validators.string })
    })

    t.plan(5)
    t.equal(f.types.REJECT_ACTION, 'REJECT_ACTION')
    t.equal(typeof f.creators.REJECT_ACTION, 'function')

    var action = f.creators.REJECT_ACTION({ msg: 'yo' })
    t.equal(action.type, f.types.REJECT_ACTION)
    t.ok(action.payload instanceof Promise)

    action.payload.catch(function(val) {
        t.equal(val, 'yo')
    })
})

