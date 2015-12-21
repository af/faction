/* eslint no-magic-numbers: 0 */
const test = require('tape')
const faction = require('..')
const handleAction = require('./utils').handleAction


test('Async action creators error if no function given', (t) => {
    t.throws(() => {
        faction.create((u) => ({ TEST: u.asyncp('not a function', {}) }))
    }, /must be a function/)
    t.end()
})

test('Async action creators error if no promise returned', (t) => {
    const s = () => 'not a promise'
    const f = faction.create((u) => ({
        SERVICE_ACTION: u.asyncp(s, { msg: u.v.string })
    }))

    t.throws(() => {
        f.creators.SERVICE_ACTION({ msg: 'yo' })
    }, /not return a Promise/)
    t.end()
})

test('Async action creators with services', (t) => {
    const s = (args) => Promise.resolve(args.msg)
    const f = faction.create((u) => ({
        SERVICE_ACTION: u.asyncp(s, { msg: u.v.string })
    }))

    t.plan(5)
    t.equal(f.types.SERVICE_ACTION, 'SERVICE_ACTION')
    t.equal(typeof f.creators.SERVICE_ACTION, 'function')

    const action = f.creators.SERVICE_ACTION({ msg: 'yo' })
    t.equal(action.type, f.types.SERVICE_ACTION)
    t.ok(action.payload instanceof Promise)

    action.payload.then((val) => t.equal(val, 'yo'))
})

test('Async creators with rejecting promises', (t) => {
    const s = (args) => Promise.reject(args.msg)
    const f = faction.create((u) => ({
        REJECT_ACTION: u.asyncp(s, { msg: u.v.string })
    }))

    t.plan(5)
    t.equal(f.types.REJECT_ACTION, 'REJECT_ACTION')
    t.equal(typeof f.creators.REJECT_ACTION, 'function')

    const action = f.creators.REJECT_ACTION({ msg: 'yo' })
    t.equal(action.type, f.types.REJECT_ACTION)
    t.ok(action.payload instanceof Promise)

    action.payload.catch((val) => t.equal(val, 'yo'))
})


test('Async creators that use store access', (t) => {
    const s = (args, store) => Promise.resolve(args.msg + store.getState())
    const f = faction.create((u) => ({
        STORE_ACTION: u.withStore(s, { msg: u.v.string })
    }))

    t.plan(5)
    const action = f.creators.STORE_ACTION({ msg: 'yo' })
    t.equal(action.type, f.types.STORE_ACTION)
    handleAction(action, f.creators, (dispatch) => {
        t.ok(action.payload instanceof Promise)
        action.payload.then((val) => t.equal(val, 'yoTESTSTATE'))
        t.equal(dispatch.callCount, 2)
        t.equal(dispatch.firstCall.args[0].type, 'STORE_ACTION')
    })
})

