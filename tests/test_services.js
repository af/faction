/* eslint no-magic-numbers: 0 */
var test = require('tape')
var sinon = require('sinon')
var faction = require('..')


test('Async action creators error if no function given', (t) => {
    t.throws(() => {
        faction.create((u) => ({ TEST: u.asyncp('not a function', {}) }))
    }, /must be a function/)
    t.end()
})

test('Async action creators error if no promise returned', (t) => {
    var s = () => 'not a promise'
    var f = faction.create((u) => ({
        SERVICE_ACTION: u.asyncp(s, { msg: u.v.string })
    }))

    t.throws(() => {
        f.creators.SERVICE_ACTION({ msg: 'yo' })
    }, /not return a Promise/)
    t.end()
})

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


test('Async creators that use store access', (t) => {
    var s = (args, store) => Promise.resolve(args.msg + store.getState())
    var f = faction.create((u) => ({
        STORE_ACTION: u.withStore(s, { msg: u.v.string })
    }))

    var store = {
        getState: function() { return 'STATE' },
        dispatch: sinon.spy()
    }
    var mw = faction.makeMiddleware({})(store)()

    t.plan(7)
    t.equal(f.types.STORE_ACTION, 'STORE_ACTION')
    t.equal(typeof f.creators.STORE_ACTION, 'function')

    var action = f.creators.STORE_ACTION({ msg: 'yo' })
    t.equal(action.type, f.types.STORE_ACTION)
    setTimeout(function() {
        mw(action)
        t.ok(action.payload instanceof Promise)
        action.payload.then((val) => t.equal(val, 'yoSTATE'))
        t.equal(store.dispatch.callCount, 1)
        t.equal(store.dispatch.firstCall.args[0].type, 'STORE_ACTION')
    }, 20)
})

