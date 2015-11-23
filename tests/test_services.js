/* eslint no-magic-numbers: 0 */
var test = require('tape')
var faction = require('..')


test('Async action creators with services', (t) => {
    var s = (args) => Promise.resolve(args.msg)
    var f = faction.create((u) => ({
        SERVICE_ACTION: u.asyncp(s, { msg: u.v.string })
    }))

    t.plan(5)
    t.equal(f.types.SERVICE_ACTION, 'SERVICE_ACTION')
    t.equal(typeof f.creators.SERVICE_ACTION, 'function')

    var action = f.creators.SERVICE_ACTION({ msg: 'yo' })
    t.equal(action.type, f.types.SERVICE_ACTION)
    t.ok(action.payload instanceof Promise)

    action.payload.then((val) => t.equal(val, 'yo'))
})

test('Async creators with rejecting promises', (t) => {
    var s = (args) => Promise.reject(args.msg)
    var f = faction.create((u) => ({
        REJECT_ACTION: u.asyncp(s, { msg: u.v.string })
    }))

    t.plan(5)
    t.equal(f.types.REJECT_ACTION, 'REJECT_ACTION')
    t.equal(typeof f.creators.REJECT_ACTION, 'function')

    var action = f.creators.REJECT_ACTION({ msg: 'yo' })
    t.equal(action.type, f.types.REJECT_ACTION)
    t.ok(action.payload instanceof Promise)

    action.payload.catch((val) => t.equal(val, 'yo'))
})

