var test = require('tape')
var sinon = require('sinon')
var faction = require('..')
require('es6-promise').polyfill()


test('Promise middleware', function(t) {
    var fakeStore = { dispatch: sinon.spy() }
    var fakeNext = sinon.spy()
    var creator = function() {
        return { type: 'FOO', payload: Promise.resolve('hey'), meta: {} }
    }

    t.plan(2)
    faction.middleware(fakeStore)(fakeNext)(creator())
    setTimeout(function() {
        t.ok(fakeStore.dispatch.calledOnce)
        t.equal(fakeNext.callCount, 0)
    }, 20)
})
