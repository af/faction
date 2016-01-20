/* eslint no-magic-numbers: 0 */
const test = require('tape')
const faction = require('..')
const handleAction = require('./utils').handleAction


test('Async action creators error if no function given', (t) => {
    t.throws(() => {
        faction.create((u) => ({ TEST: u.launch('not a function', {}) }))
    }, /must be a function/)
    t.end()
})

test('Async creators that use store access', (t) => {
    const s = (args, store) => Promise.resolve(args.msg + store.getState())
    const f = faction.create((u) => ({
        STORE_ACTION: u.launch(s, { msg: u.v.string })
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

